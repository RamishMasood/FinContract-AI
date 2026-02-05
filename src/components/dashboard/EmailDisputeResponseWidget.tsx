import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

type DisputeEmailDraft = {
  id: string;
  created_at: string;
  recipient: string;
  invoice: string;
  email_to: string;
  draft: string;
};

async function fetchDisputeEmail({ recipient, invoice, emailTo }: { recipient: string, invoice: string, emailTo: string }) {
  try {
    const response = await supabase.functions.invoke("legal-widgets", {
      body: {
        type: "dispute_email",
        recipient,
        invoice,
        emailTo
      }
    });
    console.log("Edge Function response (Dispute Email):", response);
    const { data, error } = response;
    if (error) {
      return { error: error.message || "Edge Function returned an error." };
    }
    if (!data) {
      return { error: "No response from edge function." };
    }
    if (typeof data.error === "string" && data.error) {
      return { error: data.error };
    }
    if (typeof data.result === "string") {
      return { result: data.result };
    }
    if (typeof data === "string") {
      return { result: data };
    }
    return { error: "Unexpected response: " + JSON.stringify(data) };
  } catch (e: any) {
    return { error: e?.message || "Exception calling edge function." };
  }
}

// Supabase functions for email drafts
async function saveDisputeEmailDraft({ userId, recipient, invoice, emailTo, draft }: { userId: string, recipient: string, invoice: string, emailTo: string, draft: string }) {
  const { data, error } = await supabase
    .from("dispute_emails")
    .insert([{
      user_id: userId,
      recipient,
      invoice,
      email_to: emailTo,
      draft,
    }])
    .select()
    .single();
  if (error) {
    return { error: error.message };
  }
  return data;
}

async function getDisputeEmailDrafts(userId: string): Promise<DisputeEmailDraft[]> {
  const { data, error } = await supabase
    .from("dispute_emails")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

async function deleteDisputeEmailDraft(id: string, userId: string) {
  const { error } = await supabase
    .from("dispute_emails")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return true;
}

export default function EmailDisputeResponseWidget() {
  const [recipient, setRecipient] = useState("");
  const [invoice, setInvoice] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DisputeEmailDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // fetch previous drafts for the logged-in user
  useEffect(() => {
    if (!user?.id) return;
    setLoadingDrafts(true);
    getDisputeEmailDrafts(user.id)
      .then(setDrafts)
      .catch((err) => {
        toast({ title: "Failed to fetch email drafts", description: err.message, variant: "destructive" });
      })
      .finally(() => setLoadingDrafts(false));
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!recipient || !invoice || !emailTo) {
      toast({ title: "Missing info", description: "Please fill in all fields." });
      return;
    }
    setLoading(true);
    setDraft("");
    const response = await fetchDisputeEmail({ recipient, invoice, emailTo });
    setLoading(false);
    if (response.error) {
      toast({
        title: "Email draft failed",
        description: typeof response.error === "string" ? response.error : JSON.stringify(response.error),
        variant: "destructive"
      });
    } else if (response.result && typeof response.result === "string") {
      setDraft(response.result);
      // Save the draft in the database
      if (user?.id) {
        setSaving(true);
        const { error: saveError } = await saveDisputeEmailDraft({
          userId: user.id,
          recipient,
          invoice,
          emailTo,
          draft: response.result,
        }) as any;
        setSaving(false);
        if (saveError) {
          toast({ title: "Failed to save draft", description: saveError, variant: "destructive" });
        } else {
          getDisputeEmailDrafts(user.id)
            .then(setDrafts)
            .catch(() => {});
        }
      }
    } else {
      toast({ title: "No draft generated", description: "AI did not return a draft." });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Draft email copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy email draft." });
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!user?.id) return;
    try {
      await deleteDisputeEmailDraft(draftId, user.id);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      toast({ title: "Draft deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border p-5 my-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5" /> Email-Based Dispute Response
      </h3>
      <p className="text-sm text-legal-muted mb-3">
        Enter the info of your pending invoice, generate a ready-to-send polite payment request email.
      </p>
      {/* Recipient and EmailTo remain as inputs side-by-side on desktop */}
      <div className="grid sm:grid-cols-2 gap-3 mb-2">
        <div>
          <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient Name" />
        </div>
        <div>
          <Input value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="Recipient Email" type="email" />
        </div>
      </div>
      {/* Invoice Details gets its own full-width line as extendable textarea */}
      <div className="mb-2">
        <label htmlFor="invoice-details" className="text-sm font-medium text-gray-700 block mb-1">
          Invoice Details
        </label>
        <Textarea
          id="invoice-details"
          value={invoice}
          onChange={e => setInvoice(e.target.value)}
          placeholder="Invoice Details"
          rows={3}
          className="w-full resize-y"
          autoFocus={false}
        />
      </div>
      <Button size="sm" className="mt-2 mb-3" disabled={loading || saving} onClick={handleGenerate}>
        {loading ? "Generating Email..." : saving ? "Saving Draft..." : "Generate Email"}
      </Button>
      {draft && (
        <div className="mt-3">
          <div className="mb-2 p-3 border rounded bg-gray-50">
            <MarkdownRenderer content={draft} className="text-gray-700" />
          </div>
          <Button variant="outline" size="sm" onClick={() => handleCopy(draft)}>Copy Email</Button>
        </div>
      )}

      <div className="mt-8">
        <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
          <Download className="h-4 w-4" /> Previous Drafted Emails
        </h4>
        {loadingDrafts ? (
          <div className="text-gray-500 text-sm">Loading drafts...</div>
        ) : drafts.length === 0 ? (
          <div className="text-gray-400 text-sm">No previous drafts.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {drafts.map((d) => (
              <div key={d.id} className="border rounded p-3 bg-gray-50 relative">
                <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span>
                    <span className="font-medium">To:</span>{" "}
                    {d.recipient || "--"}
                  </span>
                  <span>
                    <span className="font-medium">Email:</span>{" "}
                    {d.email_to || "--"}
                  </span>
                  <span>
                    <span className="font-medium">Invoice:</span>{" "}
                    {d.invoice || "--"}
                  </span>
                  <span>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(d.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mb-2 mt-1 p-2 border rounded bg-white">
                  <MarkdownRenderer content={d.draft} className="text-gray-700" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(d.draft)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDraft(d.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
