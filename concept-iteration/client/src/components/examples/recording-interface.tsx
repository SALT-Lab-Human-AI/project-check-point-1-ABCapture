import { RecordingInterface } from "../recording-interface";

export default function RecordingInterfaceExample() {
  return (
    <RecordingInterface
      studentName="Emma Johnson"
      onSubmit={(transcript) => console.log("Submitted transcript:", transcript)}
      onCancel={() => console.log("Cancelled recording")}
    />
  );
}
