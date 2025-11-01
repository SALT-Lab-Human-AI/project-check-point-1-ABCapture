import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IncidentHistoryTable } from "@/components/incident-history-table";
import { IncidentDetailModal } from "@/components/incident-detail-modal";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";

type ApiStudent = { id: number; name: string; grade: string | null };
type ApiIncident = {
  id: number;
  studentId: number;
  date: string;
  time: string;
  incidentType: string;
  functionOfBehavior: string[];
  status: string;
  createdAt: string;
};

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const search = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [behaviorTypeFilter, setBehaviorTypeFilter] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Get student ID from URL query parameter
  const studentIdParam = new URLSearchParams(search).get("student");
  const studentFilterId = studentIdParam ? parseInt(studentIdParam, 10) : null;

  const signIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, signature }: { incidentId: number; signature: string }) => {
      const res = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        signature,
        status: 'signed',
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Incident Signed",
        description: "The incident has been signed and finalized.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setIsDetailModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sign Failed",
        description: error.message || "Failed to sign incident",
        variant: "destructive",
      });
    },
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: async (incidentId: number) => {
      try {
        const res = await apiRequest("DELETE", `/api/incidents/${incidentId}`);
        // Check if response is HTML (means route not found or error)
        const text = await res.text();
        
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error("[Delete Incident] Received HTML response instead of JSON - route may not be found");
          throw new Error("Server returned HTML instead of JSON. The delete route may not be working correctly.");
        }
        
        // Try to parse as JSON
        if (text && text.trim()) {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("[Delete Incident] JSON parse error:", e, "Response text:", text.substring(0, 200));
            throw new Error("Invalid response from server");
          }
        }
        // Empty response means success
        return { message: "Incident deleted successfully" };
      } catch (error: any) {
        // Re-throw to trigger onError handler
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Incident Deleted",
        description: "The incident has been deleted successfully.",
      });
      // Force refresh the incidents list - use both invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.refetchQueries({ queryKey: ["/api/incidents"] });
      // Also refresh if filtering by student
      const studentIdParam = new URLSearchParams(search).get("student");
      if (studentIdParam) {
        const studentId = parseInt(studentIdParam, 10);
        queryClient.invalidateQueries({ queryKey: [`/api/incidents?studentId=${studentId}`] });
      }
      setIsDetailModalOpen(false);
      setSelectedIncident(null);
    },
    onError: (error: any) => {
      console.error("[Delete Incident] Error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignIncident = (incidentId: number, signature: string) => {
    signIncidentMutation.mutate({ incidentId, signature });
  };

  const handleDeleteIncident = (incidentId: number) => {
    if (window.confirm("Are you sure you want to delete this incident? This action cannot be undone.")) {
      deleteIncidentMutation.mutate(incidentId);
    }
  };

  // Fetch students and incidents from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });
  
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<ApiIncident[]>({
    queryKey: ["/api/incidents"],
  });

  // Get unique grades for filter
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade).filter(Boolean)));
  
  // Get unique behavior types for filter
  const uniqueBehaviorTypes = Array.from(new Set(incidents.map(i => i.incidentType).filter(Boolean)));

  // Map incidents to include student names and filter by grade and behavior type
  const incidentsWithStudentNames = incidents
    .filter(incident => {
      // Filter by specific student if student ID is in URL
      if (studentFilterId !== null && incident.studentId !== studentFilterId) {
        return false;
      }
      
      // Filter by grade if administrator
      if (user?.role === "administrator" && gradeFilter !== "all") {
        const student = students.find(s => s.id === incident.studentId);
        if (student?.grade !== gradeFilter) return false;
      }
      
      // Filter by behavior type
      if (behaviorTypeFilter !== "all" && incident.incidentType !== behaviorTypeFilter) {
        return false;
      }
      
      return true;
    })
    .map(incident => {
      const student = students.find(s => s.id === incident.studentId);
      return {
        id: String(incident.id),
        studentName: student?.name || "Unknown Student",
      date: new Date(incident.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: incident.time,
      incidentType: incident.incidentType,
      functionOfBehavior: incident.functionOfBehavior,
      status: incident.status as "signed" | "draft",
    };
  });

  // Sort by date (most recent first)
  const sortedIncidents = [...incidentsWithStudentNames].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const filteredIncidents = sortedIncidents.filter((incident) => {
    const matchesSearch = incident.studentName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = studentsLoading || incidentsLoading;

  const handleViewIncident = (incidentId: string) => {
    const incident = incidents.find(inc => String(inc.id) === incidentId);
    if (incident) {
      const student = students.find(s => s.id === incident.studentId);
      setSelectedIncident({
        ...incident,
        studentName: student?.name || "Unknown Student",
      });
      setIsDetailModalOpen(true);
    }
  };

  // Get student name if filtering by specific student
  const filteredStudent = studentFilterId 
    ? students.find(s => s.id === studentFilterId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident History</h1>
        <p className="text-muted-foreground mt-1">
          {filteredStudent 
            ? `Viewing incidents for ${filteredStudent.name}`
            : "View and manage all recorded incidents"}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-incidents"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        
        {user?.role === "administrator" && uniqueGrades.length > 0 && (
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-grade-filter">
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
        )}
        
        {uniqueBehaviorTypes.length > 0 && (
          <Select value={behaviorTypeFilter} onValueChange={setBehaviorTypeFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-behavior-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Behaviors</SelectItem>
              {uniqueBehaviorTypes.map((type) => (
                <SelectItem key={type} value={type!}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!isLoading && (
        <>
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">
                {incidents.length === 0 
                  ? "No incidents recorded yet. Start by recording your first incident!" 
                  : "No incidents match your search criteria."}
              </p>
            </div>
          ) : (
            <>
              <IncidentHistoryTable
                incidents={filteredIncidents}
                onViewIncident={handleViewIncident}
              />
              <div className="text-sm text-muted-foreground">
                Showing {filteredIncidents.length} of {incidents.length} total incidents
              </div>
            </>
          )}
        </>
      )}

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIncident(null);
        }}
        onSign={handleSignIncident}
        onDelete={selectedIncident?.status === 'draft' ? handleDeleteIncident : undefined}
      />
    </div>
  );
}
