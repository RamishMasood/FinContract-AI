
import { useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PricingPlans from "@/components/pricing/PricingPlans";
import SEOHead from "@/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

/**
 * Protects plan switching behind auth, like a real product does.
 */
const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Prohibit selection if NOT logged in; otherwise invoke
  const handleSelectPlan = useCallback(
    (planId: string) => {
      if (!user) {
        toast({
          title: "Sign up required",
          description: "Please sign up or log in to select a plan.",
          variant: "destructive"
        });
        navigate("/auth?tab=signup");
        return;
      }
      // Plan selection is handled inside PricingPlans itself (with backend connection)
      // But could do additional logic here (redirect to stripe etc. if needed)
    },
    [user, navigate, toast]
  );

  // Structured data for pricing page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "FinContract AI Pricing - Trading & Finance Compliance Plans",
    "description": "Choose the right plan for trading contract compliance. Free trial, then Basic or Premium for full risk scanning, compliant agreements, and regulatory chat.",
    "url": "https://fincontract.ai/pricing",
    "mainEntity": {
      "@type": "Product",
      "name": "FinContract AI",
      "description": "AI for trading and finance contract compliance, risk detection, regulatory checks, and jurisdiction-specific rules",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Trial",
          "price": "0",
          "priceCurrency": "USD",
          "description": "One free trading contract analysis with risk detection"
        },
        {
          "@type": "Offer",
          "name": "Basic",
          "price": "9.99",
          "priceCurrency": "USD",
          "description": "10 analyses/month, improvements, comparison, clause explanations"
        },
        {
          "@type": "Offer",
          "name": "Premium",
          "price": "29.99",
          "priceCurrency": "USD",
          "description": "Unlimited analyses and full FinContract AI: agreements, regulatory chat, dispute response, jurisdiction rules"
        }
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - FinContract AI | Trading Contract Compliance"
        description="Affordable pricing for trading contract compliance. Start free, then upgrade for full risk scanner, compliant agreements, and regulatory chat."
        keywords="FinContract AI pricing, trading contract compliance cost, finance contract AI plans"
        canonicalUrl="https://fincontract.ai/pricing"
        structuredData={structuredData}
        additionalMeta={[
          { name: "robots", content: "index,follow,noarchive" }
        ]}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4">
            <PricingPlans onSelectPlan={handleSelectPlan} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
