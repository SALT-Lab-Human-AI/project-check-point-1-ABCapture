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
import { Calendar, Clock, X, PenTool, Check, Trash2, Loader2 } from "lucide-react";
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
  onDelete?: () => void;
  activeEditFields?: Set<string>;
  onActiveEditFieldsChange?: (fields: Set<string>) => void;
  updatedFields?: Set<string>;
  signatureName?: string;
  onSignatureNameChange?: (name: string) => void;
  onSaveDraft?: () => void;
  onSignAndSave?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onClearForm?: () => void;
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

export function ABCFormEdit({ 
  data, 
  onSave, 
  onCancel, 
  onDelete,
  activeEditFields,
  onActiveEditFieldsChange,
  updatedFields = new Set(),
  signatureName: externalSignatureName,
  onSignatureNameChange,
  onSaveDraft,
  onSignAndSave,
  isSaving = false,
  hasUnsavedChanges = false,
  onClearForm,
}: ABCFormEditProps) {
  const [formData, setFormData] = useState(data);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(
    data.functionOfBehavior
  );
  const [internalSignatureName, setInternalSignatureName] = useState(data.signature || "");
  const signatureName = externalSignatureName !== undefined ? externalSignatureName : internalSignatureName;
  const setSignatureName = onSignatureNameChange || setInternalSignatureName;
  
  // Update form data when prop changes (from AI updates)
  // But preserve fields that are currently being edited
  useEffect(() => {
    if (activeEditFields && activeEditFields.size > 0) {
      // Only update fields that aren't being actively edited
      setFormData(prev => ({
        ...prev,
        ...data,
        // Preserve actively edited fields
        summary: activeEditFields.has('summary') ? prev.summary : data.summary,
        antecedent: activeEditFields.has('antecedent') ? prev.antecedent : data.antecedent,
        behavior: activeEditFields.has('behavior') ? prev.behavior : data.behavior,
        consequence: activeEditFields.has('consequence') ? prev.consequence : data.consequence,
        incidentType: activeEditFields.has('incidentType') ? prev.incidentType : data.incidentType,
      }));
      // Only update functionOfBehavior if not being edited
      if (!activeEditFields.has('functionOfBehavior')) {
        setSelectedFunctions(data.functionOfBehavior);
      }
    } else {
      // No active edits, safe to update everything
      setFormData(data);
      setSelectedFunctions(data.functionOfBehavior);
    }
  }, [data, activeEditFields]);
  
  // Track active edit fields
  const handleFieldFocus = (fieldName: string) => {
    if (onActiveEditFieldsChange) {
      const newSet = new Set(activeEditFields || []);
      newSet.add(fieldName);
      onActiveEditFieldsChange(newSet);
    }
  };
  
  const handleFieldBlur = (fieldName: string) => {
    if (onActiveEditFieldsChange) {
      const newSet = new Set(activeEditFields || []);
      newSet.delete(fieldName);
      onActiveEditFieldsChange(newSet);
    }
  };
  
  // Get highlight class for updated fields
  const getFieldHighlightClass = (fieldName: string) => {
    if (updatedFields.has(fieldName)) {
      return "ring-2 ring-primary/50 bg-primary/5 transition-all duration-2000";
    }
    return "";
  };

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
    setSelectedFunctions((prev) =>
      prev.includes(func)
        ? prev.filter((f) => f !== func)
        : [...prev, func]
    );
  };

  // Allow editing of all incidents (both draft and signed)
  const isLocked = false;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">ABC Incident Form</CardTitle>
              <p className="text-muted-foreground mt-1">Student: {formData.studentName} • {formData.date} at {formData.time}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasUnsavedChanges ? "secondary" : "default"} className="flex items-center gap-1">
                {hasUnsavedChanges ? (
                  <>
                    <Clock className="h-3 w-3" />
                    Not Saved
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Changes Saved
                  </>
                )}
              </Badge>
              {onClearForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearForm}
                >
                  Clear Form
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
                onOpenChange={(open) => {
                  if (open) handleFieldFocus('incidentType');
                  else handleFieldBlur('incidentType');
                }}
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

          <div className={`space-y-2 ${getFieldHighlightClass('summary')} p-2 rounded-lg`}>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              onFocus={() => handleFieldFocus('summary')}
              onBlur={() => handleFieldBlur('summary')}
              className="min-h-[100px]"
              disabled={isLocked}
              data-testid="input-edit-summary"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className={`space-y-2 p-4 rounded-lg ${getFieldHighlightClass('antecedent')}`} style={{ backgroundColor: 'rgba(248, 52, 34, 0.08)' }}>
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
                onFocus={() => handleFieldFocus('antecedent')}
                onBlur={() => handleFieldBlur('antecedent')}
                className="min-h-[100px]"
                placeholder="What happened immediately before the behavior?"
                disabled={isLocked}
                data-testid="input-edit-antecedent"
              />
            </div>

            <div className={`space-y-2 p-4 rounded-lg ${getFieldHighlightClass('behavior')}`} style={{ backgroundColor: 'rgba(61, 148, 53, 0.08)' }}>
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
                onFocus={() => handleFieldFocus('behavior')}
                onBlur={() => handleFieldBlur('behavior')}
                className="min-h-[100px]"
                placeholder="Describe the specific behavior observed"
                disabled={isLocked}
                data-testid="input-edit-behavior"
              />
            </div>

            <div className={`space-y-2 p-4 rounded-lg ${getFieldHighlightClass('consequence')}`} style={{ backgroundColor: 'rgba(249, 194, 55, 0.08)' }}>
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
                onFocus={() => handleFieldFocus('consequence')}
                onBlur={() => handleFieldBlur('consequence')}
                className="min-h-[100px]"
                placeholder="What happened immediately after the behavior?"
                disabled={isLocked}
                data-testid="input-edit-consequence"
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="signature">Type your full name to sign</Label>
              <Input
                id="signature"
                placeholder="Your full name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                data-testid="input-signature"
              />
            </div>
            
            <div className="flex gap-2">
              {formData.status === "draft" && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={onDelete}
                  data-testid="button-delete-incident"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              {onSaveDraft && (
                <Button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isSaving || !formData.antecedent || !formData.behavior || !formData.consequence}
                  variant="outline"
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
              )}
              {onSignAndSave && (
                <Button
                  type="button"
                  onClick={onSignAndSave}
                  disabled={isSaving || !formData.antecedent || !formData.behavior || !formData.consequence || !signatureName.trim()}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PenTool className="h-4 w-4 mr-2" />
                      Save Incident
                    </>
                  )}
                </Button>
              )}
              {!onSaveDraft && !onSignAndSave && (
                <>
                  <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-edit">
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-save-edit">
                    Save Changes
                  </Button>
                </>
              )}
            </div>
            {(!formData.antecedent || !formData.behavior || !formData.consequence) && (
              <p className="text-xs text-muted-foreground text-center">
                Please ensure all ABC fields are filled before saving
              </p>
            )}
            {!signatureName.trim() && formData.antecedent && formData.behavior && formData.consequence && onSignAndSave && (
              <p className="text-xs text-muted-foreground text-center">
                Signature required to save incident
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
