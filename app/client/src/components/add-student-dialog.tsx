import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";

interface AddStudentDialogProps {
  onAddStudent: (student: {
    name: string;
    grade: string;
    notes: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
  }) => void;
}

export function AddStudentDialog({ onAddStudent }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddStudent({ 
        name, 
        grade, 
        notes, 
        parentFirstName, 
        parentLastName, 
        parentEmail 
      });
      setName("");
      setGrade("");
      setNotes("");
      setParentFirstName("");
      setParentLastName("");
      setParentEmail("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-student">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a student to your classroom roster.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student name"
                data-testid="input-student-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., 3"
                data-testid="input-student-grade"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the student (optional)"
                data-testid="input-student-notes"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-base font-medium">Guardian Information *</Label>
              <div className="space-y-2">
                <Label htmlFor="parentFirstName">Guardian First Name *</Label>
                <Input
                  id="parentFirstName"
                  value={parentFirstName}
                  onChange={(e) => setParentFirstName(e.target.value)}
                  placeholder="Enter guardian first name"
                  data-testid="input-parent-first-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentLastName">Guardian Last Name *</Label>
                <Input
                  id="parentLastName"
                  value={parentLastName}
                  onChange={(e) => setParentLastName(e.target.value)}
                  placeholder="Enter guardian last name"
                  data-testid="input-parent-last-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Guardian Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="Enter guardian email address"
                  data-testid="input-parent-email"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-student">
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
