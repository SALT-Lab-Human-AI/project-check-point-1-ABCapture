import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatbotRecordingInterface } from "@/components/chatbot-recording-interface";
import { ABCFormEdit } from "@/components/abc-form-edit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2, PenTool, Check, Clock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import aBlockIcon from "@assets/A Block.png";
import bBlockIcon from "@assets/B Block.png";
import cBlockIcon from "@assets/C Block.png";

type ApiStudent = { id: number; name: string; grade: string | null };

type ABCFormData = {
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
};

export default function RecordIncident() {
  const [, params] = useRoute("/record/:studentId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ABCFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [activeEditFields, setActiveEditFields] = useState<Set<string>>(new Set());
  const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
  const [signatureName, setSignatureName] = useState<string>("");

  // Fetch students from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });

  const student = students.find((s) => String(s.id) === (params as { studentId: string })?.studentId);

  // Debug: Log when formData changes
  useEffect(() => {
    console.log("[RecordIncident] 📊 formData state changed:", formData);
    if (formData) {
      console.log("[RecordIncident] Form has data:");
      console.log("  - Antecedent:", formData.antecedent);
      console.log("  - Behavior:", formData.behavior);
      console.log("  - Consequence:", formData.consequence);
    } else {
      console.log("[RecordIncident] Form is empty (null)");
    }
  }, [formData]);

  // Save incident mutation
  const saveIncident = useMutation({
    mutationFn: async (incidentData: any) => {
      console.log("[RecordIncident] Saving incident:", incidentData);
      const res = await apiRequest("POST", "/api/incidents", incidentData);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("[RecordIncident] Incident saved successfully:", data);
      // Only show success message and redirect if it's a draft (not signed)
      if (data.status === 'draft') {
        toast({
          title: "Success!",
          description: "Incident saved as draft. Please review and sign.",
        });
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
        queryClient.invalidateQueries({ queryKey: [`/api/incidents?studentId=${params?.studentId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        // Redirect to student detail page
        setTimeout(() => {
          setLocation(`/students/${params?.studentId}`);
        }, 500);
      }
    },
    onError: (error: any) => {
      console.error("[RecordIncident] Error saving incident:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Student not found.</p>
        </div>
      </div>
    );
  }

  const handleFormGenerated = (newFormData: ABCFormData) => {
    console.log("[RecordIncident] 🎯 handleFormGenerated called!");
    console.log("[RecordIncident] New form data:", newFormData);
    console.log("[RecordIncident] Setting formData state...");
    
    setFormData(newFormData);
    setShowAutoFillNotification(true);
    
    console.log("[RecordIncident] ✅ State updated, formData should now be:", newFormData);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowAutoFillNotification(false);
    }, 3000);
    
    toast({
      title: "Form Auto-Filled!",
      description: "AI has analyzed the incident and filled the form. Please review and edit if needed.",
    });
    
    console.log("[RecordIncident] Toast shown, notification displayed");
  };

  const handleFormUpdate = (extractedFormData: ABCFormData) => {
    console.log("[RecordIncident] 🔄 handleFormUpdate called!");
    console.log("[RecordIncident] Extracted form data:", extractedFormData);
    console.log("[RecordIncident] Current form data:", formData);
    console.log("[RecordIncident] Active edit fields:", activeEditFields);
    
    // Merge extracted data with existing form data, respecting active edits
    if (formData) {
      const mergedData: ABCFormData = {
        ...formData,
        // Only update date/time if extracted values are provided and field isn't being edited
        // If extraction returned a new value, use it; otherwise keep existing
        date: activeEditFields.has('date') 
          ? formData.date 
          : (extractedFormData.date && extractedFormData.date.trim() && extractedFormData.date !== formData.date ? extractedFormData.date : formData.date),
        time: activeEditFields.has('time') 
          ? formData.time 
          : (extractedFormData.time && extractedFormData.time.trim() && extractedFormData.time !== formData.time ? extractedFormData.time : formData.time),
        // Only update fields that aren't being actively edited AND have new non-empty values
        summary: activeEditFields.has('summary') 
          ? formData.summary 
          : (extractedFormData.summary && extractedFormData.summary.trim() ? extractedFormData.summary : formData.summary),
        antecedent: activeEditFields.has('antecedent') 
          ? formData.antecedent 
          : (extractedFormData.antecedent && extractedFormData.antecedent.trim() ? extractedFormData.antecedent : formData.antecedent),
        behavior: activeEditFields.has('behavior') 
          ? formData.behavior 
          : (extractedFormData.behavior && extractedFormData.behavior.trim() ? extractedFormData.behavior : formData.behavior),
        consequence: activeEditFields.has('consequence') 
          ? formData.consequence 
          : (extractedFormData.consequence && extractedFormData.consequence.trim() ? extractedFormData.consequence : formData.consequence),
        incidentType: activeEditFields.has('incidentType') 
          ? formData.incidentType 
          : (extractedFormData.incidentType && extractedFormData.incidentType !== "Other" ? extractedFormData.incidentType : formData.incidentType),
        functionOfBehavior: activeEditFields.has('functionOfBehavior') 
          ? formData.functionOfBehavior 
          : (extractedFormData.functionOfBehavior && extractedFormData.functionOfBehavior.length > 0 ? extractedFormData.functionOfBehavior : formData.functionOfBehavior),
      };
      
      // Track which fields were actually updated (for visual feedback)
      const newUpdatedFields = new Set<string>();
      if (!activeEditFields.has('date') && extractedFormData.date && extractedFormData.date.trim() && extractedFormData.date !== formData.date) {
        newUpdatedFields.add('date');
      }
      if (!activeEditFields.has('time') && extractedFormData.time && extractedFormData.time.trim() && extractedFormData.time !== formData.time) {
        newUpdatedFields.add('time');
      }
      if (!activeEditFields.has('summary') && extractedFormData.summary && extractedFormData.summary.trim() && extractedFormData.summary !== formData.summary) {
        newUpdatedFields.add('summary');
      }
      if (!activeEditFields.has('antecedent') && extractedFormData.antecedent && extractedFormData.antecedent.trim() && extractedFormData.antecedent !== formData.antecedent) {
        newUpdatedFields.add('antecedent');
      }
      if (!activeEditFields.has('behavior') && extractedFormData.behavior && extractedFormData.behavior.trim() && extractedFormData.behavior !== formData.behavior) {
        newUpdatedFields.add('behavior');
      }
      if (!activeEditFields.has('consequence') && extractedFormData.consequence && extractedFormData.consequence.trim() && extractedFormData.consequence !== formData.consequence) {
        newUpdatedFields.add('consequence');
      }
      if (!activeEditFields.has('incidentType') && extractedFormData.incidentType && extractedFormData.incidentType !== "Other" && extractedFormData.incidentType !== formData.incidentType) {
        newUpdatedFields.add('incidentType');
      }
      if (!activeEditFields.has('functionOfBehavior') && extractedFormData.functionOfBehavior && extractedFormData.functionOfBehavior.length > 0 && JSON.stringify(extractedFormData.functionOfBehavior) !== JSON.stringify(formData.functionOfBehavior)) {
        newUpdatedFields.add('functionOfBehavior');
      }
      
      setUpdatedFields(newUpdatedFields);
      setFormData(mergedData);
      
      // Clear the highlight after 2 seconds
      if (newUpdatedFields.size > 0) {
        setTimeout(() => {
          setUpdatedFields(new Set());
        }, 2000);
      }
    } else {
      setFormData(extractedFormData);
    }
    
    setShowAutoFillNotification(true);
    setHasUnsavedChanges(true);
    
    console.log("[RecordIncident] ✅ Form data updated");
    
    setTimeout(() => {
      setShowAutoFillNotification(false);
    }, 2000);
  };

  const handleSaveIncident = async () => {
    if (!formData || !student) return;

    setIsSaving(true);
    try {
      // Prepare incident data for API
      const incidentData = {
        studentId: student.id,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        summary: formData.summary || "",
        antecedent: formData.antecedent || "",
        behavior: formData.behavior || "",
        consequence: formData.consequence || "",
        incidentType: formData.incidentType || "Other",
        functionOfBehavior: formData.functionOfBehavior || [],
        location: "",
        status: "draft",
      };

      console.log("[RecordIncident] Submitting incident:", incidentData);
      await saveIncident.mutateAsync(incidentData);
    } catch (error) {
      console.error("[RecordIncident] Error saving incident:", error);
    } finally {
      setIsSaving(false);
    }
  };


  const deleteIncidentMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const res = await apiRequest("DELETE", `/api/incidents/${incidentId}`);
      // Try to parse as JSON, fallback to success message if parsing fails
      try {
        // Check if response has content
        const text = await res.text();
        if (text && text.trim()) {
          return JSON.parse(text);
        }
        // Empty response means success
        return { message: "Incident deleted successfully" };
      } catch (e) {
        // If JSON parsing fails, still consider it success if we got 200 status
        console.warn("[Delete Incident] Could not parse response as JSON:", e);
        return { message: "Incident deleted successfully" };
      }
    },
    onSuccess: () => {
      toast({
        title: "Incident Deleted",
        description: "The incident has been deleted successfully.",
      });
      setFormData(null);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents?studentId=${params?.studentId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete incident",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = (updatedData: ABCFormData) => {
    console.log("[RecordIncident] Saving edited form:", updatedData);
    setFormData(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleDeleteIncident = () => {
    if (formData?.id && formData.status === "draft") {
      if (window.confirm("Are you sure you want to delete this incident? This action cannot be undone.")) {
        deleteIncidentMutation.mutate(formData.id);
      }
    }
  };

  const handleClearForm = () => {
    if (confirm("Are you sure you want to clear the form? This will remove all auto-filled data.")) {
      setFormData(null);
      setSignatureName("");
      setHasUnsavedChanges(false);
      toast({
        title: "Form Cleared",
        description: "You can start over by describing the incident in the chat.",
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!formData || !student) return;

    setIsSaving(true);
    try {
      const incidentData = {
        studentId: student.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        summary: formData.summary || "",
        antecedent: formData.antecedent || "",
        behavior: formData.behavior || "",
        consequence: formData.consequence || "",
        incidentType: formData.incidentType || "Other",
        functionOfBehavior: formData.functionOfBehavior || [],
        location: "",
        status: "draft",
      };

      console.log("[RecordIncident] Saving draft:", incidentData);
      await saveIncident.mutateAsync(incidentData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("[RecordIncident] Error saving draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignAndSave = async () => {
    if (!formData || !student || !signatureName.trim()) return;

    setIsSaving(true);
    try {
      const now = new Date();
      
      // Create a copy of formData and update only the necessary fields
      const incidentData = {
        ...formData,
        studentId: student.id,
        status: "signed" as const,
        signature: signatureName,
        // Convert date to string in YYYY-MM-DD format if it's a Date object
        date: formData.date && typeof formData.date === 'object' && 'toISOString' in formData.date 
          ? (formData.date as Date).toISOString().split('T')[0] 
          : formData.date,
        // Convert time to string in HH:MM format if it's a Date object
        time: formData.time && typeof formData.time === 'object' && 'toLocaleTimeString' in formData.time 
          ? (formData.time as Date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : formData.time,
        // Don't include signedAt - the server will set it automatically when status is "signed"
      };
      
      console.log('Submitting incident data:', JSON.stringify(incidentData, null, 2));

      console.log("[RecordIncident] Signing and saving incident:", incidentData);
      await saveIncident.mutateAsync(incidentData);
      
      // Show success message
      toast({
        title: "Incident Signed",
        description: "The incident has been signed and finalized.",
      });
      
      // Invalidate queries to refresh the incident list
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`/api/incidents?studentId=${student.id}`] }),
        queryClient.invalidateQueries({ queryKey: ["/api/incidents"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/students"] })
      ]);
      
      setHasUnsavedChanges(false);
      
      // Navigate to incident history page immediately after successful submission
      setLocation("/history");
    } catch (error) {
      console.error("[RecordIncident] Error saving incident:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Assisted Recording
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left: Chatbot */}
        <ChatbotRecordingInterface
          studentId={(params as { studentId: string }).studentId}
          studentName={student.name}
          onFormGenerated={handleFormGenerated}
          formData={formData}
          onFormUpdate={handleFormUpdate}
        />

        {/* Right: Form */}
        <div className="space-y-4">
          {showAutoFillNotification && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Form Auto-Filled!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI has analyzed the conversation and filled the form below. Please review and edit if needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData ? (
            <ABCFormEdit
              data={formData}
              onSave={handleSaveEdit}
              onCancel={() => {}}
              onDelete={formData.status === "draft" && formData.id ? handleDeleteIncident : undefined}
              activeEditFields={activeEditFields}
              onActiveEditFieldsChange={setActiveEditFields}
              updatedFields={updatedFields}
              signatureName={signatureName}
              onSignatureNameChange={setSignatureName}
              onSaveDraft={handleSaveDraft}
              onSignAndSave={handleSignAndSave}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onClearForm={handleClearForm}
            />
          ) : (
            <Card className="flex items-center justify-center" style={{ height: 'calc(100vh - 280px)', minHeight: '600px', overflow: 'auto' }}>
              <CardContent className="text-center flex flex-col items-center">
                <img 
                  src="/assets/form preview illustration.png" 
                  alt="Form Preview" 
                  className="w-48 h-48 object-contain mb-4"
                />
                <h3 className="font-semibold mb-2">Start Chatting to Generate Form</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Describe the incident in the chat, and I'll automatically fill out the ABC form for you in real-time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
