import { StudentCard } from "../student-card";

export default function StudentCardExample() {
  return (
    <div className="max-w-sm">
      <StudentCard
        id="1"
        name="Emma Johnson"
        grade="3"
        incidentCount={5}
        lastIncident="2 days ago"
        onRecordIncident={(id) => console.log("Record incident for student:", id)}
      />
    </div>
  );
}
