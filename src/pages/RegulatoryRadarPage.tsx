import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegulatoryRadar from "@/components/dashboard/RegulatoryRadar";
import useContractAnalysis from "@/hooks/useContractAnalysis";
import { ChevronLeft } from "lucide-react";

const RegulatoryRadarPage = () => {
  const { documents } = useContractAnalysis();

  const documentSummaries = (documents || [])
    .filter((d) => d.status === "analyzed" && d.analysis_data)
    .map((d) => ({
      id: d.id,
      title: d.title,
      summary: (d.analysis_data as { summary?: string })?.summary,
      redFlags: (d.analysis_data as { redFlags?: unknown[] })?.redFlags,
      riskScore: (d.analysis_data as { riskScore?: { sections?: unknown[] } })?.riskScore,
    }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          {/* <h1 className="text-2xl font-bold text-slate-900 mb-2">Regulatory Radar</h1>
          <p className="text-slate-600 mb-6">
            Track evolving regulations and assess impact on your contracts. Never be surprised by regulatory change.
          </p> */}
          <RegulatoryRadar documents={documentSummaries} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegulatoryRadarPage;
