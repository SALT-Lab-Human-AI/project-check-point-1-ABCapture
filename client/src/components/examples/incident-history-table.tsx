import { IncidentHistoryTable } from "../incident-history-table";

export default function IncidentHistoryTableExample() {
  const sampleIncidents = [
    {
      id: "1",
      studentName: "Emma Johnson",
      date: "Oct 15, 2025",
      time: "10:30 AM",
      incidentType: "Physical Aggression",
      functionOfBehavior: ["Escape/Avoidance", "Obtain Tangible"],
      status: "signed" as const,
    },
    {
      id: "2",
      studentName: "Liam Martinez",
      date: "Oct 14, 2025",
      time: "2:15 PM",
      incidentType: "Verbal Outburst",
      functionOfBehavior: ["Attention Seeking"],
      status: "draft" as const,
    },
    {
      id: "3",
      studentName: "Olivia Chen",
      date: "Oct 13, 2025",
      time: "9:45 AM",
      incidentType: "Property Destruction",
      functionOfBehavior: ["Sensory Stimulation"],
      status: "signed" as const,
    },
  ];

  return (
    <IncidentHistoryTable
      incidents={sampleIncidents}
      onViewIncident={(id) => console.log("View incident:", id)}
    />
  );
}
