import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Phone, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Help = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Add category to form state
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    subject: "",
    message: "",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Web3Forms API submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Web3Forms API submission
      const formDataForWeb3 = new FormData();
      formDataForWeb3.append("access_key", "b0067015-58be-4ae4-9ed4-2ee21b143ac8");
      formDataForWeb3.append("name", formData.name);
      formDataForWeb3.append("email", formData.email);
      formDataForWeb3.append("subject", `[${formData.category.toUpperCase()}] ${formData.subject}`);
      formDataForWeb3.append("message", `Category: ${formData.category}\n\nMessage:\n${formData.message}`);
      formDataForWeb3.append("from_name", "Legal Insight AI");
      formDataForWeb3.append("to_email", "services@fastendtech.com");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataForWeb3
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent Successfully",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        });

        // Reset form
        setFormData({
          name: "",
          email: user?.email || "",
          subject: "",
          message: "",
          category: "general"
        });
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly at services@fastendtech.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Structured data for help page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Legal Insight AI Help Center",
    "description": "Get support and answers for Legal Insight AI. Contact our support team for help with contract analysis, document generation, and AI legal tools.",
    "url": "https://legalinsightai.software/help",
    "mainEntity": {
      "@type": "Organization",
      "name": "Legal Insight AI Support",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "services@fastendtech.com",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Legal Insight AI Help Center - Get Support & Contact Us"
        description="Get help with Legal Insight AI's contract analysis and legal tools. Contact our support team for assistance with features, billing, and technical issues. Fast response guaranteed."
        keywords="legal AI support, contract analysis help, legal software support, AI legal tools help, legal technology customer service, legal automation support"
        canonicalUrl="https://legalinsightai.software/help"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Help Center</h1>
            <p className="text-legal-muted mb-8">Get support and answers to your questions</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="How can we help you?"
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-legal-primary hover:bg-legal-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </div>
            
            <div>
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-legal-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <p className="text-legal-muted">services@fastendtech.com</p>
                    </div>
                  </div>
                  {/* <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-legal-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Phone</h4>
                      <p className="text-legal-muted">+1 (800) 555-0123</p>
                    </div>
                  </div> */}
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-legal-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Support Hours</h4>
                      <p className="text-legal-muted">Monday - Friday, 9am - 5pm EST</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Live Chat</h3>
                <p className="text-legal-muted mb-4">
                  Need immediate assistance? Start a live chat with our support team.
                </p>
                <Button className="w-full flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Live Chat</span>
                </Button>
              </Card> */}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      </div>
    </>
  );
};

export default Help;
