import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivacy } from "@/contexts/privacy-context";

interface Incident {
  id: string;
  studentName: string;
  studentPhotoUrl?: string;
  date: string;
  time: string;
  incidentType: string;
  functionOfBehavior: string[];
  status: "draft" | "signed";
}

interface IncidentHistoryTableProps {
  incidents: Incident[];
  onViewIncident: (incidentId: string) => void;
}

export function IncidentHistoryTable({
  incidents,
  onViewIncident,
}: IncidentHistoryTableProps) {
  const { blurText, blurInitials } = usePrivacy();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Function</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => {
            const displayName = blurText(incident.studentName);
            const initials = blurInitials(incident.studentName);

            return (
              <TableRow key={incident.id} data-testid={`row-incident-${incident.id}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={incident.studentPhotoUrl} alt={incident.studentName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{displayName}</span>
                  </div>
                </TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell className="font-mono text-sm">{incident.time}</TableCell>
                <TableCell>
                  <Badge variant="outline">{incident.incidentType}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {incident.functionOfBehavior.map((func) => (
                      <Badge key={func} variant="secondary" className="text-xs">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={incident.status === "signed" ? "default" : "secondary"}>
                    {incident.status === "signed" ? "Signed" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewIncident(incident.id)}
                    data-testid={`button-view-${incident.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
