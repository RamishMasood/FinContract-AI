import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Create and download a nicely formatted NDA/Agreement PDF
 * @param params Agreement details and content
 */
export async function downloadAgreementPdf({
  agreementText,
  context,
  disclosing,
  receiving,
  createdAt,
  filename = "agreement"
}: {
  agreementText: string,
  context?: string,
  disclosing?: string,
  receiving?: string,
  createdAt?: string,
  filename?: string,
}) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const { height, width } = page.getSize();
  
  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Constants for layout - Fixed margins
  const margin = 50; // Reduced margin for better space utilization
  const rightMargin = 50; // Explicit right margin
  const contentWidth = width - margin - rightMargin; // Fixed content width calculation
  let y = height - margin;
  
  // Add header/letterhead with light gray background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: rgb(0.97, 0.97, 0.97),
  });
  
  // Title with proper capitalization and wrapping for long titles
  const title = context ? formatTitle(context) : "Legal Agreement";
  
  // Handle long titles by wrapping with proper width calculation
  const titleSize = title.length > 50 ? 18 : 22;
  const lines = wrapText(title, fontBold, titleSize, contentWidth);
  
  // Draw each line of the wrapped title
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    page.drawText(line, {
      x: margin,
      y: height - margin - 20 - (i * (titleSize + 4)),
      size: titleSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.3)
    });
  }
  
  // Adjust y position based on number of title lines
  y = height - margin - 60 - ((lines.length - 1) * (titleSize + 4));

  // Parties & created at
  if (disclosing || receiving) {
    page.drawText("PARTIES TO THIS AGREEMENT:", {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    y -= 20;
    
    page.drawText(`Disclosing Party: ${disclosing ?? "___________"}`, {
      x: margin,
      y,
      size: 11,
      font: font,
      color: rgb(0.2, 0.2, 0.2)
    });
    
    y -= 18;
    
    page.drawText(`Receiving Party: ${receiving ?? "___________"}`, {
      x: margin,
      y,
      size: 11, 
      font: font,
      color: rgb(0.2, 0.2, 0.2)
    });
    
    y -= 18;
  }

  if (createdAt) {
    page.drawText(`Document Created: ${createdAt}`, {
      x: margin,
      y,
      size: 10,
      font: fontItalic,
      color: rgb(0.4, 0.4, 0.4)
    });
    y -= 20;
  } else {
    y -= 12;
  }

  // Add horizontal separator
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - rightMargin, y }, // Fixed separator width
    thickness: 1.5,
    color: rgb(0.7, 0.7, 0.8)
  });
  
  y -= 30;

  // Process Markdown content
  const blocks = parseMarkdownBlocks(agreementText);
  
  for (const block of blocks) {
    // Check if we need a page break
    if (y < margin + 80) { // Increased bottom margin check
      page = pdfDoc.addPage([width, height]);
      y = height - margin;
    }
    
    if (block.type === 'heading') {
      const headingSize = block.level === 1 ? 16 : 
                         block.level === 2 ? 14 : 12;
                         
      // Wrap heading text if too long
      const headingLines = wrapText(block.text, fontBold, headingSize, contentWidth);
      
      for (let i = 0; i < headingLines.length; i++) {
        page.drawText(headingLines[i], {
          x: margin,
          y: y - (i * (headingSize + 4)),
          size: headingSize,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.3)
        });
      }
      
      y -= (headingLines.length * (headingSize + 4)) + 16;
    } 
    else if (block.type === 'paragraph') {
      // Improved paragraph handling with proper text wrapping
      const fontSize = 11;
      const lineHeight = 16;
      const paragraphLines = wrapText(block.text, font, fontSize, contentWidth);
      
      for (let i = 0; i < paragraphLines.length; i++) {
        // Check for page break for each line
        if (y < margin + 40) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }
        
        // Process line for bold formatting
        const segments = extractFormattedSegments(paragraphLines[i]);
        let currentX = margin;
        
        for (const segment of segments) {
          const segmentFont = segment.bold ? fontBold : font;
          const textWidth = segmentFont.widthOfTextAtSize(segment.text, fontSize);
          
          // Ensure text doesn't exceed right margin
          if (currentX + textWidth > width - rightMargin) {
            // Move to next line if text would overflow
            y -= lineHeight;
            currentX = margin;
            
            // Check for page break again
            if (y < margin + 40) {
              page = pdfDoc.addPage([width, height]);
              y = height - margin;
            }
          }
          
          page.drawText(segment.text, {
            x: currentX,
            y,
            size: fontSize,
            font: segmentFont,
            color: rgb(0.1, 0.1, 0.1)
          });
          
          currentX += textWidth;
        }
        
        y -= lineHeight;
      }
      
      y -= 8; // Paragraph spacing
    }
    else if (block.type === 'list') {
      for (let i = 0; i < block.items.length; i++) {
        // Check if we need a page break
        if (y < margin + 40) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }
        
        // Draw bullet or number
        const bulletText = block.ordered ? `${i+1}.` : '•';
        page.drawText(bulletText, {
          x: margin,
          y,
          size: 11,
          font: font,
          color: rgb(0.1, 0.1, 0.1)
        });
        
        // Process list item text with proper wrapping
        const listItemWidth = contentWidth - 20; // Account for bullet indentation
        const listItemLines = wrapText(block.items[i], font, 11, listItemWidth);
        
        for (let lineIndex = 0; lineIndex < listItemLines.length; lineIndex++) {
          const segments = extractFormattedSegments(listItemLines[lineIndex]);
          let currentX = margin + 20; // Indent for list items
          
          for (const segment of segments) {
            const segmentFont = segment.bold ? fontBold : font;
            const textWidth = segmentFont.widthOfTextAtSize(segment.text, 11);
            
            page.drawText(segment.text, {
              x: currentX,
              y: y - (lineIndex * 16),
              size: 11,
              font: segmentFont,
              color: rgb(0.1, 0.1, 0.1)
            });
            
            currentX += textWidth;
          }
        }
        
        y -= (listItemLines.length * 16) + 4; // Account for multiple lines
      }
      
      y -= 8; // Space after list
    }
  }
  
  // Add footer with page numbers to each page
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const { height, width } = page.getSize();
    
    // Page number
    const pageText = `Page ${i + 1} of ${pdfDoc.getPageCount()}`;
    const pageTextWidth = font.widthOfTextAtSize(pageText, 9);
    page.drawText(pageText, {
      x: (width - pageTextWidth) / 2, // Center the page number
      y: 30,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Footer line
    page.drawLine({
      start: { x: margin, y: 40 },
      end: { x: width - rightMargin, y: 40 }, // Fixed footer line width
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    // Disclaimer text
    if (i === pdfDoc.getPageCount() - 1) {
      const disclaimerText = "This document is a sample agreement and not legal advice.";
      const disclaimerWidth = fontItalic.widthOfTextAtSize(disclaimerText, 8);
      page.drawText(disclaimerText, {
        x: (width - disclaimerWidth) / 2, // Center the disclaimer
        y: 20, 
        size: 8,
        font: fontItalic,
        color: rgb(0.5, 0.5, 0.5)
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename + ".pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Format title with proper capitalization
function formatTitle(text: string): string {
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Interface for formatted text segments
interface FormattedSegment {
  text: string;
  bold: boolean;
}

// Extract bold-formatted segments from text
function extractFormattedSegments(text: string): FormattedSegment[] {
  const segments: FormattedSegment[] = [];
  let currentIndex = 0;
  let boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Text before the bold segment
    if (match.index > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, match.index),
        bold: false
      });
    }

    // The bold segment itself (without the ** markers)
    segments.push({
      text: match[1], // Content between ** markers
      bold: true
    });

    currentIndex = match.index + match[0].length;
  }

  // Remaining text after the last bold segment
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      bold: false
    });
  }

  // If no bold segments were found, return the whole text as non-bold
  if (segments.length === 0) {
    segments.push({
      text: text,
      bold: false
    });
  }

  return segments;
}

// Process a paragraph with mixed formatting
function drawFormattedParagraph(page: any, text: string, x: number, y: number, fontSize: number, width: number, 
                               regularFont: any, boldFont: any, color: any): number {
  const segments = extractFormattedSegments(text);
  let currentX = x;
  let currentY = y;
  const lineHeight = fontSize * 1.5;
  let currentLine: FormattedSegment[] = [];
  let currentLineWidth = 0;

  for (const segment of segments) {
    const segmentFont = segment.bold ? boldFont : regularFont;
    const words = segment.text.split(' ');
    
    for (const word of words) {
      const wordWithSpace = word + ' ';
      const wordWidth = segmentFont.widthOfTextAtSize(wordWithSpace, fontSize);
      
      // Check if adding this word would exceed the line width
      if (currentLineWidth + wordWidth > width) {
        // Draw the current line
        let lineX = x;
        for (const lineSeg of currentLine) {
          const lineSegFont = lineSeg.bold ? boldFont : regularFont;
          page.drawText(lineSeg.text, {
            x: lineX,
            y: currentY,
            size: fontSize,
            font: lineSegFont,
            color
          });
          lineX += lineSegFont.widthOfTextAtSize(lineSeg.text, fontSize);
        }
        
        // Move to next line
        currentY -= lineHeight;
        currentLine = [];
        currentLineWidth = 0;
        lineX = x;
      }
      
      // Add word to current line segments
      currentLine.push({
        text: wordWithSpace,
        bold: segment.bold
      });
      currentLineWidth += wordWidth;
    }
  }
  
  // Draw any remaining line
  if (currentLine.length > 0) {
    let lineX = x;
    for (const lineSeg of currentLine) {
      const lineSegFont = lineSeg.bold ? boldFont : regularFont;
      page.drawText(lineSeg.text, {
        x: lineX,
        y: currentY,
        size: fontSize,
        font: lineSegFont,
        color
      });
      lineX += lineSegFont.widthOfTextAtSize(lineSeg.text, fontSize);
    }
  }
  
  return currentY;
}

// Parse Markdown into structured blocks
function parseMarkdownBlocks(markdown: string): any[] {
  // First, preprocess the markdown to normalize bold syntax
  const normalizedMarkdown = markdown.replace(/\*\*\s*([^*]+)\s*\*\*/g, "**$1**");
  
  const blocks: any[] = [];
  const lines = normalizedMarkdown.split('\n');
  
  let currentParagraph: string[] = [];
  let currentList: {type: 'list', ordered: boolean, items: string[]} | null = null;
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: currentParagraph.join(' ')
      });
      currentParagraph = [];
    }
  };
  
  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    
    // Check for headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].replace(/\*\*([^*]+)\*\*/g, "$1") // Remove ** from headings
      });
      continue;
    }
    
    // Check for unordered list item
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { type: 'list', ordered: false, items: [] };
      }
      
      currentList.items.push(ulMatch[1]);
      continue;
    }
    
    // Check for ordered list item
    const olMatch = trimmed.match(/^(\d+)[\.)]\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { type: 'list', ordered: true, items: [] };
      }
      
      currentList.items.push(olMatch[2]);
      continue;
    }
    
    // Regular paragraph text
    flushList();
    currentParagraph.push(trimmed);
  }
  
  flushParagraph();
  flushList();
  
  return blocks;
}

// Enhanced text wrapping function with better accuracy
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle very long words that exceed maxWidth
        const chars = word.split('');
        let partialWord = '';
        
        for (const char of chars) {
          const testChar = partialWord + char;
          const testCharWidth = font.widthOfTextAtSize(testChar, fontSize);
          
          if (testCharWidth <= maxWidth) {
            partialWord = testChar;
          } else {
            if (partialWord) {
              lines.push(partialWord);
              partialWord = char;
            } else {
              lines.push(char);
            }
          }
        }
        
        if (partialWord) {
          currentLine = partialWord;
        }
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.filter(line => line.trim().length > 0);
}

