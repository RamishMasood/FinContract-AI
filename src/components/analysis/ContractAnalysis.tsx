import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Check, 
  Download, 
  Clipboard, 
  FileText,
  AlertCircle,
  BarChart3,
  PenTool,
  Clock,
  Shield
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AnalysisSummary from "./AnalysisSummary";
import ContractComparison from "./ContractComparison";
import AnalysisRedFlags from "./AnalysisRedFlags";
import AnalysisSuggestions from "./AnalysisSuggestions";
import contractAnalysisService, { AnalysisResponse } from "@/services/contractAnalysisService";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import usePlanUsage from "@/hooks/usePlanUsage";
import { usePlanFeatureAccess } from "@/hooks/usePlanFeatureAccess";

type DocumentWithAnalysis = Database["public"]["Tables"]["documents"]["Row"] & {
  analysis_data?: AnalysisResponse | null;
};

interface ContractAnalysisProps {
  documentId?: string;
}

const ContractAnalysis = ({ documentId }: ContractAnalysisProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  const { toast } = useToast();
  
  const { data: documentData } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => {
      if (!documentId) return null;
      return contractAnalysisService.getDocumentById(documentId) as Promise<DocumentWithAnalysis | null>;
    },
    enabled: !!documentId,
  });
  
  const { 
    data: analysis, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['analysis', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      if (documentData && documentData.analysis_data) {
        const analysisData = documentData.analysis_data;
        console.log("Using document analysis data:", analysisData);
        
        // Ensure all required fields exist with proper defaults
        return {
          summary: analysisData.summary || "No summary available for this document.",
          redFlags: Array.isArray(analysisData.redFlags) ? analysisData.redFlags : [],
          missingClauses: Array.isArray(analysisData.missingClauses) ? analysisData.missingClauses : [],
          suggestedEdits: Array.isArray(analysisData.suggestedEdits) ? analysisData.suggestedEdits : [],
          riskScore: analysisData.riskScore || { 
            overall: 50, 
            sections: [
              { name: "Liability", score: 55, issues: 1 },
              { name: "Termination", score: 45, issues: 1 },
              { name: "Payment", score: 60, issues: 1 }
            ] 
          },
          clauseExplanations: Array.isArray(analysisData.clauseExplanations) ? analysisData.clauseExplanations : [],
          processingMetrics: analysisData.processingMetrics || {
            documentPages: documentData.pages || 1,
            processingTimeSeconds: 3,
            wordsAnalyzed: 500
          }
        };
      }
      
      return {
        summary: "Analysis is not available for this document. Please try analyzing again.",
        redFlags: [],
        missingClauses: [],
        suggestedEdits: [],
        riskScore: { 
          overall: 50, 
          sections: [
            { name: "Liability", score: 55, issues: 1 },
            { name: "Termination", score: 45, issues: 1 }
          ] 
        },
        clauseExplanations: [],
        processingMetrics: {
          documentPages: 0,
          processingTimeSeconds: 0,
          wordsAnalyzed: 0
        }
      };
    },
    enabled: !!documentData,
  });

  const { originalPlanId, isPlanExpired, hasPaidPlans } = usePlanUsage();
  const { clauseExplanations: hasClauseExplanationsAccess } = usePlanFeatureAccess();

  useEffect(() => {
    if (analysis) {
      console.log("Analysis data loaded:", {
        redFlagsCount: analysis.redFlags?.length || 0,
        suggestedEditsCount: analysis.suggestedEdits?.length || 0,
        missingClausesCount: analysis.missingClauses?.length || 0,
        clauseExplanationsCount: analysis.clauseExplanations?.length || 0
      });
    }
  }, [analysis]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Analysis failed to load",
        description: "There was an error loading the contract analysis. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const handleCopyToClipboard = () => {
    if (analysis) {
      const suggestedContract = analysis.suggestedEdits && analysis.suggestedEdits.length > 0
        ? analysis.suggestedEdits
            .map(edit => `${edit.section}:\n${edit.suggested}`)
            .join('\n\n')
        : analysis.summary;
      
      navigator.clipboard.writeText(suggestedContract);
      
      toast({
        title: "Copied to clipboard",
        description: "The suggested contract has been copied to your clipboard.",
      });
    }
  };
  
  const handleDownload = (type: "summary" | "suggestions") => {
    if (analysis) {
      let content = '';
      let filename = '';
      
      if (type === "summary") {
        content = `# Contract Analysis Summary\n\n## Summary\n${analysis.summary}\n\n## Red Flags\n`;
        if (analysis.redFlags && analysis.redFlags.length > 0) {
          analysis.redFlags.forEach(flag => {
            content += `* ${flag.title} (${flag.severity})\n  ${flag.description}\n\n`;
          });
        }
        
        content += `\n## Missing Clauses\n`;
        if (analysis.missingClauses && analysis.missingClauses.length > 0) {
          analysis.missingClauses.forEach(clause => {
            content += `* ${clause}\n`;
          });
        }
        
        filename = 'contract-analysis-summary.txt';
      } else {
        content = `# Suggested Contract Improvements\n\n`;
        
        if (!analysis.suggestedEdits || analysis.suggestedEdits.length === 0) {
          content += "No specific improvements were suggested for this contract.";
        } else {
          analysis.suggestedEdits.forEach(edit => {
            content += `## ${edit.section}\n\n`;
            content += `### Original\n${edit.original}\n\n`;
            content += `### Suggested\n${edit.suggested}\n\n`;
            content += `### Explanation\n${edit.explanation}\n\n`;
            content += `---\n\n`;
          });
        }
        
        filename = 'contract-suggested-improvements.txt';
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Your ${type === "summary" ? "analysis summary" : "suggested improvements"} is downloading.`,
      });
    }
  };
  
  const handleViewRedFlags = () => {
    setActiveTab("redFlags");
  };
  
  const renderProcessingMetrics = () => {
    if (!analysis || !analysis.processingMetrics) return null;
    
    const { documentPages, processingTimeSeconds, wordsAnalyzed } = analysis.processingMetrics;
    
    return (
      <div className="flex flex-wrap justify-center gap-6 mt-4 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-legal-primary" />
          <div>
            <div className="text-2xl font-bold">{processingTimeSeconds.toFixed(1)}s</div>
            <div className="text-xs text-legal-muted">Processing Time</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-legal-primary" />
          <div>
            <div className="text-2xl font-bold">{documentPages}</div>
            <div className="text-xs text-legal-muted">Pages Analyzed</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-legal-primary" />
          <div>
            <div className="text-2xl font-bold">{wordsAnalyzed}</div>
            <div className="text-xs text-legal-muted">Words Analyzed</div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRiskScore = () => {
    if (!analysis || !analysis.riskScore) return null;
    
    const { overall, sections } = analysis.riskScore;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Overall Risk Score</h4>
          <div className="flex items-center">
            <div 
              className={`text-lg font-bold ${
                overall > 75 
                  ? 'text-red-600' 
                  : overall > 50 
                  ? 'text-amber-600' 
                  : 'text-green-600'
              }`}
            >
              {overall}/100
            </div>
          </div>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              overall > 75 
                ? 'bg-red-500' 
                : overall > 50 
                ? 'bg-amber-500' 
                : 'bg-green-500'
            }`} 
            style={{ width: `${overall}%` }}
          ></div>
        </div>
        
        <h4 className="font-medium mt-6 mb-3">Section Risks</h4>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm">{section.name}</div>
                <div className="text-sm font-medium">{section.score}/100</div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    section.score > 75 
                      ? 'bg-red-500' 
                      : section.score > 50 
                      ? 'bg-amber-500' 
                      : 'bg-green-500'
                  }`} 
                  style={{ width: `${section.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderClauseExplanations = () => {
    // Check if user has access to clause explanations
    if (!hasClauseExplanationsAccess) {
      const message = isPlanExpired 
        ? "Your subscription has expired. Please renew to access clause explanations."
        : "Clause explanations are available for Pay-Per-Document and Monthly subscribers. Upgrade your plan to unlock advanced clause insights.";
      
      return (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center min-h-[200px]">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">Clause Explanations Locked</h4>
          <div className="text-legal-muted max-w-md">
            <p className="mb-4">{message}</p>
            {!isPlanExpired && (
              <div className="text-sm">
                <div className="mb-1 font-semibold">Available with:</div>
                • Pay-Per-Document analysis<br />
                • Monthly subscription
              </div>
            )}
          </div>
        </div>
      );
    }

    const validExplanations = analysis && analysis.clauseExplanations ? 
      analysis.clauseExplanations.filter(explanation => 
        explanation.clause && 
        explanation.explanation && 
        explanation.clause.length > 5 &&
        explanation.explanation.length > 5
      ) : [];
    
    if (!validExplanations || validExplanations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">No Clause Explanations</h4>
          <p className="text-legal-muted max-w-md">
            No specific clause explanations were provided for this contract.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-6">
        <h4 className="font-medium">Clause Explanations</h4>
        {validExplanations.map((item, index) => (
          <div key={`clause-${index}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-medium mb-2">{item.section || `Clause ${index + 1}`}</div>
            <div className="text-sm mb-3 italic bg-white p-2 rounded border border-gray-200">"{item.clause}"</div>
            <div className="text-sm text-legal-muted">{item.explanation}</div>
          </div>
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-8 bg-gray-200 rounded w-2/6 mt-8"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <div className="text-legal-muted mt-8">Analyzing your contract...</div>
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px]">
        <AlertCircle className="h-16 w-16 text-legal-danger mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
        <p className="text-legal-muted text-center max-w-md mb-6">
          We couldn't analyze this contract. This could be due to file format issues or server problems.
        </p>
        <Button 
          className="bg-legal-primary hover:bg-legal-primary/90"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // Button lock conditions for different features
  // New free users (no paid plans ever) can't access copy/download improvements features
  const isNewFreeUser = !hasPaidPlans && originalPlanId === "free";
  
  // Lock copy for new free users only, but allow download summary for everyone
  const isCopyLocked = isNewFreeUser;
  const isDownloadSummaryLocked = false; // Enable download summary for all users including free trial
  
  // Download improvements locked for new free users, but previously paid users can access their old analyses
  const isDownloadImprovementsLocked = isNewFreeUser;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-100 p-4 md:p-6">
        <h2 className="text-xl font-bold mb-2">Contract Analysis Results</h2>
        <p className="text-legal-muted">
          AI-powered analysis of your contract with highlighted risks and suggestions
        </p>
        
        {/* Responsive metrics */}
        <div className="w-full">
          {renderProcessingMetrics()}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Responsive tab list with horizontal scroll on mobile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-100 gap-y-3">
          <TabsList
            className="flex md:grid md:grid-cols-5 w-full overflow-x-auto whitespace-nowrap gap-2 scrollbar-thin scrollbar-thumb-gray-200"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <TabsTrigger value="summary" className="min-w-max">Summary</TabsTrigger>
            <TabsTrigger value="redFlags" className="min-w-max">
              Red Flags
              {analysis.redFlags && analysis.redFlags.length > 0 && (
                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">
                  {analysis.redFlags.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="min-w-max">
              Suggestions
              {analysis.suggestedEdits && analysis.suggestedEdits.length > 0 && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                  {analysis.suggestedEdits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="min-w-max">Compare</TabsTrigger>
            <TabsTrigger value="explanation" className="min-w-max">Explanations</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Responsive tab content */}
        <div className="p-2 sm:p-4 md:p-6">
          <TabsContent value="summary" className="mt-0">
            <div className="w-full">
              {renderRiskScore()}
              <AnalysisSummary 
                summary={analysis.summary} 
                redFlagsCount={analysis.redFlags?.length || 0} 
                missingClauses={analysis.missingClauses || []}
                onViewRedFlags={handleViewRedFlags}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="redFlags" className="mt-0">
            <div className="w-full">
              <AnalysisRedFlags redFlags={analysis.redFlags || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="mt-0">
            <div className="w-full">
              <AnalysisSuggestions suggestedEdits={analysis.suggestedEdits || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-0">
            {/* Add horizontal scroll for comparison on mobile */}
            <div className="w-full overflow-x-auto">
              <ContractComparison suggestedEdits={analysis.suggestedEdits || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="explanation" className="mt-0">
            <div className="w-full">
              {renderClauseExplanations()}
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Responsive button group */}
      <div className="border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
        <Button
          variant="outline"
          className={`flex items-center gap-2 w-full sm:w-auto ${isCopyLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200' : ''}`}
          disabled={isCopyLocked}
          onClick={handleCopyToClipboard}
          title={isCopyLocked ? "Available with paid plans. Upgrade to unlock this feature." : ""}
        >
          <Clipboard className="h-4 w-4" />
          <span>Copy Suggestions</span>
        </Button>
        
        <Button
          variant="outline"
          className={`flex items-center gap-2 w-full sm:w-auto ${isDownloadSummaryLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200' : ''}`}
          disabled={isDownloadSummaryLocked}
          onClick={() => handleDownload("summary")}
          title={isDownloadSummaryLocked ? "Available with paid plans. Upgrade to unlock this feature." : ""}
        >
          <Download className="h-4 w-4" />
          <span>Download Summary</span>
        </Button>
        
        <Button
          className={`flex items-center gap-2 w-full sm:w-auto ${isDownloadImprovementsLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-legal-primary hover:bg-legal-primary/90 text-white'}`}
          disabled={isDownloadImprovementsLocked}
          onClick={() => handleDownload("suggestions")}
          title={isDownloadImprovementsLocked ? "Available with paid plans. Upgrade to unlock this feature." : ""}
        >
          <FileText className="h-4 w-4" />
          <span>Download Suggested Improvements</span>
        </Button>
      </div>
    </div>
  );
};

export default ContractAnalysis;
