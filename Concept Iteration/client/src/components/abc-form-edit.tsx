import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, X, PenTool, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import aBlockIcon from "@assets/A Block.png";
import bBlockIcon from "@assets/B Block.png";
import cBlockIcon from "@assets/C Block.png";

interface ABCFormData {
  id: string;
  studentName: string;
  date: string;
  time: string;
  summary: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  incidentType: string;
  functionOfBehavior: string[];
  status: "draft" | "signed";
  signature?: string;
  signedAt?: string;
}

interface ABCFormEditProps {
  data: ABCFormData;
  onSave: (data: ABCFormData) => void;
  onCancel: () => void;
}

const incidentTypes = [
  "Physical Aggression",
  "Verbal Outburst",
  "Property Destruction",
  "Noncompliance",
  "Self-Injury",
  "Elopement",
  "Other",
];

const behaviorFunctions = [
  "Escape/Avoidance",
  "Attention Seeking",
  "Obtain Tangible",
  "Sensory Stimulation",
  "Communication",
];

export function ABCFormEdit({ data, onSave, onCancel }: ABCFormEditProps) {
  const [formData, setFormData] = useState(data);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(
    data.functionOfBehavior
  );
  const [signatureName, setSignatureName] = useState(data.signature || "");
  const [isSignatureMode, setIsSignatureMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, functionOfBehavior: selectedFunctions, signature: signatureName });
  };

  const handleSign = () => {
    if (signatureName.trim()) {
      const signedAt = new Date().toISOString();
      const signedData = { ...formData, functionOfBehavior: selectedFunctions, status: "signed" as const, signature: signatureName, signedAt };
      setFormData(signedData);
      onSave(signedData);
    }
  };

  const toggleFunction = (func: string) => {
    if (formData.status === "signed") return; // Prevent changes when signed
    setSelectedFunctions((prev) =>
      prev.includes(func)
        ? prev.filter((f) => f !== func)
        : [...prev, func]
    );
  };

  const isLocked = formData.status === "signed";

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">ABC Incident Form</CardTitle>
              <p className="text-muted-foreground mt-1">Student: {formData.studentName}</p>
            </div>
            <Badge variant={isLocked ? "default" : "secondary"}>
              {isLocked ? "Signed" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '600px', overflowY: 'auto' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date
              </Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                disabled={isLocked}
                data-testid="input-edit-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Time
              </Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                disabled={isLocked}
                data-testid="input-edit-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidentType">Incident Type</Label>
              <Select
                value={formData.incidentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, incidentType: value })
                }
                disabled={isLocked}
              >
                <SelectTrigger id="incidentType" data-testid="select-edit-incident-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Function of Behavior</Label>
              <div className="flex gap-2 flex-wrap pt-2">
                {behaviorFunctions.map((func) => (
                  <Badge
                    key={func}
                    variant={selectedFunctions.includes(func) ? "default" : "outline"}
                    className="cursor-pointer hover-elevate"
                    onClick={() => toggleFunction(func)}
                    data-testid={`badge-function-${func.toLowerCase().replace(/[\/\s]/g, '-')}`}
                  >
                    {func}
                    {selectedFunctions.includes(func) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              className="min-h-[100px]"
              disabled={isLocked}
              data-testid="input-edit-summary"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(248, 52, 34, 0.08)' }}>
              <Label htmlFor="antecedent" className="flex items-center gap-2 text-lg">
                <img src={aBlockIcon} alt="A" className="w-6 h-6" />
                Antecedent
              </Label>
              <Textarea
                id="antecedent"
                value={formData.antecedent}
                onChange={(e) =>
                  setFormData({ ...formData, antecedent: e.target.value })
                }
                className="min-h-[100px]"
                placeholder="What happened immediately before the behavior?"
                disabled={isLocked}
                data-testid="input-edit-antecedent"
              />
            </div>

            <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(61, 148, 53, 0.08)' }}>
              <Label htmlFor="behavior" className="flex items-center gap-2 text-lg">
                <img src={bBlockIcon} alt="B" className="w-6 h-6" />
                Behavior
              </Label>
              <Textarea
                id="behavior"
                value={formData.behavior}
                onChange={(e) =>
                  setFormData({ ...formData, behavior: e.target.value })
                }
                className="min-h-[100px]"
                placeholder="Describe the specific behavior observed"
                disabled={isLocked}
                data-testid="input-edit-behavior"
              />
            </div>

            <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(249, 194, 55, 0.08)' }}>
              <Label htmlFor="consequence" className="flex items-center gap-2 text-lg">
                <img src={cBlockIcon} alt="C" className="w-6 h-6" />
                Consequence
              </Label>
              <Textarea
                id="consequence"
                value={formData.consequence}
                onChange={(e) =>
                  setFormData({ ...formData, consequence: e.target.value })
                }
                className="min-h-[100px]"
                placeholder="What happened immediately after the behavior?"
                disabled={isLocked}
                data-testid="input-edit-consequence"
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-edit">
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-edit">
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
