import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'upload' | 'analysis' | 'suggestion' | 'export' | 'compliance-check';
  documentName?: string;
  details: string;
  userId: string;
}

interface AuditLogProps {
  documentId?: string;
}

const AuditLog = ({ documentId }: AuditLogProps) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    // Load from localStorage (in real app, fetch from API)
    const storedLogs = localStorage.getItem('fincontract_audit_logs');
    if (storedLogs) {
      const parsed = JSON.parse(storedLogs);
      const filtered = documentId 
        ? parsed.filter((log: AuditLogEntry) => log.documentName?.includes(documentId))
        : parsed;
      setLogs(filtered.slice(-20).reverse()); // Last 20 entries, newest first
    }
  }, [documentId]);

  const iconMap = {
    upload: FileText,
    analysis: Shield,
    suggestion: AlertTriangle,
    export: FileText,
    'compliance-check': Shield
  };

  const colorMap = {
    upload: 'text-blue-600',
    analysis: 'text-emerald-600',
    suggestion: 'text-amber-600',
    export: 'text-slate-600',
    'compliance-check': 'text-purple-600'
  };

  if (logs.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Clock className="h-5 w-5 text-slate-600" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">No audit entries yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="h-5 w-5 text-slate-600" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = iconMap[log.action];
              const colorClass = colorMap[log.action];
              
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Icon className={`h-4 w-4 mt-0.5 ${colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {log.action.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    {log.documentName && (
                      <div className="text-xs text-slate-600 mb-1">{log.documentName}</div>
                    )}
                    <div className="text-xs text-slate-600">{log.details}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper function to add audit log entry
export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const logs = JSON.parse(localStorage.getItem('fincontract_audit_logs') || '[]');
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
  logs.push(newEntry);
  localStorage.setItem('fincontract_audit_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
};

export default AuditLog;
