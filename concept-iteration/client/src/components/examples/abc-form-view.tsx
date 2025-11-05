import { ABCFormView } from "../abc-form-view";

export default function ABCFormViewExample() {
  const sampleData = {
    id: "1",
    studentName: "Emma Johnson",
    date: "October 15, 2025",
    time: "10:30 AM",
    summary: "Student displayed verbal outburst and physical aggression after another student took their materials without permission during independent work time.",
    antecedent: "Student was working independently on a math assignment. Another student took their pencil without asking permission.",
    behavior: "Student stood up from their seat, shouted 'Give it back!' at the other student, and pushed the other student's desk, causing materials to fall to the floor.",
    consequence: "Teacher redirected the student to a calm-down area. Student took 5 minutes to regulate. Other student returned the pencil and apologized. Student was able to complete work after return to seat.",
    incidentType: "Physical Aggression",
    functionOfBehavior: ["Escape/Avoidance", "Obtain Tangible"],
    status: "draft" as const,
  };

  return (
    <ABCFormView
      data={sampleData}
      onSign={() => console.log("Form signed")}
      onEdit={() => console.log("Edit form")}
    />
  );
}
