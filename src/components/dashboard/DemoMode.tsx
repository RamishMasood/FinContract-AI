import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DERIV_SAMPLE_DATA } from "@/constants/tradingTemplates";
import { useToast } from "@/components/ui/use-toast";
import contractAnalysisService from "@/services/contractAnalysisService";

const DemoMode = () => {
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRunDemo = async () => {
    setIsRunning(true);
    
    try {
      // Create demo document with Deriv sample data
      const demoText = `
TRADING TERMS AND CONDITIONS - DERIV CFD SAMPLE

1. LEVERAGE AND MARGIN
${DERIV_SAMPLE_DATA.leverageWarnings[0]}
${DERIV_SAMPLE_DATA.leverageWarnings[1]}

2. POSITION CLOSURE
${DERIV_SAMPLE_DATA.positionClosure[0]}
${DERIV_SAMPLE_DATA.positionClosure[1]}

3. RISKS
${DERIV_SAMPLE_DATA.risks[0]}
${DERIV_SAMPLE_DATA.risks[1]}
${DERIV_SAMPLE_DATA.risks[2]}

4. REGULATORY COMPLIANCE
${DERIV_SAMPLE_DATA.regulatory[0]}
${DERIV_SAMPLE_DATA.regulatory[1]}
      `.trim();

      // Analyze the demo contract
      const response = await contractAnalysisService.analyzeContract({
        document: demoText,
        documentType: 'text',
        documentName: 'Deriv CFD Trading Terms - Demo'
      });

      toast({
        title: "Demo analysis complete",
        description: "High-risk leverage and missing protections detected. View results below.",
      });

      // Navigate to analysis page
      if (response.documentId) {
        navigate(`/dashboard/document/${response.documentId}`);
      }
    } catch (error) {
      toast({
        title: "Demo failed",
        description: "Could not run demo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Play className="h-5 w-5 text-amber-600" />
          Hackathon Demo Mode
        </CardTitle>
        <CardDescription>
          Test FinContract AI with a real Deriv-style CFD sample. Instantly see risk detection and compliance suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <TrendingUp className="h-5 w-5 text-red-600 mb-2" />
            <div className="text-xs font-semibold text-slate-900">High Leverage</div>
            <div className="text-xs text-slate-600">1:1000 detected</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <Shield className="h-5 w-5 text-amber-600 mb-2" />
            <div className="text-xs font-semibold text-slate-900">Missing Protections</div>
            <div className="text-xs text-slate-600">Negative balance</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <Clock className="h-5 w-5 text-blue-600 mb-2" />
            <div className="text-xs font-semibold text-slate-900">80% Faster</div>
            <div className="text-xs text-slate-600">Review time saved</div>
          </div>
        </div>
        
        <Button 
          onClick={handleRunDemo}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90"
        >
          {isRunning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Running Demo Analysis...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Demo: Analyze Deriv CFD Sample
            </>
          )}
        </Button>
        
        <p className="text-xs text-slate-500 text-center">
          This demo uses real Deriv Trading Terms data to showcase FinContract AI's risk detection capabilities.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoMode;
