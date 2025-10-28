import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, ArrowRight, Users } from "lucide-react";

type ApiStudent = { 
  id: number; 
  name: string; 
  grade: string | null;
  photoUrl?: string;
};

export default function RecordIncidentSelect() {
  const [, setLocation] = useLocation();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch students from API
  const { data: students = [], isLoading } = useQuery<ApiStudent[]>({
    queryKey: ["/api/students"],
  });

  const handleContinue = () => {
    if (selectedStudentId) {
      setLocation(`/record/${selectedStudentId}`);
    }
  };

  const selectedStudent = students.find(s => String(s.id) === selectedStudentId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Record Incident</h1>
        <p className="text-muted-foreground mt-1">
          Select a student to begin recording a behavioral incident
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Student
          </CardTitle>
          <CardDescription>
            Choose the student involved in the incident you want to document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading students..." : "Select a student"} />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 && !isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No students found. Add students first.
                  </div>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                        {student.grade && (
                          <span className="text-muted-foreground text-xs">
                            (Grade {student.grade})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.grade ? `Grade ${selectedStudent.grade}` : 'Grade not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleContinue}
              disabled={!selectedStudentId}
              className="flex-1"
              size="lg"
            >
              <Mic className="h-4 w-4 mr-2" />
              Continue to Record Incident
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {!selectedStudentId && (
            <p className="text-xs text-muted-foreground text-center">
              Please select a student to continue
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground mb-2">
              You can also record incidents directly from:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Student profile pages (click on a student card)</li>
              <li>My Students page (click "Record Incident" on any student)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
