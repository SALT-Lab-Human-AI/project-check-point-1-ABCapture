import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IncidentHistoryTable } from "@/components/incident-history-table";
import { IncidentDetailModal } from "@/components/incident-detail-modal";
import { ABCFormEdit } from "@/components/abc-form-edit";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [behaviorTypeFilter, setBehaviorTypeFilter] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [deleteIncidentId, setDeleteIncidentId] = useState<string | null>(null);

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

  const handleSignIncident = (incidentId: number, signature: string) => {
    signIncidentMutation.mutate({ incidentId, signature });
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

  const handleEditIncident = async (incidentId: string) => {
    try {
      // Fetch full incident data from API
      const res = await apiRequest("GET", `/api/incidents/${incidentId}`);
      const fullIncident = await res.json();
      
      const student = students.find(s => s.id === fullIncident.studentId);
      setEditingIncident({
        id: String(fullIncident.id),
        studentName: student?.name || "Unknown Student",
        date: new Date(fullIncident.date).toLocaleDateString(),
        time: fullIncident.time,
        summary: fullIncident.summary || "",
        antecedent: fullIncident.antecedent || "",
        behavior: fullIncident.behavior || "",
        consequence: fullIncident.consequence || "",
        incidentType: fullIncident.incidentType,
        functionOfBehavior: fullIncident.functionOfBehavior || [],
        status: fullIncident.status as "draft" | "signed",
        signature: fullIncident.signature,
        signedAt: fullIncident.signedAt,
      });
      setIsEditModalOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load incident data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncident = (incidentId: string) => {
    setDeleteIncidentId(incidentId);
  };

  const confirmDelete = useMutation({
    mutationFn: async (incidentId: string) => {
      await apiRequest("DELETE", `/api/incidents/${incidentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Incident Deleted",
        description: "The incident has been permanently deleted.",
      });
      // Invalidate all incident-related queries to update both history and student dashboards
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setDeleteIncidentId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete incident",
        variant: "destructive",
      });
    },
  });

  const saveEditedIncident = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/incidents/${data.id}`, {
        summary: data.summary,
        antecedent: data.antecedent,
        behavior: data.behavior,
        consequence: data.consequence,
        incidentType: data.incidentType,
        functionOfBehavior: data.functionOfBehavior,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Incident Updated",
        description: "The incident has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setIsEditModalOpen(false);
      setEditingIncident(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update incident",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = (updatedData: any) => {
    saveEditedIncident.mutate(updatedData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all recorded incidents
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
                onEditIncident={handleEditIncident}
                onDeleteIncident={handleDeleteIncident}
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
      />

      {/* Edit Incident Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {editingIncident && (
            <div className="overflow-y-auto max-h-[90vh]">
              <ABCFormEdit
                data={editingIncident}
                onSave={handleSaveEdit}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingIncident(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIncidentId} onOpenChange={() => setDeleteIncidentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this incident report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIncidentId && confirmDelete.mutate(deleteIncidentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
