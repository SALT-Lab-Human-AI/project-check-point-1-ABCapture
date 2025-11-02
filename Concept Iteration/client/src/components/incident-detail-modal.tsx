import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Download,
  Printer,
  X,
  FileSignature,
  Trash2
} from "lucide-react";
import aBlockIcon from "../../../attached_assets/A Block.png";
import bBlockIcon from "../../../attached_assets/B Block.png";
import cBlockIcon from "../../../attached_assets/C Block.png";

interface IncidentDetailModalProps {
  incident: {
    id: number;
    studentId: number;
    studentName?: string;
    date: string;
    time: string;
    summary: string;
    antecedent: string;
    behavior: string;
    consequence: string;
    incidentType: string;
    functionOfBehavior: string[];
    location?: string;
    duration?: string;
    severity?: string;
    signature?: string;
    status: string;
    createdAt: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onSign?: (incidentId: number, signature: string) => void;
  onDelete?: (incidentId: number) => void;
}

export function IncidentDetailModal({ incident, open, onClose, onSign, onDelete }: IncidentDetailModalProps) {
  const [signature, setSignature] = useState("");
  
  if (!incident) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create a formatted text version
    const reportText = `
INCIDENT REPORT
═══════════════════════════════════════════════

Student: ${incident.studentName || 'Unknown'}
Date: ${new Date(incident.date).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Time: ${incident.time}
Recorded: ${new Date(incident.createdAt).toLocaleString()}

ABC ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antecedent (What happened before):
${incident.antecedent}

Behavior (What the student did):
${incident.behavior}

Consequence (What happened after):
${incident.consequence}

ADDITIONAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: ${incident.summary}
Incident Type: ${incident.incidentType}
Function of Behavior: ${incident.functionOfBehavior.join(', ')}
${incident.location ? `Location: ${incident.location}` : ''}
${incident.duration ? `Duration: ${incident.duration}` : ''}
${incident.severity ? `Severity: ${incident.severity}` : ''}

Signature: ${incident.signature || 'Not signed'}
Status: ${incident.status}
    `.trim();

    // Create and download as text file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${incident.id}-${incident.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const initials = incident.studentName
    ? incident.studentName.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Incident Report</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={incident.studentName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{incident.studentName || 'Unknown Student'}</h3>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(incident.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {incident.time}
                </div>
                {incident.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {incident.location}
                  </div>
                )}
              </div>
            </div>
            <Badge variant={incident.status === 'signed' ? 'default' : 'secondary'}>
              {incident.status}
            </Badge>
          </div>

          {/* ABC Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ABC Analysis
            </h3>
            
            <div className="space-y-4">
              {/* Antecedent */}
              <div className="border-l-4 border-chart-1 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <img src={aBlockIcon} alt="A" className="w-6 h-6" />
                  <h4 className="font-semibold">Antecedent</h4>
                  <span className="text-xs text-muted-foreground">(What happened before)</span>
                </div>
                <p className="text-sm leading-relaxed">{incident.antecedent}</p>
              </div>

              {/* Behavior */}
              <div className="border-l-4 border-chart-2 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <img src={bBlockIcon} alt="B" className="w-6 h-6" />
                  <h4 className="font-semibold">Behavior</h4>
                  <span className="text-xs text-muted-foreground">(What the student did)</span>
                </div>
                <p className="text-sm leading-relaxed">{incident.behavior}</p>
              </div>

              {/* Consequence */}
              <div className="border-l-4 border-chart-3 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <img src={cBlockIcon} alt="C" className="w-6 h-6" />
                  <h4 className="font-semibold">Consequence</h4>
                  <span className="text-xs text-muted-foreground">(What happened after)</span>
                </div>
                <p className="text-sm leading-relaxed">{incident.consequence}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {incident.summary && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                  <p className="text-sm">{incident.summary}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Incident Type</h4>
                <Badge>{incident.incidentType}</Badge>
              </div>

              {incident.functionOfBehavior && incident.functionOfBehavior.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Function of Behavior</h4>
                  <div className="flex flex-wrap gap-1">
                    {incident.functionOfBehavior.map((func, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {incident.duration && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                  <p className="text-sm">{incident.duration}</p>
                </div>
              )}

              {incident.severity && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Severity</h4>
                  <Badge variant={
                    incident.severity === 'High' ? 'destructive' : 
                    incident.severity === 'Medium' ? 'default' : 
                    'secondary'
                  }>
                    {incident.severity}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Signature */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Signature</h3>
            {incident.status === 'draft' && onSign ? (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <FileSignature className="h-4 w-4 inline mr-1" />
                    This incident requires your signature to be finalized.
                  </p>
                </div>
                <div>
                  <Label htmlFor="signature-input">Type your full name to sign</Label>
                  <Input
                    id="signature-input"
                    placeholder="Your full name"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{incident.signature || 'Not signed'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorded on {new Date(incident.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            {incident.status === 'draft' && onDelete && (
              <Button 
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this incident? This action cannot be undone.")) {
                    onDelete(incident.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {incident.status === 'draft' && onSign && (
                <Button 
                  onClick={() => {
                    if (signature.trim()) {
                      onSign(incident.id, signature.trim());
                      setSignature("");
                    }
                  }}
                  disabled={!signature.trim()}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Sign Incident
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
