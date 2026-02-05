import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import JurisdictionSuggestionHistory from "./JurisdictionSuggestionHistory";

// Utility: Save the suggestion to Supabase for the user
async function saveJurisdictionSuggestion({
  userId,
  region,
  suggestion,
}: {
  userId: string;
  region: string;
  suggestion: string;
}) {
  // Insert into table, select single
  const { data, error } = await supabase
    .from("legal_jurisdiction_suggestions")
    .insert([
      {
        user_id: userId,
        region,
        suggestion,
      },
    ])
    .select()
    .single();
  if (error) {
    return { error: error.message };
  }
  return data;
}

async function fetchJurisdictionAdvice(region: string) {
  try {
    const response = await supabase.functions.invoke("legal-widgets", {
      body: {
        type: "jurisdiction_suggestion",
        region,
        detailLevel: "detailed", // Request more detailed AI answers
      },
    });
    console.log("Edge Function response (Jurisdiction):", response);
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

export default function JurisdictionSuggestionWidget() {
  const [region, setRegion] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // After suggestion is saved, we want to force refresh the history list. Best way: use a key
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuggest = async () => {
    if (!region.trim()) {
      toast({
        title: "Enter location",
        description: "Specify a country/region to get suggestions.",
      });
      return;
    }
    setLoading(true);
    setAdvice("");
    const response = await fetchJurisdictionAdvice(region);
    setLoading(false);
    if (response.error) {
      toast({
        title: "Region advice failed",
        description:
          typeof response.error === "string"
            ? response.error
            : JSON.stringify(response.error),
        variant: "destructive",
      });
    } else if (response.result && typeof response.result === "string") {
      setAdvice(response.result);
      // Save suggestion to DB for logged-in user
      if (user?.id) {
        const { error: saveError } = await saveJurisdictionSuggestion({
          userId: user.id,
          region,
          suggestion: response.result,
        }) as any;
        if (saveError) {
          toast({
            title: "Failed to save suggestion",
            description: saveError,
            variant: "destructive",
          });
        } else {
          setRefreshKey((k) => k + 1);
        }
      }
    } else {
      toast({
        title: "No advice generated",
        description: "AI did not return an answer.",
      });
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border p-5 my-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
        <FileSearch className="h-5 w-5" /> Jurisdiction-Based Suggestions
      </h3>
      <p className="text-sm text-legal-muted mb-3">
        Get detailed regional tips for clauses, taxes, legal provisions, example contract clauses, penalties, compliance steps, and negotiation strategies (e.g., "UK", "Pakistan", "Canada").
      </p>
      <div className="flex gap-2 mb-2">
        <Input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Enter region/country..."
          disabled={loading}
        />
        <Button size="sm" onClick={handleSuggest} disabled={loading}>
          {loading ? "Suggesting..." : "Suggest"}
        </Button>
      </div>
      {advice && (
        <div className="bg-gray-50 p-3 rounded mt-2">
          <MarkdownRenderer 
            content={advice} 
            className="text-gray-700"
          />
        </div>
      )}
      <JurisdictionSuggestionHistory key={refreshKey} />
    </section>
  );
}
