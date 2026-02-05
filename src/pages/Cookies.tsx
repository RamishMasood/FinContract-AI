import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Cookies = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">1. What Are Cookies</h2>
              <p className="text-legal-muted">
                Cookies are small text files that are placed on your computer or mobile device when you visit a 
                website. They are widely used to make websites work more efficiently and provide information to 
                the website owners.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">2. How We Use Cookies</h2>
              <p className="text-legal-muted">
                We use cookies for several purposes, including:
              </p>
              <ul className="list-disc pl-6 text-legal-muted space-y-1">
                <li>Authentication: To recognize you when you return to our website and maintain your login session.</li>
                <li>Preferences: To remember your settings and preferences.</li>
                <li>Analytics: To understand how visitors interact with our website and improve its performance.</li>
                <li>Marketing: To deliver more relevant advertisements and track the effectiveness of our marketing campaigns.</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">3. Types of Cookies We Use</h2>
              <p className="text-legal-muted">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 text-legal-muted space-y-1">
                <li><strong>Essential cookies:</strong> These are necessary for the website to function properly.</li>
                <li><strong>Preference cookies:</strong> These remember your settings and preferences.</li>
                <li><strong>Analytics cookies:</strong> These help us understand how visitors interact with our website.</li>
                <li><strong>Marketing cookies:</strong> These are used to track visitors across websites to display relevant advertisements.</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">4. Managing Cookies</h2>
              <p className="text-legal-muted">
                Most web browsers allow you to control cookies through their settings. You can usually find these 
                settings in the "Options" or "Preferences" menu of your browser. You can also delete cookies that 
                have already been set.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">5. Third-Party Cookies</h2>
              <p className="text-legal-muted">
                We also use third-party services that may set cookies on your device. These third parties include 
                analytics providers, advertising networks, and social media platforms.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">6. Changes to This Policy</h2>
              <p className="text-legal-muted">
                We may update this cookie policy from time to time. We will notify you of any changes by posting 
                the new policy on our website and updating the "Last Updated" date.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold">7. Contact Us</h2>
              <p className="text-legal-muted">
                If you have any questions about this cookie policy, please contact us at privacy@legalinsightai.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cookies;
