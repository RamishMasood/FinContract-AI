
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown-like formatting function
  const formatContent = (text: string) => {
    // Split by line breaks and process each line
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Process bold text (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={`bold-${index}-${partIndex}`}>{boldText}</strong>;
        }
        return part;
      });
      
      elements.push(
        <div key={`line-${index}`} className="mb-2">
          {formattedLine}
        </div>
      );
    });
    
    return elements;
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {formatContent(content)}
    </div>
  );
}
