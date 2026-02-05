import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Star, Circle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PLANS, { Plan } from "@/constants/pricingPlans";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaqSection from "./FaqSection";
import gumroadService, { GUMROAD_PRODUCTS } from "@/services/gumroadService";
import { usePlanExpiration } from "@/hooks/usePlanExpiration";
import usePlanUsage from "@/hooks/usePlanUsage";

// List icon based on plan index
const planIcons = [
  <Circle key="circle" className="w-8 h-8 text-legal-primary" strokeWidth={2} />,
  <Star key="star" className="w-8 h-8 text-legal-primary" strokeWidth={2} />,
  <Crown key="crown" className="w-8 h-8 text-legal-primary" strokeWidth={2} />
];

// Helper to merge features
function getPlanFeatureMap(plan: Plan) {
  const included = plan.features.map((f) => ({
    feature: f,
    included: true,
  }));
  const notIncluded =
    plan.notIncluded?.map((f) => ({
      feature: f,
      included: false,
    })) || [];
  return [...included, ...notIncluded];
}

// Helper: Extract all unique features from all plans
function getAllFeatures(plans: Plan[]) {
  const featuresSet = new Set<string>();
  plans.forEach(plan => {
    plan.features.forEach(f => featuresSet.add(f));
    plan.notIncluded?.forEach(f => featuresSet.add(f));
  });
  return Array.from(featuresSet);
}

// Helper: Get feature value for a plan
function getFeatureStatus(plan: Plan, feature: string) {
  if (plan.features.includes(feature)) return true;
  if (plan.notIncluded?.includes(feature)) return false;
  return null;
}

type PricingPlansProps = {
  onSelectPlan?: (planId: string) => void;
};

const PricingPlans = ({ onSelectPlan }: PricingPlansProps) => {
  const { user } = useAuth();
  const { userPlan, loading, selectPlan, refreshing } = useUserPlan();
  const { hasPaidPlans } = usePlanUsage();
  const { toast } = useToast();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use the plan expiration hook
  usePlanExpiration();

  const currentPlanId = userPlan?.plan_id ?? "free";
  const isFreeTrial = currentPlanId === "free" || !userPlan;
  
  // Check if plan is expired
  const isPlanExpired = userPlan?.expires_at ? 
    new Date(userPlan.expires_at) < new Date() : false;
  
  // Effective plan ID considering expiration
  const effectivePlanId = isPlanExpired ? "free" : currentPlanId;

  const handleSelectPlan = async (planId: string) => {
    console.log('handleSelectPlan called with planId:', planId);
    
    if (!user) {
      // For logged out users, redirect them to signup/login page
      navigate("/auth?tab=signup");
      return;
    }

    // Handle free plan selection - only allow if user has no paid plans
    if (planId === "free") {
      if (hasPaidPlans) {
        toast({
          title: "Cannot Select Free Plan",
          description: "You have purchased paid plans. Free trial is no longer available.",
          variant: "destructive",
        });
        return;
      }
      
      setPendingPlan(planId);
      const res = await selectPlan(planId);
      setPendingPlan(null);
      
      if (res.success) {
        toast({
          title: "Plan Updated!",
          description: "You are now on the Free Trial plan.",
          variant: "default",
        });
        onSelectPlan?.(planId);
      }
      return;
    }

    // For paid plans, redirect to Gumroad
    try {
      const returnUrl = `${window.location.origin}/dashboard`;
      const product = GUMROAD_PRODUCTS[planId];
      
      console.log('Selected plan:', planId);
      console.log('Product config:', product);
      
      if (!product) {
        throw new Error(`No product configuration found for plan: ${planId}`);
      }

      const checkoutUrl = gumroadService.generateCheckoutUrl({
        productId: product.productId,
        planId,
        userId: user.id,
        userEmail: user.email,
        returnUrl
      });

      console.log('Final checkout URL:', checkoutUrl);

      // Show processing message
      toast({
        title: "Redirecting to Gumroad",
        description: `You'll be redirected to complete your purchase for ${product.name}.`,
      });

      // Small delay to show the toast
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);
    } catch (error) {
      console.error('Error generating checkout URL:', error);
      toast({
        title: "Error",
        description: "Failed to redirect to payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <span className="animate-spin h-8 w-8 border-4 border-legal-primary border-t-transparent rounded-full" aria-label="Loading..." />
      </div>
    );
  }

  return (
    <>
      {/* Pricing Plans Section */}
      <section className="w-full flex flex-col items-center py-8 sm:py-14 px-1 sm:px-2 bg-transparent">
        <h2 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-2 sm:mb-3">
          <span>Choose Your&nbsp;</span>
          <span className="bg-gradient-to-r from-[#b96fdb] to-[#667eea] text-transparent bg-clip-text font-extrabold">Plan</span>
        </h2>
        <p className="text-legal-muted text-sm xs:text-base sm:text-xl text-center mb-6 sm:mb-12">
          Start free with one analysis, then scale with compliance and risk tools for trading contracts
        </p>
        {/* Alert for not logged in */}
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 py-2 px-3 sm:px-4 rounded text-xs xs:text-sm sm:text-base mb-6 sm:mb-8">
            <strong>Note:</strong> Please sign up or log in to activate a plan.
          </div>
        )}
        {/* Expiration alert */}
        {isPlanExpired && (
          <div className="bg-red-50 border border-red-200 text-red-900 py-2 px-3 sm:px-4 rounded text-xs xs:text-sm sm:text-base mb-6 sm:mb-8">
            <strong>Notice:</strong> Your subscription has expired. Please renew to continue using premium features.
          </div>
        )}
        {/* PLANS */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 z-10 relative">
          {PLANS.map((plan, i) => {
            const isCurrent = !!userPlan && effectivePlanId === plan.id;
            const isProcessing = pendingPlan === plan.id || refreshing;
            const allFeatures = getPlanFeatureMap(plan);
            const isPopular = plan.highlight;
            
            // Button state logic - disable if current plan and not expired, or if free plan but has paid plans
            const isDisabled = isProcessing || 
              (plan.id === "free" && hasPaidPlans) ||
              (isCurrent && !isPlanExpired);

            // Show expiration info for current plan
            const expirationInfo = isCurrent && userPlan?.expires_at ? 
              new Date(userPlan.expires_at) : null;

            // Card styling overrides
            let cardBg =
              isPopular
                ? "bg-gradient-to-b from-[#f1ecff] to-[#e5e9ff] border-[#a389fd] shadow-legal-primary/20 ring-2 ring-[#a389fd]"
                : "bg-white border-legal-primary/10";
            cardBg += " rounded-3xl border shadow-lg transition-all";
            // Enhanced hover for "Most Popular" premium monthly card
            let hoverClass =
              isPopular
                ? "hover:ring-4 hover:ring-[#a389fd] hover:border-[#a389fd] hover:shadow-[0_0_32px_4px_rgba(179,111,220,0.25)]"
                : "hover:scale-105";
            cardBg += ` ${hoverClass}`;
            // Glow effect for main card
            let extraOverlay = isPopular
              ? "after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:shadow-[0_0_64px_8px_rgba(179,111,220,0.08)] after:pointer-events-none after:-z-0"
              : "";

            return (
              <div
                key={plan.id}
                className={cn("relative", extraOverlay)}
              >
                {/* Most Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#d286ff] to-[#716fed] shadow-sm text-white text-xs xs:text-sm sm:text-base font-semibold px-3 xs:px-4 sm:px-5 py-1 xs:py-1.5 rounded-full border-2 sm:border-4 border-white drop-shadow animate-fade-in tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}
                <Card className={cn(
                  cardBg,
                  // Increased top padding for all breakpoints
                  "relative flex flex-col items-center px-4 xs:px-6 sm:px-8 pt-12 xs:pt-16 sm:pt-20 pb-6 xs:pb-7 sm:pb-8 min-h-[420px] xs:min-h-[480px] sm:min-h-[540px] group"
                )}>
                  {/* Icon */}
                  <div className="mt-1 flex items-center justify-center h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 rounded-full bg-white shadow-md z-10 mb-2 xs:mb-3 border-2 xs:border-4 border-[#ece7fa] -mt-8 xs:-mt-10 sm:-mt-11">
                    {planIcons[i]}
                  </div>
                  {/* Title */}
                  <h3 className="mt-1 mb-1 text-lg xs:text-xl sm:text-2xl font-bold text-center text-legal-text">{plan.name}</h3>
                  {/* Price and per/month */}
                  <div className="mb-2 text-3xl xs:text-4xl sm:text-5xl font-extrabold text-legal-primary flex items-end gap-1 justify-center leading-[1.1]">
                    {plan.price}
                    {(plan.id === "basic" || plan.id === "premium") && (
                      <span className="text-xs xs:text-sm sm:text-base font-normal text-legal-muted mb-1 xs:mb-2 ml-0.5">/mo</span>
                    )}
                  </div>
                  {/* Status info */}
                  {isCurrent && !isPlanExpired && expirationInfo && (
                    <div className="mb-2 text-xs xs:text-sm sm:text-sm text-legal-muted">
                      {(plan.id === 'premium' || plan.id === 'basic') ? 
                        `Expires: ${expirationInfo.toLocaleDateString()}` :
                        'Active'
                      }
                    </div>
                  )}
                  {isCurrent && isPlanExpired && (
                    <div className="mb-2 text-xs xs:text-sm sm:text-sm text-red-600">
                      Expired
                    </div>
                  )}
                  {/* Description */}
                  <div className="mb-4 xs:mb-5 sm:mb-6 text-legal-muted text-xs xs:text-sm sm:text-md text-center px-0 min-h-[32px] xs:min-h-[38px] sm:min-h-[42px]">{plan.description}</div>
                  {/* Features */}
                  <ul className="w-full flex flex-col gap-2 xs:gap-2.5 sm:gap-3 mb-6 xs:mb-8 sm:mb-9">
                    {allFeatures.map(({ feature, included }, idx) => (
                      <li
                        key={idx}
                        className={cn(
                          "flex items-center gap-2 xs:gap-3 text-xs xs:text-sm sm:text-base",
                          included ? "text-legal-text" : "text-legal-muted line-through opacity-60"
                        )}
                      >
                        <Check className="h-4 w-4 xs:h-5 xs:w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Select button styling */}
                  <Button
                    className={cn(
                      "w-full mt-auto px-0 py-2 xs:py-2.5 sm:py-3 h-11 xs:h-12 sm:h-14 transition-all text-base xs:text-lg sm:text-lg font-semibold rounded-xl",
                      isPopular
                        ? "bg-gradient-to-r from-[#b96fdb] to-[#667eea] text-white shadow-lg hover:from-[#a877db] hover:to-[#5b62cc]"
                        : "bg-white text-legal-primary border border-legal-primary hover:bg-legal-primary/10 font-bold",
                      isDisabled && "opacity-60 pointer-events-none cursor-not-allowed"
                    )}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isDisabled}
                  >
                    {plan.id === "free" && hasPaidPlans
                      ? "Not Available"
                      : isCurrent && !isPlanExpired
                      ? "Current Plan"
                      : isCurrent && isPlanExpired
                      ? "Renew Plan"
                      : isProcessing
                      ? "Processing..."
                      : plan.id === "free"
                      ? "Start Free"
                      : "Subscribe Now"}
                  </Button>
                  
                </Card>
              </div>
            );
          })}
        </div>

      </section>

      {/* Compare All Features Section */}
      <section className="w-full flex flex-col items-center py-10 sm:py-16 px-2 sm:px-4 bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2">
          Compare Compliance & Risk Features
        </h2>
        <p className="text-legal-muted text-center mb-6 max-w-xl">
          See what’s included in each plan for trading contract analysis and FinContract AI tools
        </p>
        <div
          className="w-full max-w-5xl border-b border-legal-primary/10"
          style={{
            // Remove overflow-x-scroll from desktop
            // Only show horizontal scroll on mobile/tablet
          }}
        >
          <style>{`
            .pricing-scroll {
              overflow-x: scroll !important;
              -webkit-overflow-scrolling: auto !important;
            }
            .pricing-scroll::-webkit-scrollbar {
              height: 8px;
              display: block !important;
            }
            .pricing-scroll::-webkit-scrollbar-thumb {
              background: #7c3aed;
              border-radius: 6px;
            }
            .pricing-scroll::-webkit-scrollbar-track {
              background: #f3f4f6;
            }
            /* Hide scroller on desktop */
            @media (min-width: 640px) {
              .pricing-scroll {
                overflow-x: visible !important;
                -webkit-overflow-scrolling: auto !important;
              }
              .pricing-scroll::-webkit-scrollbar {
                display: none !important;
              }
            }
          `}</style>
          <div
            className="pricing-scroll"
            style={{
              overflowX: "scroll",
            }}
          >
            <table className="min-w-[600px] sm:min-w-full border-separate border-spacing-y-2">
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  <th className="text-left font-semibold text-xs xs:text-sm sm:text-lg py-2 px-2 whitespace-nowrap">Feature</th>
                  {PLANS.map(plan => (
                    <th key={plan.id} className="text-center font-semibold text-xs xs:text-sm sm:text-lg py-2 px-2 whitespace-nowrap">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getAllFeatures(PLANS).map((feature, idx) => (
                  <tr key={idx} className="bg-[#f9f7fc]">
                    <td className="py-2 px-2 text-xs xs:text-sm sm:text-base font-medium whitespace-nowrap">{feature}</td>
                    {PLANS.map(plan => {
                      const status = getFeatureStatus(plan, feature);
                      return (
                        <td key={plan.id} className="text-center py-2 px-2">
                          {status === true ? (
                            <Check className="inline-block text-green-500 w-5 h-5" />
                          ) : status === false ? (
                            <X className="inline-block text-red-400 w-5 h-5" />
                          ) : (
                            <span className="text-legal-muted">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

  
    </>
  );
};

export default PricingPlans;
