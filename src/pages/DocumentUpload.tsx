import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UploadForm from "@/components/dashboard/UploadForm";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import usePlanUsage from "@/hooks/usePlanUsage";
const DocumentUpload = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    planId,
    originalPlanId,
    isPlanExpired,
    limitReached,
    isLoading,
    usedThisMonth,
    docLimit
  } = usePlanUsage();

  // Redirect if not logged in and finished loading
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, navigate, authLoading]);
  useEffect(() => {
    if (!isLoading && limitReached) {
      let message = "";
      if (isPlanExpired) {
        message = "Your subscription has expired. Please renew to continue analyzing documents.";
      } else if (planId === "free") {
        message = "You've used your 1 free analysis this month. Upgrade to analyze more documents.";
      } else if (planId === "pay-per-use") {
        message = "You've used your pay-per-document purchase. Buy another to analyze more documents.";
      }
      toast({
        title: "Upload limit reached",
        description: message,
        variant: "destructive"
      });
    }
  }, [isLoading, limitReached, planId, isPlanExpired, toast]);

  // If limit reached, block upload
  if (!isLoading && limitReached) {
    let upgradeMessage = "";
    let upgradeAction = "Upgrade Plan";
    if (isPlanExpired) {
      upgradeMessage = "Your subscription has expired. Please renew your plan to continue analyzing documents.";
      upgradeAction = "Renew Plan";
    } else if (planId === "free") {
      upgradeMessage = "You've used your one free analysis for this month. Upgrade your plan to analyze more documents.";
    } else if (planId === "pay-per-use") {
      upgradeMessage = "You've used your pay-per-document purchase. Buy another document analysis to continue.";
      upgradeAction = "Buy Another Document";
    }
    return <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="mb-6">
              <Link to="/dashboard" className="inline-flex items-center text-legal-muted hover:text-legal-text transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold mb-2">Upload Limit Reached</h2>
              <p className="mb-4 text-legal-muted">
                {upgradeMessage}
              </p>
              <Link to="/pricing" className="inline-block mt-2 px-5 py-3 bg-legal-primary text-white rounded-lg font-semibold hover:bg-legal-primary/90 transition">
                {upgradeAction}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-legal-muted hover:text-legal-text transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="text-center mb-4">
            <p className="text-sm text-legal-muted">Please upload a soft copy of your document. Scanned copies are not recommended, as they may not be readable.</p>
          </div>
          <UploadForm />
        </div>
      </main>
      <Footer />
    </div>;
};
export default DocumentUpload;