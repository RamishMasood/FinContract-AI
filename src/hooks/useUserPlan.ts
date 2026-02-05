
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserPlan = {
  id: string;
  plan_id: string;
  started_at: string;
  updated_at: string;
  user_id: string;
  expires_at: string | null;
  gumroad_purchase_id: string | null;
  paused_referral_reward: string | null;
  is_referral_reward?: boolean;
  is_promo_code?: boolean;
} | null;

type UseUserPlanResult = {
  userPlan: UserPlan;
  loading: boolean;
  selectPlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  refreshing: boolean;
  refetch: () => Promise<void>;
};

export function useUserPlan(): UseUserPlanResult {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserPlan = async () => {
    if (!user) {
      setUserPlan(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Use the database function to get effective plan including referral rewards
    const { data: effectivePlan, error: effectiveError } = await supabase
      .rpc('get_effective_user_plan', { user_uuid: user.id });
    
    if (effectiveError) {
      console.error("Error fetching effective user plan:", effectiveError);
    }
    
    // Also get the actual user plan for plan management operations
    const { data: actualPlan, error: actualError } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (actualError) {
      console.error("Error fetching user plan:", actualError);
    }
    
    // If we have an effective plan from referral rewards, promo codes, or actual plan
    if (effectivePlan && effectivePlan.length > 0) {
      const effective = effectivePlan[0];
      // Create a plan object that combines effective plan with actual plan data
      const combinedPlan = {
        id: actualPlan?.id || (effective.is_promo_code ? 'promo-code' : 'referral-reward'),
        plan_id: effective.plan_id,
        started_at: actualPlan?.started_at || new Date().toISOString(),
        updated_at: actualPlan?.updated_at || new Date().toISOString(),
        user_id: user.id,
        expires_at: effective.expires_at || null,
        gumroad_purchase_id: actualPlan?.gumroad_purchase_id || null,
        paused_referral_reward: (actualPlan as any)?.paused_referral_reward || null,
        is_referral_reward: effective.is_referral_reward || false,
        is_promo_code: effective.is_promo_code || false
      };
      setUserPlan(combinedPlan);
    } else if (actualPlan) {
      setUserPlan({
        ...actualPlan,
        paused_referral_reward: (actualPlan as any)?.paused_referral_reward || null
      });
    } else {
      setUserPlan(null);
    }
    
    setLoading(false);
  };

  const refetch = async () => {
    await fetchUserPlan();
  };

  useEffect(() => {
    fetchUserPlan();
  }, [user]);

  const selectPlan = async (planId: string) => {
    if (!user) return { success: false, error: "Not signed in" };
    setRefreshing(true);

    // Check if a plan already exists for the user
    const { data: current, error: fetchErr } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let error, data;
    if (current) {
      // Update existing plan
      ({ data, error } = await supabase
        .from("user_plans")
        .update({
          plan_id: planId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .maybeSingle()
      );
    } else {
      // Insert new plan
      ({ data, error } = await supabase
        .from("user_plans")
        .insert({
          user_id: user.id,
          plan_id: planId,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle()
      );
    }
    if (!error && data) {
      setUserPlan({
        ...data,
        paused_referral_reward: (data as any)?.paused_referral_reward || null
      });
      setRefreshing(false);
      return { success: true };
    } else {
      setRefreshing(false);
      return { success: false, error: error?.message ?? "Unknown error" };
    }
  };

  return { userPlan, loading, selectPlan, refreshing, refetch };
}
