import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Tag, Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ABCFormData {
  id: string;
  studentName: string;
  date: string;
  time: string;
  summary: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  incidentType: string;
  functionOfBehavior: string[];
  status: "draft" | "signed";
}

interface ABCFormViewProps {
  data: ABCFormData;
  onSign?: () => void;
  onEdit?: () => void;
}

export function ABCFormView({ data, onSign, onEdit }: ABCFormViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl">ABC Incident Form</CardTitle>
            <p className="text-muted-foreground mt-1">Student: {data.studentName}</p>
          </div>
          <Badge variant={data.status === "signed" ? "default" : "secondary"}>
            {data.status === "signed" ? "Signed" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium" data-testid="text-incident-date">{data.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium" data-testid="text-incident-time">{data.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline">{data.incidentType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Function:</span>
            <div className="flex gap-1 flex-wrap">
              {data.functionOfBehavior.map((func) => (
                <Badge key={func} variant="outline" className="text-xs">
                  {func}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
            {data.summary}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="bg-chart-1 text-primary-foreground rounded-md px-2 py-1 text-sm">A</span>
              Antecedent
            </h3>
            <p className="text-sm pl-9">{data.antecedent}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="bg-chart-2 text-white rounded-md px-2 py-1 text-sm">B</span>
              Behavior
            </h3>
            <p className="text-sm pl-9">{data.behavior}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="bg-chart-3 text-white rounded-md px-2 py-1 text-sm">C</span>
              Consequence
            </h3>
            <p className="text-sm pl-9">{data.consequence}</p>
          </div>
        </div>
      </CardContent>
      {(onSign || onEdit) && data.status === "draft" && (
        <CardFooter className="flex gap-2 justify-end">
          {onEdit && (
            <Button variant="outline" onClick={onEdit} data-testid="button-edit">
              Edit
            </Button>
          )}
          {onSign && (
            <Button onClick={onSign} data-testid="button-sign">
              Sign & Save
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
