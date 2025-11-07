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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

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

  const handleFormUpdate = (updatedFormData: ABCFormData) => {
    console.log("[RecordIncident] 🔄 handleFormUpdate called!");
    console.log("[RecordIncident] Updated form data:", updatedFormData);
    
    setFormData(updatedFormData);
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

  const handleEditForm = () => {
    setIsEditing(true);
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
      setIsEditing(false);
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
    setIsEditing(false);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes Saved",
      description: "Your edits have been saved to the draft.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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

          {isEditing && formData ? (
            <ABCFormEdit
              data={formData}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onDelete={formData.status === "draft" && formData.id ? handleDeleteIncident : undefined}
            />
          ) : formData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ABC Incident Form</CardTitle>
                  <div className="flex gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearForm}
                    >
                      Clear Form
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditForm}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Student: {formData.studentName} • {formData.date} at {formData.time}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(248, 52, 34, 0.08)' }}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <img src={aBlockIcon} alt="A" className="w-6 h-6" />
                    Antecedent
                  </h3>
                  <p className="text-sm pl-9 whitespace-pre-wrap">
                    {formData.antecedent || "Not yet filled"}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(61, 148, 53, 0.08)' }}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <img src={bBlockIcon} alt="B" className="w-6 h-6" />
                    Behavior
                  </h3>
                  <p className="text-sm pl-9 whitespace-pre-wrap">
                    {formData.behavior || "Not yet filled"}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(249, 194, 55, 0.08)' }}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <img src={cBlockIcon} alt="C" className="w-6 h-6" />
                    Consequence
                  </h3>
                  <p className="text-sm pl-9 whitespace-pre-wrap">
                    {formData.consequence || "Not yet filled"}
                  </p>
                </div>

                {formData.summary && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Summary</h3>
                    <p className="text-sm">{formData.summary}</p>
                  </div>
                )}

                {formData.incidentType && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Incident Type</h3>
                    <Badge>{formData.incidentType}</Badge>
                  </div>
                )}

                {formData.functionOfBehavior && formData.functionOfBehavior.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Function of Behavior</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.functionOfBehavior.map((func, idx) => (
                        <Badge key={idx} variant="secondary">{func}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <Label className="text-lg">Signature</Label>
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
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDraft}
                      disabled={isSaving || !formData.antecedent || !formData.behavior || !formData.consequence}
                      variant="outline"
                      className="flex-1"
                      size="lg"
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
                    <Button
                      onClick={handleSignAndSave}
                      disabled={isSaving || !formData.antecedent || !formData.behavior || !formData.consequence || !signatureName.trim()}
                      className="flex-1"
                      size="lg"
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
                  </div>
                  {(!formData.antecedent || !formData.behavior || !formData.consequence) && (
                    <p className="text-xs text-muted-foreground text-center">
                      Please ensure all ABC fields are filled before saving
                    </p>
                  )}
                  {!signatureName.trim() && formData.antecedent && formData.behavior && formData.consequence && (
                    <p className="text-xs text-muted-foreground text-center">
                      Signature required to save incident
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
