import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";

const FAQ = () => {
  const { user } = useAuth();
  
  // Structured data for FAQ page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is FinContract AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FinContract AI is an AI-powered tool for trading and finance contract compliance. It helps you scan CFDs, futures, and client agreements for leverage risks, fraud-prone clauses, and regulatory gaps, and suggests compliant improvements."
        }
      },
      {
        "@type": "Question", 
        "name": "How accurate is the analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI models are trained on thousands of legal documents and provide high-quality analysis. However, AI analysis should not replace legal advice from a qualified attorney for critical matters."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data secure?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Yes, we take data security seriously. All documents are encrypted both in transit and at rest. We do not share your documents with third parties, and you can delete your data at any time."
        }
      },
      {
        "@type": "Question",
        "name": "What file formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We currently support PDF, DOCX, and plain text files. We're working on adding support for more file formats in the future."
        }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="FinContract AI FAQ - Frequently Asked Questions"
        description="Get answers about FinContract AI's trading contract risk scanner, compliant agreements, regulatory chat, and compliance scoring. Features, pricing, and security."
        keywords="FinContract AI FAQ, trading contract compliance, CFD risk analysis questions, finance contract AI"
        canonicalUrl="https://fincontract.ai/faq"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">What is FinContract AI?</h3>
              <p className="text-slate-600">
                FinContract AI is an AI-powered tool for trading and finance contract compliance. It scans CFDs, futures, and client agreements for leverage risks, fraud-prone clauses, and regulatory gaps, and suggests compliant improvements—built for brokers and fintech like Deriv.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">How accurate is the analysis?</h3>
              <p className="text-legal-muted">
                Our AI models are trained on thousands of legal documents and provide high-quality analysis. 
                However, AI analysis should not replace legal advice from a qualified attorney for critical matters.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">Is my data secure?</h3>
              <p className="text-legal-muted">
                Yes, we take data security seriously. All documents are encrypted both in transit and at rest. 
                We do not share your documents with third parties, and you can delete your data at any time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">What file formats are supported?</h3>
              <p className="text-legal-muted">
                We currently support PDF, DOCX, and plain text files. We're working on adding support for more file formats in the future.
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

export default FAQ;
