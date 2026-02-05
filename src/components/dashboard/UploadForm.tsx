import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, 
  FileText, 
  FileUp, 
  CheckCircle2, 
  X,
  AlertCircle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import useContractAnalysis from "@/hooks/useContractAnalysis";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import fileTextExtractor from "@/services/fileTextExtractor";
import { TradingTemplate } from "@/constants/tradingTemplates";
import { redactPII } from "@/utils/dataRedaction";

const uploadFormSchema = z.object({
  documentName: z.string().min(3, "Document name must be at least 3 characters"),
});

interface UploadFormProps {
  selectedTemplate?: TradingTemplate | null;
}

const UploadForm = ({ selectedTemplate }: UploadFormProps = {}) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [contractText, setContractText] = useState(selectedTemplate?.sampleText || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileType, setFileType] = useState<"pdf" | "docx" | "other">("pdf");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [redactData, setRedactData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { analyzeContract, isAnalyzing } = useContractAnalysis();
  
  // Update text when template changes
  React.useEffect(() => {
    if (selectedTemplate?.sampleText) {
      setContractText(selectedTemplate.sampleText);
      setActiveTab("paste");
      toast({
        title: "Template loaded",
        description: `${selectedTemplate.name} template is ready for analysis.`,
      });
    }
  }, [selectedTemplate, toast]);

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      documentName: "",
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
      
      // Auto-fill document name from file name
      const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
      form.setValue("documentName", nameWithoutExtension);
      
      if (selectedFile.type === "application/pdf") {
        setFileType("pdf");
      } else if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileType("docx");
      } else {
        setFileType("other");
        toast({
          title: "Unsupported file type",
          description: "Only PDF and DOCX files are supported.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setUploadError(null);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      
      // Auto-fill document name from file name
      const nameWithoutExtension = droppedFile.name.split('.').slice(0, -1).join('.');
      form.setValue("documentName", nameWithoutExtension);
      
      if (droppedFile.type === "application/pdf") {
        setFileType("pdf");
      } else if (
        droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileType("docx");
      } else {
        setFileType("other");
        toast({
          title: "Unsupported file type",
          description: "Only PDF and DOCX files are supported.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handlePasteText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContractText(e.target.value);
    setUploadError(null);
  };

  const onSubmit = async (values: z.infer<typeof uploadFormSchema>) => {
    if (activeTab === "upload" && !file) {
      toast({
        title: "No file selected",
        description: "Please upload a contract document to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    if (activeTab === "paste" && !contractText) {
      toast({
        title: "No text entered",
        description: "Please paste your contract text to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadError(null);
    
    try {
      setUploading(true);
      
      // Simulate upload progress
      let progressInterval: NodeJS.Timeout | undefined;
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      try {
        let requestDocument: string | File = contractText;
        let requestType: "pdf" | "docx" | "text" = "text";
        let extractionMetadata: any = undefined;

        // NEW: If uploading, extract text instead of sending file
        if (activeTab === "upload") {
          if (!file) throw new Error("No file selected.");
          if (fileType === "pdf" || fileType === "docx") {
            setUploadProgress(20);
            const extraction = await fileTextExtractor.extractText(file, fileType);
            setUploadProgress(50);

            if (!extraction.isValid || !extraction.text) {
              throw new Error(
                extraction.error ||
                "Could not extract readable text from document. Are you sure this is a valid contract?"
              );
            }
            requestDocument = extraction.text;
            extractionMetadata = {
              isValid: extraction.isValid,
              wordCount: extraction.wordCount,
              extractionError: extraction.error || null
            };
            requestType = fileType;
          } else {
            throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
          }
        }

        // Send extracted text to analyzer (never send file object)
        const response = await analyzeContract({
          document: requestDocument,
          documentType: requestType,
          documentName: values.documentName,
          ...(extractionMetadata ? { extractionMetadata } : {})
        });
        
        if (progressInterval) clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadComplete(true);
        
        toast({
          title: "Analysis complete",
          description: "Your contract has been analyzed successfully.",
        });
        
        // Navigate directly to document analysis after completion
        setTimeout(() => {
          if (response.documentId) {
            navigate(`/dashboard/document/${response.documentId}`);
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } catch (error) {
        if (progressInterval) clearInterval(progressInterval);
        
        console.error("Upload error:", error);
        
        let errorMessage = "There was an error analyzing your contract. Please try again.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setUploadError(errorMessage);
        
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Don't navigate away on error - let user try again
        setUploading(false);
        setUploadProgress(0);
        setUploadComplete(false);
      }
    } catch (mainError) {
      console.error("Main upload process error:", mainError);
      setUploadError("An unexpected error occurred. Please try again.");
      setUploading(false);
      setUploadProgress(0);
      setUploadComplete(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-center">
              <TabsTrigger value="upload" className="data-[state=active]:bg-legal-primary data-[state=active]:text-white">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload File</span>
              </TabsTrigger>
              <TabsTrigger value="paste" className="data-[state=active]:bg-legal-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                <span>Paste Text</span>
              </TabsTrigger>
            </TabsList>
            
            <FormField
              control={form.control}
              name="documentName"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TabsContent value="upload" className="mt-4">
              <div 
                className={`relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${dragActive ? 'border-legal-primary bg-legal-primary/10' : 'border-gray-300'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  aria-label="Upload PDF or DOCX trading contract"
                />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-legal-success mb-3" />
                    <p className="text-lg font-medium text-legal-text">{file.name}</p>
                    <p className="text-sm text-legal-muted">
                      {file.type === "application/pdf" ? "PDF Document" : "DOCX Document"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FileUp className="h-10 w-10 text-legal-primary mb-3" />
                    <p className="text-lg font-medium text-legal-text">
                      {dragActive ? 'Drop file here' : 'Drag and drop a file here, or click to select'}
                    </p>
                    <p className="text-sm text-legal-muted">
                      Supports: PDF, DOCX
                    </p>
                  </div>
                )}
              </div>
              
              {file && fileType === "other" && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-md mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <span>Selected file type is not supported. Please upload a PDF or DOCX file.</span>
                </div>
              )}
              
              {file && fileType !== "other" && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="file-type">File Type:</Label>
                  <RadioGroup defaultValue={fileType} onValueChange={(value) => setFileType(value as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" disabled={file.type !== "application/pdf"} />
                      <Label htmlFor="pdf">PDF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="docx" id="docx" disabled={file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"} />
                      <Label htmlFor="docx">DOCX</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="paste" className="mt-4">
              <div className="grid gap-2">
                <Label htmlFor="contract">Trading Contract Text:</Label>
                <Textarea
                  id="contract"
                  placeholder="Paste your CFD terms, futures agreement, or client contract here..."
                  className="min-h-[200px]"
                  value={contractText}
                  onChange={handlePasteText}
                />
                {selectedTemplate && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✓ Using template: {selectedTemplate.name}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {uploading && (
            <div className="space-y-2">
              <p className="text-sm text-legal-muted">
                {uploadProgress < 100 ? `Uploading contract... ${uploadProgress}%` : 'Analyzing contract...'}
              </p>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          {uploadComplete && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span>Upload complete! Analyzing contract...</span>
            </div>
          )}
          
          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{uploadError}</span>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90 w-full"
            disabled={uploading || isAnalyzing || (file && fileType === "other")}
          >
            {uploading || isAnalyzing ? (
              <>
                {uploadProgress < 100 ? 'Uploading Contract...' : 'Analyzing Contract...'}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                <span>Scan Trading Contract</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default UploadForm;
