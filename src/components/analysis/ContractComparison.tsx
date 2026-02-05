
import React, { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import usePlanUsage from "@/hooks/usePlanUsage";

type SuggestedEdit = {
  id: string;
  section: string;
  original: string;
  suggested: string;
  explanation: string;
};

type ContractComparisonProps = {
  suggestedEdits: SuggestedEdit[];
};

const ContractComparison = ({ suggestedEdits = [] }: ContractComparisonProps) => {
  const [selectedView, setSelectedView] = useState<"all" | "side-by-side">("side-by-side");
  const { featureLocks } = usePlanUsage();
  
  // Clean and validate suggested edits for comparison
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
      if (edit.original.trim().length < 15 || edit.suggested.trim().length < 15) {
        return false;
      }
      
      return true;
    }).map(edit => ({
      id: edit.id || `comp-${Math.random().toString(36).substr(2, 9)}`,
      section: edit.section.trim(),
      original: edit.original.trim(),
      suggested: edit.suggested.trim(),
      explanation: edit.explanation?.trim() || "This improvement enhances the contract's clarity and legal protection."
    }));
  };
  
  const validSuggestions = cleanSuggestedEdits(suggestedEdits);
  
  console.log("Valid suggestions for comparison:", validSuggestions.length);

  if (featureLocks.sideBySideComparison) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contract Comparison</h3>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center min-h-[200px]">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">Comparison Locked</h4>
          <div className="text-legal-muted max-w-md">
            <div className="mb-1 font-semibold">Locked on Free/Pay-Per-Doc</div>
            Side-by-side comparison is only available for paid subscribers.<br />
            <span className="font-semibold">Upgrade your plan</span> to unlock full comparison features.
          </div>
        </div>
      </div>
    );
  }
  
  if (validSuggestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contract Comparison</h3>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">No Comparison Available</h4>
          <p className="text-legal-muted max-w-md">
            There are no suggested improvements to compare with the original contract text.
          </p>
        </div>
      </div>
    );
  }

  const formatSideBySideContent = () => {
    return (
      <div className="grid grid-cols-1 md: grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Original Contract</h3>
          <div className="space-y-6">
            {validSuggestions.map((edit, index) => (
              <div key={`original-${edit.id || index}`} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="font-medium text-legal-text mb-2">{edit.section}</div>
                <div className="text-gray-700 text-sm">{edit.original}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700">Improved Contract</h3>
          <div className="space-y-6">
            {validSuggestions.map((edit, index) => (
              <div key={`suggested-${edit.id || index}`} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-legal-text mb-2">{edit.section}</div>
                <div className="text-green-800 text-sm">{edit.suggested}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const formatAllContent = () => {
    return (
      <div className="space-y-8">
        {validSuggestions.map((edit, index) => (
          <div key={edit.id || index} className="space-y-4">
            <h4 className="font-medium text-lg">{edit.section}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-sm font-medium mb-2 text-red-700">Current Text</div>
                <div className="text-gray-700 text-sm">{edit.original}</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium mb-2 text-green-700">Improved Text</div>
                <div className="text-green-800 text-sm">{edit.suggested}</div>
              </div>
            </div>
            {edit.explanation && (
              <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-100">
                <span className="font-medium text-blue-800">Impact: </span>
                <span className="text-blue-700">{edit.explanation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contract Comparison</h3>
        <Select
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as "all" | "side-by-side")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="side-by-side">Side by Side</SelectItem>
            <SelectItem value="all">Section by Section</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedView === "side-by-side" ? formatSideBySideContent() : formatAllContent()}
    </div>
  );
};

export default ContractComparison;
