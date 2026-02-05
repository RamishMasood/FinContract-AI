import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";

const Terms = () => {
  const { user } = useAuth();
  
  return (
    <>
      <SEOHead
        title="Terms of Service - FinContract AI"
        description="Read FinContract AI's terms of service covering trading contract analysis, subscriptions, free trials, and user responsibilities."
        keywords="FinContract AI terms, trading contract compliance terms, finance AI terms of service"
        canonicalUrl="https://fincontract.ai/terms"
        noIndex={true}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">1. Introduction</h2>
              <p className="text-legal-muted">
                These Terms of Service govern your use of FinContract AI, accessible at fincontract.ai. 
                By using our service, you agree to be bound by these Terms. If you disagree with any part of 
                these terms, you may not access the service.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">2. Subscriptions</h2>
              <p className="text-legal-muted">
                Some parts of the Service are billed on a subscription basis. You will be billed in advance 
                on a recurring and periodic basis, depending on the type of subscription plan you select.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">3. Free Trial</h2>
              <p className="text-legal-muted">
                We offer a 7-day free trial for new users. The trial automatically converts to a paid subscription 
                unless cancelled before the trial period ends. You will not be charged if you cancel before the 
                trial period ends.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">4. Content</h2>
              <p className="text-legal-muted">
                Our Service allows you to upload, link, store, share and otherwise make available certain 
                information, text, graphics, or other material. You retain any rights that you may have in 
                your content.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">5. Use of AI Analysis</h2>
              <p className="text-legal-muted">
                The analysis provided by FinContract AI is generated using artificial intelligence and 
                should not be considered legal advice. Always consult with a qualified attorney before making 
                legal decisions or signing contracts based on our analysis.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">6. Changes to Terms</h2>
              <p className="text-legal-muted">
                We may modify these Terms at any time. We will provide notice of significant changes to the Terms, 
                such as by posting a notice on our site or sending you an email. Your continued use of the Service 
                after any modification indicates your acceptance of the updated Terms.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">7. Contact Us</h2>
              <p className="text-legal-muted">
                If you have any questions about these Terms, please contact us at legal@fincontract.ai.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      </div>
    </>
  );
};

export default Terms;
