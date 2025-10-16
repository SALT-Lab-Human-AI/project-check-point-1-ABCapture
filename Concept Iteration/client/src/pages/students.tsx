import { useState } from "react";
import { StudentCard } from "@/components/student-card";
import { AddStudentDialog } from "@/components/add-student-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// TODO: Remove mock data
const mockStudents = [
  { id: "1", name: "Emma Johnson", grade: "3", incidentCount: 5, lastIncident: "2 days ago", status: "elevated" as const },
  { id: "2", name: "Liam Martinez", grade: "4", incidentCount: 3, lastIncident: "1 day ago", status: "calm" as const },
  { id: "3", name: "Olivia Chen", grade: "3", incidentCount: 7, lastIncident: "Today", status: "critical" as const },
  { id: "4", name: "Noah Williams", grade: "2", incidentCount: 2, lastIncident: "1 week ago", status: "calm" as const },
  { id: "5", name: "Ava Rodriguez", grade: "4", incidentCount: 4, lastIncident: "3 days ago", status: "elevated" as const },
  { id: "6", name: "Sophia Davis", grade: "3", incidentCount: 1, lastIncident: "2 weeks ago", status: "calm" as const },
];

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = (student: { name: string; grade: string; notes: string }) => {
    console.log("Add student:", student);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage your classroom roster
          </p>
        </div>
        <AddStudentDialog onAddStudent={handleAddStudent} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-students"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              {...student}
            />
          ))}
        </div>
      )}
    </div>
  );
}
