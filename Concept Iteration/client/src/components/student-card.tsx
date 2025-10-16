import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePrivacy } from "@/contexts/privacy-context";
import { Link } from "wouter";

interface StudentCardProps {
  id: string;
  name: string;
  grade?: string;
  photoUrl?: string;
  incidentCount: number;
  lastIncident?: string;
  status?: "calm" | "elevated" | "critical";
}

export function StudentCard({
  id,
  name,
  grade,
  photoUrl,
  incidentCount,
  lastIncident,
  status = "calm",
}: StudentCardProps) {
  const { blurText, blurInitials } = usePrivacy();
  const statusColors = {
    calm: "bg-chart-2",
    elevated: "bg-chart-3",
    critical: "bg-destructive",
  };
  const initials = blurInitials(name);
  const displayName = blurText(name);

  return (
    <Link href={`/students/${id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`card-student-${id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={photoUrl} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate" data-testid={`text-student-name-${id}`}>
                  {displayName}
                </h3>
                <Badge variant="outline" className={`text-xs ${statusColors[status]} text-white border-0`}>
                  {status}
                </Badge>
              </div>
              {grade && (
                <p className="text-sm text-muted-foreground">Grade {grade}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {incidentCount} {incidentCount === 1 ? "incident" : "incidents"}
                </Badge>
              </div>
              {lastIncident && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last: {lastIncident}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
