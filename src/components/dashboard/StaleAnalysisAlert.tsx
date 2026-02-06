import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

const STALE_DAYS_THRESHOLD = 30;

interface DocumentWithAnalyzedAt {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  analysis_data?: unknown;
}

interface StaleAnalysisAlertProps {
  documents: DocumentWithAnalyzedAt[];
}

const StaleAnalysisAlert = ({ documents }: StaleAnalysisAlertProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const now = new Date();
  const staleDocs = (documents || []).filter((d) => {
    if (d.status !== "analyzed") return false;
    const updated = new Date(d.updated_at);
    const daysSince = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= STALE_DAYS_THRESHOLD;
  });

  if (staleDocs.length === 0) return null;

  const handleViewContracts = () => {
    if (location.pathname === "/dashboard") {
      const el = document.getElementById("contracts-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/dashboard#contracts");
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">
                {staleDocs.length} contract{staleDocs.length > 1 ? "s" : ""} may need re-analysis
              </h3>
              <p className="text-sm text-amber-800">
                Analyses older than {STALE_DAYS_THRESHOLD} days may miss recent regulatory updates. Consider re-analyzing for compliance.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={handleViewContracts}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            View Contracts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaleAnalysisAlert;
export { STALE_DAYS_THRESHOLD };
