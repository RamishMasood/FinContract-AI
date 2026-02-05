
import PremiumFeatureGuard from "@/components/common/PremiumFeatureGuard";
import EmailDisputeResponseWidget from "@/components/dashboard/EmailDisputeResponseWidget";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DisputeEmail = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <PremiumFeatureGuard 
            feature="disputeResponse"
            title="Email-Based Dispute Response"
            description="Generate professional dispute response emails with AI assistance"
          >
            <EmailDisputeResponseWidget />
          </PremiumFeatureGuard>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DisputeEmail;
