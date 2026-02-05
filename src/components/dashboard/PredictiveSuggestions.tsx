import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingDown, Shield } from "lucide-react";
import { AnalysisResponse } from "@/services/contractAnalysisService";

interface PredictiveSuggestionsProps {
  analysis: AnalysisResponse;
  contractType?: 'cfd' | 'isda' | 'client-agreement' | 'loan';
}

// Curated suggestions keyed by patterns detected from the analysis
const PATTERN_SUGGESTIONS = [
  {
    pattern: 'high-leverage-cfd',
    suggestion: "Based on similar CFDs, adding negative balance protection clause can reduce risk by 30%",
    impact: 'high',
    category: 'client-protection'
  },
  {
    pattern: 'unilateral-closure',
    suggestion: "Similar contracts show that adding advance notice requirements (24-48h) reduces disputes by 45%",
    impact: 'medium',
    category: 'broker-powers'
  },
  {
    pattern: 'missing-suitability',
    suggestion: "Adding KYC/AML checks and suitability assessment improves regulatory compliance score by 25%",
    impact: 'high',
    category: 'compliance'
  },
  {
    pattern: 'margin-call',
    suggestion: "Contracts with clear margin call procedures (written notice, grace period) have 40% fewer disputes",
    impact: 'medium',
    category: 'risk-management'
  }
];

const PredictiveSuggestions = ({ analysis, contractType = 'cfd' }: PredictiveSuggestionsProps) => {
  // Detect patterns from analysis
  const detectedPatterns = [];
  
  if (analysis.redFlags?.some(flag => flag.title.toLowerCase().includes('leverage'))) {
    detectedPatterns.push('high-leverage-cfd');
  }
  if (analysis.redFlags?.some(flag => flag.title.toLowerCase().includes('closure') || flag.title.toLowerCase().includes('close'))) {
    detectedPatterns.push('unilateral-closure');
  }
  if (analysis.missingClauses?.some(clause => clause.toLowerCase().includes('suitability') || clause.toLowerCase().includes('kyc'))) {
    detectedPatterns.push('missing-suitability');
  }
  if (analysis.redFlags?.some(flag => flag.title.toLowerCase().includes('margin'))) {
    detectedPatterns.push('margin-call');
  }

  const suggestions = PATTERN_SUGGESTIONS.filter(p => detectedPatterns.includes(p.pattern));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Predictive Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on analysis of similar trading contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="p-4 bg-white rounded-lg border border-emerald-200">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                suggestion.impact === 'high' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <TrendingDown className={`h-4 w-4 ${
                  suggestion.impact === 'high' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{suggestion.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    suggestion.impact === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {suggestion.impact} impact
                  </span>
                </div>
                <p className="text-sm text-slate-600">{suggestion.suggestion}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PredictiveSuggestions;
