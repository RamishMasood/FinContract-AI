import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";

interface PreviousAnalysis {
  overallRiskScore?: number;
  redFlagsCount?: number;
}

interface TemporalComparisonProps {
  currentScore: number;
  currentRedFlagsCount?: number;
  previousAnalysis?: PreviousAnalysis | null;
  documentTitle?: string;
}

const TemporalComparison = ({
  currentScore,
  currentRedFlagsCount = 0,
  previousAnalysis,
}: TemporalComparisonProps) => {
  if (!previousAnalysis || previousAnalysis.overallRiskScore == null) return null;

  const previous = previousAnalysis.overallRiskScore;
  const diff = currentScore - previous;
  const improved = diff > 0;
  const regressed = diff < 0;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-900 text-base">
          <History className="h-4 w-4 text-slate-600" />
          Temporal Comparison
        </CardTitle>
        <CardDescription>
          Risk score change since last analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-500">{previous}/100</div>
            <div className="text-xs text-slate-500">Previous</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            {improved && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="h-5 w-5" />
                +{diff} improved
              </span>
            )}
            {regressed && (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <TrendingDown className="h-5 w-5" />
                {diff} regressed
              </span>
            )}
            {!improved && !regressed && (
              <span className="flex items-center gap-1 text-slate-600">
                <Minus className="h-5 w-5" />
                No change
              </span>
            )}
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${improved ? "text-emerald-600" : regressed ? "text-red-600" : "text-slate-900"}`}>
              {currentScore}/100
            </div>
            <div className="text-xs text-slate-500">Current</div>
          </div>
        </div>
        {previousAnalysis.redFlagsCount != null && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Red flags: {previousAnalysis.redFlagsCount} → {currentRedFlagsCount}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TemporalComparison;
