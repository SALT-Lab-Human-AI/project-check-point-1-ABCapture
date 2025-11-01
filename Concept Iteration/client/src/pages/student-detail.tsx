import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertTriangle,
  Mail,
  Users,
  Share2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePrivacy } from "@/contexts/privacy-context";

type ApiStudent = { id: number; name: string; grade: string | null; userId: string; createdAt: string; photoUrl?: string };
type ApiIncident = {
  id: number;
  studentId: number;
  date: string;
  time: string;
  summary: string;
  incidentType: string;
  location?: string;
  createdAt: string;
};
type ApiParent = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export default function StudentDetail() {
  const { studentId } = useParams();
  const [, setLocation] = useLocation();
  const { blurText, blurInitials } = usePrivacy();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ApiIncident | null>(null);

  const shareIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, parentEmails }: { incidentId: number; parentEmails: string[] }) => {
      const res = await apiRequest("POST", `/api/incidents/${incidentId}/share`, { parentEmails });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Incident Shared",
        description: data.note || `Incident shared with ${data.recipients} guardian(s)`,
      });
      setShareDialogOpen(false);
      setSelectedIncident(null);
    },
    onError: (error: any) => {
      toast({
        title: "Share Failed",
        description: error.message || "Failed to share incident",
        variant: "destructive",
      });
    },
  });

  // Fetch student data from API
  const { data: student, isLoading: studentLoading } = useQuery<ApiStudent>({
    queryKey: ["/api/students", studentId],
    enabled: !!studentId,
  });

  // Fetch incidents for this student
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<ApiIncident[]>({
    queryKey: [`/api/incidents?studentId=${studentId}`],
    enabled: !!studentId,
  });

  // Fetch parents for this student
  const { data: parents = [], isLoading: parentsLoading } = useQuery<ApiParent[]>({
    queryKey: [`/api/students/${studentId}/parents`],
    enabled: !!studentId,
  });

  if (studentLoading || incidentsLoading || parentsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8">
          <p className="text-muted-foreground">Loading student data...</p>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8">
          <p className="text-muted-foreground">Student not found</p>
        </Card>
      </div>
    );
  }

  // Calculate incident statistics
  const incidentCount = incidents.length;
  const lastIncident = incidents[0] ? new Date(incidents[0].createdAt).toLocaleDateString() : "No incidents";
  const status = incidentCount > 5 ? "critical" : incidentCount > 2 ? "elevated" : "calm";

  // Calculate behavior trend data (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return date.toISOString().split('T')[0];
  });

  const behaviorTrendData = last14Days.map(date => {
    const count = incidents.filter(inc => inc.date === date).length;
    return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), incidents: count };
  });

  // Calculate behavior type distribution
  const typeCount: Record<string, number> = {};
  incidents.forEach(inc => {
    typeCount[inc.incidentType] = (typeCount[inc.incidentType] || 0) + 1;
  });
  const behaviorTypeData = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

  // Get recent incidents (last 3)
  const recentIncidents = incidents.slice(0, 3);

  const statusColors = {
    calm: "bg-chart-2",
    elevated: "bg-chart-3",
    critical: "bg-destructive",
  };

  const initials = blurInitials(student.name);
  const displayName = blurText(student.name);

  // Calculate week-over-week change
  const thisWeekTotal = behaviorTrendData.slice(-7).reduce((sum, day) => sum + day.incidents, 0);
  const lastWeekTotal = behaviorTrendData.slice(0, 7).reduce((sum, day) => sum + day.incidents, 0);
  const weekOverWeekChange = lastWeekTotal === 0 
    ? (thisWeekTotal > 0 ? 100 : 0) 
    : ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
  const isDecreasing = weekOverWeekChange < 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/students")}
          data-testid="button-back-to-students"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Individual progress and incident tracking
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6 flex-wrap">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold" data-testid="text-student-name">
                  {displayName}
                </h2>
                <Badge variant="outline" className={`${statusColors[status]} text-white border-0`}>
                  {status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">Grade {student.grade || 'N/A'}</p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => setLocation(`/record/${studentId}`)}
                  data-testid="button-record-incident"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record New Incident
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/history?student=${studentId}`)}
                  data-testid="button-view-all-incidents"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Incidents
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Guardian Information</CardTitle>
            </div>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={incidents.length === 0}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Incident with Guardian
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share Incident with Guardian</DialogTitle>
                  <DialogDescription>
                    Select an incident to share with {displayName}'s guardian(s) via email.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Select Incident</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {incidents.map((incident) => (
                        <div
                          key={incident.id}
                          onClick={() => setSelectedIncident(incident)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedIncident?.id === incident.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {incident.incidentType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(incident.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{incident.summary}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedIncident && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-3">Recipients</h4>
                      {parents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No guardians linked to this student yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {parents.map((parent) => (
                            <div key={parent.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {parent.firstName} {parent.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{parent.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShareDialogOpen(false);
                        setSelectedIncident(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedIncident || parents.length === 0 || shareIncidentMutation.isPending}
                      onClick={() => {
                        if (selectedIncident) {
                          const parentEmails = parents.map(p => p.email);
                          shareIncidentMutation.mutate({
                            incidentId: selectedIncident.id,
                            parentEmails,
                          });
                        }
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {shareIncidentMutation.isPending ? "Sending..." : "Share via Email"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {parents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guardians linked to this student yet.</p>
          ) : (
            <div className="space-y-3">
              {parents.map((parent) => (
                <div key={parent.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(parent.firstName?.[0] || '') + (parent.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {parent.firstName} {parent.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{parent.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-incidents">
              {incidentCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            {isDecreasing ? (
              <TrendingDown className="h-4 w-4 text-chart-1" />
            ) : (
              <TrendingUp className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold" data-testid="text-week-incidents">
                {thisWeekTotal}
              </div>
              <div className={`text-sm font-semibold ${isDecreasing ? 'text-chart-1' : 'text-destructive'}`}>
                {isDecreasing ? '↓' : '↑'} {Math.abs(weekOverWeekChange).toFixed(0)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. last week ({lastWeekTotal})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Incident</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-last-incident">
              {lastIncident}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent event
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Behavior Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily incident count over the last 14 days
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={behaviorTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behavior Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution by incident type
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behaviorTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="type"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest behavioral events
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIncidents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No incidents recorded yet</p>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`incident-${incident.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{incident.incidentType}</Badge>
                      {incident.location && (
                        <span className="text-sm text-muted-foreground">
                          {incident.location}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{incident.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(incident.date).toLocaleDateString()}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{incident.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
