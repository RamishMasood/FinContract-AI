
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
    "name": "Legal Insight AI Pricing - AI Legal Suite Plans",
    "description": "Choose the perfect plan for your legal document needs. Free trial available with premium features for contract analysis, document generation, legal advice, and more.",
    "url": "https://legalinsightai.software/pricing",
    "mainEntity": {
      "@type": "Product",
      "name": "Legal Insight AI Suite",
      "description": "Complete AI legal suite for contract analysis and document generation",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Trial",
          "price": "0",
          "priceCurrency": "USD",
          "description": "One free contract analysis"
        },
        {
          "@type": "Offer", 
          "name": "Monthly Subscription",
          "price": "29",
          "priceCurrency": "USD",
          "description": "Full access to all AI legal tools"
        }
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - Legal Insight AI Legal Suite"
        description="Affordable pricing for our complete AI legal suite. Start with a free trial, then choose from our flexible plans for contract analysis, document generation, legal advice, and more."
        keywords="legal AI pricing, contract analysis cost, AI legal tools pricing, legal software subscription, legal automation pricing, affordable legal AI, legal tech pricing plans"
        canonicalUrl="https://legalinsightai.software/pricing"
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
