import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Import the worker as a URL string
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker?url';

// Set the worker source for PDF.js to the local worker from Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface TextExtractionResult {
  text: string;
  isValid: boolean;
  wordCount: number;
  error?: string;
}

class FileTextExtractor {
  async extractFromPDF(file: File): Promise<TextExtractionResult> {
    try {
      console.log('Starting PDF text extraction with pdfjs-dist library');
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document using PDF.js (worker is automatically handled via workerSrc)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine all text items from the page
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + ' ';
          console.log(`Page ${pageNum} extracted: ${pageText.length} characters`);
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
      
      if (!fullText || fullText.trim().length === 0) {
        console.warn('No text content found in PDF');
        return {
          text: '',
          isValid: false,
          wordCount: 0,
          error: 'No readable text content found in PDF file'
        };
      }
      
      console.log(`PDF extraction successful. Raw text length: ${fullText.length}`);
      console.log('First 200 characters:', fullText.substring(0, 200));
      
      // No manual worker termination needed

      return this.validateAndCleanText(fullText);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return {
        text: '',
        isValid: false,
        wordCount: 0,
        error: `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async extractFromDOCX(file: File): Promise<TextExtractionResult> {
    try {
      console.log('Starting DOCX text extraction with mammoth library');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages);
      }
      
      console.log(`DOCX extraction successful. Raw text length: ${result.value.length}`);
      console.log('First 200 characters:', result.value.substring(0, 200));
      
      return this.validateAndCleanText(result.value);
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return {
        text: '',
        isValid: false,
        wordCount: 0,
        error: `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateAndCleanText(rawText: string): TextExtractionResult {
    if (!rawText || typeof rawText !== 'string') {
      return {
        text: '',
        isValid: false,
        wordCount: 0,
        error: 'No text content found in file'
      };
    }

    // Clean the text
    let cleanText = rawText
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that aren't relevant to contracts
      .replace(/[^\w\s.,;:!?()-]/g, ' ')
      // Remove multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Validate content quality
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    const hasContractKeywords = this.hasContractRelevantContent(cleanText);
    const isLikelyEnglish = this.isLikelyEnglish(cleanText);
    
    // Check if text looks like readable English
    const englishWordRatio = this.calculateEnglishWordRatio(cleanText);
    const isValid = wordCount >= 10 && englishWordRatio > 0.3 && (hasContractKeywords || isLikelyEnglish);

    if (!isValid) {
      let error = 'Extracted text may not be optimal for contract analysis. ';
      if (wordCount < 10) error += 'Too few words extracted. ';
      if (englishWordRatio <= 0.3) error += 'Text may not be in English. ';
      if (!hasContractKeywords && !isLikelyEnglish) error += 'No contract-relevant keywords found.';
      
      console.warn('Text validation warning:', error);
      console.warn('Word count:', wordCount, 'English ratio:', englishWordRatio);
      
      // Still return the text but mark as potentially problematic
      return {
        text: cleanText,
        isValid: false,
        wordCount,
        error: error.trim()
      };
    }

    console.log('Text validation successful:', { wordCount, englishWordRatio, hasContractKeywords });

    return {
      text: cleanText,
      isValid: true,
      wordCount
    };
  }

  private isLikelyEnglish(text: string): boolean {
    const commonEnglishWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall'
    ];

    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return false;

    const englishWordCount = words.filter(word => 
      commonEnglishWords.includes(word)
    ).length;

    return englishWordCount >= 3; // At least 3 common English words
  }

  private hasContractRelevantContent(text: string): boolean {
    const contractKeywords = [
      'agreement', 'contract', 'party', 'parties', 'terms', 'conditions',
      'clause', 'section', 'article', 'liability', 'obligation', 'payment',
      'termination', 'breach', 'indemnification', 'confidential', 'intellectual',
      'property', 'governing', 'law', 'dispute', 'resolution', 'signature',
      'executed', 'effective', 'date', 'shall', 'hereby', 'whereas'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = contractKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );

    return foundKeywords.length >= 2; // Reduced threshold for more flexibility
  }

  private calculateEnglishWordRatio(text: string): number {
    const words = text.split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return 0;

    // Count words that contain only English letters
    const englishWordCount = words.filter(word => 
      /^[a-zA-Z]+$/.test(word)
    ).length;

    return englishWordCount / words.length;
  }

  async extractText(file: File, fileType: 'pdf' | 'docx' | 'text'): Promise<TextExtractionResult> {
    console.log(`Extracting text from ${fileType} file:`, file.name, `(${file.size} bytes)`);
    
    try {
      let result: TextExtractionResult;

      switch (fileType) {
        case 'pdf':
          result = await this.extractFromPDF(file);
          break;
        case 'docx':
          result = await this.extractFromDOCX(file);
          break;
        case 'text':
          const textContent = await file.text();
          result = this.validateAndCleanText(textContent);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      console.log(`Text extraction completed:`, {
        isValid: result.isValid,
        wordCount: result.wordCount,
        textLength: result.text.length,
        hasError: !!result.error
      });

      if (result.error) {
        console.warn('Extraction warning:', result.error);
      }

      // Show preview of extracted text
      if (result.text.length > 0) {
        console.log('Text extraction preview (first 300 chars):', result.text.substring(0, 300));
      }

      return result;
    } catch (error) {
      console.error('File text extraction failed:', error);
      return {
        text: '',
        isValid: false,
        wordCount: 0,
        error: `File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const fileTextExtractor = new FileTextExtractor();
export default fileTextExtractor;
