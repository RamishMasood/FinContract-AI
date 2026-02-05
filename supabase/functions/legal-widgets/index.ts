import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Setup: Use the Deepseek API key from Supabase secrets
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function safeJson(res: Response) {
  try { return res.json(); } catch { return Promise.resolve({ error: "Invalid JSON" }); }
}

function widgetPrompt(type: string, payload: any) {
  switch (type) {
    case "dispute_email": {
      // Compose a prompt instructing the AI to generate a polite payment follow-up email
      return {
        system: "You are a helpful legal contract assistant who specializes in generating professional business emails.",
        user: `Generate a polite and professional payment follow-up email based on these details:
Recipient: ${payload.recipient}
Recipient's Email: ${payload.emailTo}
Invoice Details: ${payload.invoice}
The tone should be firm yet courteous, and the subject line must be included at the top as 'Subject: ...'
Do NOT invent recipient or sender names; use [Recipient Name] and [Your Name] where not provided.`
      };
    }
    case "nda_agreement": {
      // Compose a prompt that instructs the AI to generate both an NDA and a Work-for-hire Agreement
      return {
        system: "You are a contract attorney able to write NDAs and work-for-hire agreements. Use clear Markdown formatting with proper headers (using # and ##), paragraphs, numbered lists (1. 2.) for clauses, and bold for key terms. Make all party references use placeholders like [Disclosing Party] and [Receiving Party] for easy replacement.",
        user: `Given this context: "${payload.context}", generate:
1. A simple NDA draft with header "# NON-DISCLOSURE AGREEMENT" including standard confidentiality clauses, term, scope, and remedies.
2. A work-for-hire agreement with header "# WORK-FOR-HIRE AGREEMENT" including description of services, compensation terms, intellectual property rights, and delivery terms.
Format each section with proper Markdown headings, numbered clauses, and use [Disclosing Party] and [Receiving Party] as placeholder names throughout.
Add a brief disclaimer at the end that this document is for sample purposes and should not be considered legal advice.`
      };
    }
    case "legal_advice": {
      // --- UPDATED SYSTEM PROMPT: Less strict, more helpful ---
      return {
        system: "You are a legal expert who provides clear, practical, and informative guidance about law, contracts, and legal situations. Respond with useful explanations, examples, and tips relevant to the user's questions. Avoid giving specific legal advice for personal cases, and politely remind users to consult a qualified attorney for personal matters if needed, but your primary goal is to help users understand the law and their options in detail.",
        user: `User question: "${payload.question}"`
      };
    }
    case "jurisdiction_suggestion": {
      // Compose a prompt requesting jurisdiction-based contract tips
      return {
        system: "You are a contract lawyer who specializes in global differences in law and tax.",
        user: `Give short, focused contract law and tax tips for business contracts in this country/region: "${payload.region}". Mention governing law, tax risks, and local customs. Respond in 3 sentences max.`
      };
    }
    default:
      return { system: "You are a helpful assistant.", user: "Say hello." };
  }
}

// ---- NEW UTILITY for assembling DeepSeek-compatible message history ----
function buildMessagesForDeepSeek({ chat, systemPrompt }: { chat: any[], systemPrompt: string }) {
  // systemPrompt is used as the first message
  const messages: { role: "system"|"user"|"assistant", content: string }[] = [
    { role: "system", content: systemPrompt }
  ];
  // Convert ChatMsg[] to OpenAI/DeepSeek messages
  for (const msg of chat ?? []) {
    if (!msg || typeof msg.content !== "string") continue;
    let role: "user" | "assistant" = msg.role === "ai" ? "assistant" : "user";
    messages.push({ role, content: msg.content });
  }
  return messages;
}

// The function that was missing!
async function queryDeepSeek(system: string, user: string) {
  if (!deepseekApiKey) {
    return { error: "DeepSeek API key missing in Supabase project secrets." };
  }
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
  const body = {
    model: 'deepseek-chat',
    messages,
    max_tokens: 700,
    temperature: 0.27
  };
  try {
    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return { error: `DeepSeek error: ${resp.status} - ${errText}` };
    }
    const res = await resp.json();
    return { result: res?.choices?.[0]?.message?.content ?? "" };
  } catch (e: any) {
    return { error: e?.message || "Exception calling DeepSeek API." };
  }
}

async function queryDeepSeekWithFullChat(messages: any[]) {
  if (!deepseekApiKey) {
    return { error: "DeepSeek API key missing in Supabase project secrets." };
  }
  const body = {
    model: 'deepseek-chat',
    messages,
    max_tokens: 700,
    temperature: 0.27
  };
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deepseekApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const errText = await resp.text();
    return { error: `DeepSeek error: ${resp.status} - ${errText}` };
  }
  const res = await resp.json();
  return { result: res?.choices?.[0]?.message?.content ?? "" };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const { type, ...payload } = body || {};
    if (!type) {
      return new Response(JSON.stringify({ error: "Missing 'type'." }), { status: 400, headers: corsHeaders });
    }

    if (type === "legal_advice" && payload.chat) {
      // --- Use the UPDATED system prompt here as well ---
      const systemPrompt = "You are a legal expert who provides clear, practical, and informative guidance about law, contracts, and legal situations. Respond with useful explanations, examples, and tips relevant to the user's questions. Avoid giving specific legal advice for personal cases, and politely remind users to consult a qualified attorney for personal matters if needed, but your primary goal is to help users understand the law and their options in detail.";
      const messages = buildMessagesForDeepSeek({ chat: payload.chat, systemPrompt });
      const resp = await queryDeepSeekWithFullChat(messages);
      return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fallback: legacy payload, non-chat context (what most widgets use!)
    const prompt = widgetPrompt(type, payload);
    const resp = await queryDeepSeek(prompt.system, prompt.user);

    return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
