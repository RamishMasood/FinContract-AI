
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalysisSummaryProps {
  summary: string;
  redFlagsCount: number;
  missingClauses: string[];
  onViewRedFlags?: () => void;
}

const AnalysisSummary = ({ summary, redFlagsCount, missingClauses, onViewRedFlags }: AnalysisSummaryProps) => {
  // Clean up the summary text to ensure it's complete and remove markdown formatting
  const cleanSummary = (text: string) => {
    if (!text) return "No summary available";
    
    // Remove markdown headers, formatting and metadata text
    let cleanedText = text
      .replace(/Here is the structured analysis of the contract:/gi, "")
      .replace(/---/g, "")
      .replace(/#+\s*\d*\.\s*SUMMARY\s*\n*/gi, "") // Remove "## 1. SUMMARY" and variations
      .replace(/#+\s*SUMMARY\s*\n*/gi, "") // Remove "## SUMMARY" without numbers
      .replace(/#+\s*\d*\.\s*RED FLAGS\s*\n*/gi, "") // Remove "## 2. RED FLAGS" and variations
      .replace(/#+\s*RED FLAGS\s*\n*/gi, "") // Remove "## RED FLAGS" without numbers
      .replace(/#+\s*\*\*\d+\.\s*[^*]+\*\*/gi, "") // Remove "## **1. Vague Service Scope...**"
      .replace(/Issue\*\*:.*?(?=\n|$)/gi, "") // Remove "Issue**:..." lines
      .replace(/Clause Text\*\*:.*?(?=\n|$)/gi, "") // Remove "Clause Text**:..." lines
      .replace(/Severity\*\*:.*?(?=\n|$)/gi, "") // Remove "Severity**:..." lines
      .trim();
    
    // Extract only the first paragraph (the actual summary)
    const firstParagraphMatch = cleanedText.match(/^(.*?)(?=\n\n|\n*-\n|\n*##|\n*\*\*|\n*Issue|\n*Clause|$)/s);
    cleanedText = firstParagraphMatch ? firstParagraphMatch[1].trim() : cleanedText;
    
    // If summary ends with "and." or similar incomplete ending, fix it
    if (cleanedText.endsWith("and.")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 4) + ".";
    } else if (cleanedText.endsWith("and")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3) + ".";
    }
    
    // Add a period at the end if missing
    if (cleanedText && !cleanedText.endsWith(".") && !cleanedText.endsWith("!") && !cleanedText.endsWith("?")) {
      cleanedText += ".";
    }
    
    return cleanedText;
  };
  
  // Clean up missing clauses to remove explanatory text
  const cleanMissingClauses = (clauses: string[]) => {
    if (!clauses || !Array.isArray(clauses)) return [];
    
    return clauses.map(clause => {
      // Remove any text after period, comma, or similar breaks
      const match = clause.match(/^([^.,()]+)(?:\s*(?:\(e\.g\.|\.|\,|\:).*)?$/);
      return match ? match[1].trim() : clause.trim();
    }).filter(clause => clause.length > 0);
  };
  
  const cleanedSummary = cleanSummary(summary);
  const cleanedMissingClauses = cleanMissingClauses(missingClauses);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Summary</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-legal-text whitespace-pre-line">{cleanedSummary}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Key Findings</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium">Red Flags</div>
              <p className="text-sm text-legal-muted mb-2">
                {redFlagsCount} potential {redFlagsCount === 1 ? 'issue' : 'issues'} identified in this contract
              </p>
              
              {redFlagsCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewRedFlags}
                  className="flex items-center gap-1"
                >
                  <span>View all red flags</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {cleanedMissingClauses && cleanedMissingClauses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Missing Clauses</h4>
              <div className="flex flex-wrap gap-2">
                {cleanedMissingClauses.map((clause, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-white border-amber-200 text-amber-800"
                  >
                    {clause}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary;
