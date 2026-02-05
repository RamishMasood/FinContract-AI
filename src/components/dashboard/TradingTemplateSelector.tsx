import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Scale, DollarSign } from "lucide-react";
import { TRADING_TEMPLATES, TradingTemplate } from "@/constants/tradingTemplates";
import { useToast } from "@/components/ui/use-toast";

interface TradingTemplateSelectorProps {
  onSelectTemplate: (template: TradingTemplate) => void;
}

const iconMap = {
  cfd: TrendingUp,
  isda: Scale,
  'client-agreement': FileText,
  loan: DollarSign
};

const TradingTemplateSelector = ({ onSelectTemplate }: TradingTemplateSelectorProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { toast } = useToast();

  const handleSelect = () => {
    const template = TRADING_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      onSelectTemplate(template);
      toast({
        title: "Template loaded",
        description: `${template.name} template has been loaded.`,
      });
    }
  };

  const selectedTemplate = TRADING_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <FileText className="h-5 w-5 text-blue-600" />
          Trading Contract Templates
        </CardTitle>
        <CardDescription>
          Select a pre-built template to analyze common trading contract patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent>
            {TRADING_TEMPLATES.map((template) => {
              const Icon = iconMap[template.category];
              return (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span>{template.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {selectedTemplate && (
          <div className="p-4 bg-white rounded-lg border border-blue-100 space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{selectedTemplate.name}</h4>
              <p className="text-sm text-slate-600">{selectedTemplate.description}</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700">Key Risk Areas:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.riskAreas.map((risk, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                    {risk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700">Compliance Regulations:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.complianceRegs.map((reg, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    {reg}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSelect}
              className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#059669] hover:opacity-90"
            >
              Load Template for Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingTemplateSelector;
