import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentAnalysis from "./pages/DocumentAnalysis";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import Documentation from "./pages/Documentation";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import DisputeEmailPage from "./pages/DisputeEmail";
import AgreementGeneratorPage from "./pages/AgreementGenerator";
import LegalChatPage from "./pages/LegalChat";
import JurisdictionSuggestionPage from "./pages/JurisdictionSuggestion";
import RegulatoryRadarPage from "./pages/RegulatoryRadarPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/upload" element={<DocumentUpload />} />
              <Route path="/dashboard/document/:id" element={<DocumentAnalysis />} />
              <Route path="/dashboard/dispute-email" element={<DisputeEmailPage />} />
              <Route path="/dashboard/agreement-generator" element={<AgreementGeneratorPage />} />
              <Route path="/dashboard/legal-chat" element={<LegalChatPage />} />
              <Route path="/dashboard/jurisdiction-suggestion" element={<JurisdictionSuggestionPage />} />
              <Route path="/dashboard/regulatory-radar" element={<RegulatoryRadarPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/help" element={<Help />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="*" element={<NotFound />} />
              
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
