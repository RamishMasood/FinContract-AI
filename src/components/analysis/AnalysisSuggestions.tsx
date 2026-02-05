
import React from "react";
import usePlanUsage from "@/hooks/usePlanUsage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuggestedEdit {
  id: string;
  section: string;
  original: string;
  suggested: string;
  explanation: string;
}

const AnalysisSuggestions = ({ suggestedEdits = [] }: { suggestedEdits: any[] }) => {
  const { featureLocks } = usePlanUsage();

  // Clean and validate suggested edits
  const cleanSuggestedEdits = (edits: any[]): SuggestedEdit[] => {
    if (!Array.isArray(edits)) {
      return [];
    }
    
    return edits.filter(edit => {
      // Filter out invalid entries
      if (!edit.section || !edit.original || !edit.suggested) return false;
      
      // Filter out generic placeholders
      if (edit.section.toLowerCase().includes('original') || 
          edit.section.toLowerCase().includes('suggested') ||
          edit.original.toLowerCase().includes('needs enhancement') ||
          edit.original.toLowerCase().includes('current contract language needs improvement') ||
          edit.suggested.toLowerCase().includes('needs improvement')) {
        return false;
      }
      
      // Ensure meaningful content
      if (edit.original.trim().length < 10 || edit.suggested.trim().length < 10) {
        return false;
      }
      
      return true;
    }).map(edit => ({
      id: edit.id || `se-${Math.random().toString(36).substr(2, 9)}`,
      section: edit.section.trim(),
      original: edit.original.trim(),
      suggested: edit.suggested.trim(),
      explanation: edit.explanation?.trim() || "This improvement enhances the contract's clarity and legal protection."
    }));
  };

  const validSuggestedEdits = cleanSuggestedEdits(suggestedEdits);

  if (featureLocks.advancedClauseSuggestions) {
    return (
      <div className="opacity-40 pointer-events-none select-none relative">
        <div className="flex items-center mb-4">
          <span className="text-xl font-bold mr-2">Clause Suggestions</span>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-legal-muted">
          Advanced clause suggestions are available only for paid subscribers. Please upgrade your plan to unlock this feature.
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-10">
          <span className="text-legal-muted">
            Locked for Free users
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {validSuggestedEdits.length > 0 ? (
        <div className="space-y-4">
          {validSuggestedEdits.map((edit) => (
            <Card key={edit.id} className="border-legal-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{edit.section}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">Suggestion</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-legal-muted">Original Text</h4>
                    <p className="text-sm">{edit.original}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-legal-muted">Suggested Improvement</h4>
                    <p className="text-sm">{edit.suggested}</p>
                  </div>
                </div>
                {edit.explanation && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm text-legal-muted">Explanation</h4>
                    <p className="text-sm">{edit.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-legal-muted">
          No specific suggestions found for this contract.
        </div>
      )}
    </div>
  );
};

export default AnalysisSuggestions;
