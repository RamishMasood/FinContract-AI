import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContractAnalysis from "@/components/analysis/ContractAnalysis";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import contractAnalysisService from "@/services/contractAnalysisService";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

// Define the document type with analysis_data field
type DocumentWithAnalysis = Database["public"]["Tables"]["documents"]["Row"] & {
  analysis_data?: any | null;
};

const DocumentAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not logged in and finished loading
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, navigate, authLoading]);
  
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => {
      if (!id) return null;
      return contractAnalysisService.getDocumentById(id) as Promise<DocumentWithAnalysis | null>;
    },
    enabled: !!id && !!user,
    retry: 2,
    retryDelay: 1000,
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading document",
        description: "The document could not be loaded. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Log document data to help with debugging
  useEffect(() => {
    if (document && document.analysis_data) {
      console.log("Document analysis data:", document.analysis_data);
    }
  }, [document]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-legal-muted hover:text-legal-text transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Dashboard</span>
            </Link>
            
            <h1 className="text-2xl font-bold mt-3">
              {isLoading ? "Loading analysis..." : document?.title || "Document Analysis"}
            </h1>
            
            {document?.status === 'analyzing' && (
              <div className="mt-2 text-legal-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                Analysis in progress...
              </div>
            )}
            
            {document?.status === 'failed' && (
              <div className="mt-2 text-legal-danger">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                Analysis failed - please try again
              </div>
            )}
          </div>
          
          <ContractAnalysis documentId={id} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DocumentAnalysis;
