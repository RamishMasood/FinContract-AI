import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sliders, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AnalysisResponse } from "@/services/contractAnalysisService";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringRule {
  id: string;
  category: string;
  rule: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  suggestedThreshold?: string;
}

interface MonitoringRuleSuggestionsProps {
  analysis: AnalysisResponse;
}

const MonitoringRuleSuggestions = ({ analysis }: MonitoringRuleSuggestionsProps) => {
  const [rules, setRules] = useState<MonitoringRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysis?.summary) return;
    setLoading(true);
    setError(null);
    supabase.functions
      .invoke("legal-widgets", {
        body: {
          type: "monitoring_rules",
          summary: analysis.summary,
          redFlags: analysis.redFlags || [],
          riskScoreSections: analysis.riskScore?.sections || [],
          missingClauses: analysis.missingClauses || [],
        },
      })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setRules([]);
          return;
        }
        const parsed = data?.result?.rules;
        if (Array.isArray(parsed)) {
          setRules(
            parsed.map((r: Record<string, unknown>, i: number) => ({
              id: (r.id as string) || `rule-${i}`,
              category: String(r.category || "compliance"),
              rule: String(r.rule || ""),
              rationale: String(r.rationale || ""),
              priority: (r.priority as "high" | "medium" | "low") || "medium",
              suggestedThreshold: r.suggestedThreshold as string | undefined,
            }))
          );
        } else {
          setRules([]);
        }
      })
      .catch((e) => {
        setError(String(e));
        setRules([]);
      })
      .finally(() => setLoading(false));
  }, [analysis?.summary, analysis?.redFlags, analysis?.riskScore?.sections, analysis?.missingClauses]);

  const getPriorityBadge = (p: string) => {
    if (p === "high") return <Badge className="bg-red-100 text-red-700">High</Badge>;
    if (p === "medium") return <Badge className="bg-amber-100 text-amber-700">Medium</Badge>;
    return <Badge className="bg-slate-100 text-slate-700">Low</Badge>;
  };

  if (loading) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Sliders className="h-5 w-5 text-violet-600" />
            Monitoring Rule Suggestions
          </CardTitle>
          <CardDescription>
            AI-suggested operational monitoring rules based on contract terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating monitoring rules...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || rules.length === 0) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Sliders className="h-5 w-5 text-violet-600" />
            Monitoring Rule Suggestions
          </CardTitle>
          <CardDescription>
            AI-suggested operational monitoring rules based on contract terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Could not load rules. Try again later.</span>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No monitoring rules suggested for this contract.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Sliders className="h-5 w-5 text-violet-600" />
          Monitoring Rule Suggestions
        </CardTitle>
        <CardDescription>
          Suggested operational monitoring rules based on contract risks. Adjust thresholds in your compliance systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-white rounded-lg border border-violet-100 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {r.category}
                  </Badge>
                  {getPriorityBadge(r.priority)}
                  {r.suggestedThreshold && (
                    <Badge variant="secondary" className="text-xs">
                      {r.suggestedThreshold}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-slate-900">{r.rule}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-violet-500 flex-shrink-0" />
            </div>
            {r.rationale && (
              <p className="text-sm text-slate-600">{r.rationale}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MonitoringRuleSuggestions;
