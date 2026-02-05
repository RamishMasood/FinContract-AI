import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

interface RedeemRequest {
  code: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { code }: RedeemRequest = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Promo code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the promo code (case-insensitive)
    const { data: promoCode, error: fetchError } = await supabaseClient
      .from('promo_codes')
      .select('*')
      .ilike('code', code)
      .single();

    if (fetchError || !promoCode) {
      console.log('Promo code not found:', code);
      return new Response(
        JSON.stringify({ error: 'Invalid promo code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired
    if (new Date(promoCode.expiry_date) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Promo code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is active
    if (promoCode.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Promo code is no longer active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if max usage reached
    if (promoCode.current_usage >= promoCode.max_usage) {
      return new Response(
        JSON.stringify({ error: 'Promo code usage limit reached' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has already redeemed this code
    const { data: existingRedemption } = await supabaseClient
      .from('promo_code_redemptions')
      .select('*')
      .eq('promo_code_id', promoCode.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ error: 'You have already redeemed this promo code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine start date: check if user has active paid subscription
    const { data: userPlan } = await supabaseClient
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let startDate = new Date();
    
    // If user has a paid plan with expiry, start promo after it expires
    if (userPlan && userPlan.plan_id !== 'free' && userPlan.expires_at) {
      const planExpiry = new Date(userPlan.expires_at);
      if (planExpiry > startDate) {
        startDate = planExpiry;
      }
    }

    // Check for active referral rewards
    const { data: activeReferralReward } = await supabaseClient
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .lte('starts_at', new Date().toISOString())
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If there's an active referral reward, start promo after it expires
    if (activeReferralReward) {
      const rewardExpiry = new Date(activeReferralReward.expires_at);
      if (rewardExpiry > startDate) {
        startDate = rewardExpiry;
      }
    }

    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + promoCode.validity_duration_days);

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabaseClient
      .from('promo_code_redemptions')
      .insert({
        promo_code_id: promoCode.id,
        user_id: user.id,
        starts_at: startDate.toISOString(),
        expires_at: expiresAt.toISOString(),
        plan_id: 'premium',
        validity_duration_days: promoCode.validity_duration_days
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      throw redemptionError;
    }

    // Update promo code usage count
    const { error: updateError } = await supabaseClient
      .from('promo_codes')
      .update({
        current_usage: promoCode.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', promoCode.id);

    if (updateError) {
      console.error('Error updating promo code usage:', updateError);
    }

    console.log('Promo code redeemed successfully:', {
      userId: user.id,
      code: code,
      startsAt: startDate.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        redemption: {
          starts_at: redemption.starts_at,
          expires_at: redemption.expires_at,
          plan_id: redemption.plan_id,
          validity_duration_days: promoCode.validity_duration_days,
          code: promoCode.code
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in redeem-promo-code function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
