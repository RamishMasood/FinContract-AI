import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radar, AlertTriangle, Calendar, FileText, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { REGULATORY_UPDATES, RegulatoryUpdate } from "@/constants/regulatoryUpdates";
import { supabase } from "@/integrations/supabase/client";

interface DocumentSummary {
  id: string;
  title: string;
  summary?: string;
  redFlags?: unknown[];
  riskScore?: { sections?: { name: string; score: number; issues: number }[] };
}

interface ImpactResult {
  isAffected: boolean;
  impactLevel: string;
  affectedAreas: string[];
  requiredActions: string[];
  deadlineNote: string;
}

const RegulatoryRadar = ({ documents = [] }: { documents?: DocumentSummary[] }) => {
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [impactMap, setImpactMap] = useState<Record<string, Record<string, ImpactResult>>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, string | null>>({});

  const updates = jurisdiction === "all"
    ? REGULATORY_UPDATES
    : REGULATORY_UPDATES.filter((u) => u.jurisdiction.toLowerCase() === jurisdiction.toLowerCase());

  const assessImpact = async (update: RegulatoryUpdate, doc: DocumentSummary) => {
    const key = `${update.id}-${doc.id}`;
    setLoadingMap((prev) => ({ ...prev, [key]: "loading" }));
    try {
      const { data, error } = await supabase.functions.invoke("legal-widgets", {
        body: {
          type: "regulatory_impact",
          updateTitle: update.title,
          updateSummary: update.summary,
          impactAreas: update.impactAreas,
          effectiveDate: update.effectiveDate,
          contractSummary: doc.summary,
          redFlags: doc.redFlags || [],
          riskScoreSections: doc.riskScore?.sections || [],
        },
      });
      if (error) throw error;
      const result = data?.result as ImpactResult | undefined;
      if (result) {
        setImpactMap((prev) => ({
          ...prev,
          [update.id]: { ...(prev[update.id] || {}), [doc.id]: result },
        }));
      }
    } catch (err) {
      console.error("Impact assessment failed:", err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: null }));
    }
  };

  const getImpactBadge = (impact: ImpactResult) => {
    const level = impact.impactLevel?.toLowerCase() || "none";
    if (level === "high") return <Badge className="bg-red-100 text-red-700">High Impact</Badge>;
    if (level === "medium") return <Badge className="bg-amber-100 text-amber-700">Medium Impact</Badge>;
    if (level === "low") return <Badge className="bg-blue-100 text-blue-700">Low Impact</Badge>;
    return <Badge variant="outline">No Impact</Badge>;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Radar className="h-5 w-5 text-blue-600" />
          Regulatory Radar
        </CardTitle>
        <CardDescription>
          Stay current with evolving regulations. Assess impact on your contracts.
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Select value={jurisdiction} onValueChange={setJurisdiction}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="EU">EU</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="US">US</SelectItem>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="Malta">Malta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update) => {
          const isExpanded = expandedId === update.id;
          const analyzedDocs = documents.filter((d) => d.summary && d.summary.length > 50);
          return (
            <div
              key={update.id}
              className="border rounded-lg bg-white p-4 space-y-3"
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : update.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{update.regulation}</Badge>
                    <Badge variant="secondary">{update.jurisdiction}</Badge>
                    <span className="text-xs text-slate-500">{update.date}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mt-1">{update.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{update.summary}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    Effective: {update.effectiveDate}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="pt-3 border-t space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Impact Areas</h5>
                    <div className="flex flex-wrap gap-1">
                      {update.impactAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Suggested Actions</h5>
                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                      {update.suggestedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  {analyzedDocs.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Impact on Your Contracts
                      </h5>
                      <div className="space-y-2">
                        {analyzedDocs.map((doc) => {
                          const key = `${update.id}-${doc.id}`;
                          const loading = loadingMap[key];
                          const impact = impactMap[update.id]?.[doc.id];
                          return (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                            >
                              <span className="text-sm truncate flex-1">{doc.title}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                ) : impact ? (
                                  <>
                                    {getImpactBadge(impact)}
                                    {impact.isAffected && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/document/${doc.id}`);
                                        }}
                                      >
                                        Details
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      assessImpact(update, doc);
                                    }}
                                  >
                                    Assess Impact
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {impactMap[update.id] && Object.keys(impactMap[update.id]).length > 0 && (
                        <div className="mt-2 space-y-2">
                          {Object.entries(impactMap[update.id])
                            .filter(([, v]) => v.isAffected)
                            .map(([docId, impact]) => {
                              const doc = analyzedDocs.find((d) => d.id === docId);
                              return (
                                <div key={docId} className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                                  <div className="font-medium text-amber-900 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    {doc?.title}
                                  </div>
                                  <p className="text-amber-800 mt-1">{impact.deadlineNote}</p>
                                  {impact.requiredActions?.length > 0 && (
                                    <ul className="list-disc list-inside mt-1 text-amber-700">
                                      {impact.requiredActions.slice(0, 3).map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {analyzedDocs.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      Analyze contracts to assess impact against this update.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RegulatoryRadar;
