import { AddStudentDialog } from "../add-student-dialog";

export default function AddStudentDialogExample() {
  return (
    <AddStudentDialog
      onAddStudent={(student) => console.log("New student:", student)}
    />
  );
}
