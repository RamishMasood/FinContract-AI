
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Download } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

type JurisdictionSuggestion = {
  id: string;
  created_at: string;
  region: string;
  suggestion: string;
};

async function fetchUserJurisdictionSuggestions(userId: string): Promise<JurisdictionSuggestion[]> {
  const { data, error } = await supabase
    .from("legal_jurisdiction_suggestions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  
  if (error) throw new Error(error.message);
  return data || [];
}

export default function JurisdictionSuggestionHistory() {
  const [suggestions, setSuggestions] = useState<JurisdictionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchUserJurisdictionSuggestions(user.id)
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className="mt-6">
      <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
        <Download className="h-4 w-4" /> Previous Jurisdiction Suggestions
      </h4>
      {loading ? (
        <div className="text-gray-500 text-sm">Loading suggestions...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-400 text-sm">No previous suggestions.</div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.id} className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">Region:</span> {s.region} &nbsp;
                <span className="font-medium">Date:</span> {new Date(s.created_at).toLocaleString()}
              </div>
              <MarkdownRenderer content={s.suggestion} className="text-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
