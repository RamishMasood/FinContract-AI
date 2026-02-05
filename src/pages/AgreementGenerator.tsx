
import PremiumFeatureGuard from "@/components/common/PremiumFeatureGuard";
import AgreementGeneratorWidget from "@/components/dashboard/AgreementGeneratorWidget";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AgreementGenerator = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <PremiumFeatureGuard 
            feature="ndaGenerator"
            title="Compliant Agreement Generator"
            description="Generate compliant NDAs and client trading agreements for brokers and fintech with AI-powered templates"
          >
            <AgreementGeneratorWidget />
          </PremiumFeatureGuard>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgreementGenerator;
