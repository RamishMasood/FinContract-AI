
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
            title="Legal Advice Chat"
            description="Get instant legal guidance through our AI-powered chat interface"
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
