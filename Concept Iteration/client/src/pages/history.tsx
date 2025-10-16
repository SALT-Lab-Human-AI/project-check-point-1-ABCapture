import { useState } from "react";
import { IncidentHistoryTable } from "@/components/incident-history-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

// TODO: Remove mock data
const mockStudents = [
  { id: "1", name: "Emma Johnson", grade: "3", incidentCount: 5, lastIncident: "2 days ago" },
  { id: "2", name: "Liam Martinez", grade: "4", incidentCount: 3, lastIncident: "1 day ago" },
  { id: "3", name: "Olivia Chen", grade: "3", incidentCount: 7, lastIncident: "Today" },
];

const mockIncidents = [
  {
    id: "1",
    studentName: "Emma Johnson",
    date: "Oct 15, 2025",
    time: "10:30 AM",
    incidentType: "Physical Aggression",
    functionOfBehavior: ["Escape/Avoidance", "Obtain Tangible"],
    status: "signed" as const,
  },
  {
    id: "2",
    studentName: "Liam Martinez",
    date: "Oct 14, 2025",
    time: "2:15 PM",
    incidentType: "Verbal Outburst",
    functionOfBehavior: ["Attention Seeking"],
    status: "draft" as const,
  },
  {
    id: "3",
    studentName: "Olivia Chen",
    date: "Oct 13, 2025",
    time: "9:45 AM",
    incidentType: "Property Destruction",
    functionOfBehavior: ["Sensory Stimulation"],
    status: "signed" as const,
  },
  {
    id: "4",
    studentName: "Emma Johnson",
    date: "Oct 12, 2025",
    time: "1:20 PM",
    incidentType: "Verbal Outburst",
    functionOfBehavior: ["Escape/Avoidance"],
    status: "signed" as const,
  },
  {
    id: "5",
    studentName: "Noah Williams",
    date: "Oct 11, 2025",
    time: "11:05 AM",
    incidentType: "Noncompliance",
    functionOfBehavior: ["Attention Seeking"],
    status: "signed" as const,
  },
];

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredIncidents = mockIncidents.filter((incident) => {
    const matchesSearch = incident.studentName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all recorded incidents
        </p>
      </div>

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

      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No incidents found.</p>
        </div>
      ) : (
        <>
          <IncidentHistoryTable
            incidents={filteredIncidents}
            onViewIncident={(id) => console.log("View incident:", id)}
          />
          <div className="text-sm text-muted-foreground">
            Showing {filteredIncidents.length} of {mockIncidents.length} total incidents
          </div>
        </>
      )}
    </div>
  );
}
