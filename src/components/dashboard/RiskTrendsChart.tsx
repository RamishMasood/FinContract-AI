import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DocumentWithRisk {
  id: string;
  title: string;
  analyzedAt: Date;
  riskScore: number;
  previousRiskScore?: number;
}

interface RiskTrendsChartProps {
  documents: DocumentWithRisk[];
}

const RiskTrendsChart = ({ documents }: RiskTrendsChartProps) => {
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
  );

  const chartData = sortedDocs.map((d) => ({
    name: d.title.length > 20 ? d.title.slice(0, 20) + "…" : d.title,
    fullName: d.title,
    score: d.riskScore,
    date: new Date(d.analyzedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    }),
  }));

  const improvements = documents.filter(
    (d) => d.previousRiskScore != null && d.riskScore > (d.previousRiskScore ?? 0)
  ).length;
  const regressions = documents.filter(
    (d) => d.previousRiskScore != null && d.riskScore < (d.previousRiskScore ?? 0)
  ).length;

  if (documents.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Risk Trends
          </CardTitle>
          <CardDescription>
            Temporal view of compliance scores across your contracts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Analyze contracts to see risk trends over time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Risk Trends
        </CardTitle>
        <CardDescription>
          Temporal view of compliance scores. Track improvements and regressions.
        </CardDescription>
        {(improvements > 0 || regressions > 0) && (
          <div className="flex gap-4 mt-2">
            {improvements > 0 && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {improvements} improved
              </span>
            )}
            {regressions > 0 && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="h-4 w-4" />
                {regressions} regressed
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(_, i) => chartData[i]?.date || ""}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
              />
              <ReferenceLine y={60} stroke="#94a3b8" strokeDasharray="3 3" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded-lg shadow-lg p-2 text-sm">
                        <div className="font-medium truncate max-w-[200px]">{d.fullName}</div>
                        <div className="text-slate-600">
                          Score: <span className="font-semibold">{d.score}/100</span>
                        </div>
                        <div className="text-slate-500 text-xs">{d.date}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: "#059669", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Higher score = lower risk. Dotted line at 60 = compliance threshold.
        </p>
      </CardContent>
    </Card>
  );
};

export default RiskTrendsChart;
