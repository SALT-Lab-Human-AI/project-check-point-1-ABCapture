import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  Send,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useLocation } from "wouter";

// Mock data for trend visualization (14 days)
const incidentTrendData = [
  { date: "Oct 1", incidents: 2 },
  { date: "Oct 2", incidents: 1 },
  { date: "Oct 3", incidents: 3 },
  { date: "Oct 4", incidents: 2 },
  { date: "Oct 5", incidents: 0 },
  { date: "Oct 6", incidents: 1 },
  { date: "Oct 7", incidents: 4 },
  { date: "Oct 8", incidents: 2 },
  { date: "Oct 9", incidents: 1 },
  { date: "Oct 10", incidents: 3 },
  { date: "Oct 11", incidents: 2 },
  { date: "Oct 12", incidents: 1 },
  { date: "Oct 13", incidents: 2 },
  { date: "Oct 14", incidents: 3 },
];

// Week over week data
const thisWeekTotal = incidentTrendData.slice(-7).reduce((sum, day) => sum + day.incidents, 0);
const lastWeekTotal = incidentTrendData.slice(0, 7).reduce((sum, day) => sum + day.incidents, 0);
const weekOverWeekChange = lastWeekTotal === 0 
  ? (thisWeekTotal > 0 ? 100 : 0) 
  : ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;

// Mock data for behavior types
const behaviorTypeData = [
  { type: "Physical Aggression", count: 8, percentage: 30 },
  { type: "Noncompliance", count: 7, percentage: 25 },
  { type: "Verbal Outburst", count: 5, percentage: 19 },
  { type: "Property Destruction", count: 4, percentage: 15 },
  { type: "Self-Injury", count: 3, percentage: 11 },
];

// Mock data for time heatmap (hourly distribution)
const timeHeatmapData = [
  { time: "8 AM", count: 1 },
  { time: "9 AM", count: 3 },
  { time: "10 AM", count: 6 },
  { time: "11 AM", count: 5 },
  { time: "12 PM", count: 2 },
  { time: "1 PM", count: 4 },
  { time: "2 PM", count: 3 },
  { time: "3 PM", count: 3 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const mockStats = {
  totalStudents: 6,
  totalIncidents: 27,
  avgPerDay: 1.9,
  criticalStudents: 1,
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isDecreasing = weekOverWeekChange < 0;

  const handleSendToSpecialist = () => {
    toast({
      title: "Report Sent",
      description: "Summary has been sent to the specialist.",
    });
  };

  const handleSendToParent = () => {
    toast({
      title: "Report Sent",
      description: "Parent update report has been sent successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of incidents and student status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-students">
              {mockStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Active in classroom
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
              {mockStats.totalIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 14 days
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
            <CardTitle className="text-sm font-medium">Critical Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-critical-students">
              {mockStats.criticalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Log</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quickly record a new incident
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Need to document a behavior incident? Start a new conversation to create a detailed ABC form.
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
            <CardTitle>Share Reports</CardTitle>
            <p className="text-sm text-muted-foreground">
              Send formatted summaries to stakeholders
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSendToSpecialist}
              data-testid="button-send-specialist"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Summary to Specialist
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSendToParent}
              data-testid="button-send-parent"
            >
              <Send className="h-4 w-4 mr-2" />
              Parent Update Report
            </Button>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
