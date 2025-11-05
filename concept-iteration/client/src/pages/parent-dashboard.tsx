import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Clock, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with actual API calls
const mockChild = {
  id: "1",
  name: "Emma Johnson",
  grade: "3",
};

const mockIncidents = [
  {
    id: "1",
    date: "January 15, 2024",
    time: "10:30 AM",
    incidentType: "Physical Aggression",
    summary: "Student pushed another student's desk during math class",
    status: "signed",
  },
  {
    id: "2",
    date: "January 10, 2024",
    time: "2:15 PM",
    incidentType: "Verbal Outburst",
    summary: "Student shouted during quiet reading time",
    status: "signed",
  },
];

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Child's Dashboard</h1>
        <p className="text-muted-foreground">View behavioral incidents and progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{mockChild.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{mockChild.grade}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Incidents
          </CardTitle>
          <CardDescription>
            Behavioral incident reports from teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockIncidents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No incidents have been reported
            </p>
          ) : (
            <div className="space-y-4">
              {mockIncidents.map((incident) => (
                <Card key={incident.id} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {incident.date} at {incident.time}
                        </span>
                      </div>
                      <Badge variant="outline">{incident.incidentType}</Badge>
                    </div>
                    <p className="text-sm">{incident.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
