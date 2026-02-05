
import { usePlanUsage } from "./usePlanUsage";

// Hook to check if user has access to premium features
export function usePlanFeatureAccess() {
  const { planId, originalPlanId, isPlanExpired, isLoading, hasPaidPlans } = usePlanUsage();

  // Use effective plan ID (considering expiration)
  const effectivePlanId = isPlanExpired ? "free" : originalPlanId;

  const hasPremiumAccess = effectivePlanId === "premium" && !isPlanExpired;
  const hasBasicAccess = effectivePlanId === "basic" && !isPlanExpired;
  const hasPayPerUseAccess = (effectivePlanId === "pay-per-use" && !isPlanExpired) || hasPremiumAccess;
  const hasFreeAccess = effectivePlanId === "free" || hasPayPerUseAccess;

    // Premium features that require active premium subscription
    const premiumFeatures = {
      // Only active premium subscription users can access these
      ndaGenerator: hasPremiumAccess,
      legalChat: hasPremiumAccess,
      disputeResponse: hasPremiumAccess,
      jurisdictionSuggestions: hasPremiumAccess,
      
      // Contract analysis features by plan - Basic and Premium have access
      // Previously paid users can access explanations and downloads for their old analyses
      contractAnalysis: true, // Available to all (viewing existing analysis)
      improvementSuggestions: hasBasicAccess || hasPayPerUseAccess || hasPaidPlans, // Available to current subscribers and previously paid users
      sideBySideComparison: hasBasicAccess || hasPayPerUseAccess || hasPaidPlans, // Available to current subscribers and previously paid users
      advancedClauseSuggestions: hasBasicAccess || hasPayPerUseAccess || hasPaidPlans, // Available to current subscribers and previously paid users
      downloadableImproved: hasBasicAccess || hasPayPerUseAccess || hasPaidPlans, // Available to current subscribers and previously paid users
      clauseExplanations: hasBasicAccess || hasPayPerUseAccess || hasPaidPlans, // Available to current subscribers and previously paid users
    };

  const getAccessMessage = (feature: keyof typeof premiumFeatures) => {
    if (premiumFeatures[feature]) return null;
    
    if (isPlanExpired) {
      return "Your subscription has expired. Please renew to access this feature.";
    }
    
    if (["ndaGenerator", "legalChat", "disputeResponse", "jurisdictionSuggestions"].includes(feature)) {
      return "This feature requires an active Premium Subscription.";
    }
    
    return "This feature requires a paid plan. Upgrade to unlock advanced analysis features.";
  };

  return {
    ...premiumFeatures,
    planId: effectivePlanId,
    originalPlanId,
    isPlanExpired,
    isLoading,
    getAccessMessage,
  };
}

export default usePlanFeatureAccess;
