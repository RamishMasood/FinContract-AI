import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";

interface RiskChartProps {
  riskScore: {
    overall: number;
    sections: Array<{
      name: string;
      score: number;
      issues: number;
    }>;
  };
  redFlagsCount: number;
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

// Compliance score 0–100: lower = riskier, higher = safer. Map score → risk level for display.
const scoreToRiskLevel = (score: number): 'high' | 'medium' | 'low' =>
  score <= 30 ? 'high' : score <= 60 ? 'medium' : 'low';

const RiskChart = ({ riskScore, redFlagsCount }: RiskChartProps) => {
  const chartData = useMemo(() => {
    // Section score: lower = riskier. Count sections by risk level.
    const high = riskScore.sections.filter(s => s.score <= 40).length;
    const medium = riskScore.sections.filter(s => s.score > 40 && s.score <= 70).length;
    const low = riskScore.sections.filter(s => s.score > 70).length;

    return [
      { name: 'High Risk', value: high, color: COLORS.high },
      { name: 'Medium Risk', value: medium, color: COLORS.medium },
      { name: 'Low Risk', value: low, color: COLORS.low }
    ].filter(item => item.value > 0);
  }, [riskScore]);

  const overallRiskLevel = scoreToRiskLevel(riskScore.overall);

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Shield className="h-5 w-5 text-blue-600" />
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Risk Score */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: COLORS[overallRiskLevel] }}>
              {riskScore.overall}/100
            </div>
            <div className="text-sm text-slate-600">Overall Compliance Score</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              {overallRiskLevel === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {overallRiskLevel === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
              {overallRiskLevel === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
              <span className="text-xs text-slate-500 capitalize">{overallRiskLevel} risk</span>
            </div>
          </div>

          {/* Pie Chart */}
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Red Flags Count */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Red Flags Detected</span>
              <span className="text-lg font-semibold text-red-600">{redFlagsCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskChart;
