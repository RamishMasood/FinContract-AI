
import { AlertTriangle, AlertCircle, HelpCircle, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type RedFlag = {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  clause: string;
};

type AnalysisRedFlagsProps = {
  redFlags: RedFlag[];
};

const AnalysisRedFlags = ({ redFlags = [] }: AnalysisRedFlagsProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "medium":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "low":
        return <HelpCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    
    switch (normalizedSeverity) {
      case "high":
      case "high risk":
        return (
          <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            High Risk
          </span>
        );
      case "medium":
      case "medium risk":
        return (
          <span className="inline-flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
            Medium Risk
          </span>
        );
      case "low":
      case "low risk":
        return (
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Low Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
            Medium Risk
          </span>
        );
    }
  };
  
  // Clean and validate red flags
  const cleanRedFlags = (flags: RedFlag[]): RedFlag[] => {
    if (!Array.isArray(flags)) {
      return [];
    }
    
    return flags.filter(flag => {
      // Filter out invalid entries
      if (!flag.title || !flag.description) return false;
      
      // Filter out entries that are error placeholders
      if (flag.title === "Analysis Error" || 
          flag.description === "The system encountered an error while analyzing this document.") {
        return false;
      }
      
      return true;
    }).map(flag => ({
      ...flag,
      // Clean description of any severity prefixes that might have leaked through
      description: flag.description.replace(/^(High|Medium|Low)\s*(Risk|Severity)[:\s]*/i, '').trim(),
      // Ensure severity is normalized
      severity: flag.severity.toLowerCase().includes('high') ? 'high' as const :
                flag.severity.toLowerCase().includes('low') ? 'low' as const : 
                'medium' as const
    }));
  };
  
  const validRedFlags = cleanRedFlags(redFlags);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Red Flags</h3>
        <span className="text-legal-muted text-sm">{validRedFlags.length} issues found</span>
      </div>
      
      {validRedFlags.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">No Red Flags Found</h4>
          <p className="text-legal-muted max-w-md">
            We didn't detect any significant issues with this contract.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {validRedFlags.map((flag, index) => (
            <AccordionItem 
              key={flag.id || `rf-${index}`} 
              value={flag.id || `rf-${index}`}
              className={`border rounded-lg overflow-hidden ${
                flag.severity === 'high' 
                  ? 'border-red-200' 
                  : flag.severity === 'medium' 
                  ? 'border-amber-200' 
                  : 'border-blue-200'
              }`}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center gap-3 text-left">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    flag.severity === 'high' 
                      ? 'bg-red-100' 
                      : flag.severity === 'medium' 
                      ? 'bg-amber-100' 
                      : 'bg-blue-100'
                  }`}>
                    {getSeverityIcon(flag.severity)}
                  </div>
                  <div>
                    <div className="font-medium">{flag.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {getSeverityBadge(flag.severity)}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-4 py-3">
                <div className="space-y-3">
                  <p className="text-legal-text">{flag.description}</p>
                  {flag.clause && flag.clause !== "Not specified in the contract" && flag.clause !== "Clause not specified" ? (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="text-sm font-medium mb-1">Problematic Clause:</div>
                      <div className="text-legal-muted text-sm italic">"{flag.clause}"</div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="text-sm font-medium mb-1">Affected Area:</div>
                      <div className="text-legal-muted text-sm">
                        This issue affects the contract generally or a section that could not be specifically identified.
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default AnalysisRedFlags;
