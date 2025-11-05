import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, Users, Calendar, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Teacher {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  grade: string | null;
  incidentCount: number;
  lastIncidentDate: string | null;
}

export default function TeacherDetail() {
  const [, params] = useRoute("/admin/teachers/:id");
  const teacherId = params?.id;

  const { data: teacher, isLoading: isLoadingTeacher } = useQuery<Teacher>({
    queryKey: [`/api/admin/teachers/${teacherId}`],
    enabled: !!teacherId,
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: [`/api/admin/teachers/${teacherId}/students`],
    enabled: !!teacherId,
  });

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "T";
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Unnamed Teacher";
  };

  if (isLoadingTeacher) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Teacher not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teachers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Teacher Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={teacher.photoUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(teacher.firstName, teacher.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {getFullName(teacher.firstName, teacher.lastName)}
                </CardTitle>
                <p className="text-muted-foreground mt-1">{teacher.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {format(new Date(teacher.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{students?.length || 0} students</span>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Teacher</DropdownMenuItem>
                <DropdownMenuItem>Manage Access</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Remove Teacher
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Students Under {teacher.firstName || "This Teacher"}
        </h2>

        {isLoadingStudents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !students || students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No students assigned</p>
              <p className="text-sm text-muted-foreground">
                This teacher doesn't have any students yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {student.name}
                        </CardTitle>
                        {student.grade && (
                          <Badge variant="outline" className="mt-2">
                            Grade {student.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Incidents</span>
                      </div>
                      <Badge variant="secondary">{student.incidentCount}</Badge>
                    </div>
                    {student.lastIncidentDate && (
                      <div className="text-xs text-muted-foreground">
                        Last incident:{" "}
                        {format(new Date(student.lastIncidentDate), "MMM d, yyyy")}
                      </div>
                    )}
                    <Button className="w-full" variant="outline" size="sm">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
