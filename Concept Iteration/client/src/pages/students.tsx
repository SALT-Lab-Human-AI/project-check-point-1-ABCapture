import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StudentCard } from "@/components/student-card";
import { AddStudentDialog } from "@/components/add-student-dialog";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ApiStudent = { id: number; name: string; grade: string | null };
type ApiIncident = { id: number; studentId: number; date: string; createdAt: string };

export default function Students() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const { data: students = [] } = useQuery<ApiStudent[]>({ queryKey: ["/api/students"] });
  
  // Fetch all incidents to calculate counts per student
  const { data: allIncidents = [] } = useQuery<ApiIncident[]>({ 
    queryKey: ["/api/incidents"],
  });

  const addStudent = useMutation({
    mutationFn: async (student: { name: string; grade: string; classroom: string; notes: string }) => {
      console.log("Frontend: Adding student:", student);
      
      try {
        const res = await apiRequest("POST", "/api/students", { 
          name: student.name, 
          grade: student.grade || null,
          classroom: student.classroom || null
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Frontend: Server error response:", errorData);
          throw new Error(errorData.message || "Failed to add student");
        }
        
        const result = await res.json();
        console.log("Frontend: Student created:", result);
        return result;
      } catch (error) {
        console.error("Frontend: Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log("Frontend: Mutation successful, invalidating queries");
      await queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: (error) => {
      console.error("Frontend: Error adding student:", error);
      alert(`Failed to add student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Get unique grades for filter
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade).filter(Boolean)));

  const filteredStudents = students
    .filter((s) => {
      // Filter by grade if administrator
      if (user?.role === "administrator" && gradeFilter !== "all") {
        return s.grade === gradeFilter;
      }
      return true;
    })
    .map((s) => {
      // Calculate incident count for this student
      const studentIncidents = allIncidents.filter(inc => inc.studentId === s.id);
      const incidentCount = studentIncidents.length;
      
      // Calculate last incident date
      let lastIncident: string | undefined;
      if (studentIncidents.length > 0) {
        const sortedIncidents = [...studentIncidents].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastDate = new Date(sortedIncidents[0].createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) lastIncident = "Today";
        else if (diffDays === 1) lastIncident = "Yesterday";
        else if (diffDays < 7) lastIncident = `${diffDays} days ago`;
        else lastIncident = lastDate.toLocaleDateString();
      }
      
      // Calculate status based on incident frequency
      const status: "calm" | "elevated" | "critical" = 
        incidentCount > 5 ? "critical" : 
        incidentCount > 2 ? "elevated" : 
        "calm";
      
      return {
        id: String(s.id),
        name: s.name,
        grade: s.grade ?? undefined,
        incidentCount,
        lastIncident,
        status,
      };
    })
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddStudent = (student: { name: string; grade: string; classroom: string; notes: string }) => {
    addStudent.mutate(student);
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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-students"
          />
        </div>
        
        {user?.role === "administrator" && uniqueGrades.length > 0 && (
          <div className="w-64">
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger data-testid="select-grade-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade!}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
