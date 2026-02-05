import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, AlertTriangle, Shield, Scale, Loader2, Info } from "lucide-react";
import { AnalysisResponse } from "@/services/contractAnalysisService";
import { supabase } from "@/integrations/supabase/client";

interface ProactiveAlertsProps {
  analysis: AnalysisResponse;
  jurisdiction?: string;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  regulation?: string;
}

// Distinct color theme per alert so each card is visually different
const ALERT_THEMES: Array<{ bg: string; border: string; icon: string; Icon: typeof AlertTriangle }> = [
  { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", Icon: AlertTriangle },
  { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", Icon: AlertTriangle },
  { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", Icon: Shield },
  { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", Icon: Scale },
  { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", Icon: Info },
  { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", Icon: AlertTriangle },
  { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-600", Icon: Shield },
  { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", Icon: Scale },
];

const ProactiveAlerts = ({ analysis, jurisdiction = 'malta' }: ProactiveAlertsProps) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAlerts = async () => {
      if (!analysis || !analysis.summary) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await supabase.functions.invoke("legal-widgets", {
          body: {
            type: "proactive_alerts",
            summary: analysis.summary,
            redFlags: analysis.redFlags || [],
            missingClauses: analysis.missingClauses || [],
            jurisdiction: jurisdiction
          }
        });

        const { data, error } = response;

        if (error) {
          console.error("Error generating proactive alerts:", error);
          setAlerts([]);
          setLoading(false);
          return;
        }

        if (data?.result?.alerts && Array.isArray(data.result.alerts)) {
          // Ensure each alert has a unique ID
          const processedAlerts = data.result.alerts.map((alert: any, index: number) => ({
            id: alert.id || `alert-${index}-${Date.now()}`,
            type: alert.type || 'info',
            title: alert.title,
            message: alert.message || '',
            regulation: alert.regulation
          }));
          setAlerts(processedAlerts);
        } else {
          console.warn("Unexpected response format from proactive_alerts:", data);
          setAlerts([]);
        }
      } catch (err) {
        console.error("Exception generating proactive alerts:", err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    generateAlerts();
  }, [analysis, jurisdiction]);

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600 text-sm py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Analyzing compliance risks...</span>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, index) => {
        const theme = ALERT_THEMES[index % ALERT_THEMES.length];
        const IconComponent = theme.Icon;
        return (
          <Alert
            key={alert.id}
            className={`${theme.bg} ${theme.border} border`}
          >
            <div className="flex items-start gap-3">
              <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${theme.icon}`} />
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-slate-900">
                  {alert.regulation && `${alert.regulation}: `}
                  {alert.title || (alert.type === "error" ? "Compliance Issue" : alert.type === "warning" ? "Risk Warning" : "Information")}
                </AlertTitle>
                <AlertDescription className="text-slate-700 mt-1">
                  {alert.message}
                </AlertDescription>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default ProactiveAlerts;
