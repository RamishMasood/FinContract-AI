

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import contractAnalysisService, { 
  AnalysisRequest, 
  AnalysisResponse 
} from '@/services/contractAnalysisService';

export const useContractAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const { data: documents, isLoading: isLoadingDocuments, refetch: refetchDocuments } = 
    useQuery({
      queryKey: ['documents'],
      queryFn: () => contractAnalysisService.getDocuments(),
      // Add retry to ensure we get documents even if first attempt fails
      retry: 3,
      retryDelay: 1000,
    });

  const analyzeContract = async (request: AnalysisRequest) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log("Starting contract analysis with request:", {
        documentType: request.documentType,
        documentName: request.documentName,
        documentIsFile: request.document instanceof File
      });
      
      const response = await contractAnalysisService.analyzeContract(request);
      console.log("Analysis completed successfully", response);
      
      // Process red flags from raw text if they appear to be in the summary
      const processRedFlagsFromText = (response: AnalysisResponse) => {
        if (!response.redFlags || response.redFlags.length === 0) {
          // Check if red flags might be in the summary or other fields
          const summary = response.summary || '';
          let extractedFlags: any[] = [];
          
          // Look for structured red flags in the summary
          if (summary.includes("Red Flags") || summary.includes("Issue") || summary.includes("**Vague")) {
            const redFlagSection = summary.match(/Red Flags[:\s]+([^]*?)(?=\n\n|\n*##|\nMissing|$)/i);
            if (redFlagSection && redFlagSection[1]) {
              const flagsText = redFlagSection[1].trim();
              
              // Parse from table format if it exists
              const tableRows = flagsText.match(/\|\s*\*\*([^*|]+)\*\*\s*\|\s*\*\*([^*|]+)\*\*\s*\|\s*([^*|]+)?\s*\|/g);
              if (tableRows) {
                extractedFlags = tableRows.map((row, index) => {
                  const parts = row.split('|').map(p => p.trim().replace(/\*\*/g, ''));
                  const title = parts[1] || `Issue ${index + 1}`;
                  const severity = (parts[2] || 'medium').toLowerCase();
                  const description = parts[3] || `Issue with ${title}`;
                  
                  return {
                    id: `auto-flag-${index}`,
                    title,
                    severity: severity.includes('high') ? 'high' : severity.includes('low') ? 'low' : 'medium',
                    description,
                    clause: ''
                  };
                });
              } else {
                // Try to extract by bullet points or similar formats
                const bulletPoints = flagsText.split(/\n\*|\n-|\n\d+\./).filter(item => item.trim().length > 0);
                extractedFlags = bulletPoints.map((item, index) => {
                  const titleMatch = item.match(/[*"]?([^:*"\n]+)[*"]?(?:\s*:|$)/);
                  const title = titleMatch ? titleMatch[1].trim() : `Issue ${index + 1}`;
                  
                  let severity: 'high' | 'medium' | 'low' = 'medium';
                  if (item.toLowerCase().includes('high')) severity = 'high';
                  else if (item.toLowerCase().includes('low')) severity = 'low';
                  
                  return {
                    id: `auto-flag-${index}`,
                    title,
                    severity,
                    description: item.replace(titleMatch ? titleMatch[0] : '', '').trim(),
                    clause: ''
                  };
                });
              }
            }
          }
          
          if (extractedFlags.length > 0) {
            return { ...response, redFlags: extractedFlags };
          }
        }
        
        return response;
      };
      
      // Try to extract red flags from text if they're not properly structured
      const processedResponse = processRedFlagsFromText(response);
      
      // Ensure we have valid data in each section
      const validatedResponse: AnalysisResponse = {
        ...processedResponse,
        redFlags: Array.isArray(processedResponse.redFlags) ? processedResponse.redFlags : [],
        missingClauses: Array.isArray(processedResponse.missingClauses) ? processedResponse.missingClauses : [],
        suggestedEdits: Array.isArray(processedResponse.suggestedEdits) ? processedResponse.suggestedEdits : [],
        riskScore: processedResponse.riskScore || { overall: 50, sections: [] },
        clauseExplanations: Array.isArray(processedResponse.clauseExplanations) ? processedResponse.clauseExplanations : []
      };
      
      setResult(validatedResponse);
      
      // Refetch documents after successful analysis to update the list
      try {
        await refetchDocuments();
      } catch (refetchError) {
        console.error("Error refetching documents:", refetchError);
        // Continue even if refetch fails
      }
      
      return validatedResponse;
    } catch (err) {
      console.error("Error in analyzeContract:", err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      // Try to refetch documents even on error, as the document might have been created
      try {
        await refetchDocuments();
      } catch (refetchError) {
        console.error("Error refetching documents after analysis error:", refetchError);
      }
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeContract,
    isAnalyzing,
    error,
    result,
    documents,
    isLoadingDocuments,
    refetchDocuments
  };
};

export default useContractAnalysis;
