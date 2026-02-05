import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Trash2, Download, Clipboard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { downloadAgreementPdf } from "./utils/agreementPdf";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import usePlanUsage from "@/hooks/usePlanUsage";
type Agreement = {
  id: string;
  user_id: string;
  created_at: string;
  context: string;
  disclosing_party: string;
  receiving_party: string;
  agreement_text: string;
  type: string;
  title: string | null;
};
async function fetchAgreement(context: string, disclosing: string, receiving: string) {
  try {
    const response = await supabase.functions.invoke("legal-widgets", {
      body: {
        type: "nda_agreement",
        context,
        disclosing_party: disclosing,
        receiving_party: receiving
      }
    });
    console.log("Edge Function response (Agreement):", response);
    const {
      data,
      error
    } = response;
    if (error) {
      // HTTP-level error
      return {
        error: error.message || "Edge Function returned an error."
      };
    }
    if (!data) {
      return {
        error: "No response from function. Please try again later."
      };
    }
    if (typeof data.error === "string" && data.error) {
      return {
        error: data.error
      };
    }
    if (typeof data.result === "string") {
      return {
        result: data.result
      };
    }
    if (typeof data === "string") {
      return {
        result: data
      };
    }
    // Show raw data if possible for troubleshooting
    return {
      error: "Unexpected structure: " + JSON.stringify(data)
    };
  } catch (e: any) {
    return {
      error: e?.message || "Edge Function call threw an exception."
    };
  }
}
async function saveAgreement(agreement: {
  user_id: string;
  context: string;
  disclosing_party: string;
  receiving_party: string;
  agreement_text: string;
  type: string;
  title?: string;
}) {
  // Always include "deleted": false on insert to avoid RLS errors
  const payload = {
    ...agreement,
    deleted: false
  };
  const {
    data,
    error
  } = await supabase.from("legal_agreements").insert([payload]).select().single();
  if (error) {
    // Add explicit RLS error logging for troubleshooting
    if (error.message && error.message.toLowerCase().includes("row-level security")) {
      console.error("RLS error when inserting agreement:", error);
    }
    throw new Error(error.message);
  }
  return data as Agreement;
}
async function fetchAgreements(userId: string): Promise<Agreement[]> {
  const {
    data,
    error
  } = await supabase.from("legal_agreements").select("*").eq("user_id", userId).eq("deleted", false).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Agreement[];
}
async function deleteAgreement(id: string, userId: string) {
  // Soft delete logic with enhanced debug logging
  console.log("[deleteAgreement] table legal_agreements, target id:", id, "user_id for query:", userId);
  const updatePayload = {
    deleted: true
  };
  try {
    const {
      data,
      error
    } = await supabase.from("legal_agreements").update(updatePayload).eq("id", id).eq("user_id", userId).select("id, deleted, user_id");
    if (error) {
      console.error("[Delete Agreement] Supabase Error:", error, "Payload:", updatePayload, "id:", id, "user_id:", userId);
      throw new Error(error.message);
    }
    console.log("[deleteAgreement] DELETE SUCCESS:", data);
    return data;
  } catch (e) {
    console.error("[Delete Agreement] Exception", e);
    throw e;
  }
}

/**
 * Replace common party name placeholder tokens with real values.
 * @param draft string
 * @param disclosing string
 * @param receiving string
 */
function substitutePartyNames(draft: string, disclosing: string, receiving: string): string {
  let result = draft;

  // Patterns for disclosing party
  const disclosingPatterns = [/\[Disclosing Party\]/gi, /\*\*Disclosing Party\*\*/gi, /\[First Party Name\]/gi, /\*\*First Party Name\*\*/gi, /\[Party A\]/gi, /\*\*Party A\*\*/gi, /\[CLIENT\]/gi, /\[Client\]/gi, /\*\*Client\*\*/gi];

  // Patterns for receiving party
  const receivingPatterns = [/\[Receiving Party\]/gi, /\*\*Receiving Party\*\*/gi, /\[Second Party Name\]/gi, /\*\*Second Party Name\*\*/gi, /\[Party B\]/gi, /\*\*Party B\*\*/gi, /\[FREELANCER\]/gi, /\[Freelancer\]/gi, /\*\*Freelancer\*\*/gi];

  // Substitute all patterns
  for (const pattern of disclosingPatterns) {
    result = result.replace(pattern, disclosing);
  }
  for (const pattern of receivingPatterns) {
    result = result.replace(pattern, receiving);
  }

  // As a last check, substitute any plain Disclosing/Receiving Party without brackets
  result = result.replace(/Disclosing Party/gi, disclosing).replace(/Receiving Party/gi, receiving);
  return result;
}
export default function AgreementGeneratorWidget() {
  const [context, setContext] = useState("");
  const [disclosing, setDisclosing] = useState("");
  const [receiving, setReceiving] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    planId,
    limitReached
  } = usePlanUsage();
  useEffect(() => {
    if (user?.id) {
      setLoadingAgreements(true);
      fetchAgreements(user.id).then(setAgreements).catch(err => toast({
        title: "Could not fetch agreements",
        description: err.message,
        variant: "destructive"
      })).finally(() => setLoadingAgreements(false));
    }
  }, [user?.id]);
  const handleGenerate = async () => {
    if (!context.trim() || !disclosing.trim() || !receiving.trim()) {
      toast({
        title: "Add all details",
        description: "Please enter the agreement scenario and both party names."
      });
      return;
    }

    // Check plan restrictions
    if ((planId === "free" || planId === "pay-per-use") && limitReached) {
      toast({
        title: "Plan limit reached",
        description: "You've reached your plan's limit. Please upgrade to continue generating agreements.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setDraft("");
    const response = await fetchAgreement(context, disclosing, receiving);
    setLoading(false);
    if (response.error) {
      toast({
        title: "Draft failed",
        description: typeof response.error === "string" ? response.error : JSON.stringify(response.error),
        variant: "destructive"
      });
    } else if (response.result && typeof response.result === "string") {
      const finalDraft = substitutePartyNames(response.result, disclosing, receiving);
      setDraft(finalDraft);
    } else {
      toast({
        title: "No draft generated",
        description: "AI did not return a draft."
      });
    }
  };
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Login required",
        description: "Please sign in."
      });
      return;
    }
    if (!draft.trim()) {
      toast({
        title: "Nothing to save",
        description: "No agreement to save."
      });
      return;
    }

    // Check plan restrictions for saving
    if (planId === "free") {
      toast({
        title: "Feature locked",
        description: "Saving agreements is only available for paid plans. Please upgrade to save your agreements.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      const saved = await saveAgreement({
        user_id: user.id,
        context,
        disclosing_party: disclosing,
        receiving_party: receiving,
        agreement_text: draft,
        type: "nda"
      });
      setAgreements(prev => [saved, ...prev]);
      toast({
        title: "Agreement saved"
      });
      setContext("");
      setDisclosing("");
      setReceiving("");
      setDraft("");
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message,
        variant: "destructive"
      });
    }
    setSaving(false);
  };
  const handleCopy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      toast({
        title: "Copied!",
        description: "Agreement text copied to clipboard."
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy agreement."
      });
    }
  };
  const handleDelete = async (id: string) => {
    // Enhanced debug logging for user ID and record ownership
    const target = agreements.find(a => a.id === id);
    if (!target) {
      toast({
        title: "Agreement not found",
        description: "Could not find this agreement to delete.",
        variant: "destructive"
      });
      return;
    }
    // Additional debug output for troubleshooting
    console.log("[handleDelete] Current auth user?.id:", user?.id, "| Agreement.user_id:", target.user_id);
    if (!user || !user.id) {
      console.error("[handleDelete] User not signed in!");
      toast({
        title: "Not signed in",
        description: "You must be logged in to delete agreements.",
        variant: "destructive"
      });
      return;
    }
    if (user.id !== target.user_id) {
      // Show an immediate error toast for mismatched user/session
      const msg = `Delete forbidden: This agreement belongs to a different user.\nCurrent user: ${user.id}\nAgreement owner: ${target.user_id}`;
      console.error("[handleDelete] " + msg);
      toast({
        title: "Delete forbidden",
        description: msg,
        variant: "destructive"
      });
      return;
    }
    if (!window.confirm("Delete this agreement? This cannot be undone.")) return;
    try {
      await deleteAgreement(id, target.user_id);
      setAgreements(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Deleted"
      });
    } catch (e: any) {
      const errStr = typeof e === "string" ? e : e?.message ?? "Unknown error";
      if (errStr.toLowerCase().includes("row-level security")) {
        console.error("RLS error when deleting agreement:", e);
        toast({
          title: "Delete failed (permissions)",
          description: "Your account may have lost access. Please log out and log in again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Delete failed",
          description: errStr || "Could not delete.",
          variant: "destructive"
        });
      }
    }
  };
  const handleExportText = (txt: string, filename: string) => {
    const blob = new Blob([txt], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF export using browser print dialog (best for cross-browser compatibility without extra packages)
  const handleExportPDF = (txt: string, context?: string, disclosing?: string, receiving?: string, createdAt?: string) => {
    downloadAgreementPdf({
      agreementText: txt,
      context,
      disclosing,
      receiving,
      createdAt,
      filename: "agreement"
    });
  };

  // Determine if features are locked based on plan
  const isGenerateLocked = (planId === "free" || planId === "pay-per-use") && limitReached;
  const isSaveLocked = planId === "free";
  const isHistoryLocked = planId === "free";
  return <section className="bg-white rounded-lg shadow-sm border p-5 my-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5" /> Auto NDA & Agreement Generator
      </h3>
      <p className="text-sm text-legal-muted mb-3">
        Enter what the agreement is for (e.g., "freelance logo design") and party names to get ready NDA + contract draft.
      </p>

      {/* Plan limitations notice */}
      {isGenerateLocked && <div className="bg-amber-50 border border-amber-200 text-amber-900 py-2 px-3 rounded text-sm mb-3">
          <strong>Plan limit reached:</strong> You've reached your plan's generation limit. Please upgrade to continue.
        </div>}

      {/* Context textarea full width */}
      <div className="mb-2">
        <Textarea className="mb-2 resize-y min-h-[65px] text-base" value={context} onChange={e => setContext(e.target.value)} placeholder='Describe your agreement need (e.g., "Hiring a designer")' disabled={loading || saving || isGenerateLocked} rows={3} />
      </div>
      {/* Party name inputs, responsive row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-2">
        <Input className="flex-1 mb-1" value={disclosing} onChange={e => setDisclosing(e.target.value)} placeholder="Disclosing Party (e.g., Client)" disabled={loading || saving || isGenerateLocked} />
        <Input className="flex-1 mb-1" value={receiving} onChange={e => setReceiving(e.target.value)} placeholder="Receiving Party (e.g., Freelancer)" disabled={loading || saving || isGenerateLocked} />
      </div>
      <Button size="sm" className="mb-3" disabled={loading || saving || isGenerateLocked} onClick={handleGenerate}>
        {loading ? <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Generating...
          </> : <>Generate NDA + Agreement</>}
      </Button>
      {draft && <div className="border border-gray-100 rounded p-2 mb-3 bg-gray-50">
          <div className="mb-2 p-3 border rounded bg-white">
            <MarkdownRenderer content={draft} className="text-gray-700" />
          </div>
          <div className="flex gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => handleCopy(draft)}>
              <Clipboard className="w-4 h-4 mr-1" /> Copy Agreement
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportText(draft, "agreement")}>
              <Download className="w-4 h-4 mr-1" /> Export as Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportPDF(draft, context, disclosing, receiving, new Date().toLocaleString())}>
              <Download className="w-4 h-4 mr-1" /> Export as PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving || isSaveLocked} title={isSaveLocked ? "Upgrade your plan to save agreements" : ""}>
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
              {isSaveLocked ? "Save (Locked)" : "Save Agreement"}
            </Button>
          </div>
        </div>}
      
      <h4 className="text-base font-semibold mt-6 mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4" /> Saved Agreements
        {isHistoryLocked && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Upgrade to unlock</span>}
      </h4>

      {isHistoryLocked ? <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <p className="text-gray-600 text-sm mb-2">Agreement history is locked on the free plan.</p>
          <p className="text-gray-500 text-xs">Upgrade to view and manage your saved agreements.</p>
        </div> : loadingAgreements ? <div className="text-gray-500 text-sm">Loading agreements...</div> : agreements.length === 0 ? <div className="text-gray-400 text-sm">No saved agreements.</div> : <div className="space-y-4">
          {agreements.map(a => <div key={a.id} className="border rounded px-3 py-2 bg-gray-50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-[15px] truncate max-w-xs">{a.context}</div>
                  <div className="text-xs text-gray-500">
                    Disclosing: <span className="font-mono">{a.disclosing_party}</span> &mdash; Receiving: <span className="font-mono">{a.receiving_party}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Created: {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-1 mt-2 sm:mt-0">
                  <Button variant="ghost" size="icon" title="Copy" onClick={() => handleCopy(a.agreement_text)}>
                    <Clipboard className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Export as Text" onClick={() => handleExportText(a.agreement_text, "agreement-" + a.id)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Export as PDF" onClick={() => handleExportPDF(a.agreement_text, a.context, a.disclosing_party, a.receiving_party, new Date(a.created_at).toLocaleString())}>
                    <Download className="w-4 h-4" />
                  </Button>
                  
                </div>
              </div>
              <div className="mt-2 p-2 border rounded bg-white">
                <MarkdownRenderer content={a.agreement_text} className="text-gray-700" />
              </div>
            </div>)}
        </div>}
    </section>;
}