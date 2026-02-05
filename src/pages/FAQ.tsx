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
        "name": "What is Legal Insight AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Legal Insight AI is an AI-powered contract analysis tool that helps you understand legal documents, identify potential risks, and suggest improvements to protect your interests."
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
        title="Legal Insight AI FAQ - Frequently Asked Questions"
        description="Get answers to common questions about Legal Insight AI's contract analysis, document generation, legal advice, and AI-powered legal tools. Learn about features, pricing, and security."
        keywords="legal AI FAQ, contract analysis questions, legal software help, AI legal tools FAQ, legal technology support, legal automation questions"
        canonicalUrl="https://legalinsightai.software/faq"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-3">What is Legal Insight AI?</h3>
              <p className="text-legal-muted">
                Legal Insight AI is an AI-powered contract analysis tool that helps you understand legal documents, 
                identify potential risks, and suggest improvements to protect your interests.
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
