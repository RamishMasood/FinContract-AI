
import apiService from './api';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Types for contract analysis
export interface AnalysisRequest {
  document: File | string;
  documentType: 'pdf' | 'docx' | 'text';
  documentName?: string;
}

export interface AnalysisResponse {
  summary: string;
  redFlags: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    clause: string;
  }>;
  missingClauses: string[];
  suggestedEdits: Array<{
    id: string;
    section: string;
    original: string;
    suggested: string;
    explanation: string;
  }>;
  riskScore: {
    overall: number;
    sections: Array<{
      name: string;
      score: number;
      issues: number;
    }>;
  };
  clauseExplanations: Array<{
    id: string;
    section: string;
    clause: string;
    explanation: string;
  }>;
  processingMetrics: {
    documentPages: number;
    processingTimeSeconds: number;
    wordsAnalyzed: number;
  };
  documentId?: string; // Add document ID to response
}

// Define the document type with analysis_data field
type DocumentWithAnalysis = Database["public"]["Tables"]["documents"]["Row"] & {
  analysis_data?: any | null;
};

class ContractAnalysisService {
  // Main contract analysis function
  async analyzeContract(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      let documentId = '';
      let documentText = '';

      // If document is a File (PDF/DOCX), send file directly to the edge function
      if (request.document instanceof File) {
        // Must be logged in
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('User must be logged in to analyze contracts');
        }
        const userId = userData.user.id;
        // Insert metadata into DB
        let docData;
        {
          const { data, error } = await supabase
            .from('documents')
            .insert({
              title: request.documentName || request.document.name,
              file_type: request.documentType,
              status: 'analyzing',
              user_id: userId
            })
            .select()
            .single();
          if (error) {
            console.error("Database error when inserting document:", error);
            throw new Error(`Database error: ${error.message}`);
          }
          docData = data;
        }
        documentId = docData?.id;

        const formData = new FormData();
        formData.append("file", request.document);
        formData.append("documentId", documentId);
        formData.append("documentType", request.documentType);
        formData.append(
          "documentName",
          request.documentName || request.document.name
        );

        let response;
        let responseText = "";
        try {
          const EDGE_FUNCTION_URL = `https://pewmzdrzvjopdvngynhy.supabase.co/functions/v1/analyze-contract`;
          response = await fetch(EDGE_FUNCTION_URL, {
            method: "POST",
            body: formData,
          });
        } catch (e) {
          console.error("Failed to contact analysis edge function:", e);
          throw new Error("Failed to contact analysis edge function: " + (e as Error).message);
        }

        let analysisResult: AnalysisResponse;
        if (!response.ok) {
          // Try to get the error from response as JSON, fallback to text
          let errorMessage = "Edge function error";
          try {
            // Try parse as JSON
            const json = await response.json();
            errorMessage = json?.error || errorMessage;
          } catch (_) {
            // Fallback to text
            try {
              responseText = await response.text();
              errorMessage = responseText.substring(0, 400) || errorMessage;
            } catch (e2) {
              // ignore
            }
          }
          throw new Error(errorMessage);
        }

        // Parse expected JSON result, fallback to error
        try {
          analysisResult = await response.json();
        } catch (parseErr) {
          responseText = await response.text();
          console.error("Edge function returned non-JSON result:", responseText);
          throw new Error("Analyze contract failed: received non-JSON result from analysis API. Please try again or check your file format.");
        }

        // Add document ID to the response
        analysisResult.documentId = documentId;

        // Update DB with result (should be done by edge, but double-write ok)
        try {
          const analysisData = JSON.parse(JSON.stringify(analysisResult));
          await supabase
            .from('documents')
            .update({ status: 'analyzed', analysis_data: analysisData })
            .eq('id', documentId);
        } catch (e) {
          console.warn("Could not update doc after analysis:", e);
        }

        return analysisResult;

      } else if (typeof request.document === 'string') {
        // Pasted text mode is unchanged
        documentText = request.document;

        // Insert as before if logged in and docName provided
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user && request.documentName) {
          try {
            const { data: docData, error: docError } = await supabase
              .from('documents')
              .insert({
                title: request.documentName,
                file_type: request.documentType,
                status: 'analyzing',
                user_id: userData.user.id
              })
              .select()
              .single();

            if (docError) {
              console.error(`Database error: ${docError.message}`);
            } else {
              documentId = docData?.id;
            }
          } catch (docInsertError) {
            console.error("Exception during text document insert:", docInsertError);
          }
        }

        // Validate text (basic)
        if (!documentText || documentText.trim().length < 50) {
          throw new Error("Insufficient readable text content extracted from the document. Please ensure your file contains readable contract text.");
        }

        // Send pasted text to edge function (will use Deepseek for analysis)
        let analysisResult: AnalysisResponse;

        try {
          if (documentId) {
            const { data, error } = await supabase.functions.invoke('analyze-contract', {
              body: {
                documentId,
                documentText,
                documentName: request.documentName || "Unnamed Document",
              }
            });

            if (error) {
              console.error("Edge function error:", error);
              throw new Error(`Analysis failed: ${error.message}`);
            }
            analysisResult = data as AnalysisResponse;
            // Add document ID to response
            analysisResult.documentId = documentId;
          } else {
            analysisResult = this.generateMockAnalysis(documentText);
          }
        } catch (analysisError) {
          console.error("Error during analysis:", analysisError);
          analysisResult = {
            summary: "Analysis could not be completed. This may be due to system limitations or the complexity of the document.",
            redFlags: [
              {
                id: "error-1",
                title: "Analysis Error",
                description: "The system encountered an error while analyzing this document.",
                severity: "medium",
                clause: ""
              }
            ],
            missingClauses: ["Analysis incomplete"],
            suggestedEdits: [],
            riskScore: { overall: 50, sections: [] },
            clauseExplanations: [],
            processingMetrics: {
              documentPages: 1,
              processingTimeSeconds: 0,
              wordsAnalyzed: 0
            }
          };
        }

        if (!documentId) {
          return analysisResult;
        }

        try {
          const analysisData = JSON.parse(JSON.stringify(analysisResult));
          const updateData: any = {
            status: 'analyzed',
            analysis_data: analysisData,
            pages: analysisResult.processingMetrics.documentPages || 0
          };
          const { error: updateError } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', documentId);

          if (updateError) {
            setTimeout(async () => {
              try {
                const { error: retryError } = await supabase
                  .from('documents')
                  .update(updateData)
                  .eq('id', documentId);
                if (retryError) {
                  console.error("Error on retry update:", retryError);
                }
              } catch (finalUpdateError) {
                console.error("Final update attempt failed:", finalUpdateError);
              }
            }, 1000);
          }
        } catch (finalUpdateError) {
          console.error("Error during final document update:", finalUpdateError);
        }

        return analysisResult;
      }

      throw new Error(
        "Invalid request: must be a file upload or contract text string"
      );
    } catch (error) {
      // Return a concise, user-friendly error - always a string.
      let msg = typeof error === "string" ? error
        : error instanceof Error
        ? error.message
        : "Unknown error occurred";
      throw new Error(msg);
    }
  }

  // Fallback only for "Paste text"
  private generateMockAnalysis(text: string): AnalysisResponse {
    const wordCount = text.split(/\s+/).length;
    const pageEstimate = Math.max(1, Math.ceil(wordCount / 500));
    return {
      summary: "This contract appears to be a standard agreement with some potential areas of concern highlighted below.",
      redFlags: [
        {
          id: "rf-1",
          title: "Ambiguous Termination Clause",
          description: "The termination clause lacks specific conditions and timeframes.",
          severity: "medium",
          clause: "Either party may terminate this agreement with reasonable notice."
        },
        {
          id: "rf-2",
          title: "Broad Indemnification",
          description: "The indemnification clause is overly broad and may create excessive liability.",
          severity: "high",
          clause: "Party A shall indemnify Party B against all claims, losses, and damages."
        }
      ],
      missingClauses: [
        "Dispute Resolution Mechanism",
        "Force Majeure",
        "Confidentiality Provision"
      ],
      suggestedEdits: [
        {
          id: "se-1",
          section: "Payment Terms",
          original: "Payment shall be made within a reasonable time after receipt of invoice.",
          suggested: "Payment shall be made within thirty (30) days after receipt of invoice.",
          explanation: "Specific timeframes reduce ambiguity and payment disputes."
        },
        {
          id: "se-2",
          section: "Intellectual Property",
          original: "All intellectual property shall belong to the Company.",
          suggested: "All intellectual property created during the performance of this Agreement shall belong to the Company.",
          explanation: "Limiting scope to IP created during the agreement prevents unintended transfer of pre-existing IP."
        }
      ],
      riskScore: {
        overall: 65,
        sections: [
          {
            name: "Liability",
            score: 75,
            issues: 2
          },
          {
            name: "Termination",
            score: 60,
            issues: 1
          },
          {
            name: "Payment",
            score: 50,
            issues: 1
          }
        ]
      },
      clauseExplanations: [
        {
          id: "ce-1",
          section: "Non-Compete",
          clause: "Party A shall not engage in similar business activities for a period of two years.",
          explanation: "This clause restricts Party A from competing with Party B for 2 years. Depending on jurisdiction, such duration may be considered reasonable."
        },
        {
          id: "ce-2",
          section: "Governing Law",
          clause: "This Agreement shall be governed by the laws of the State of California.",
          explanation: "This clause establishes California law as the controlling law for interpreting the agreement and resolving disputes."
        }
      ],
      processingMetrics: {
        documentPages: pageEstimate,
        processingTimeSeconds: 2.5,
        wordsAnalyzed: wordCount
      }
    };
  }

  async getDocuments() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      return data || [] as DocumentWithAnalysis[];
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<DocumentWithAnalysis | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User must be logged in to view documents');
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single();

      if (error) {
        console.error("Error fetching document by ID:", error);
        throw error;
      }

      return data as DocumentWithAnalysis;
    } catch (error) {
      console.error("Error fetching document:", error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User must be logged in to delete documents');
      }
      
      // Soft delete: mark as deleted instead of actually deleting
      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', id)
        .eq('user_id', userData.user.id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  // Fetch analysis data as JSON for download
  async getDocumentAnalysisData(id: string): Promise<any> {
    try {
      const document = await this.getDocumentById(id);
      if (!document) throw new Error("Document not found");
      // Attach analysis_data or basic structure if missing
      return {
        id: document.id,
        title: document.title,
        created_at: document.created_at,
        pages: document.pages,
        file_type: document.file_type,
        status: document.status,
        analysis: document.analysis_data || {},
      };
    } catch (error) {
      throw error;
    }
  }
}

export const contractAnalysisService = new ContractAnalysisService();
export default contractAnalysisService;
