import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePrivacy } from "@/contexts/privacy-context";
import { Link } from "wouter";
import { getStudentAvatar } from "@/lib/utils";

interface StudentCardProps {
  id: string;
  name: string;
  grade?: string;
  photoUrl?: string;
  incidentCount: number;
  recentCount?: number;
  lastIncident?: string;
  hasRecentIncident?: boolean;
}

export function StudentCard({
  id,
  name,
  grade,
  photoUrl,
  incidentCount,
  recentCount,
  lastIncident,
  hasRecentIncident = false,
}: StudentCardProps) {
  const { blurText, blurInitials } = usePrivacy();
  const initials = blurInitials(name);
  const displayName = blurText(name);
  const avatarIcon = getStudentAvatar(id);

  // Yellow if incident in last week, green otherwise
  const badgeColor = hasRecentIncident ? "bg-yellow-500 hover:bg-yellow-600" : "bg-chart-2 hover:bg-chart-2/90";

  return (
    <Link href={`/students/${id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`card-student-${id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={photoUrl || avatarIcon} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate" data-testid={`text-student-name-${id}`}>
                  {displayName}
                </h3>
              </div>
              {grade && (
                <p className="text-sm text-muted-foreground">Grade {grade}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={`text-xs text-white border-0 ${badgeColor}`}>
                  {incidentCount} {incidentCount === 1 ? "incident" : "incidents"}
                  {recentCount !== undefined && recentCount < incidentCount && (
                    <span className="ml-1 opacity-75">
                      (last 7 days)
                    </span>
                  )}
                </Badge>
                {recentCount !== undefined && recentCount < incidentCount && (
                  <span className="text-xs text-muted-foreground" title={`${recentCount} incidents in last 7 days, ${incidentCount} total`}>
                    {recentCount} this week
                  </span>
                )}
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
