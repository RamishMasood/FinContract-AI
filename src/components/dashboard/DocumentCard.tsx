import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, FileText, MoreVertical, Eye, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import contractAnalysisService from "@/services/contractAnalysisService";
export type DocumentStatus = "analyzed" | "pending" | "failed";
export type Document = {
  id: string;
  title: string;
  uploadDate: Date;
  status: DocumentStatus;
  fileType: "pdf" | "docx" | "text";
  pages?: number;
  analyzedAt?: Date;
  riskScore?: number;
};
type DocumentCardProps = {
  document: Document;
  onDelete?: (id: string) => void;
};
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};
const DocumentCard = ({
  document: doc,
  onDelete
}: DocumentCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "analyzed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "analyzed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
    }
  };
  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case "analyzed":
        return "Analyzed";
      case "pending":
        return "Analyzing...";
      case "failed":
        return "Failed";
    }
  };

  // Download analysis as JSON
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const reportData = await contractAnalysisService.getDocumentAnalysisData(doc.id);
      const fileName = `${doc.title.replace(/\s+/g, "_")}_analysis.json`;
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json"
      });
      const url = window.URL.createObjectURL(blob);

      // Create a link and click it
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your analysis report is downloading as a JSON file."
      });
    } catch (err: any) {
      toast({
        title: "Download error",
        description: err.message || "Could not download analysis report.",
        variant: "destructive"
      });
    }
    setDownloading(false);
    setIsMenuOpen(false);
  };

  // Actual delete
  const handleDelete = async () => {
    setIsMenuOpen(false);
    try {
      await contractAnalysisService.deleteDocument(doc.id);
      toast({
        title: "Document deleted",
        description: "The document has been removed from your account."
      });
      onDelete?.(doc.id);
    } catch (err: any) {
      toast({
        title: "Error deleting document",
        description: err.message || "Could not delete document.",
        variant: "destructive"
      });
    }
  };
  return <Card className="contract-card flex flex-col h-full w-full max-w">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-md bg-legal-primary/10 p-2">
          <FileText className="h-6 w-6 text-legal-primary" />
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger className="outline-none">
            <MoreVertical className="h-5 w-5 text-legal-muted hover:text-legal-text transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* View Analysis - navigates to document page */}
            <DropdownMenuItem className="cursor-pointer" onClick={() => {
            navigate(`/dashboard/document/${doc.id}`);
            setIsMenuOpen(false);
          }}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View Analysis</span>
            </DropdownMenuItem>
            
            {/* Delete Document */}
            
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-1">
        <Link to={`/dashboard/document/${doc.id}`} className="hover:underline">
          <h3 className="font-medium text-lg line-clamp-2 mb-1">{doc.title}</h3>
        </Link>
        <div className="text-legal-muted text-sm mb-4">
          {formatDate(doc.uploadDate)} • {doc.fileType.toUpperCase()}
          {doc.pages && ` • ${doc.pages} pages`}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`${getStatusColor(doc.status)} flex items-center gap-1`}>
            {getStatusIcon(doc.status)}
            <span>{getStatusText(doc.status)}</span>
          </Badge>
          <Link to={`/dashboard/document/${doc.id}`} className={`text-sm font-medium text-legal-primary hover:underline ${doc.status !== 'analyzed' ? 'opacity-50 pointer-events-none' : ''}`}>
            View Analysis
          </Link>
        </div>
        {doc.status === 'analyzed' && doc.analyzedAt && (() => {
          const daysSince = (Date.now() - doc.analyzedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince >= 30) {
            return (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <RefreshCw className="h-3 w-3" />
                Re-analyze recommended ({Math.floor(daysSince)}d ago)
              </div>
            );
          }
          return null;
        })()}
      </div>
    </Card>;
};
export default DocumentCard;

// NOTE: This file is getting long (203+ lines). Please consider refactoring it into smaller components/utility files after this fix!