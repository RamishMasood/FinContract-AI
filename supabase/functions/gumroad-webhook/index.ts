import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map of actual Gumroad product IDs to our plan IDs - Updated with correct IDs
const GUMROAD_PRODUCT_ID_MAP: Record<string, string> = {
  // New correct product IDs
  'ptlsqlp': 'basic',
  'omxfm': 'premium',
  // Keep old IDs for backward compatibility in case of webhook retries
  'SovSpZUABprtMPU0KmUksA==': 'basic',
  'lWL2oynuKtJTYjAEEhmTsg==': 'premium',
  'lcgkby': 'basic',
  'jqkug': 'premium',
  'ZU_EYSqQjZGJ3x_8Hm102g==': 'basic',
  '8Z5KbSnX9tZnx7buHJcbWQ==': 'premium',
};

serve(async (req) => {
  console.log('=== GUMROAD WEBHOOK RECEIVED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('OK', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the raw body first
    const body = await req.text();
    console.log('Raw webhook body length:', body.length);
    console.log('Raw webhook body:', body);

    let payload;
    
    // Gumroad sends data as form-encoded by default
    if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      console.log('Processing as form data');
      const formData = new URLSearchParams(body);
      payload = Object.fromEntries(formData.entries());
    } else {
      console.log('Processing as JSON');
      try {
        payload = JSON.parse(body);
      } catch (parseError) {
        console.error('JSON parse failed, trying form data:', parseError);
        const formData = new URLSearchParams(body);
        payload = Object.fromEntries(formData.entries());
      }
    }

    console.log('Parsed payload:', JSON.stringify(payload, null, 2));

    // Handle ping requests from Gumroad
    if (payload.ping === 'true' || payload.ping === true || req.url.includes('ping')) {
      console.log('Ping request detected - responding with OK');
      return new Response('OK', { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Validate webhook payload
    if (!payload.sale_id && !payload.order_id) {
      console.error('Missing sale_id/order_id in payload');
      return new Response('Missing sale_id', { status: 400, headers: corsHeaders });
    }

    if (!payload.product_id) {
      console.error('Missing product_id in payload');
      return new Response('Missing product_id', { status: 400, headers: corsHeaders });
    }

    // Extract data from payload
    const saleId = payload.sale_id || payload.order_id;
    const productId = payload.product_id;
    const userEmail = payload.email || payload.purchaser_email;
    const amount = parseFloat(payload.price || payload.amount || '0');
    const currency = payload.currency || 'USD';
    const isRefunded = payload.refunded === 'true' || payload.refunded === true;

    console.log('Extracted basic data:', {
      saleId,
      productId,
      userEmail,
      amount,
      currency,
      isRefunded
    });

    // Extract custom fields from URL parameters that Gumroad passes through
    let userId = payload.user_id;
    let planId = payload.plan_id;

    console.log('Extracted URL parameters:', {
      userId,
      planId,
      userEmail
    });

    // Enhanced product mapping - try multiple approaches
    if (!planId) {
      console.log('Attempting to map product ID to plan ID');
      
      // First try direct product ID mapping with new correct IDs
      if (GUMROAD_PRODUCT_ID_MAP[productId]) {
        planId = GUMROAD_PRODUCT_ID_MAP[productId];
        console.log('Mapped via product ID:', { productId, planId });
      }
      // Try short product ID if available
      else if (payload.short_product_id && GUMROAD_PRODUCT_ID_MAP[payload.short_product_id]) {
        planId = GUMROAD_PRODUCT_ID_MAP[payload.short_product_id];
        console.log('Mapped via short product ID:', { short_product_id: payload.short_product_id, planId });
      }
      // Fallback to price-based mapping
      else if (amount > 0) {
        if (amount >= 9.98 && amount <= 10.01) {
          planId = 'basic';
          console.log('Mapped via price to basic:', amount);
        } else if (amount >= 29.98 && amount <= 30.01) {
          planId = 'premium';
          console.log('Mapped via price to premium:', amount);
        }
      }
    }

    // If we still don't have userId, try to find user by email
    if (!userId && userEmail) {
      console.log('Attempting to find user by email:', userEmail);
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (!userError && userData.users) {
        const matchingUser = userData.users.find(u => u.email === userEmail);
        if (matchingUser) {
          userId = matchingUser.id;
          console.log('Found user by email:', { email: userEmail, userId });
        } else {
          console.log('No user found with email:', userEmail);
        }
      } else {
        console.error('Error fetching users:', userError);
      }
    }

    // Final validation
    if (!userId || !planId) {
      console.error('Still missing required fields after all mapping attempts:', { 
        userId, 
        planId,
        productId: productId,
        short_product_id: payload.short_product_id,
        amount: amount,
        userEmail: userEmail
      });
      return new Response('Missing required user or plan information', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Successfully mapped payment:', { userId, planId, saleId, productId, amount });

    // Determine expiration date based on plan (both basic and premium are monthly subscriptions)
    let expiresAt = null;
    if (planId === 'premium' || planId === 'basic') {
      const now = new Date();
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    }

    // Create purchase record
    const purchaseData = {
      user_id: userId,
      gumroad_order_id: saleId,
      product_id: productId,
      plan_id: planId,
      amount: amount,
      currency: currency,
      status: isRefunded ? 'refunded' : 'completed',
      expires_at: expiresAt,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating purchase record:', purchaseData);

    // Insert purchase record (handle duplicates gracefully)
    const { data: purchase, error: purchaseError } = await supabase
      .from('gumroad_purchases')
      .upsert(purchaseData, { 
        onConflict: 'gumroad_order_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating/updating purchase record:', purchaseError);
      // Continue processing even if purchase record fails
    } else {
      console.log('Purchase record created/updated successfully:', purchase);
    }

    // Update user plan
    if (isRefunded) {
      console.log('Processing refund - reverting to free plan');
      const { error: updateError } = await supabase
        .from('user_plans')
        .update({
          plan_id: 'free',
          expires_at: null,
          gumroad_purchase_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating plan for refund:', updateError);
      } else {
        console.log('Plan reverted to free due to refund');
      }
    } else {
      console.log('Processing successful purchase - updating user plan to:', planId);
      
      // Check if user has active referral rewards that need to be paused
      const { data: activeReferralReward } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', userId)
        .lte('starts_at', new Date().toISOString())
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check if user plan exists
      const { data: existingPlan, error: fetchError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing plan:', fetchError);
      }

      console.log('Existing plan:', existingPlan);
      console.log('Active referral reward:', activeReferralReward);

      // Calculate remaining referral reward time if exists
      let pausedReferralData = null;
      if (activeReferralReward) {
        const now = new Date();
        const rewardExpiry = new Date(activeReferralReward.expires_at);
        const remainingTime = rewardExpiry.getTime() - now.getTime();
        
        if (remainingTime > 0) {
          pausedReferralData = {
            reward_plan_id: activeReferralReward.plan_id,
            remaining_time_ms: remainingTime,
            original_expiry: activeReferralReward.expires_at
          };
          console.log('Pausing referral reward with remaining time:', remainingTime, 'ms');
          
          // Pause the referral reward by setting its expires_at to now
          await supabase
            .from('referral_rewards')
            .update({
              expires_at: new Date().toISOString()
            })
            .eq('id', activeReferralReward.id);
        }
      }

      // Update to the purchased plan with paused referral data
      const planData = {
        user_id: userId,
        plan_id: planId,
        expires_at: expiresAt,
        gumroad_purchase_id: purchase?.id || null,
        updated_at: new Date().toISOString(),
        user_email: userEmail,
        // Store paused referral info in user_plan for later restoration
        paused_referral_reward: pausedReferralData ? JSON.stringify(pausedReferralData) : null
      };

      if (existingPlan) {
        console.log('Updating existing user plan to:', planId);
        const { error: updateError } = await supabase
          .from('user_plans')
          .update(planData)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating existing plan:', updateError);
          return new Response('Failed to update plan', { status: 500, headers: corsHeaders });
        } else {
          console.log('Successfully updated user plan to:', planId);
        }
      } else {
        console.log('Creating new user plan for:', planId);
        const { error: insertError } = await supabase
          .from('user_plans')
          .insert({
            user_id: userId,
            plan_id: planId,
            expires_at: expiresAt,
            gumroad_purchase_id: purchase?.id || null,
            user_email: userEmail
          });

        if (insertError) {
          console.error('Error creating new plan:', insertError);
          return new Response('Failed to create plan', { status: 500, headers: corsHeaders });
        } else {
          console.log('Successfully created new user plan for:', planId);
        }
      }
    }

    // Return success response
    const response = { 
      success: true, 
      message: 'Webhook processed successfully',
      processedData: {
        userId,
        planId,
        saleId,
        productId,
        isRefunded,
        amount
      }
    };

    console.log('=== WEBHOOK PROCESSING COMPLETED SUCCESSFULLY ===');
    console.log('Final response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error?.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
