import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatbotRecordingInterface } from "@/components/chatbot-recording-interface";
import { ABCFormEdit } from "@/components/abc-form-edit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch students from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });

  const student = students.find((s) => String(s.id) === params?.studentId);

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
      toast({
        title: "Success!",
        description: "Incident recorded successfully",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      // Redirect to student detail page
      setTimeout(() => {
        setLocation(`/students/${params?.studentId}`);
      }, 1000);
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
        signature: "Digital Signature",
        status: "signed",
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

  const handleSaveEdit = (updatedData: ABCFormData) => {
    console.log("[RecordIncident] Saving edited form:", updatedData);
    setFormData(updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleClearForm = () => {
    if (confirm("Are you sure you want to clear the form? This will remove all auto-filled data.")) {
      setFormData(null);
      toast({
        title: "Form Cleared",
        description: "You can start over by describing the incident in the chat.",
      });
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Chatbot */}
        <ChatbotRecordingInterface
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
            />
          ) : formData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ABC Incident Form</CardTitle>
                  <div className="flex gap-2">
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
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="bg-chart-1 text-white rounded-md px-2 py-1 text-xs">A</span>
                    Antecedent
                  </h3>
                  <p className="text-sm pl-9 whitespace-pre-wrap">
                    {formData.antecedent || "Not yet filled"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="bg-chart-2 text-white rounded-md px-2 py-1 text-xs">B</span>
                    Behavior
                  </h3>
                  <p className="text-sm pl-9 whitespace-pre-wrap">
                    {formData.behavior || "Not yet filled"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="bg-chart-3 text-white rounded-md px-2 py-1 text-xs">C</span>
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

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSaveIncident}
                    disabled={isSaving || !formData.antecedent || !formData.behavior || !formData.consequence}
                    className="w-full"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Incident...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Incident
                      </>
                    )}
                  </Button>
                  {(!formData.antecedent || !formData.behavior || !formData.consequence) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please ensure all ABC fields are filled before saving
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
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
