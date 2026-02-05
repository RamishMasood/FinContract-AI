import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// FinContract AI: Use Deepseek API key from Supabase secrets
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function safeJson(res: Response) {
  try { return res.json(); } catch { return Promise.resolve({ error: "Invalid JSON" }); }
}

// FinContract AI: Finance/trading-focused prompts for all widgets
function widgetPrompt(type: string, payload: any) {
  switch (type) {
    case "dispute_email": {
      return {
        system: "You are FinContract AI: a professional compliance and operations specialist for trading and finance contracts. You write clear, firm-but-professional emails for trading and finance disputes: payment follow-ups, margin call reminders, contract clause disputes, broker-client communications, CFD/futures account issues, and regulatory compliance matters. Always include a subject line at the top as 'Subject: ...'. Use [Recipient Name] and [Your Name] where not provided. Keep tone suitable for regulated finance (FCA, MiFID, CFTC, Malta MFSA, UAE SCA context). Focus on trading-specific language and compliance requirements.",
        user: `Generate a professional dispute/payment follow-up email for a trading or finance context (CFD broker, futures trading, client agreement, margin call, or payment dispute).

Recipient: ${payload.recipient}
Recipient Email: ${payload.emailTo}
Dispute/Invoice Details: ${payload.invoice}

Requirements: 
- Include Subject line at top
- Be clear and professional
- Suitable for broker-client or B2B finance communications
- Reference relevant trading/finance context (leverage, margin, compliance) if applicable
- Maintain regulatory compliance tone`
      };
    }
    case "nda_agreement": {
      return {
        system: "You are FinContract AI: a contract attorney specializing in trading and financial services compliance. You draft NDAs, client agreements, broker agreements, and trading partner contracts suitable for fintech, brokers, CFD platforms, and trading platforms (e.g. Deriv-style). Use clear Markdown: headers (# and ##), numbered clauses, bold for key terms. Use placeholders [Disclosing Party] and [Receiving Party]. Include references to confidentiality of trading strategies, client data, proprietary algorithms, margin information, and regulatory considerations (MiFID, FCA, CFTC) where relevant. Add a short disclaimer that the document is for guidance and not legal advice.",
        user: `Generate a compliant NDA and/or client/broker agreement for this trading/finance scenario: "${payload.context}"

Parties: Disclosing Party = ${payload.disclosing_party}, Receiving Party = ${payload.receiving_party}.

Produce:
1. A NON-DISCLOSURE AGREEMENT section with confidentiality, term, scope, and remedies – suitable for trading partners, brokers, or service providers in the finance industry.
2. A CLIENT/BROKER AGREEMENT or WORK-FOR-HIRE section if the context involves services – include description of services (trading platform access, CFD services, etc.), compensation, IP (trading algorithms, strategies), margin/leverage terms, and delivery terms.

Use [Disclosing Party] and [Receiving Party] throughout. Format with Markdown headings and numbered clauses. Include trading/finance-specific protections.`
      };
    }
    case "legal_advice": {
      return {
        system: "You are FinContract AI: a regulatory and compliance expert specializing in trading and finance contracts. You answer questions about: CFD and derivatives contracts, leverage and margin rules, margin calls, negative balance protection, broker unilateral powers, client suitability requirements, MiFID II, FCA, CFTC, Malta MFSA, UAE SCA, ESMA regulations, and other jurisdiction-specific trading regulations. Give clear, practical guidance focused on trading/finance compliance. Do not give personalized legal advice; recommend consulting a qualified lawyer for specific cases. Focus on compliance red flags, what to look for in trading agreements, and regulatory requirements for brokers and clients.",
        user: `User question about trading/finance contract compliance: "${payload.question}"

Provide a detailed answer focusing on:
- Trading-specific regulations (CFDs, futures, leverage, margin)
- Regulatory compliance (MiFID, FCA, CFTC, Malta MFSA, UAE SCA)
- Risk management and fraud prevention
- Broker-client agreement best practices
- Jurisdiction-specific requirements if mentioned`
      };
    }
    case "jurisdiction_suggestion": {
      return {
        system: "You are FinContract AI: a compliance expert specializing in global trading and financial regulations. For the given country/region, provide: (1) Key regulators and frameworks (e.g. Malta MFSA, UK FCA, US CFTC, UAE SCA, EU MiFID II, ESMA). (2) Trading contract and CFD-specific rules (leverage limits, client categorization, suitability requirements, negative balance protection). (3) Suggested clauses or compliance steps for client agreements in that jurisdiction. (4) Brief tax or reporting considerations if relevant. (5) Fraud prevention and risk management requirements. Use clear Markdown. Be specific and actionable for trading platforms and brokers.",
        user: `Provide jurisdiction-specific trading and compliance rules for: "${payload.region}". Requested detail level: ${payload.detailLevel || "detailed"}. 

Include:
- Regulator names and contact info
- Key rules for trading/CFD contracts (leverage limits, client categories)
- Required clauses for broker-client agreements
- Compliance steps and best practices
- Risk management and fraud prevention requirements`
      };
    }
    case "proactive_alerts": {
      return {
        system: "You are FinContract AI: an expert in trading and finance contract compliance and risk detection. Analyze contract analysis data and generate proactive compliance alerts, risk warnings, and regulatory violation notices. Focus on: leverage and margin risks, regulatory compliance gaps (MiFID II, FCA, CFTC, Malta MFSA, UAE SCA), fraud-prone clauses, missing suitability checks, unilateral broker powers, and jurisdiction-specific requirements. Return valid JSON only.",
        user: `Analyze this trading/finance contract analysis and generate proactive alerts:

Contract Summary: ${payload.summary || "N/A"}
Red Flags: ${JSON.stringify(payload.redFlags || [])}
Missing Clauses: ${JSON.stringify(payload.missingClauses || [])}
Jurisdiction: ${payload.jurisdiction || "malta"}

Return EXACTLY this JSON structure (no markdown, no extra text):
{
  "alerts": [
    {
      "id": "unique-id",
      "type": "error|warning|info",
      "title": "Alert title (e.g. 'Compliance Issue' or 'Risk Warning')",
      "message": "Specific, actionable message about the compliance issue or risk",
      "regulation": "Regulation name if applicable (e.g. 'MiFID II', 'FCA', 'CFTC')"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Generate 2-6 alerts based on actual issues found in the analysis
2. Focus on trading/finance-specific risks (leverage, margin, regulatory compliance, fraud-prone terms)
3. Use "error" for compliance violations, "warning" for risks, "info" for recommendations
4. Include regulation names when relevant (MiFID II, FCA, CFTC, Malta MFSA, UAE SCA, ESMA)
5. Make messages specific and actionable, not generic
6. Return valid JSON only - no markdown formatting`
      };
    }
    default:
      return { system: "You are FinContract AI: a helpful assistant for trading and finance contract compliance.", user: "Say hello." };
  }
}

function buildMessagesForDeepSeek({ chat, systemPrompt }: { chat: any[], systemPrompt: string }) {
  const messages: { role: "system"|"user"|"assistant", content: string }[] = [
    { role: "system", content: systemPrompt }
  ];
  for (const msg of chat ?? []) {
    if (!msg || typeof msg.content !== "string") continue;
    let role: "user" | "assistant" = msg.role === "ai" ? "assistant" : "user";
    messages.push({ role, content: msg.content });
  }
  return messages;
}

async function queryDeepSeek(system: string, user: string, type?: string) {
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
    max_tokens: type === 'proactive_alerts' ? 2000 : 1200,
    temperature: type === 'proactive_alerts' ? 0.1 : 0.3
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
    max_tokens: 1200,
    temperature: 0.3
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
      return new Response(JSON.stringify({ error: "Missing 'type'." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "legal_advice" && payload.chat) {
      const systemPrompt = "You are FinContract AI: a regulatory and compliance expert specializing in trading and finance contracts. You answer questions about: CFD and derivatives contracts, leverage and margin rules, margin calls, negative balance protection, broker unilateral powers, client suitability requirements, MiFID II, FCA, CFTC, Malta MFSA, UAE SCA, ESMA regulations, and other jurisdiction-specific trading regulations. Give clear, practical guidance focused on trading/finance compliance. Do not give personalized legal advice; recommend consulting a qualified lawyer for specific cases. Focus on compliance red flags, what to look for in trading agreements, and regulatory requirements for brokers and clients.";
      const messages = buildMessagesForDeepSeek({ chat: payload.chat, systemPrompt });
      const resp = await queryDeepSeekWithFullChat(messages);
      return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "proactive_alerts") {
      const prompt = widgetPrompt(type, payload);
      const resp = await queryDeepSeek(prompt.system, prompt.user, type);
      
      // Parse JSON response for proactive_alerts
      if (resp.result && !resp.error) {
        try {
          let cleanResponse = resp.result;
          cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
          cleanResponse = cleanResponse.replace(/```\s*/, '');
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanResponse = jsonMatch[0];
          }
          const parsed = JSON.parse(cleanResponse);
          return new Response(JSON.stringify({ result: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (parseError) {
          console.error('Failed to parse proactive_alerts JSON:', parseError);
          return new Response(JSON.stringify({ error: "Failed to parse AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      
      return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = widgetPrompt(type, payload);
    const resp = await queryDeepSeek(prompt.system, prompt.user, type);

    return new Response(JSON.stringify(resp), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
