
import PremiumFeatureGuard from "@/components/common/PremiumFeatureGuard";
import LegalAdviceChatWidget from "@/components/dashboard/LegalAdviceChatWidget";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const LegalChat = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <PremiumFeatureGuard 
            feature="legalChat"
            title="Regulatory Risk Chat"
            description="Ask compliance questions: e.g. 'Is this CFD clause compliant under Malta law?' or 'Does this meet CFTC requirements?'"
          >
            <LegalAdviceChatWidget />
          </PremiumFeatureGuard>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalChat;
