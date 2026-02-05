import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, SortDesc, SortAsc, Filter, UploadCloud, Mail, FileText, Activity, Globe } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DocumentCard, { Document } from "@/components/dashboard/DocumentCard";
import useContractAnalysis from "@/hooks/useContractAnalysis";
import { useAuth } from "@/contexts/AuthContext";
import contractAnalysisService from "@/services/contractAnalysisService";
import usePlanUsage from "@/hooks/usePlanUsage";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "analyzed" | "pending">("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const {
    documents,
    isLoadingDocuments,
    refetchDocuments
  } = useContractAnalysis();
  const {
    planId,
    limitReached,
    isLoading: planUsageLoading,
    availableCredits
  } = usePlanUsage();

  // Compute credits to show
  let credits: number | string | undefined;
  if (planUsageLoading) {
    credits = undefined;
  } else {
    credits = availableCredits;
  }

  // Redirect if not logged in and finished loading
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, navigate, authLoading]);
  const handleDeleteDocument = async (id: string) => {
    try {
      await contractAnalysisService.deleteDocument(id);
      toast({
        title: "Document deleted",
        description: "The document has been removed from your account."
      });
      refetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error?.message || "There was an error deleting the document. Please try again.",
        variant: "destructive"
      });
    }
  };
  const filteredDocuments = documents ? documents.filter(doc => {
    if (activeFilter !== "all" && doc.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim() && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    if (sortDirection === "asc") {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  }) : [];
  const EmptyState = () => <div className="flex flex-col items-center justify-center py-12 px-2 sm:px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-legal-primary/10 flex items-center justify-center mb-4">
        <UploadCloud className="h-8 w-8 text-legal-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
      <p className="text-legal-muted max-w-md mb-6">
        Upload your first contract to get started with AI-powered legal analysis.
      </p>
      <Link to="/dashboard/upload">
        <Button className="bg-legal-primary hover:bg-legal-primary/90 w-full max-w-xs mx-auto">
          Upload Your First Contract
        </Button>
      </Link>
    </div>;
  const formatDocumentForCard = (doc: any): Document => ({
    id: doc.id,
    title: doc.title,
    uploadDate: new Date(doc.created_at),
    status: doc.status as 'analyzed' | 'pending' | 'failed',
    fileType: doc.file_type as 'pdf' | 'docx' | 'text',
    pages: doc.pages || 0
  });
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <DashboardHeader credits={credits} />
        <div className="container max-w-full px-1 xs:px-2 sm:px-4 py-4 sm:py-6">
          {/* --- DASHBOARD ANALYTICS SECTION --- */}
          <DashboardAnalytics credits={credits} />
          {/* --- END ANALYTICS --- */}

          {/* ------- TOOL NAVIGATION CARDS ------- */}
          <div className="mx-12 grid grid-cols-1 md:grid-cols-2 gap-5 my-8">
            <Link to="/dashboard/dispute-email">
              <div className="bg-white rounded-lg shadow-sm border p-5 flex flex-col gap-2 hover:shadow-md transition cursor-pointer h-full">
                <Mail className="h-5 w-5 mb-1 text-legal-primary" />
                <h3 className="text-lg font-bold mb-1">Email Dispute Response</h3>
                <p className="text-sm text-legal-muted flex-1">
                  Generate a polite payment follow-up email for pending invoices.
                </p>
                <Button variant="secondary" className="w-max mt-2 text-slate-50 bg-[#0059aa] rounded-sm">Open Tool</Button>
              </div>
            </Link>
            <Link to="/dashboard/agreement-generator">
              <div className="bg-white rounded-lg shadow-sm border p-5 flex flex-col gap-2 hover:shadow-md transition cursor-pointer h-full">
                <FileText className="h-5 w-5 mb-1 text-legal-primary" />
                <h3 className="text-lg font-bold mb-1">NDA & Agreement Generator</h3>
                <p className="text-sm text-legal-muted flex-1">
                  Instantly draft an NDA and work-for-hire contract (AI-powered).
                </p>
                <Button variant="secondary" className="w-max mt-2 text-slate-50 bg-[#0059aa]">Open Tool</Button>
              </div>
            </Link>
            <Link to="/dashboard/legal-chat">
              <div className="bg-white rounded-lg shadow-sm border p-5 flex flex-col gap-2 hover:shadow-md transition cursor-pointer h-full">
                <Activity className="h-5 w-5 mb-1 text-legal-primary" />
                <h3 className="text-lg font-bold mb-1">Legal Advice Chat</h3>
                <p className="text-sm text-legal-muted flex-1">
                  Ask legal questions and get AI-powered general advice in chat.
                </p>
                <Button variant="secondary" className="w-max mt-2 bg-[#0059aa] text-slate-50">Open Tool</Button>
              </div>
            </Link>
            <Link to="/dashboard/jurisdiction-suggestion">
              <div className="bg-white rounded-lg shadow-sm border p-5 flex flex-col gap-2 hover:shadow-md transition cursor-pointer h-full">
                <Globe className="h-5 w-5 mb-1 text-legal-primary" />
                <h3 className="text-lg font-bold mb-1">Jurisdiction-based Suggestions</h3>
                <p className="text-sm text-legal-muted flex-1">
                  Get contract and tax tips based on your country/region.
                </p>
                <Button variant="secondary" className="w-max mt-2 bg-[#0059aa] text-slate-50">Open Tool</Button>
              </div>
            </Link>
          </div>

          {/* FILTERS AND DOCUMENTS */}
          {isLoadingDocuments ? <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-full max-w-md"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(item => <div key={item} className="h-64 bg-gray-200 rounded-lg"></div>)}
              </div>
            </div> : documents && documents.length > 0 ? <div className="space-y-4 sm:space-y-6">
              <div className="mx-12 bg-white p-2 xs:p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                {/* Responsive filters and actions bar */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  {/* Search Left Side */}
                  <div className="relative w-full md:w-auto flex-1 mb-2 md:mb-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-legal-muted h-4 w-4" />
                    <Input placeholder="Search documents..." className="pl-9 w-full md:w-80" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  {/* Filters and Buttons Right Side */}
                  <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:gap-3 md:items-center">
                    <Tabs value={activeFilter} onValueChange={value => setActiveFilter(value as any)}>
                      <TabsList className="flex flex-row gap-1 bg-gray-100">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="analyzed" className="text-xs">Analyzed</TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Button variant="outline" size="icon" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")} className="h-8 w-8" aria-label="Sort by date">
                      {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                    <Link to="/dashboard/upload" className="w-full md:w-auto">
                      <Button className="bg-legal-primary hover:bg-legal-primary/90 w-full md:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span>New</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {filteredDocuments.length > 0 ? <div className="mx-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredDocuments.map(document => <DocumentCard key={document.id} document={formatDocumentForCard(document)} onDelete={handleDeleteDocument} />)}
                </div> : <div className="bg-white p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">No matching documents</h3>
                  <p className="text-legal-muted mb-4">
                    Try adjusting your search terms or filters.Upload contracts and get instant risk analysis, red flags, and improvement suggestions.
                  </p>
                  <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}>
                    Clear Filters
                  </Button>
                </div>}
            </div> : <EmptyState />}
        </div>
      </main>
      <Footer />
    </div>;
};
export default Dashboard;
