import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStudentAvatar } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  AlertTriangle, 
  Plus,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";

type ApiStudent = { id: number; name: string; grade: string; photoUrl?: string; notes?: string };
type ApiIncident = {
  id: number;
  studentId: number;
  studentName?: string;
  date: string;
  time: string;
  incidentType: string;
  status?: string;
  createdAt: string;
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch real data from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });
  
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<ApiIncident[]>({
    queryKey: ["/api/incidents"],
  });

  // Fetch all incidents (same as history page for consistency)
  const { data: allIncidents = [] } = useQuery<ApiIncident[]>({
    queryKey: ["/api/incidents"],
  });

  const isLoading = studentsLoading || incidentsLoading;

  // Filter for drafts and combine with student names and photos (same logic as history)
  const draftIncidentsWithNames = (Array.isArray(allIncidents) ? allIncidents : [])
    .filter((incident: ApiIncident) => incident.status === 'draft')
    .map((incident: ApiIncident) => {
      const student = students.find(s => s.id === incident.studentId);
      return {
        ...incident,
        studentName: student?.name || incident.studentName || `Student ${incident.studentId}`,
        studentPhotoUrl: student?.photoUrl
      };
    });

  // Calculate real metrics
  const totalStudents = students.length;
  const totalIncidents = incidents.length;

  // Calculate incidents over last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return date;
  });

  const incidentTrendData = last14Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const count = incidents.filter(inc => inc.date === dateStr).length;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      incidents: count,
    };
  });

  // Week over week comparison
  const thisWeekTotal = incidentTrendData.slice(-7).reduce((sum, day) => sum + day.incidents, 0);
  const lastWeekTotal = incidentTrendData.slice(0, 7).reduce((sum, day) => sum + day.incidents, 0);
  const weekOverWeekChange = lastWeekTotal === 0 
    ? (thisWeekTotal > 0 ? 100 : 0) 
    : ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
  const isDecreasing = weekOverWeekChange < 0;

  // Calculate behavior type distribution
  const behaviorTypeCounts: Record<string, number> = {};
  incidents.forEach(inc => {
    behaviorTypeCounts[inc.incidentType] = (behaviorTypeCounts[inc.incidentType] || 0) + 1;
  });
  
  const behaviorTypeData = Object.entries(behaviorTypeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // Calculate time distribution (by hour)
  const timeHourCounts: Record<string, number> = {};
  incidents.forEach(inc => {
    try {
      const hour = parseInt(inc.time.split(':')[0]);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const timeKey = `${displayHour} ${period}`;
      timeHourCounts[timeKey] = (timeHourCounts[timeKey] || 0) + 1;
    } catch (e) {
      // Skip invalid times
    }
  });

  const timeHeatmapData = Object.entries(timeHourCounts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
      const aHour = parseInt(a.time);
      const bHour = parseInt(b.time);
      return aHour - bHour;
    });

  // Calculate students with incidents in last 7 days (for yellow badge)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const studentsWithRecentIncidents = new Set<number>();
  incidents.forEach(inc => {
    const incidentDate = new Date(inc.createdAt);
    if (incidentDate >= sevenDaysAgo) {
      studentsWithRecentIncidents.add(inc.studentId);
    }
  });
  const studentsWithIncidentsThisWeek = studentsWithRecentIncidents.size;

  const handleSendToSpecialist = () => {
    toast({
      title: "Report Sent",
      description: "Summary has been sent to the specialist.",
    });
  };

  const handleSendToGuardian = () => {
    toast({
      title: "Report Sent",
      description: "Guardian update report has been sent successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Weekly overview (unless otherwise stated) of incidents and student status
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-students">
                  {totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalStudents === 0 ? "Add your first student" : "Active in classroom"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-incidents">
                  {totalIncidents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalIncidents === 0 ? "No incidents yet" : "Last 14 days"}
                </p>
              </CardContent>
            </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Comparison</CardTitle>
            {isDecreasing ? (
              <TrendingDown className="h-4 w-4 text-chart-1" />
            ) : (
              <TrendingUp className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold" data-testid="text-week-comparison">
                {thisWeekTotal}
              </div>
              <div className={`flex items-center gap-1 ${isDecreasing ? 'text-chart-1' : 'text-destructive'}`}>
                {isDecreasing ? (
                  <ArrowDown className="h-5 w-5 animate-pulse" data-testid="icon-trend-down" />
                ) : (
                  <ArrowUp className="h-5 w-5 animate-pulse" data-testid="icon-trend-up" />
                )}
                <span className="text-sm font-semibold">
                  {Math.abs(weekOverWeekChange).toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. last week ({lastWeekTotal})
            </p>
          </CardContent>
        </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500" data-testid="text-critical-students">
                  {studentsWithIncidentsThisWeek}
                </div>
                <p className="text-xs text-muted-foreground">
                  {studentsWithIncidentsThisWeek === 0 ? "No incidents this week" : "Students with incidents"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Record Incident</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a detailed ABC Data report
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Start a new conversation to generate a detailed ABC Data report.
                  </p>
                  <Button 
                    onClick={() => setLocation("/")} 
                    className="w-full"
                    data-testid="button-quick-log"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record New Incident
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  To-Do
                  {draftIncidentsWithNames.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      {draftIncidentsWithNames.length}
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete and sign incident drafts
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {draftIncidentsWithNames.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <p className="text-sm text-muted-foreground text-center">
                      All caught up! No pending drafts to complete.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You have {draftIncidentsWithNames.length} draft{draftIncidentsWithNames.length !== 1 ? 's' : ''} to complete:
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {draftIncidentsWithNames.slice(0, 5).map((incident) => (
                        <div 
                          key={incident.id} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => setLocation(`/record/${incident.studentId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <Avatar className="h-6 w-6">
                              <AvatarImage 
                                src={incident.studentPhotoUrl || getStudentAvatar(incident.studentId)} 
                                alt={incident.studentName} 
                              />
                              <AvatarFallback className="text-xs">
                                {incident.studentName ? 
                                  incident.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 
                                  `S${incident.studentId}`
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {incident.studentName || `Student ${incident.studentId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {incident.date} at {incident.time}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Complete
                          </Button>
                        </div>
                      ))}
                      {draftIncidentsWithNames.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          And {draftIncidentsWithNames.length - 5} more...
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={() => setLocation("/history")} 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      View All Drafts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {totalIncidents === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No incident data yet. Start recording incidents to see insights and analytics!
                  </p>
                  <Button onClick={() => setLocation("/students")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Incidents by Behavior Type</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Distribution of incident types (last 14 days)
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
                            formatter={(value: any, name: string) => {
                              if (name === 'count') return [value, 'Incidents'];
                              if (name === 'percentage') return [`${value}%`, 'Percentage'];
                              return [value, name];
                            }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      When incidents most frequently occur
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeHeatmapData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="time"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            formatter={(value: any) => [value, 'Incidents']}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--chart-2))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Frequency Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daily incident count over the last 14 days
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={incidentTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
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
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
