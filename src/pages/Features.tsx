import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { AlertTriangle, FileText, Shield, PenTool, Clock, Scale, Upload, Download, BarChart3, Sparkles, CheckCircle, Star, User, Users, ArrowRight, MessageSquare, FileCheck, Mail, Crown, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- VerticalImageRotator: Rotates all images in /images vertically ---
function VerticalImageRotator() {
  // Make sure these filenames match exactly with your /public/images folder (no spaces, correct case)
  const images = [
    "/images/Analysis.png",
    "/images/RedFlags.png",
    "/images/Suggestions.png",
    "/images/Compare.png",
    "/images/Explanations.png",
    "/images/LegalChat.png",
    "/images/Disputes.png",
    "/images/Generate.png",
    "/images/Jurisdiction.png",
    "/images/Dashboard.png",
  ];
  const [current, setCurrent] = React.useState(0);
  const [broken, setBroken] = React.useState<number[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2600);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, images.length]);

  // If all images are broken, show a fallback
  const allBroken = broken.length === images.length;

  return (
    <div className="relative h-[380px] w-[98vw] max-w-[900px] sm:h-[460px] sm:w-[900px] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-white">
      {!allBroken ? images.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`FinContract AI ${src.split('/').pop()?.split('.')[0]} – trading and finance compliance`}
          className={`absolute left-0 top-0 w-full h-full object-contain rounded-2xl transition-all duration-700 ease-in-out
            ${idx === current ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-12 z-0"}
          `}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={e => {
            setBroken(b => b.includes(idx) ? b : [...b, idx]);
            console.error("Image failed to load:", src);
          }}
          style={{ boxShadow: idx === current ? "0 8px 32px #b96fdb22" : undefined }}
        />
      )) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <span className="text-4xl mb-2">🖼️</span>
          <span className="text-lg">No images found in <code>/src/images</code></span>
        </div>
      )}
      {/* Dots indicator */}
      {!allBroken && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block w-2 h-2 rounded-full transition-all duration-300 ${idx === current ? "bg-[#b96fdb]" : "bg-gray-300/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Features = () => {
  // Structured data for features page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "FinContract AI Features - Trading & Finance Compliance Tools",
    "description": "Powerful AI tools for trading and finance compliance: contract risk scanner, compliant agreement generator, regulatory chat, compliance scoring, jurisdiction-specific rules",
    "url": "https://fincontract.ai/features",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "FinContract AI",
      "featureList": [
        "Trading Contract Risk Scanner",
        "Compliant NDA and Client Agreement Generator",
        "Regulatory Risk Chat (e.g. Malta, CFTC)",
        "Predictive Compliance Scoring",
        "Jurisdiction-Specific Trading Rules (MiFID, SCA, etc.)"
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Powerful AI Tools for Trading & Finance Compliance - FinContract AI"
        description="Trading contract risk scanner, compliant agreement generator, regulatory chat, and jurisdiction-specific rules. Built for brokers and fintech."
        keywords="FinContract AI features, trading contract compliance, CFD risk scanner, compliant agreements, regulatory chat, MiFID CFTC Malta"
        canonicalUrl="https://fincontract.ai/features"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
        <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white to-slate-50 py-16 md:py-36 text-center animate-fade-in">
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 animate-enter drop-shadow-lg text-slate-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a5f] via-blue-600 to-emerald-600">Powerful AI Tools for Trading & Finance Compliance</span>
            </h1>
            <p className="text-slate-600 text-base md:text-xl max-w-3xl mx-auto mb-10 animate-fade-in">
              Risk scanner, compliant agreements, regulatory chat, and jurisdiction-specific rules – built for brokers and fintech like Deriv.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in">
              <Link to="/auth?tab=signup">
                <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90 text-white px-10 py-6 text-lg font-semibold shadow-xl rounded-lg transition-all duration-300 hover:scale-105">
                  Start Analyzing Trading Contracts Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/10 px-10 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                  View Pricing
                </Button>
              </Link>
            </div>
            {/* Replace static dashboard image with VerticalImageRotator */}
            <div className="flex justify-center max-w-4xl mx-auto animate-scale-in transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-1">
              <VerticalImageRotator />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* Key Benefits Section */}
        <section className="py-20 md:py-32 bg-white animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in text-slate-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a5f] to-emerald-600">Why FinContract AI for Finance?</span>
              </h2>
              <p className="text-slate-600 text-lg md:text-xl">
                Reduce review time by 80%, prevent fraud-prone clauses, and stay regulatory-aligned.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <BenefitCard icon={<Clock className="h-10 w-10 text-blue-600" />} colorClass="border-blue-500" title="80% Faster Review" description="Automate first-pass review of CFD terms, client agreements, and ISDA docs. Focus on high-value decisions." />
              <BenefitCard icon={<Shield className="h-10 w-10 text-emerald-600" />} colorClass="border-emerald-500" title="Anti-Fraud & Risk" description="Flag unilateral broker powers, missing suitability checks, and fraud-prone clauses before they become issues." />
              <BenefitCard icon={<PenTool className="h-10 w-10 text-amber-600" />} colorClass="border-amber-500" title="Regulatory Alignment" description="Malta, FCA, CFTC, MiFID, UAE SCA – get jurisdiction-specific rules and compliant clause suggestions." />
            </div>
          </div>
        </section>

        {/* Features Tabs Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white via-gray-100 to-white animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Feature Set for Trading & Finance</h2>
              <p className="text-slate-600 text-lg md:text-xl hidden sm:block">
                Contract risk scanner, compliant agreements, regulatory chat, and jurisdiction rules – with finance examples below.
              </p>
            </div>
            
            <Tabs defaultValue="analyze" className="max-w-5xl mx-auto">
              <div className="relative mb-8 md:mb-16">
                {/* Mobile scrollable tabs (visible only on small screens) */}
                <div className="block md:hidden overflow-x-auto pb-3 no-scrollbar">
                  <TabsList className="flex w-full justify-between bg-transparent border-b border-gray-200 min-w-[600px]">
                    <TabsTrigger 
                      value="analyze" 
                      className="flex-1 text-sm py-3 px-1 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      <span className="whitespace-nowrap">Analysis</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="generate" 
                      className="flex-1 text-sm py-3 px-1 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      <span className="whitespace-nowrap">Generate</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chat" 
                      className="flex-1 text-sm py-3 px-1 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      <span className="whitespace-nowrap">Legal Chat</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="disputes" 
                      className="flex-1 text-sm py-3 px-1 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      <span className="whitespace-nowrap">Disputes</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="jurisdiction" 
                      className="flex-1 text-sm py-3 px-1 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      <span className="whitespace-nowrap">Jurisdiction</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Desktop tabs (visible only on medium screens and up) */}
                <div className="hidden md:block">
                  <TabsList className="flex w-full justify-between bg-transparent border-b border-gray-200">
                    <TabsTrigger 
                      value="analyze" 
                      className="flex-1 text-base lg:text-lg py-4 px-2 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      Analysis
                    </TabsTrigger>
                    <TabsTrigger 
                      value="generate" 
                      className="flex-1 text-base lg:text-lg py-4 px-2 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      Generate
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chat" 
                      className="flex-1 text-base lg:text-lg py-4 px-2 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      Legal Chat
                    </TabsTrigger>
                    <TabsTrigger 
                      value="disputes" 
                      className="flex-1 text-base lg:text-lg py-4 px-2 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      Disputes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="jurisdiction" 
                      className="flex-1 text-base lg:text-lg py-4 px-2 font-medium text-gray-600 rounded-none border-b-2 border-transparent data-[state=active]:border-legal-primary data-[state=active]:text-legal-primary transition-all duration-300"
                    >
                      Jurisdiction
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="analyze" className="border rounded-xl bg-white p-4 md:p-6 lg:p-10 shadow-lg mt-4 md:mt-8 lg:mt-12 transition-all duration-500 animate-fade-in">
                <div className="flex justify-center mb-8">
                  <img src="/images/Analysis.png" alt="FinContract AI trading contract analysis – risk assessment, red flags, and improvement suggestions for CFDs and client agreements" className="rounded-xl shadow-md" loading="lazy" decoding="async" />
                </div>
                <p className="text-slate-600 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <strong>Finance example:</strong> Upload CFD terms → Flags: &quot;High leverage may cause losses exceeding margin&quot;, &quot;Broker unilateral closure risk (high)&quot;.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12">
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-red-600">
                      <AlertTriangle className="h-6 w-6 mr-3" />
                      Red Flag Detection
                    </h3>
                    <p className="text-slate-600 mb-6 text-base md:text-lg">
                      Identifies leverage risks, fraud-prone clauses, unilateral broker powers, and missing suitability checks in trading contracts.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Identifies unfavorable terms and one-sided clauses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Highlights vague language that could be problematic</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Flags missing clauses that should be included</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-amber-600">
                      <Scale className="h-6 w-6 mr-3" />
                      Clause Explainer
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Get plain-language explanations of complex legal terms and their implications for your specific situation.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Converts legal jargon into everyday language</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Explains implications of specific clauses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Provides context and significance of terms</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-teal-600">
                      <BarChart3 className="h-6 w-6 mr-3" />
                      Risk Scoring
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Each contract receives an overall risk score plus section-by-section assessments to prioritize your attention.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Overall contract risk score from low to high</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Section-by-section risk assessment</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Visualized risk metrics for quick understanding</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-green-700">
                      <Sparkles className="h-6 w-6 mr-3" />
                      Suggestions & Improvements
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      AI suggests ways to strengthen your contract and add missing protections for better security.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Recommends additional clauses and edits</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Suggests improvements for clarity and fairness</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Highlights missing protections</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-blue-700">
                      <BarChart3 className="h-6 w-6 mr-3" />
                      Comparison
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Instantly compare two contracts or versions to highlight key differences and risks.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Side-by-side clause comparison</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Highlights changed terms</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Risk and benefit analysis for each version</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-indigo-700">
                      <Download className="h-6 w-6 mr-3" />
                      Downloadable Summary & Improvements
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Instantly download a professional summary report and AI-suggested improvements for your contract.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Comprehensive contract summary</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>List of actionable improvements</span>
                      </li>
                    
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="border rounded-xl bg-white p-6 md:p-10 shadow-lg mt-8 md:mt-12 transition-all duration-500 animate-fade-in">
                <div className="flex items-center gap-3 mb-8 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-md">Monthly Subscription Required</span>
                </div>
                <div className="flex justify-center mb-8">
                  <img src="/images/Generate.png" alt="FinContract AI – generate compliant trading agreements, NDAs and client contracts" className="rounded-xl shadow-md " loading="lazy" decoding="async" />
                </div>
                <p className="text-slate-600 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <strong>Finance example:</strong> Create compliant NDAs for trading partners or client agreements for brokers and fintech.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12">
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-blue-600">
                      <FileCheck className="h-6 w-6 mr-3" />
                      Compliant NDA & Agreement Generator
                    </h3>
                    <p className="text-slate-600 mb-6 text-base md:text-lg">
                      Generate compliant NDAs and client contracts for trading partners and finance ops – with jurisdiction-aware clauses.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Customizable terms and duration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Industry-specific clause recommendations</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-purple-600">
                      <Sparkles className="h-6 w-6 mr-3" />
                      Smart Agreement Builder
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Create custom agreements beyond NDAs with intelligent form-based generation and professional formatting.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Service agreements, consulting contracts, and more</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>AI-powered clause suggestions based on agreement type</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Professional PDF generation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="border rounded-xl bg-white p-6 md:p-10 shadow-lg mt-8 md:mt-12 transition-all duration-500 animate-fade-in">
                <div className="flex items-center gap-3 mb-8 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-md">Monthly Subscription Required</span>
                </div>
                <div className="flex justify-center mb-8">
                  <img src="/images/LegalChat.png" alt="FinContract AI regulatory risk chat – ask compliance questions (e.g. Malta, CFTC)" className="rounded-xl shadow-md " loading="lazy" decoding="async" />
                </div>
                <p className="text-slate-600 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <strong>Finance example:</strong> Ask: &quot;Does this futures clause meet CFTC requirements?&quot; or &quot;Is this CFD clause compliant under Malta law?&quot;
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12">
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-blue-600">
                      <MessageSquare className="h-6 w-6 mr-3" />
                      Regulatory Risk Chat
                    </h3>
                    <p className="text-slate-600 mb-6 text-base md:text-lg">
                      Query regulatory risks: &quot;Is this CFD clause compliant under Malta law?&quot; Get instant guidance for FCA, CFTC, MiFID, and more.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Real-time legal question answering</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Contract interpretation and explanation</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Legal procedure guidance and next steps</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-purple-600">
                      <Brain className="h-6 w-6 mr-3" />
                      Contextual Advice
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Receive tailored legal advice based on your specific situation, industry, and jurisdiction requirements.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Industry-specific legal guidance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Risk assessment for business decisions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Compliance and regulatory guidance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disputes" className="border rounded-xl bg-white p-6 md:p-10 shadow-lg mt-8 md:mt-12 transition-all duration-500 animate-fade-in">
                <div className="flex items-center gap-3 mb-8 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-md">Monthly Subscription Required</span>
                </div>
                <div className="flex justify-center mb-8">
                  <img src="/images/Disputes.png" alt="FinContract AI dispute and communication tools for trading and client agreements" className="rounded-xl shadow-md" loading="lazy" decoding="async" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12">
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
                      <Mail className="h-6 w-6 mr-3" />
                      Professional Response Generation
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Generate professional, well-structured dispute response emails that protect your interests while maintaining professionalism.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>AI-generated professional tone and language</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Legal precedent and clause referencing</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Multiple response strategies and approaches</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-green-600">
                      <Shield className="h-6 w-6 mr-3" />
                      Strategic Communication
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Craft responses that protect your position while leaving room for resolution and maintaining business relationships.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Balanced approach to dispute resolution</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Evidence and documentation integration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Next steps and escalation planning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="jurisdiction" className="border rounded-xl bg-white p-6 md:p-10 shadow-lg mt-8 md:mt-12 transition-all duration-500 animate-fade-in">
                <div className="flex items-center gap-3 mb-8 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-md">Monthly Subscription Required</span>
                </div>
                <div className="flex justify-center mb-8">
                  <img src="/images/Jurisdiction.png" alt="FinContract AI jurisdiction-specific trading rules – EU MiFID, UAE SCA, Malta, FCA, CFTC" className="rounded-xl shadow-md" loading="lazy" decoding="async" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-12">
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-indigo-600">
                      <Scale className="h-6 w-6 mr-3" />
                      Regional Legal Guidance
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Get specific legal advice tailored to your jurisdiction, including local laws, regulations, and business practices.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Country and state-specific legal requirements</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Local business law and compliance guidance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Cross-border legal considerations</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:bg-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-teal-600">
                      <FileText className="h-6 w-6 mr-3" />
                      Jurisdiction-Specific Clauses
                    </h3>
                    <p className="text-legal-muted mb-6 text-base md:text-lg">
                      Receive recommendations for clauses and terms that are relevant and enforceable in your specific legal jurisdiction.
                    </p>
                    <ul className="space-y-3 text-base md:text-lg">
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Enforceable contract terms by region</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Local tax and liability considerations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Jurisdiction selection for disputes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works - Trading contract flow */}
        <section className="py-20 md:py-32 bg-white animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">How It Works</h2>
              <p className="text-slate-600 text-lg md:text-xl">
                From upload to compliant output – in four simple steps.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <div className="text-center relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900">1. Upload trading contract</h3>
                  <p className="text-slate-600 text-base">
                    Upload your CFD terms, client agreement, or ISDA doc (e.g. Deriv-style CFD).
                  </p>
                </div>
                
                <div className="text-center relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900">2. AI scans risks</h3>
                  <p className="text-slate-600 text-base">
                    FinContract AI scans for leverage risks, compliance gaps, and fraud-prone clauses.
                  </p>
                </div>
                
                <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900">3. Get red flags + suggestions</h3>
                  <p className="text-slate-600 text-base">
                    Review red flags and AI-suggested improvements to stay compliant.
                  </p>
                </div>

                <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <Download className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900">4. Export revised version</h3>
                  <p className="text-slate-600 text-base">
                    Export a revised, compliant version of your contract.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105">
                    Start Analyzing Trading Contracts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Customers Say</h2>
              <p className="text-legal-muted text-lg md:text-xl">
                Trusted by legal professionals, business owners, and contract managers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-amber-400 rounded-xl overflow-hidden">
                <CardContent className="pt-8">
                  <div className="flex items-center mb-6">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-legal-muted italic mb-8 text-base md:text-lg">
                    "The complete legal suite is incredible. Contract analysis, NDA generation, and legal chat all in one platform has revolutionized our workflow."
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-legal-primary/20 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-legal-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-base md:text-lg">Sarah Johnson</p>
                      <p className="text-legal-muted text-sm md:text-base">General Counsel, TechCorp Inc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-legal-primary rounded-xl overflow-hidden">
                <CardContent className="pt-8">
                  <div className="flex items-center mb-6">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-legal-muted italic mb-8 text-base md:text-lg">
                    "As a small business owner, having access to dispute response generation and jurisdiction guidance has saved me thousands in legal fees."
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-legal-primary/20 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-legal-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-base md:text-lg">Michael Torres</p>
                      <p className="text-legal-muted text-sm md:text-base">CEO, Innovative Solutions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-legal-accent rounded-xl overflow-hidden">
                <CardContent className="pt-8">
                  <div className="flex items-center mb-6">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-legal-muted italic mb-8 text-base md:text-lg">
                    "The legal AI chat feature answers questions instantly, and the auto-generated agreements are professional quality. Incredible value."
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-legal-primary/20 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-legal-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-base md:text-lg">Jennifer Lee</p>
                      <p className="text-legal-muted text-sm md:text-base">Contract Manager, Global Enterprises</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
              <p className="text-legal-muted text-lg md:text-xl">
                Get answers to common questions about our complete AI legal suite.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {/* FAQ items */}
                <AccordionItem value="item-1" className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold bg-gray-50 hover:bg-gray-100 px-6 py-4 transition-all">What tools are included in the complete legal suite?</AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg p-6 bg-white">
                    Our complete legal suite includes five AI-powered tools: Contract Analysis & Review, Auto NDA & Agreement Generator, Legal Advice Chat, Email-Based Dispute Response, and Jurisdiction-Based Suggestions. Each tool is designed to handle specific legal document needs with professional accuracy.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold bg-gray-50 hover:bg-gray-100 px-6 py-4 transition-all">Which tools require a subscription?</AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg p-6 bg-white">
                    The Contract Analysis tool is available across all plans. However, the Auto NDA & Agreement Generator, Legal Advice Chat, Email-Based Dispute Response, and Jurisdiction-Based Suggestions are premium features that require a Monthly Subscription plan for full access.
                  </AccordionContent>
                </AccordionItem>

                
                <AccordionItem value="item-4" className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold bg-gray-50 hover:bg-gray-100 px-6 py-4 transition-all">Is my data secure across all tools?</AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg p-6 bg-white">
                    Yes, we maintain enterprise-grade security across all tools in our suite. All documents and conversations are encrypted in transit and at rest. Your data isn't used to train our AI models without explicit permission, and you can opt to automatically delete your data after processing.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold bg-gray-50 hover:bg-gray-100 px-6 py-4 transition-all">Can I try all tools before subscribing?</AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg p-6 bg-white">
                    Yes! We offer a free trial that includes one complete contract analysis. To access the premium tools (NDA Generator, Legal Chat, Dispute Response, and Jurisdiction Suggestions), you'll need to upgrade to our Monthly Subscription plan, which gives you unlimited access to all tools.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-emerald-50/50 animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-blue-100 rounded-2xl p-8 md:p-16 max-w-4xl mx-auto shadow-2xl">
              <div className="text-center space-y-6 mb-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a5f] to-emerald-600">
                    Ready to Reduce Risk & Stay Compliant?
                  </span>
                </h2>
                <p className="text-slate-600 text-lg md:text-xl">
                  Start analyzing trading contracts free. Upgrade for the full toolkit – compliant agreements, regulatory chat, jurisdiction rules.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/auth?tab=signup">
                  <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90 text-white px-10 py-6 text-lg font-semibold rounded-lg shadow-xl transition-all duration-300 hover:scale-105">
                    Start Analyzing Trading Contracts Free
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/10 px-10 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
};

// --- BenefitCard: For the benefit icons at the top
function BenefitCard({
  icon,
  colorClass,
  title,
  description
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  description: string;
}) {
  return <div className={`${colorClass} border-t-4 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl bg-white animate-fade-in hover:-translate-y-1`}>
      <div className="flex flex-col items-center p-8">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
        <p className="text-legal-muted text-base md:text-lg mt-2 text-center">{description}</p>
      </div>
    </div>;
}

export default Features;
