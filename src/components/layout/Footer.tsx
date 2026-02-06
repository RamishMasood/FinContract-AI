import { Link } from "react-router-dom";
import { Shield, Lock, Award } from "lucide-react";
import HeroLogo from "@/components/landing/HeroLogo"; // ADDED
import FastEndLogo from "/src/Extras/fastendlogo.webp";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Flexbox for perfect alignment with header/navbar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-10 md:gap-y-0 md:gap-x-14">
          {/* Logo + Description */}
          <div className="flex-1 min-w-[220px] flex flex-col gap-5 md:gap-6 items-center md:items-start text-center md:text-left">
            <div className="flex items-center text-2xl font-bold justify-center md:justify-start">
              <span className="mr-2 select-none" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <HeroLogoSmall />
              </span>
              <span className="gradient-text">FinContract</span>
              <span className="text-legal-text ml-1">AI</span>
            </div>
            {/* ...existing code... */}
            <p className="text-legal-muted max-w-md mx-auto md:mx-0">
              AI-powered risk intelligence for trading and finance contracts. Scan CFDs, futures, and client agreements for leverage risks, compliance gaps, and fraud-prone clauses—built for brokers and fintech.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                <Shield className="h-5 w-5 text-legal-primary" />
                <span className="text-sm">Privacy First</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-5 w-5 text-legal-primary" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-5 w-5 text-legal-primary" />
                <span className="text-sm">Expert Analysis</span>
              </div>
            </div>
          </div>
          {/* Responsive columns for links */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start items-center sm:items-start gap-x-8 sm:gap-x-14 gap-y-8 sm:gap-y-10 mt-6 md:mt-1 w-full md:w-auto">
            <div className="min-w-[130px] flex flex-col gap-4 sm:gap-6 items-center sm:items-start">
              <h3 className="font-medium">Product</h3>
              <ul className="space-y-2 text-center w-full sm:text-left">
                <li>
                  <Link to="/features" className="text-legal-muted hover:text-legal-primary transition-colors">Features</Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-legal-muted hover:text-legal-primary transition-colors">Pricing</Link>
                </li>
                <li>
                  <Link to="/faq" className="text-legal-muted hover:text-legal-primary transition-colors">FAQ</Link>
                </li>
                <li>
                  <Link to="/blog" className="text-legal-muted hover:text-legal-primary transition-colors">Blog</Link>
                </li>
              </ul>
            </div>
            <div className="min-w-[130px] flex flex-col gap-4 sm:gap-6 items-center sm:items-start mt-6 sm:mt-0">
              <h3 className="font-medium">Resources</h3>
              <ul className="space-y-2 text-center w-full sm:text-left">
                {/* ...existing code... */}
                <li>
                  <Link to="/documentation" className="text-legal-muted hover:text-legal-primary transition-colors">Documentation</Link>
                </li>
                <li>
                  <Link to="/help" className="text-legal-muted hover:text-legal-primary transition-colors">Help Center</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Responsive footer bottom bar */}
        <div className="border-t border-gray-100 mt-10 sm:mt-12 pt-4 sm:pt-6 text-legal-muted text-xs sm:text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
              <Link to="/terms" className="hover:text-legal-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-legal-primary transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-legal-primary transition-colors">Cookie Policy</Link>
            </div>
            <div className="mt-2 md:mt-0 md:text-right w-full md:w-auto text-center md:text-right">
              2025 FinContract AI. All rights reserved.
            </div>
            <div className="w-full md:w-auto flex flex-col items-center justify-center order-3 md:order-none mt-2 md:mt-0">
              <span className="block text-center flex items-center gap-2">
                Powered By
                <img
                  src={FastEndLogo}
                  alt="FastEnd Team"
                  style={{ width: 24, height: 24, objectFit: "contain" }}
                />
                <span className=" text-black">
                FastEnd Team
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Small version of animated logo for header and footer (38x38px)
function HeroLogoSmall() {
  return (
    <span style={{ width: 38, height: 38, minWidth: 38, minHeight: 38, display: "inline-block" }}>
      <HeroLogoWithSize size={38} />
    </span>
  );
}

function HeroLogoWithSize({ size = 82 }) {
  return (
    <span style={{ transform: `scale(${size / 82})`, transformOrigin: "top left", display: "inline-block" }}>
      <HeroLogo />
    </span>
  );
}

export default Footer;
