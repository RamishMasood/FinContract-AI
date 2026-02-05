import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Documentation = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Documentation</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p className="text-legal-muted mb-4">
              Learn how to use Legal Insight AI to analyze your contracts and legal documents.
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-legal-primary pl-4">
                <h3 className="font-medium mb-2">1. Upload Your Document</h3>
                <p className="text-legal-muted">
                  Upload your contract or legal document in PDF, DOCX, or text format through our secure interface.
                </p>
              </div>
              <div className="border-l-4 border-legal-primary pl-4">
                <h3 className="font-medium mb-2">2. Review Analysis</h3>
                <p className="text-legal-muted">
                  Our AI will analyze your document and provide a detailed report highlighting potential issues and suggestions.
                </p>
              </div>
              <div className="border-l-4 border-legal-primary pl-4">
                <h3 className="font-medium mb-2">3. Export Results</h3>
                <p className="text-legal-muted">
                  Download the analysis or improved contract version for your records or to share with your legal team.
                </p>
              </div>
            </div>
          </div>
          
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">API Documentation</h2>
              <p className="text-legal-muted">
                Integrate Legal Insight AI's contract analysis capabilities into your own applications using our API.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">User Guides</h2>
              <p className="text-legal-muted">
                Detailed guides on how to use all features of Legal Insight AI, from basic analysis to advanced customization.
              </p>
            </div>
          </div> */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Documentation;
