import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Tag, Target, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import aBlockIcon from "@assets/A Block.png";
import bBlockIcon from "@assets/B Block.png";
import cBlockIcon from "@assets/C Block.png";

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
  isSaving?: boolean;
}

export function ABCFormView({ data, onSign, onEdit, isSaving = false }: ABCFormViewProps) {
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
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(248, 52, 34, 0.08)' }}>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <img src={aBlockIcon} alt="A" className="w-6 h-6" />
              Antecedent
            </h3>
            <p className="text-sm pl-9">{data.antecedent}</p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(61, 148, 53, 0.08)' }}>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <img src={bBlockIcon} alt="B" className="w-6 h-6" />
              Behavior
            </h3>
            <p className="text-sm pl-9">{data.behavior}</p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(249, 194, 55, 0.08)' }}>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <img src={cBlockIcon} alt="C" className="w-6 h-6" />
              Consequence
            </h3>
            <p className="text-sm pl-9">{data.consequence}</p>
          </div>
        </div>
      </CardContent>
      {(onSign || onEdit) && data.status === "draft" && (
        <CardFooter className="flex gap-2 justify-end">
          {onEdit && (
            <Button variant="outline" onClick={onEdit} disabled={isSaving} data-testid="button-edit">
              Edit
            </Button>
          )}
          {onSign && (
            <Button onClick={onSign} disabled={isSaving} data-testid="button-sign">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Sign & Save"
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
