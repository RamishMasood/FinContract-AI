import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Brain, Sparkles, FileText, BarChart, RefreshCw, User, Star, Zap, MessageSquare, FileCheck, Scale, Mail } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";
import PricingPlans from "@/components/pricing/PricingPlans";
import HeroLogo from "@/components/landing/HeroLogo";
import SEOHead from "@/components/seo/SEOHead";

// Modern primary/outline button classes
const PRIMARY_BTN_CLASSES = "rounded-lg px-8 py-4 text-xl font-semibold bg-gradient-to-r from-[#213B75] to-[#314890] text-white shadow-md hover:scale-105 hover:bg-gradient-to-l focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#223372] min-w-[210px] flex gap-2 items-center transition-all";
const OUTLINE_BTN_CLASSES = "border-2 border-[#213B75] text-[#213B75] bg-transparent px-10 py-5 text-lg rounded-lg hover:bg-[#213B75]/10 shadow-sm font-bold transition-colors";

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
    "name": "Legal Insight AI",
    "alternateName": [
      "LegalInsightAI",
      "Legal Insight A I", 
      "Legal AI Insight",
      "legalinsightai.software"
    ],
    "description": "Complete AI legal suite for contract analysis, document generation, legal advice, dispute handling, and jurisdiction guidance",
    "url": "https://legalinsightai.software",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "keywords": [
      "Legal Insight AI",
      "legal insight ai",
      "LegalInsightAI",
      "Legal Insight A I",
      "Legal AI Insight",
      "legalinsightai.software",
      "legal ai platform",
      "legal technology platform",
      "legal",
      "insight",
      "AI",
      "law",
      "lawyer",
      "AI lawyer",
      "legal assistant",
      "AI legal assistant",
      "contract analyzer",
      "contract reviewer",
      "contract analysis",
      "agreement analysis",
      "document analysis",
      "legal document review",
      "contract generator",
      "NDA generator",
      "agreement generator",
      "dispute response",
      "jurisdiction guidance",
      "legal technology",
      "legal tech",
      "contract review software",
      "AI legal tools",
      "legal automation",
      "compliance",
      "risk analysis"
    ].join(", "),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available"
    },
    "creator": {
      "@type": "Organization",
      "name": "Legal Insight AI",
      "url": "https://legalinsightai.software"
    },
    "featureList": [
      "Contract Analysis and Review",
      "AI-Powered Document Generation", 
      "Legal Advice Chat",
      "Dispute Response Generation",
      "Jurisdiction-Specific Guidance"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "5000",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Legal Insight AI",
    "alternateName": [
      "LegalInsightAI",
      "Legal Insight A I",
      "Legal AI Insight",
      "legalinsightai.software"
    ],
    "url": "https://legalinsightai.software",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://legalinsightai.software/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://legalinsightai.software/" },
      { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://legalinsightai.software/features" },
      { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://legalinsightai.software/pricing" }
    ]
  };
  const structuredData = [softwareJsonLd, websiteJsonLd, breadcrumbJsonLd];

  return (
    <>
      <SEOHead
        title="Legal Insight AI — AI Legal Suite for Contract Analysis & Legal Advice"
        description="Legal Insight AI: complete AI legal suite for contract analysis, NDA and agreement generation, legal advice chat, dispute responses, and jurisdiction guidance. The leading legal technology platform for businesses and professionals."
        keywords="Legal Insight AI, legal insight ai, LegalInsightAI, Legal Insight A I, Legal AI Insight, legal ai suite, contract analysis AI, legal document AI, AI legal advice, NDA generator, agreement generator, dispute email generator, jurisdiction suggestions, legal technology platform, legalinsightai.software, legal insight ai software, legal ai platform"
        canonicalUrl="https://legalinsightai.software/"
        structuredData={structuredData}
      />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f8f6ff] via-[#f5edff] to-[#eef3fa]">
        <Header onLogout={handleLogout} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center min-h-[65vh] px-2 text-center relative z-10 animate-fade-in py-[90px] sm:py-24 md:py-[160px]">
          {/* Hero Logo - AI/Contract/Checkmark */}
          <div className="flex justify-center mb-4 sm:mb-6 relative">
            <HeroLogo />
          </div>

          {/* Headline */}
          <h1 className="font-extrabold text-xl xs:text-2xl sm:text-[2.4rem] md:text-[3.6rem] leading-[1.07] max-w-4xl mx-auto mb-2 sm:mb-3 text-black">
            Complete{" "}
            <span className="block md:inline font-extrabold bg-gradient-to-r from-[#b96fdb] via-[#bd44bd] to-[#667eea] text-transparent bg-clip-text">
              AI Legal Suite<br className="sm:hidden" /> 
            </span>{" "}
            for Everyone
          </h1>

          {/* Subtitle */}
          <p className="text-[#567198] text-sm xs:text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto mb-6 sm:mb-9 mt-2">
            Analyze contracts, generate agreements, get legal advice, handle disputes, and receive jurisdiction-specific guidance - all powered by AI
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
                style={{
                  boxShadow: "0px 7px 28px 0px #d480fc18"
                }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {user ? "Go to Dashboard" : "Start Your Legal Suite"}
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-3 sm:gap-7 justify-center items-center mt-2 text-[#567198] text-xs xs:text-sm sm:text-base font-medium flex-col sm:flex-row">
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>5000+ Contracts Analyzed</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span>4.9/5 User Ratings</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>AI Results in Seconds</span>
            </div>
          </div>
          {/* SaasHub Featured Badge */}
          <div className="flex justify-center mt-8 mb-4">
            <a href='https://www.saashub.com/legal-insight-ai?utm_source=badge&utm_campaign=badge&utm_content=legal-insight-ai&badge_variant=color&badge_kind=approved' target='_blank' rel="noopener noreferrer">
              <img src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="Legal Insight AI SaaS Hub approved badge - verified legal technology solution" style={{ maxWidth: 150 }} loading="lazy" decoding="async" />
            </a>
          </div>
        </section>

        {/* Animated down chevron prompt */}
        <div className="flex justify-center -mt-8">
          <ChevronDown className="text-legal-muted animate-bounce" size={40} />
        </div>

        {/* "How it Works" Cards - Updated for all tools */}
        <section className="py-8 sm:py-24 bg-gradient-to-b from-white to-gray-50 animate-fade-in">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-16">
              <h2 className="text-lg xs:text-xl sm:text-4xl md:text-5xl font-extrabold mb-1 sm:mb-3 animate-fade-in">
                Complete Legal AI Tools
              </h2>
              <p className="text-legal-muted text-sm xs:text-base sm:text-xl animate-fade-in">
                Five powerful AI tools to handle all your legal document needs
              </p>
            </div>
            {/* Cards in flex row with wrap and improved design */}
            <div className="flex flex-wrap justify-center gap-8 my-8 sm:flex-row flex-col items-center">
              {/* First row: 3 cards */}
              <AnimatedCard 
                icon={<FileText className="h-8 w-8 text-legal-primary" />} 
                title="Contract Analysis" 
                text="Upload contracts and get instant risk analysis, red flags, and improvement suggestions." 
                delay={0} 
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<FileCheck className="h-8 w-8 text-legal-primary" />} 
                title="Auto NDA & Agreement Generator" 
                text="Generate professional NDAs and agreements instantly with AI-powered templates." 
                delay={0.1} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              <AnimatedCard 
                icon={<MessageSquare className="h-8 w-8 text-legal-primary" />} 
                title="Legal Advice Chat" 
                text="Get instant legal guidance through our AI-powered chat interface." 
                delay={0.2} 
                premium={true}
                cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
              />
              {/* Second row: 2 cards centered */}
              <div className="basis-full h-0" />
              <div className="flex justify-center w-full gap-8 flex-col sm:flex-row items-center">
                <AnimatedCard 
                  icon={<Mail className="h-8 w-8 text-legal-primary" />} 
                  title="Email Dispute Response" 
                  text="Generate professional dispute response emails with AI assistance." 
                  delay={0.3} 
                  premium={true}
                  cardClassName="max-w-md min-w-[260px] sm:min-w-[400px] flex-1 w-full"
                />
                <AnimatedCard 
                  icon={<Scale className="h-8 w-8 text-legal-primary" />} 
                  title="Jurisdiction Suggestions" 
                  text="Get region-specific legal advice and clause recommendations." 
                  delay={0.4} 
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
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#667eea]/10 to-[#b96fdb]/10 rounded-full border border-[#667eea]/20">
                    <Sparkles className="h-4 w-4 text-[#667eea] mr-2" />
                    <span className="text-[#667eea] font-semibold text-sm">Why Choose Us</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#161731] leading-tight">
                    Why Legal Insight{" "}
                    <span className="bg-gradient-to-r from-[#667eea] to-[#b96fdb] text-transparent bg-clip-text">
                      AI?
                    </span>
                  </h2>
                  
                  <p className="text-[#64748b] text-base sm:text-lg font-normal leading-relaxed">
                    We provide a complete legal AI suite that makes legal work{" "}
                    <span className="text-[#475569]">
                      accessible, understandable, and actionable
                    </span>{" "}
                    for everyone.
                  </p>
                </div>

                {/* Enhanced Benefits List */}
                <div className="space-y-0 w-full">
                  <EnhancedBenefit 
                    icon={<Brain className="h-6 w-6" />}
                    title="Complete Legal Toolkit" 
                    description="Five AI-powered tools covering contract analysis, document generation, legal advice, dispute handling, and jurisdiction guidance." 
                    gradient="from-blue-500 to-blue-600"
                  />
                  <EnhancedBenefit 
                    icon={<Zap className="h-6 w-6" />}
                    title="Instant AI Analysis" 
                    description="Get comprehensive contract reviews, generate documents, and receive legal advice in seconds, not hours." 
                    gradient="from-purple-500 to-purple-600"
                  />
                  <EnhancedBenefit 
                    icon={<Star className="h-6 w-6" />}
                    title="Professional Quality" 
                    description="AI-generated documents and advice that meet professional standards for business and legal use." 
                    gradient="from-amber-500 to-orange-500"
                  />
                  <EnhancedBenefit 
                    icon={<RefreshCw className="h-6 w-6" />}
                    title="Save Time & Money" 
                    description="Handle multiple legal tasks without costly consultations or lengthy manual processes." 
                    gradient="from-green-500 to-emerald-500"
                  />
                </div>

                {/* Enhanced CTA Button */}
                <div className="pt-4">
                  <Link to="/features" className="group">
                    <Button className="bg-gradient-to-r from-[#213B75] to-[#314890] hover:from-[#314890] hover:to-[#213B75] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[240px]">
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

        {/* Testimonials Section with animated cards */}
        <section className="bg-gray-50 py-7 sm:py-[57px]">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 animate-fade-in">
              <h2 className="text-lg xs:text-xl sm:text-4xl font-bold mb-1 sm:mb-2">What Users Say</h2>
              <p className="text-legal-muted text-sm xs:text-base sm:text-lg">
                Trusted by freelancers, founders, and legal professionals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard userInitials="SB" name="Sarah B." title="Freelance Designer" quote="The complete legal suite is amazing! I can analyze contracts, generate NDAs, and get legal advice all in one place." delay={0} />
              <TestimonialCard userInitials="MJ" name="Michael J." title="Small Business Owner" quote="The agreement generator and legal chat saved me thousands in legal fees. The AI advice is surprisingly accurate." delay={0.12} />
              <TestimonialCard userInitials="AT" name="Amy T." title="HR Manager" quote="From contract analysis to dispute responses, this platform handles all our legal document needs efficiently." delay={0.2} />
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-7 sm:py-20 bg-gradient-to-r from-legal-primary to-legal-secondary text-white animate-fade-in">
          <div className="container mx-auto px-2 sm:px-4 text-center max-w-3xl space-y-3 sm:space-y-5">
            <h2 className="text-lg xs:text-xl sm:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">Ready to Transform Your Legal Work?</h2>
            <p className="text-white/80 text-sm xs:text-base sm:text-lg mb-4 sm:mb-8">
              Start your trial today—access the complete AI legal suite.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5 flex-col sm:flex-row items-center">
              <Link to={user ? "/dashboard" : "/auth?tab=signup"} className="w-full sm:w-auto">
                <Button className={PRIMARY_BTN_CLASSES + " text-base xs:text-lg sm:text-lg w-full sm:w-auto px-5 py-3 sm:px-8 sm:py-4 min-w-0 sm:min-w-[210px]"}>
                  {user ? "Go to Dashboard" : "Start Free Trial"}
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button variant="outline" className={OUTLINE_BTN_CLASSES + " w-full sm:w-auto text-base xs:text-lg sm:text-lg px-5 py-3 sm:px-10 sm:py-5 min-w-0 sm:min-w-[200px]"} style={{
                borderColor: "#fff",
                color: "#fff",
                backgroundColor: "transparent"
              }}>
                  Learn More
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
        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-[#b96fdb] to-[#667eea] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
          Premium
        </div>
      )}
      <div className="h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-full bg-legal-primary/10 mb-3 sm:mb-5 group-hover:shadow-lg transition-all">
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
          alt={`Legal Insight AI ${src.split('/').pop()?.split('.')[0]} interface screenshot demonstrating ${src.split('/').pop()?.split('.')[0]} functionality and features`}
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
