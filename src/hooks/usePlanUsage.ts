
import { useMemo } from "react";
import { useUserPlan } from "./useUserPlan";
import { useQuery } from "@tanstack/react-query";
import contractAnalysisService from "@/services/contractAnalysisService";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Centralized hook to get document usage and check plan restrictions
export function usePlanUsage() {
  const { user } = useAuth();
  const { userPlan, loading: userPlanLoading } = useUserPlan();

  // Calculate dates first to avoid temporal dead zone issues
  const now = new Date();
  const thisMonthStart = startOfMonth(now).toISOString();
  const thisMonthEnd = endOfMonth(now).toISOString();

  // Defensive: Wait until plan is loaded to avoid flashing wrong state
  const planId = userPlan?.plan_id || "free";
  
  // Check if plan is expired
  const isPlanExpired = userPlan?.expires_at ? 
    new Date(userPlan.expires_at) < new Date() : false;

  // Effective plan ID considering expiration
  const effectivePlanId = isPlanExpired ? "free" : planId;

  // Query for user's basic purchase count (for credits tracking)
  const { data: basicPurchases = 0 } = useQuery({
    queryKey: ["user-basic-purchases", user?.id, effectivePlanId],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from('gumroad_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_id', 'basic')
        .eq('status', 'completed');
      
      if (error) {
        console.error('Error fetching basic purchases:', error);
        return 0;
      }
      
      return data?.length || 0;
    },
    enabled: !userPlanLoading && !!user,
  });

  // Check if user has any paid plans
  const { data: hasPaidPlans = false } = useQuery({
    queryKey: ["user-has-paid-plans", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('gumroad_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');
      
      if (error) {
        console.error('Error checking paid plans:', error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    },
    enabled: !userPlanLoading && !!user,
  });

  // Query for user documents (visible ones)
  const { data: docs, isLoading: docsLoading, refetch } = useQuery({
    queryKey: ["user-documents", effectivePlanId, basicPurchases],
    queryFn: () => contractAnalysisService.getDocuments(),
    enabled: !userPlanLoading,
  });

  // Query for ALL documents including deleted ones (for usage calculation)
  const { data: usageCountFree } = useQuery({
    queryKey: ["user-usage-free", effectivePlanId, user?.id, thisMonthStart, thisMonthEnd],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .rpc('get_user_document_usage', {
          user_uuid: user.id,
          start_date: thisMonthStart,
          end_date: thisMonthEnd
        });
      
      if (error) {
        console.error('Error fetching usage count:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !userPlanLoading && !!user && effectivePlanId === "free",
  });

  const { data: usageCountBasic } = useQuery({
    queryKey: ["user-usage-basic", effectivePlanId, user?.id, userPlan?.started_at, thisMonthStart, thisMonthEnd],
    queryFn: async () => {
      if (!user || !userPlan?.started_at) return 0;
      
      const currentPlanStart = parseISO(userPlan.started_at);
      const countFromDate = currentPlanStart > parseISO(thisMonthStart) ? 
        currentPlanStart.toISOString() : thisMonthStart;
      
      const { data, error } = await supabase
        .rpc('get_user_document_usage', {
          user_uuid: user.id,
          start_date: countFromDate,
          end_date: thisMonthEnd
        });
      
      if (error) {
        console.error('Error fetching usage count:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !userPlanLoading && !!user && effectivePlanId === "basic" && !!userPlan?.started_at,
  });

  // Count documents based on plan type - use database function to get accurate usage including deleted docs
  const usedThisMonth = useMemo(() => {    
    if (effectivePlanId === "free") {
      // For free plan, count docs in current month (only if no paid plans)
      if (hasPaidPlans) return 0; // If user has paid plans, they can't use free credits
      return usageCountFree || 0;
    }
    
    if (effectivePlanId === "basic") {
      // For basic plan, use the specific usage count
      return usageCountBasic || 0;
    }
    
    if (effectivePlanId === "premium") {
      // Premium allows unlimited - return 0 for usage count
      return 0;
    }
    
    // Fallback to visible docs count
    return docs?.length || 0;
  }, [effectivePlanId, hasPaidPlans, usageCountFree, usageCountBasic, docs]);

  // Document limit by plan
  const docLimit = useMemo(() => {
    if (effectivePlanId === "premium") return Infinity; // Unlimited for premium
    if (effectivePlanId === "basic") return 10; // 10 per month for basic
    if (effectivePlanId === "free" && !hasPaidPlans) return 1; // 1 per month only if no paid plans
    return 0; // No free credits if user has paid plans
  }, [effectivePlanId, hasPaidPlans]);

  // Determine if over limit
  const limitReached = useMemo(() => {
    if (effectivePlanId === "premium") return false; // Never limited for premium
    if (effectivePlanId === "free" && hasPaidPlans) return true; // No free credits if user has paid plans
    if (effectivePlanId === "free") return usedThisMonth >= 1;
    if (effectivePlanId === "basic") {
      // For basic, check if they have used all 10 monthly credits
      return usedThisMonth >= 10;
    }
    return usedThisMonth >= docLimit;
  }, [effectivePlanId, usedThisMonth, docLimit, hasPaidPlans]);

  // Feature locks per plan (keep these in sync with PLANS features)
  const featureLocks = useMemo(() => {
    const isExpired = isPlanExpired;
    const currentPlan = isExpired ? "free" : planId;
    
    return {
      // Analysis features - available to basic monthly and premium
      sideBySideComparison: currentPlan === "free" && !hasPaidPlans,
      advancedClauseSuggestions: currentPlan === "free" && !hasPaidPlans,
      downloadableImproved: currentPlan === "free" && !hasPaidPlans,
      clauseExplanations: currentPlan === "free" && !hasPaidPlans,
      
      // Premium tools - only available to active premium subscribers
      ndaGenerator: currentPlan !== "premium" || isExpired,
      legalChat: currentPlan !== "premium" || isExpired,
      disputeResponse: currentPlan !== "premium" || isExpired,
      jurisdictionSuggestions: currentPlan !== "premium" || isExpired,
      
      // Other features
      priorityProcessing: currentPlan !== "premium" && currentPlan !== "pro",
      bulkUpload: currentPlan !== "pro",
      customClauses: currentPlan !== "pro",
      apiAccess: currentPlan !== "pro",
    };
  }, [planId, isPlanExpired, hasPaidPlans]);

  // Calculate available credits
  const availableCredits = useMemo(() => {
    if (effectivePlanId === "premium") return "Unlimited";
    if (effectivePlanId === "basic") return Math.max(0, 10 - usedThisMonth);
    if (effectivePlanId === "free" && !hasPaidPlans) return Math.max(0, 1 - usedThisMonth);
    return 0; // No credits if user has paid plans but is on free plan
  }, [effectivePlanId, usedThisMonth, hasPaidPlans]);

  return {
    planId: effectivePlanId,
    originalPlanId: planId,
    isPlanExpired,
    docLimit,
    usedThisMonth,
    limitReached,
    isLoading: docsLoading || userPlanLoading,
    docs: docs || [],
    featureLocks,
    refetch,
    availableCredits,
    basicPurchases,
    hasPaidPlans,
  };
}

export default usePlanUsage;
