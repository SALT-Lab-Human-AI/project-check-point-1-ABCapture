import { useState } from "react";
import { useRoute } from "wouter";
import { RecordingInterface } from "@/components/recording-interface";
import { ABCFormView } from "@/components/abc-form-view";
import { ABCFormEdit } from "@/components/abc-form-edit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// TODO: Remove mock data
const mockStudents = [
  { id: "1", name: "Emma Johnson", grade: "3" },
  { id: "2", name: "Liam Martinez", grade: "4" },
  { id: "3", name: "Olivia Chen", grade: "3" },
];

export default function RecordIncident() {
  const [, params] = useRoute("/record/:studentId");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const student = mockStudents.find((s) => s.id === params?.studentId);

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

  const handleSubmitTranscript = (transcript: string) => {
    console.log("Processing transcript:", transcript);
    // TODO: Call Gemini API to generate ABC form
    // Simulating AI processing
    setTimeout(() => {
      const mockFormData = {
        id: Date.now().toString(),
        studentName: student.name,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        summary: transcript,
        antecedent: "Student was working independently on a math assignment. Another student took their pencil without asking permission.",
        behavior: "Student stood up from their seat, shouted 'Give it back!' at the other student, and pushed the other student's desk, causing materials to fall to the floor.",
        consequence: "Teacher redirected the student to a calm-down area. Student took 5 minutes to regulate. Other student returned the pencil and apologized. Student was able to complete work after return to seat.",
        incidentType: "Physical Aggression",
        functionOfBehavior: ["Escape/Avoidance", "Obtain Tangible"],
        status: "draft" as const,
      };
      setFormData(mockFormData);
      setShowForm(true);
      setIsEditing(false);
    }, 1500);
  };

  const handleSignForm = () => {
    console.log("Form signed and saved");
    window.location.href = "/";
  };

  const handleEditForm = () => {
    console.log("Edit form");
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedData: any) => {
    console.log("Saved updated form:", updatedData);
    setFormData(updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/">
        <Button variant="ghost" data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {!showForm ? (
        <RecordingInterface
          studentName={student.name}
          onSubmit={handleSubmitTranscript}
          onCancel={() => (window.location.href = "/")}
        />
      ) : (
        formData && (
          isEditing ? (
            <ABCFormEdit
              data={formData}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ABCFormView
              data={formData}
              onSign={handleSignForm}
              onEdit={handleEditForm}
            />
          )
        )
      )}
    </div>
  );
}
