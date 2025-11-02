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
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivacy } from "@/contexts/privacy-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onEditIncident: (incidentId: string) => void;
  onDeleteIncident: (incidentId: string) => void;
}

export function IncidentHistoryTable({
  incidents,
  onViewIncident,
  onEditIncident,
  onDeleteIncident,
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-actions-${incident.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewIncident(incident.id)}
                        data-testid={`menu-view-${incident.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEditIncident(incident.id)}
                        data-testid={`menu-edit-${incident.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteIncident(incident.id)}
                        className="text-destructive focus:text-destructive"
                        data-testid={`menu-delete-${incident.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
