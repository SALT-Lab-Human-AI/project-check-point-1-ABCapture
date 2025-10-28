import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IncidentHistoryTable } from "@/components/incident-history-table";
import { IncidentDetailModal } from "@/components/incident-detail-modal";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch students and incidents from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });
  
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<ApiIncident[]>({
    queryKey: ["/api/incidents"],
  });

  // Map incidents to include student names
  const incidentsWithStudentNames = incidents.map(incident => {
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
      />
    </div>
  );
}
