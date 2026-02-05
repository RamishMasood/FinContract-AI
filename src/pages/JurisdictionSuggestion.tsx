
import PremiumFeatureGuard from "@/components/common/PremiumFeatureGuard";
import JurisdictionSuggestionWidget from "@/components/dashboard/JurisdictionSuggestionWidget";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const JurisdictionSuggestion = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <PremiumFeatureGuard 
            feature="jurisdictionSuggestions"
            title="Jurisdiction-Based Suggestions"
            description="Get region-specific legal advice and clause recommendations"
          >
            <JurisdictionSuggestionWidget />
          </PremiumFeatureGuard>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JurisdictionSuggestion;
