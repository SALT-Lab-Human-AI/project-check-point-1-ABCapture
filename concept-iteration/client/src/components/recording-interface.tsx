import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Keyboard, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStudentAvatar } from "@/lib/utils";

interface RecordingInterfaceProps {
  studentId: string | number;
  studentName: string;
  studentPhotoUrl?: string;
  onSubmit: (transcript: string) => void;
  onCancel: () => void;
}

export function RecordingInterface({
  studentId,
  studentName,
  studentPhotoUrl,
  onSubmit,
  onCancel,
}: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [useText, setUseText] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    console.log("Started recording (Web Speech API would be initialized here)");
    // TODO: Implement Web Speech API
    // Simulating transcript for demo
    setTimeout(() => {
      setTranscript("Student was working on math assignment when another student took their pencil. Student stood up and shouted 'Give it back!' then pushed the other student's desk.");
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    console.log("Stopped recording");
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onSubmit(transcript);
    }
  };

  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarIcon = getStudentAvatar(studentId);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={studentPhotoUrl || avatarIcon} alt={studentName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Recording Incident</CardTitle>
            <p className="text-sm text-muted-foreground">Student: {studentName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!useText ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "default"}
              className="h-24 w-24 rounded-full"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              data-testid="button-toggle-recording"
            >
              {isRecording ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
            {isRecording && (
              <div className="flex flex-col items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">
                  Recording
                </Badge>
                <p className="font-mono text-2xl">{formatTime(recordingTime)}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-destructive rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseText(true)}
              data-testid="button-switch-text"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Type instead
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the incident in detail..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px]"
              data-testid="input-incident-text"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseText(false)}
              data-testid="button-switch-voice"
            >
              <Mic className="h-4 w-4 mr-2" />
              Use voice instead
            </Button>
          </div>
        )}
        
        {transcript && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!transcript.trim()}
          data-testid="button-submit-transcript"
        >
          {isRecording ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate ABC Form"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
