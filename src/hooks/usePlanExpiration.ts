
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "./useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function usePlanExpiration() {
  const { user } = useAuth();
  const { userPlan, refetch } = useUserPlan();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !userPlan) return;

    const checkExpiration = async () => {
      // Check if current plan has expired
      if (userPlan.expires_at) {
        const expirationDate = new Date(userPlan.expires_at);
        const now = new Date();

        if (now > expirationDate && userPlan.plan_id !== 'free') {
          console.log('Plan expired, reverting to free');
          
          // Check if there's a paused referral reward to restore
          let restoredPlan = 'free';
          let restoredExpiry = null;
          
          if (userPlan.paused_referral_reward) {
            try {
              const pausedReward = JSON.parse(userPlan.paused_referral_reward);
              const remainingTimeMs = pausedReward.remaining_time_ms;
              
              if (remainingTimeMs > 0) {
                // Restore the referral reward plan
                restoredPlan = pausedReward.reward_plan_id;
                restoredExpiry = new Date(Date.now() + remainingTimeMs).toISOString();
                
                console.log('Restoring paused referral reward:', restoredPlan, 'expires at:', restoredExpiry);
                
                // Restore the referral reward in referral_rewards table
                await supabase
                  .from('referral_rewards')
                  .update({
                    starts_at: new Date().toISOString(),
                    expires_at: restoredExpiry
                  })
                  .eq('user_id', user.id)
                  .eq('plan_id', pausedReward.reward_plan_id);
              }
            } catch (e) {
              console.error('Error parsing paused referral reward:', e);
            }
          }
          
          // Update plan to free or restored referral plan
          const { error } = await supabase
            .from('user_plans')
            .update({
              plan_id: restoredPlan,
              expires_at: restoredExpiry,
              gumroad_purchase_id: null,
              paused_referral_reward: null, // Clear the paused reward data
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (!error) {
            // Refresh the plan data
            refetch();
            
            // Show appropriate notification
            const message = restoredPlan !== 'free' 
              ? `Your subscription has expired. You've been switched back to your ${restoredPlan} referral reward.`
              : "Your subscription has expired. You've been moved to the free plan.";
              
            toast({
              title: "Subscription Expired",
              description: message,
              variant: "destructive"
            });
          }
        }
      }
    };

    // Check immediately
    checkExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiration, 60000);

    return () => clearInterval(interval);
  }, [user, userPlan, refetch, toast]);
}
