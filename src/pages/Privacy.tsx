import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Privacy = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">1. Information We Collect</h2>
              <p className="text-legal-muted">
                We collect information you provide directly to us when you create an account, upload documents, 
                or contact us. This may include your name, email address, payment information, and the content 
                of documents you upload for analysis.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
              <p className="text-legal-muted">
                We use the information we collect to provide, maintain, and improve our services, including to 
                process transactions, send communications, and analyze usage patterns. We also use your documents 
                to provide AI-powered contract analysis.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">3. Data Security</h2>
              <p className="text-legal-muted">
                We take reasonable measures to help protect information about you from loss, theft, misuse, 
                unauthorized access, disclosure, alteration, and destruction. All documents are encrypted both 
                in transit and at rest.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">4. Document Retention</h2>
              <p className="text-legal-muted">
                We retain your documents for as long as your account is active or as needed to provide services. 
                You can delete your documents at any time. We may retain and use your information as necessary 
                to comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">5. Sharing Your Information</h2>
              <p className="text-legal-muted">
                We do not share your personal information or documents with third parties except as described 
                in this policy. We may share information with vendors, consultants, and other service providers 
                who need access to such information to carry out work on our behalf.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">6. Your Rights</h2>
              <p className="text-legal-muted">
                You have the right to access, correct, or delete your personal information and documents. 
                You can access or update your account information at any time by logging into your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">7. Changes to This Policy</h2>
              <p className="text-legal-muted">
                We may update this privacy policy from time to time. We will notify you of any changes by 
                posting the new policy on our website and updating the "Last Updated" date.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">8. Contact Us</h2>
              <p className="text-legal-muted">
                If you have any questions about this privacy policy, please contact us at privacy@legalinsightai.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
