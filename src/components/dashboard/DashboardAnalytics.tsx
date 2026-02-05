import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon, Gauge, ChartBar, ChartPie, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useContractAnalysis } from "@/hooks/useContractAnalysis";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

// Utility: returns short status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case "analyzed": return "Analyzed";
    case "pending": return "Pending";
    case "failed": return "Failed";
    default: return "Other";
  }
};

// System status utility
const getSystemStatus = (credits: number | string | undefined) => {
  if (credits === undefined) return { label: "Loading...", color: "text-gray-400", status: "Loading" };
  if (credits === "Unlimited") return { label: "Active", color: "text-emerald-600", status: "Active" };
  if (typeof credits === "number" && credits > 0) return { label: "Active", color: "text-emerald-600", status: "Active" };
  if (credits === 0) return { label: "Inactive", color: "text-red-500", status: "Inactive" };
  return { label: "Inactive", color: "text-red-500", status: "Inactive" };
};

function EmptyChartAnimation() {
  // Simple pulse-dot loading, could use Lottie for even better look
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in duration-300">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-gray-200 animate-pulse delay-150" />
        <span className="w-2 h-2 rounded-full bg-gray-200 animate-pulse delay-300" />
      </div>
      <span className="text-xs text-gray-400 mt-2">No data yet</span>
    </div>
  );
}

// Accept credits as a prop
type DashboardAnalyticsProps = {
  credits?: number | string;
};

export default function DashboardAnalytics({ credits }: DashboardAnalyticsProps) {
  const { documents, isLoadingDocuments } = useContractAnalysis();

  // Analytics/statistics memoized calculations
  const stats = useMemo(() => {
    const total = documents?.length ?? 0;
    let analyzed = 0, pending = 0, failed = 0, pages = 0;
    let latestDoc: any = null, latestDate = 0, typeCounter: Record<string, number> = {};
    let thisMonthCount = 0, totalLength = 0;
    if (documents) {
      for (const doc of documents) {
        // Fix: Normalize status to lowercase and trim whitespace before comparison
        const status = typeof doc.status === "string" ? doc.status.toLowerCase().trim() : "";
        if (status === "analyzed") analyzed++;
        if (status === "pending") pending++;
        if (status === "failed") failed++;
        pages += Number(doc.pages || 0);
        totalLength += Number(doc.pages || 0);
        if (doc.created_at) {
          const createdAtTS = new Date(doc.created_at).getTime();
          if (createdAtTS > latestDate) {
            latestDate = createdAtTS;
            latestDoc = doc;
          }
          if (
            new Date(doc.created_at).getMonth() === new Date().getMonth() &&
            new Date(doc.created_at).getFullYear() === new Date().getFullYear()
          ) {
            thisMonthCount++;
          }
        }
        if (doc.file_type) {
          typeCounter[doc.file_type] = (typeCounter[doc.file_type] || 0) + 1;
        }
      }
    }
    // Find most frequent file type
    let topFileType = Object.entries(typeCounter).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
    return {
      total,
      analyzed,
      pending,
      failed,
      pages,
      latestDoc,
      topFileType,
      thisMonthCount,
      avgLength: total > 0 ? Math.round(totalLength / total) : 0,
    };
  }, [documents]);

  // Chart: Show document counts by status
  const chartData = [
    { name: "Analyzed", value: stats.analyzed, color: "#16a34a" }, // emerald
    { name: "Pending", value: stats.pending, color: "#fbbf24" },   // amber
    { name: "Failed", value: stats.failed, color: "#ef4444" },     // red
  ];

  // Animation classes for fade-in cards
  const cardBase = "shadow-md border-0 transition-transform transform hover:scale-105 animate-fade-in";
  
  // === REPLACE Status Breakdown WITH System Status Card ===
  const systemStatus = getSystemStatus(credits);

  return (
    <>
      <section className={cn("mb-8 mx-12 grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6")}>
        {/* Total Documents */}
        <Card className={cardBase}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <BarChartIcon className="text-emerald-600 bg-emerald-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDocuments ? "–" : stats.total}</div>
            <div className="text-xs text-muted-foreground">Uploaded</div>
          </CardContent>
        </Card>
        {/* Pages */}
        <Card className={cardBase + " delay-75"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ChartBar className="text-blue-600 bg-blue-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Pages Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDocuments ? "–" : stats.pages}</div>
            <div className="text-xs text-muted-foreground">Total pages</div>
          </CardContent>
        </Card>
        {/* System Status (replaces Status Breakdown) */}
        <Card className={cardBase + " delay-150"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Gauge
              className={cn(
                "rounded p-1 w-8 h-8",
                systemStatus.status === "Active" ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"
              )}
            />
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemStatus.color}`}>
              {systemStatus.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {systemStatus.status === "Loading" ? "Checking credits..." : systemStatus.status === "Active" ? "You can upload and analyze contracts" : "Upload credits required"}
            </div>
          </CardContent>
        </Card>
        {/* Success Rate */}
        <Card className={cardBase + " delay-200"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ChartPie className="text-indigo-600 bg-indigo-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDocuments || stats.total === 0
                ? "–"
                : `${Math.round((stats.analyzed / stats.total) * 100)}%`}
            </div>
            <div className="text-xs text-muted-foreground">Analysis completed</div>
          </CardContent>
        </Card>
      </section>

      {/* --- Expand with More Advanced Analytics --- */}
      <section className="mb-8 mx-12 grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
        {/* Latest Upload */}
        <Card className={cardBase}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Activity className="text-pink-500 bg-pink-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Latest Upload</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.latestDoc ? (
              <>
                <div className="font-semibold truncate">{stats.latestDoc.title || "Untitled"}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(stats.latestDoc.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <div className="mt-1 text-xs bg-gray-100 rounded-full px-2 py-0.5 inline-block">
                  {getStatusLabel(stats.latestDoc.status)} · {stats.latestDoc.file_type?.toUpperCase() || "?"}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">No uploads yet</span>
            )}
          </CardContent>
        </Card>
        {/* Most Common File Type */}
        <Card className={cardBase + " delay-75"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <TrendingUp className="text-purple-600 bg-purple-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Most Common File Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">{stats.topFileType !== "N/A" ? stats.topFileType : "–"}</div>
            <div className="text-xs text-muted-foreground">Across uploads</div>
          </CardContent>
        </Card>
        {/* Documents This Month */}
        <Card className={cardBase + " delay-150"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <TrendingDown className="text-cyan-600 bg-cyan-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Docs This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthCount}</div>
            <div className="text-xs text-muted-foreground">{new Date().toLocaleString(undefined, { month: 'long' })}</div>
          </CardContent>
        </Card>
        {/* Average Document Length */}
        <Card className={cardBase + " delay-200"}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <ChartArea className="text-teal-700 bg-teal-50 rounded p-1 w-8 h-8" />
            <CardTitle className="text-lg font-medium">Avg. Doc Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLength}</div>
            <div className="text-xs text-muted-foreground">Pages per doc</div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

// Modern bar chart using recharts & shadcn color palette
function BarChartWrapper({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <BarChart data={data}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip
        wrapperStyle={{ borderRadius: 6, boxShadow: "0 2px 12px rgba(0,0,0,0.09)" }}
        content={({ active, payload }) =>
          active && payload && payload.length ? (
            <div className="bg-white border shadow px-2 py-1 rounded text-xs">
              <span>{payload[0].value}</span> {payload[0].payload.name}
            </div>
          ) : null
        }
      />
      <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive fill="#16a34a">
        {data.map((entry, idx) => (
          <Cell
            key={`cell-${idx}`}
            fill={entry.color}
            stroke="none"
          />
        ))}
      </Bar>
    </BarChart>
  );
}

// Always import ChartArea for the extra avg stat card
import { ChartArea } from "lucide-react";
