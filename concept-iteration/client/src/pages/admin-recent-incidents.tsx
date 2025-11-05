import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Incident {
  id: number;
  date: string;
  time: string;
  studentId: number;
  studentName: string;
  userId: string;
  teacherName: string;
  incidentType: string;
  status: string;
  createdAt: string;
}

interface Teacher {
  id: string;
  name: string;
}

export default function AdminRecentIncidents() {
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const { data: incidents, isLoading: isLoadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/admin/incidents"],
  });

  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ["/api/admin/teachers-list"],
  });

  // Get unique incident types
  const incidentTypes = useMemo(() => {
    if (!incidents) return [];
    const types = new Set(incidents.map((i) => i.incidentType));
    return Array.from(types).sort();
  }, [incidents]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (!incidents) return [];

    return incidents.filter((incident) => {
      // Teacher filter
      if (teacherFilter !== "all" && incident.userId !== teacherFilter) {
        return false;
      }

      // Incident type filter
      if (incidentTypeFilter !== "all" && incident.incidentType !== incidentTypeFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const incidentDate = new Date(incident.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateRange === "7days" && daysDiff > 7) return false;
        if (dateRange === "30days" && daysDiff > 30) return false;
        if (dateRange === "90days" && daysDiff > 90) return false;
      }

      return true;
    });
  }, [incidents, teacherFilter, incidentTypeFilter, dateRange]);

  // Sort by date (newest first)
  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredIncidents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recent Incidents</h1>
        <p className="text-muted-foreground mt-1">
          View and manage incidents across all teachers and students
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All teachers</SelectItem>
            {teachers?.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={incidentTypeFilter} onValueChange={setIncidentTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {incidentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(teacherFilter !== "all" || incidentTypeFilter !== "all" || dateRange !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setTeacherFilter("all");
              setIncidentTypeFilter("all");
              setDateRange("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoadingIncidents ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : sortedIncidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No incidents found</p>
            <p className="text-sm text-muted-foreground">
              {teacherFilter !== "all" || incidentTypeFilter !== "all" || dateRange !== "all"
                ? "Try adjusting your filters"
                : "No incidents have been recorded yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Incident Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncidents.map((incident) => (
                  <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(incident.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {incident.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${incident.studentId}`}>
                        <span className="font-medium hover:underline cursor-pointer">
                          {incident.studentName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{incident.teacherName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{incident.incidentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={incident.status === "signed" ? "default" : "secondary"}
                      >
                        {incident.status === "signed" ? "Signed" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/students/${incident.studentId}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {sortedIncidents.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {sortedIncidents.length} of {incidents?.length || 0} incidents
        </div>
      )}
    </div>
  );
}
