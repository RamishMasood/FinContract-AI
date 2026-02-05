import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let documentText = '';
    let documentId = '';
    let documentName = '';

    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      documentId = formData.get('documentId') as string;
      documentName = formData.get('documentName') as string;

      if (file) {
        if (file.type === 'application/pdf') {
          console.log('Processing PDF file');
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          try {
            const response = await fetch('https://api.pdftxt.xyz/api/extract-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: uint8Array,
            });
            
            if (response.ok) {
              const result = await response.json();
              documentText = result.text || '';
            } else {
              throw new Error(`PDF extraction failed: ${response.statusText}`);
            }
          } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF');
          }
        } else {
          documentText = await file.text();
        }
      }
    } else {
      const body = await req.json();
      documentText = body.documentText || '';
      documentId = body.documentId || '';
      documentName = body.documentName || '';
    }

    console.log(`Analyzing document with ID: ${documentId}`);
    console.log(`Document name: ${documentName}`);
    console.log(`Document text length: ${documentText.length} characters`);
    console.log(`Text preview (first 300 chars): ${documentText.substring(0, 300)}`);

    if (!documentText || documentText.trim().length < 50) {
      throw new Error('Document text is too short or empty');
    }

    const processingStartMs = Date.now();
    const wordsAnalyzed = documentText.split(/\s+/).length;
    const documentPages = Math.max(1, Math.ceil(documentText.length / 3000));

    const analysisPrompt = `You are FinContract AI: an expert in trading and finance contract compliance and risk. Analyze this document as a CFD, futures, client agreement, ISDA, or other trading/finance contract. Focus on: leverage and margin risks, broker unilateral powers, regulatory compliance (e.g. Malta MFSA, UK FCA, EU MiFID, CFTC, UAE SCA), fraud-prone or unfair terms, missing suitability/risk warnings, unlimited liability, and jurisdiction-specific requirements.

Contract Text:
${documentText}

Respond with EXACTLY this JSON structure (no markdown, no extra text):
{
  "summary": "Detailed summary: type of trading/finance contract, key terms, leverage/margin mentions, governing law, and main risks for the client or firm",
  "redFlags": [
    {
      "title": "Specific risk title (e.g. High leverage may cause losses exceeding margin)",
      "description": "Detailed explanation of why this is problematic for compliance or risk - NO SEVERITY WORDS HERE",
      "severity": "high|medium|low",
      "clause": "Actual clause text from contract or precise description"
    }
  ],
  "missingClauses": [
    "Specific missing clause 1 (e.g. Suitability / risk warning for retail clients)",
    "Specific missing clause 2"
  ],
  "suggestedEdits": [
    {
      "section": "Specific Section Name from the contract",
      "original": "Actual original text from the contract",
      "suggested": "Specific improved text for compliance or risk",
      "explanation": "Why this change is needed (regulatory or risk reason)"
    }
  ],
  "clauseExplanations": [
    {
      "section": "Section Name",
      "clause": "Actual clause text from contract",
      "explanation": "What this clause means in plain language (finance/trading context)"
    }
  ],
  "riskScoreSections": [
    { "name": "Category name (e.g. Leverage & Margin Risk)", "score": 0-100, "issues": number },
    { "name": "Regulatory Compliance", "score": 0-100, "issues": number },
    { "name": "Counterparty / Broker Powers", "score": 0-100, "issues": number },
    { "name": "Liability & Indemnity", "score": 0-100, "issues": number },
    { "name": "Termination & Close-Out", "score": 0-100, "issues": number }
  ],
  "overallRiskScore": 0-100
}

CRITICAL REQUIREMENTS:
1. redFlags: Focus on trading/finance risks (leverage, margin calls, unilateral closure, fraud-prone terms, regulatory gaps). Put only explanation in "description"; put severity in "severity".
2. riskScoreSections: Include 4-6 categories relevant to THIS contract. For EACH section: score 0 = highest risk (many issues), 100 = lowest risk (no issues). Set "issues" to the count of red flags or problems in that category. Sections with high/medium severity red flags MUST get low scores (e.g. 5-35). Sections with no relevant issues get high scores (e.g. 70-100).
3. overallRiskScore: MUST be derived from red flags. Formula logic: many high-severity red flags → overall 5-25 (high risk). Several medium or low severity → 30-55. Few or no issues → 60-100 (lower risk). Never return a high number (e.g. 80) when you have listed multiple high-severity red flags.
4. suggestedEdits: Use actual section names; suggest compliant wording for trading/finance context.
5. Extract real text from the contract; no generic placeholders.
6. Return valid JSON only - no markdown, no code fences.`;

    console.log('Sending request to Deepseek API');

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are FinContract AI: an expert in trading and finance contract compliance, risk, and regulation (CFDs, futures, leverage, margin, MiFID, FCA, CFTC, Malta, UAE). Analyze documents for broker/client agreements, flag risks and compliance gaps, and return only valid JSON—no markdown or extra text. Use actual contract text, not generic descriptions.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error(`Deepseek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const aiResponse = deepseekData.choices[0].message.content.trim();

    console.log(`Successfully received response from Deepseek, length: ${aiResponse.length}`);
    console.log(`First 500 chars of response: ${aiResponse.substring(0, 500)}`);

    // Parse the JSON response
    let analysisData;
    try {
      // Clean the response - remove any markdown formatting
      let cleanResponse = aiResponse;
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      cleanResponse = cleanResponse.replace(/```\s*/, '');
      
      // Try to find JSON content if wrapped in other text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      analysisData = JSON.parse(cleanResponse);
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw response:', aiResponse);
      
      // Fallback parsing if JSON fails
      analysisData = {
        summary: "Analysis completed but response format needs adjustment.",
        redFlags: [],
        missingClauses: [],
        suggestedEdits: [],
        clauseExplanations: []
      };
    }

    // Validate and clean the parsed data
    const cleanAnalysisData = {
      summary: analysisData.summary || "No summary available",
      redFlags: Array.isArray(analysisData.redFlags) ? analysisData.redFlags.filter((flag: any) => 
        flag.title && flag.description && flag.severity
      ).map((flag: any) => ({
        id: `rf-${Math.random().toString(36).substr(2, 9)}`,
        title: flag.title.trim(),
        description: flag.description.trim().replace(/^(High|Medium|Low)\s*(Risk|Severity)[:\s]*/i, ''),
        severity: flag.severity.toLowerCase().includes('high') ? 'high' : 
                 flag.severity.toLowerCase().includes('low') ? 'low' : 'medium',
        clause: flag.clause || "Clause not specified"
      })) : [],
      
      missingClauses: Array.isArray(analysisData.missingClauses) ? 
        analysisData.missingClauses.filter((clause: any) => clause && clause.trim().length > 0) : [],
      
      suggestedEdits: Array.isArray(analysisData.suggestedEdits) ? analysisData.suggestedEdits.filter((edit: any) => 
        edit.section && edit.original && edit.suggested &&
        !edit.section.toLowerCase().includes('original') &&
        !edit.section.toLowerCase().includes('suggested') &&
        !edit.original.toLowerCase().includes('needs enhancement') &&
        !edit.suggested.toLowerCase().includes('needs improvement')
      ).map((edit: any) => ({
        id: `se-${Math.random().toString(36).substr(2, 9)}`,
        section: edit.section.trim(),
        original: edit.original.trim(),
        suggested: edit.suggested.trim(),
        explanation: edit.explanation?.trim() || "Improvement suggested for better legal protection"
      })) : [],
      
      clauseExplanations: Array.isArray(analysisData.clauseExplanations) ? analysisData.clauseExplanations.filter((exp: any) => 
        exp.section && exp.clause && exp.explanation
      ).map((exp: any) => ({
        id: `ce-${Math.random().toString(36).substr(2, 9)}`,
        section: exp.section.trim(),
        clause: exp.clause.trim(),
        explanation: exp.explanation.trim()
      })) : []
    };

    // Use AI-provided risk scores; fallback to derived scores if missing or invalid
    const normalizeScore = (n: unknown): number => {
      const v = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
      return Math.max(0, Math.min(100, Math.round(v)));
    };
    let riskScore: { overall: number; sections: { name: string; score: number; issues: number }[] };
    if (Array.isArray(analysisData.riskScoreSections) && analysisData.riskScoreSections.length > 0) {
      const sections = analysisData.riskScoreSections
        .filter((s: any) => s && (s.name || s.section))
        .map((s: any) => ({
          name: String(s.name || s.section || 'Risk').trim(),
          score: normalizeScore(s.score),
          issues: typeof s.issues === 'number' && s.issues >= 0 ? s.issues : 0
        }));
      let overall = typeof analysisData.overallRiskScore === 'number' && !Number.isNaN(analysisData.overallRiskScore)
        ? normalizeScore(analysisData.overallRiskScore)
        : Math.round(sections.reduce((sum, s) => sum + s.score, 0) / (sections.length || 1));
      // Safeguard: if there are many high-severity red flags, cap overall so UI shows high risk
      const highCount = cleanAnalysisData.redFlags.filter((f: any) => f.severity === 'high').length;
      const mediumCount = cleanAnalysisData.redFlags.filter((f: any) => f.severity === 'medium').length;
      if (highCount >= 2 && overall > 45) overall = Math.min(overall, 45);
      if (highCount >= 4 && overall > 30) overall = Math.min(overall, 30);
      if (mediumCount + highCount >= 5 && overall > 55) overall = Math.min(overall, 55);
      riskScore = { overall, sections };
    } else {
      const redFlags = cleanAnalysisData.redFlags;
      const highRiskCount = redFlags.filter((f: any) => f.severity === 'high').length;
      const mediumRiskCount = redFlags.filter((f: any) => f.severity === 'medium').length;
      const lowRiskCount = redFlags.filter((f: any) => f.severity === 'low').length;
      const totalIssues = redFlags.length;
      const sections = [
        { name: "Leverage & Margin Risk", score: normalizeScore(50 - highRiskCount * 12), issues: Math.floor(totalIssues * 0.3) },
        { name: "Regulatory Compliance", score: normalizeScore(55 - mediumRiskCount * 10), issues: Math.floor(totalIssues * 0.25) },
        { name: "Counterparty / Broker Powers", score: normalizeScore(45 - highRiskCount * 10), issues: Math.floor(totalIssues * 0.2) },
        { name: "Liability & Indemnity", score: normalizeScore(40 - highRiskCount * 8), issues: Math.floor(totalIssues * 0.15) },
        { name: "Termination & Close-Out", score: normalizeScore(60 - lowRiskCount * 5), issues: Math.floor(totalIssues * 0.1) }
      ];
      riskScore = {
        overall: Math.round(sections.reduce((sum, s) => sum + s.score, 0) / sections.length),
        sections
      };
    }
    console.log(`Risk scores - Overall: ${riskScore.overall} Sections: ${riskScore.sections.length}`);

    const finalResult = {
      summary: cleanAnalysisData.summary,
      redFlags: cleanAnalysisData.redFlags,
      missingClauses: cleanAnalysisData.missingClauses,
      suggestedEdits: cleanAnalysisData.suggestedEdits,
      riskScore: riskScore,
      clauseExplanations: cleanAnalysisData.clauseExplanations,
      processingMetrics: {
        documentPages,
        processingTimeSeconds: parseFloat(((Date.now() - processingStartMs) / 1000).toFixed(1)),
        wordsAnalyzed
      }
    };

    console.log('Parsed analysis results:');
    console.log(`- Summary length: ${finalResult.summary.length}`);
    console.log(`- Red flags count: ${finalResult.redFlags.length}`);
    console.log(`- Missing clauses count: ${finalResult.missingClauses.length}`);
    console.log(`- Suggested edits count: ${finalResult.suggestedEdits.length}`);
    console.log(`- Clause explanations count: ${finalResult.clauseExplanations.length}`);
    console.log(`- Overall risk score: ${finalResult.riskScore.overall}`);

    console.log('Successfully completed Deepseek analysis');

    // Update document in database
    if (documentId) {
      console.log('Updating document in database with analysis results');
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'analyzed',
          analysis_data: finalResult,
          pages: finalResult.processingMetrics.documentPages
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Database update error:', updateError);
      } else {
        console.log('Document successfully updated with analysis results');
      }
    }

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-contract function:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error',
      details: 'FinContract AI analysis failed. Please try again or check your document format.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
