import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Brain, Sparkles, FileText, BarChart, RefreshCw, User, Star, Zap, MessageSquare, FileCheck, Scale, Mail, Shield, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";
import PricingPlans from "@/components/pricing/PricingPlans";
import HeroLogo from "@/components/landing/HeroLogo";
import SEOHead from "@/components/seo/SEOHead";

// Finance palette: blue (trust) + green (growth/security)
const PRIMARY_BTN_CLASSES = "rounded-lg px-8 py-4 text-xl font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#059669] text-white shadow-md hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669] min-w-[210px] flex gap-2 items-center transition-all";
const OUTLINE_BTN_CLASSES = "border-2 border-[#1e3a5f] text-[#1e3a5f] bg-transparent px-10 py-5 text-lg rounded-lg hover:bg-[#1e3a5f]/10 shadow-sm font-bold transition-colors";

const Index = () => {
  const [user, setUser] = useState<{
    email: string;
  } | null>(null);
  const handleAuthSuccess = (user: {
    email: string;
  }) => {
    setUser(user);
  };
  const handleLogout = () => {
    setUser(null);
  };
  // Structured data for the homepage
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FinContract AI",
    "alternateName": ["FinContractAI", "FinContract A I", "fincontract.ai"],
    "description": "AI-powered risk intelligence for trading and finance contracts. Scan CFDs, futures, and client agreements for leverage risks, compliance gaps, and fraud-prone clauses.",
    "url": "https://fincontract.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "keywords": "FinContract AI, trading contract compliance, CFD risk, futures compliance, FCA CFTC Malta, broker compliance, Deriv hackathon",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free trial available" },
    "creator": { "@type": "Organization", "name": "FinContract AI", "url": "https://fincontract.ai" },
    "featureList": [
      "Trading Contract Risk Scanner",
      "Compliant Agreement & NDA Generator",
      "Regulatory Risk Chat",
      "Predictive Compliance Scoring & Monitoring Rules",
      "Jurisdiction-Specific Trading Rules (MiFID, SCA, etc.)",
      "Risk Trends Dashboard & Audit Log",
      "Regulatory Radar & Proactive Compliance Alerts"
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "5000", "bestRating": "5", "worstRating": "1" }
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FinContract AI",
    "alternateName": ["FinContractAI", "fincontract.ai"],
    "url": "https://fincontract.ai",
    "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://fincontract.ai/search?q={search_term_string}" }, "query-input": "required name=search_term_string" }
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fincontract.ai/" },
      { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://fincontract.ai/features" },
      { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://fincontract.ai/pricing" }
    ]
  };
  const structuredData = [softwareJsonLd, websiteJsonLd, breadcrumbJsonLd];

  return (
    <>
      <SEOHead
        title="FinContract AI – AI for Trading Contract Compliance & Risk Analysis | Deriv Hackathon"
        description="Automate risk detection and compliance in CFDs, futures, and trading agreements with FinContract AI. Instant red flags, suggestions, and regulatory checks for finance teams."
        keywords="FinContract AI, trading contract compliance, CFD risk analysis, futures compliance, FCA CFTC Malta, broker compliance, Deriv hackathon, finance contract AI"
        canonicalUrl="https://fincontract.ai/"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40">
        <Header onLogout={handleLogout} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center min-h-[65vh] px-2 text-center relative z-10 animate-fade-in py-[90px] sm:py-24 md:py-[160px]">
          {/* Hero Logo - AI/Contract/Checkmark */}
          <div className="flex justify-center mb-4 sm:mb-6 relative">
            <HeroLogo />
          </div>

          {/* Headline */}
          <h1 className="font-extrabold text-xl xs:text-2xl sm:text-[2.4rem] md:text-[3.6rem] leading-[1.07] max-w-4xl mx-auto mb-2 sm:mb-3 text-slate-900">
         
            <span className="block md:inline font-extrabold bg-gradient-to-r from-[#1e3a5f] via-[#2563eb] to-[#059669] text-transparent bg-clip-text">
              AI-Powered Risk Intelligence<br className="sm:hidden" />
            </span>{" "}
            for Trading & Finance Contracts
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm xs:text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto mb-3 sm:mb-4">
            Instantly scan CFDs, futures, and client agreements for leverage, margin, and compliance risks – with AI suggestions to fix them.
          </p>
          <p className="text-slate-500 text-sm xs:text-base max-w-2xl mx-auto mb-6 sm:mb-9">
            Upload a trading contract and get red flags, risk scores, compliant edits, and regulatory checks in seconds – built for brokers, fintech, and Deriv‑style platforms.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-7 sm:mb-11 w-full">
            <Link to={user ? "/dashboard" : "/auth?tab=signup"} className="w-full sm:w-auto max-w-[320px] sm:max-w-none">
              <Button
                size="lg"
                className={
                  PRIMARY_BTN_CLASSES +
                  " w-full sm:w-auto text-base xs:text-lg sm:text-xl px-5 py-3 sm:px-8 sm:py-4 min-w-0 sm:min-w-[150px]"
                }
                style={{ boxShadow: "0px 7px 28px 0px rgba(5, 150, 105, 0.2)" }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {user ? "Go to Dashboard" : "Start Analyzing Trading Contracts Free"}
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-3 sm:gap-7 justify-center items-center mt-2 text-slate-600 text-xs xs:text-sm sm:text-base font-medium flex-col sm:flex-row">
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>5000+ Contracts Analyzed</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              <span>80% Faster Review</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              <span>Results in Seconds</span>
            </div>
          </div>
          {/* Demo note */}
          <p className="mt-6 text-sm text-slate-500 max-w-xl mx-auto italic">
            Tested on real Deriv-style CFD samples – instantly flags high-risk leverage and missing protections.
          </p>
        </section>

        {/* Animated down chevron prompt */}
        <div className="flex justify-center -mt-8">
          <ChevronDown className="text-legal-muted animate-bounce" size={40} />
        </div>

        {/* Features - Finance/Trading angle */}
        <section className="py-8 sm:py-24 bg-gradient-to-b from-white to-slate-50 animate-fade-in">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-16">
              <h2 className="text-lg xs:text-xl sm:text-4xl md:text-5xl font-extrabold mb-1 sm:mb-3 animate-fade-in text-slate-900">
                AI Tools for Trading & Finance Compliance
              </h2>
              <p className="text-slate-600 text-sm xs:text-base sm:text-xl animate-fade-in">
                Risk scanning, compliant agreements, and regulatory checks – built for brokers and fintech.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 my-8 sm:flex-row flex-col items-center">
              <AnimatedCard 
                icon={<FileText className="h-8 w-8 text-blue-600" />} 
                title="Trading Contract Risk Scanner" 
                text="Detect leverage risks, fraud-prone clauses, and compliance gaps in real-time. Red flags and suggestions in seconds." 
                delay={0} 
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<FileCheck className="h-8 w-8 text-emerald-600" />} 
                title="Generate Compliant Trading Agreements" 
                text="Create compliant NDAs and client contracts for trading partners and finance ops." 
                delay={0.1} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<MessageSquare className="h-8 w-8 text-blue-600" />} 
                title="Query Regulatory Risks" 
                text="Ask: 'Is this CFD clause compliant under Malta law?' Get instant regulatory guidance." 
                delay={0.2} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <div className="basis-full h-0" />
              <div className="flex justify-center w-full gap-8 flex-col sm:flex-row items-center">
              <AnimatedCard 
                icon={<BarChart className="h-8 w-8 text-amber-600" />} 
                title="Risk Trends & Predictive Suggestions" 
                text="See contract risk over time with Risk Trends plus AI predictive suggestions and monitoring rules to prevent issues early." 
                delay={0.3} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<Scale className="h-8 w-8 text-slate-700" />} 
                title="Jurisdiction-Specific Trading Rules" 
                text="EU MiFID, UAE SCA, FCA, CFTC, Malta – get rules and clause suggestions by region." 
                delay={0.4} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<Shield className="h-8 w-8 text-indigo-600" />} 
                title="Regulatory Radar & Audit Log" 
                text="Track evolving regulations, stale analyses, and every action in an audit-ready log – with one-click re-analyze when rules change." 
                delay={0.5} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-32 bg-gradient-to-br from-white via-slate-50/30 to-white animate-fade-in">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left: Enhanced Image Section */}
              <div className="flex-1 flex items-center justify-center w-full">
                {/* Replace static image with VerticalImageRotator */}
                <VerticalImageRotator />
              </div>

              {/* Right: Enhanced Content Section */}
              <div className="flex-1 flex flex-col items-start max-w-2xl w-full space-y-8">
                {/* Header with improved typography */}
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full border border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-blue-700 font-semibold text-sm">For Finance & Trading</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                    Why FinContract{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-emerald-600 text-transparent bg-clip-text">
                      AI?
                    </span>
                  </h2>
                  
                  <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
                    Built for brokers, fintech, and finance ops. Reduce risks early and stay compliant – with real business impact.
                  </p>
                </div>

                {/* Why FinContract AI for Finance & Trading - 4 bullets */}
                <div className="space-y-0 w-full">
                  <EnhancedBenefit 
                    icon={<RefreshCw className="h-6 w-6" />}
                    title="Reduces legal review time by 80%" 
                    description="Automate first-pass review of CFD terms, client agreements, and ISDA docs. Focus human time on high-value decisions." 
                    gradient="from-blue-500 to-blue-600"
                  />
                  <EnhancedBenefit 
                    icon={<Shield className="h-6 w-6" />}
                    title="Prevents fraud & risk in client agreements" 
                    description="Flags fraud-prone clauses, unilateral broker powers, and missing suitability checks before they become problems." 
                    gradient="from-emerald-500 to-emerald-600"
                  />
                  <EnhancedBenefit 
                    icon={<Scale className="h-6 w-6" />}
                    title="Ensures regulatory alignment for brokers" 
                    description="Stay aligned with Malta, FCA, CFTC, MiFID, UAE SCA and other jurisdiction-specific trading rules." 
                    gradient="from-slate-600 to-slate-700"
                  />
                  <EnhancedBenefit 
                    icon={<TrendingUp className="h-6 w-6" />}
                    title="High business impact – save costs, avoid penalties" 
                    description="Cut legal spend and avoid regulatory penalties with faster, smarter contract and compliance workflows." 
                    gradient="from-amber-500 to-orange-500"
                  />
                </div>

                {/* Enhanced CTA Button */}
                <div className="pt-4">
                  <Link to="/features" className="group">
                    <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[240px]">
                      <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      See All Features
                      <div className="w-2 h-2 bg-white/30 rounded-full group-hover:w-3 group-hover:h-3 transition-all duration-300"></div>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section with scroll reveal */}
        <section id="pricing" className="bg-gradient-to-b from-white via-gray-50 to-white animate-fade-in py-[29px]">
          <div className="container mx-auto px-4">
            <PricingPlans />
          </div>
        </section>

        {/* Use cases: For Trading Platforms & Brokers */}
        <section className="py-8 sm:py-16 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-2">For Trading Platforms & Brokers</h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-8">Automate compliance, anti-fraud in agreements, and finance ops efficiency.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium">Compliance automation</span>
              <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium">Anti-fraud in client agreements</span>
              <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium">Finance ops efficiency</span>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-slate-50 py-7 sm:py-[57px]">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 animate-fade-in">
              <h2 className="text-lg xs:text-xl sm:text-4xl font-bold mb-1 sm:mb-2 text-slate-900">What Users Say</h2>
              <p className="text-slate-600 text-sm xs:text-base sm:text-lg">
                Trusted by compliance officers, brokers, and finance teams.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard userInitials="SB" name="Sarah B." title="Compliance Officer" quote="Reduces our legal review time by 80%. We catch leverage and margin risks before they become issues." delay={0} />
              <TestimonialCard userInitials="MJ" name="Michael J." title="Broker Ops Lead" quote="The risk scanner flags unilateral broker clauses and missing suitability checks instantly. Huge time-saver." delay={0.12} />
              <TestimonialCard userInitials="AT" name="Amy T." title="Legal, Fintech" quote="Regulatory chat and jurisdiction rules (MiFID, Malta) in one place. Exactly what we needed for Deriv-style products." delay={0.2} />
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-7 sm:py-20 bg-gradient-to-r from-[#1e3a5f] via-[#2563eb] to-[#059669] text-white animate-fade-in">
          <div className="container mx-auto px-2 sm:px-4 text-center max-w-3xl space-y-3 sm:space-y-5">
            <h2 className="text-lg xs:text-xl sm:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">Ready to Reduce Risk & Stay Compliant?</h2>
            <p className="text-white/90 text-sm xs:text-base sm:text-lg mb-4 sm:mb-8">
              Start analyzing trading contracts free – built for Deriv-style platforms and finance teams.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5 flex-col sm:flex-row items-center">
              <Link to={user ? "/dashboard" : "/auth?tab=signup"} className="w-full sm:w-auto">
                <Button className={PRIMARY_BTN_CLASSES + " text-base xs:text-lg sm:text-lg w-full sm:w-auto px-5 py-3 sm:px-8 sm:py-4 min-w-0 sm:min-w-[210px] bg-white/10 border-2 border-white hover:bg-white/20 text-white"} style={{ borderColor: "#fff" }}>
                  {user ? "Go to Dashboard" : "Start Analyzing Trading Contracts Free"}
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button variant="outline" className={OUTLINE_BTN_CLASSES + " w-full sm:w-auto text-base xs:text-lg sm:text-lg px-5 py-3 sm:px-10 sm:py-5 min-w-0 sm:min-w-[200px]"} style={{ borderColor: "#fff", color: "#fff", backgroundColor: "transparent" }}>
                  See Features
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      </div>
    </>
  );
};

// --- AnimatedCard: Animated Info Card component with premium badge
function AnimatedCard({
  icon,
  title,
  text,
  delay = 0,
  premium = false,
  cardClassName = ""
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  delay?: number;
  premium?: boolean;
  cardClassName?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-xl border border-gray-100 px-4 sm:px-8 py-5 sm:py-8 flex flex-col items-center transition-transform hover:scale-[1.04] group relative ${cardClassName} w-full sm:w-auto`}
      style={{
        animation: `fade-in 0.5s cubic-bezier(.37,.53,.38,1.01) both`,
        animationDelay: `${delay}s`
      }}
    >
      {premium && (
        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
          Premium
        </div>
      )}
      <div className="h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-full bg-blue-100 mb-3 sm:mb-5 group-hover:shadow-lg transition-all">
        {icon}
      </div>
      <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-1 sm:mb-3 text-center">{title}</h3>
      <p className="text-legal-muted text-xs xs:text-sm sm:text-base text-center">{text}</p>
    </div>
  );
}

// --- BenefitListItem: For Benefit points ---
function BenefitListItem({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return <li className="flex items-start gap-3 animate-fade-in">
      <span className="inline-flex rounded-full bg-green-50 mt-1 p-2">
        <Check className="h-5 w-5 text-green-600" />
      </span>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-legal-muted">{description}</p>
      </div>
    </li>;
}

// --- TestimonialCard with fade-in animation ---
function TestimonialCard({
  userInitials,
  name,
  title,
  quote,
  delay
}: {
  userInitials: string;
  name: string;
  title: string;
  quote: string;
  delay?: number;
}) {
  return <div className="bg-white p-4 sm:p-7 rounded-2xl shadow-lg border border-gray-100 animate-fade-in" style={{
    animationDelay: `${delay || 0}s`,
    animationFillMode: 'both'
  }}>
      <div className="flex items-center mb-2 sm:mb-4">
        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-legal-primary/20 flex items-center justify-center mr-2 sm:mr-4 text-base sm:text-xl font-bold text-legal-primary drop-shadow">
          {userInitials}
        </div>
        <div>
          <h4 className="font-semibold text-sm xs:text-base sm:text-lg">{name}</h4>
          <p className="text-legal-muted text-xs sm:text-sm">{title}</p>
        </div>
      </div>
      <p className="text-legal-muted italic leading-relaxed text-xs xs:text-sm sm:text-base">"{quote}"</p>
    </div>;
}

// --- ModernBenefit: Modernized Benefit List Item ---
function ModernBenefit({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return <li className="flex items-start gap-2 sm:gap-4">
      <span className="inline-flex items-center justify-center rounded-full bg-green-50 mt-0.5 h-6 w-6 sm:h-8 sm:w-8 min-w-6 sm:min-w-8">
        <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-500" strokeWidth={2.5} />
      </span>
      <div>
        <h4 className="font-bold text-sm xs:text-base sm:text-[1.13rem] leading-tight mb-1">{title}</h4>
        <p className="text-[#7a7c98] text-xs xs:text-sm sm:text-base md:text-[1.09rem]">{description}</p>
      </div>
    </li>;
}

// --- EnhancedBenefit: Modern Benefit Component with Icons and Gradients ---
function EnhancedBenefit({
  icon,
  title,
  description,
  gradient
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-white hover:to-slate-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-slate-200/50">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover: transition-all duration-300`}>
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <h4 className="font-bold text-lg text-[#161731] group-hover:text-[#213B75] transition-colors duration-300">
          {title}
        </h4>
        <p className="text-[#64748b] text-base leading-relaxed group-hover:text-[#475569] transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
}

// --- VerticalImageRotator: Rotates all images in /images vertically ---
function VerticalImageRotator() {
  // Make sure these filenames match exactly with your /public/images folder (no spaces, correct case)
  const images = [
    "/images/Analysis1.png",
    "/images/Analysis2.png",
    "/images/Analysis3.png",
    "/images/Analysis4.png",
    "/images/Audit Log.png",
    "/images/Compare.png",
    "/images/Dashboard.png",
    "/images/Disputes.png",
    "/images/Explanations.png",
    "/images/Generate.png",
    "/images/Jurisdiction.png",
    "/images/LegalChat.png",
    "/images/RedFlags.png",
    "/images/Regulatory Radar.png",
    "/images/Suggestions.png",
  ];
  const [current, setCurrent] = useState(0);
  const [broken, setBroken] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
    <div className="relative h-[380px] w-[90vw] max-w-[600px] sm:h-[460px] sm:w-[600px] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-white">
      {!allBroken ? images.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`FinContract AI ${src.split('/').pop()?.split('.')[0]} interface – trading contract risk and compliance`}
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

export default Index;
