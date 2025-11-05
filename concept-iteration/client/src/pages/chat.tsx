import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Send, User, Bot, CheckCircle2, FileText, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ABCFormEdit } from "@/components/abc-form-edit";

type ApiStudent = { id: number; name: string; grade: string | null };

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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
  signature?: string;
  signedAt?: string;
}

const mockConversation: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm here to help you document a behavioral incident. Please describe what happened.",
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "2",
    role: "user",
    content: "Emma got upset during math and pushed another student's desk over.",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "3",
    role: "assistant",
    content: "Thank you. Can you tell me what was happening immediately before Emma pushed the desk? What was she working on?",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "4",
    role: "user",
    content: "She was working independently on a math worksheet. Another student had taken her pencil without asking.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "5",
    role: "assistant",
    content: "I understand. And what happened right after she pushed the desk? How did you respond?",
    timestamp: new Date(Date.now() - 30000),
  },
];

export default function Chat() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // Fetch students from API
  const { data: apiStudents = [] } = useQuery<ApiStudent[]>({ queryKey: ["/api/students"] });
  const mockStudents = apiStudents.map(s => ({ id: String(s.id), name: s.name, grade: s.grade || "" }));

  // Send chat message mutation
  const sendMessage = useMutation({
    mutationFn: async (msgs: ChatMessage[]) => {
      // Strip out id and timestamp - Groq API only accepts role and content
      const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
      const res = await apiRequest("POST", "/api/chat", { messages: cleanMessages });
      return await res.json();
    },
  });

  // Extract ABC data mutation
  const extractABC = useMutation({
    mutationFn: async (msgs: ChatMessage[]) => {
      // Strip out id and timestamp - Groq API only accepts role and content
      const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
      const res = await apiRequest("POST", "/api/chat/extract-abc", { messages: cleanMessages });
      return await res.json();
    },
  });
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showMockConversation, setShowMockConversation] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "form">("chat");
  
  // ABC Form state - updates in real-time as conversation progresses
  const [abcFormData, setAbcFormData] = useState<ABCFormData>({
    id: Date.now().toString(),
    studentName: "",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    summary: "",
    antecedent: "",
    behavior: "",
    consequence: "",
    incidentType: "",
    functionOfBehavior: [],
    status: "draft",
  });

  const displayMessages = showMockConversation ? mockConversation : messages;

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedStudent || isLoadingResponse) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoadingResponse(true);

    try {
      // Send to Groq API
      console.log("[Chat] Sending message to API...");
      const response = await sendMessage.mutateAsync(updatedMessages);
      console.log("[Chat] Received response from API");
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error: any) {
      // Log detailed error information
      console.error("[Chat] Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      
      // Extract the actual error message from the API response
      let errorText = "I apologize, but I encountered an error. Please try again.";
      
      if (error.message) {
        // Use the error message from the backend
        errorText = error.message;
      } else if (error.response?.data?.message) {
        errorText = error.response.data.message;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${errorText}`,
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const loadMockConversation = () => {
    setShowMockConversation(true);
    setSelectedStudent("1");
    
    // Simulate AI extracting data from conversation and updating form in real-time
    const mockExtractedData: ABCFormData = {
      id: Date.now().toString(),
      studentName: "Emma Johnson",
      date: new Date().toLocaleDateString(),
      time: "10:30 AM",
      summary: "Student pushed another student's desk during independent math work",
      antecedent: "Working independently on math worksheet when another student took pencil without asking",
      behavior: "Pushed another student's desk over",
      consequence: "Teacher redirected student and provided break",
      incidentType: "Physical Aggression",
      functionOfBehavior: ["Escape/Avoidance", "Communication"],
      status: "draft",
    };
    
    setAbcFormData(mockExtractedData);
  };

  const handleGenerateForm = async () => {
    if (messages.length === 0) {
      alert("Please have a conversation first before generating the form.");
      return;
    }

    if (messages.length < 3) {
      alert("The conversation is too short. Please provide more details about the incident before generating the form.");
      return;
    }

    try {
      setIsLoadingResponse(true);
      console.log("[Chat] Extracting ABC data from conversation...");
      
      const extracted = await extractABC.mutateAsync(messages);
      console.log("[Chat] ABC data extracted successfully:", extracted);
      
      const student = mockStudents.find(s => s.id === selectedStudent);
      setAbcFormData({
        id: Date.now().toString(),
        studentName: student?.name || "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        summary: extracted.summary,
        antecedent: extracted.antecedent,
        behavior: extracted.behavior,
        consequence: extracted.consequence,
        incidentType: extracted.incidentType,
        functionOfBehavior: extracted.functionOfBehavior,
        status: "draft",
      });
      
      setActiveTab("form");
    } catch (error: any) {
      console.error("[Chat] Form generation error:", {
        message: error.message,
        error: error,
      });
      
      // Show specific error message
      const errorMsg = error.message || "Failed to generate form. Please try again.";
      alert(`Form Generation Error:\n\n${errorMsg}`);
    } finally {
      setIsLoadingResponse(false);
    }
  };
  
  const handleFormSave = (updatedData: ABCFormData) => {
    setAbcFormData(updatedData);
    // Here you would save to backend
    console.log("Form saved:", updatedData);
  };
  
  const handleFormSign = (signature: string) => {
    setAbcFormData({
      ...abcFormData,
      signature,
      status: "signed",
    });
    // Here you would save to backend
    console.log("Form signed with:", signature);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  // Update form student name when student is selected
  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      setAbcFormData(prev => ({
        ...prev,
        studentName: student.name,
      }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {selectedStudent && (
        <div className="flex items-center justify-end gap-4 p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Student:</span>
            <Select value={selectedStudent} onValueChange={handleStudentChange}>
              <SelectTrigger className="w-[200px]" data-testid="select-student-header">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} - Grade {student.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!showMockConversation && messages.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadMockConversation}
              data-testid="button-load-example"
            >
              Load Example Conversation
            </Button>
          )}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "form")} className="flex-1 flex flex-col">
        {selectedStudent && (
          <div className="px-4 pt-2">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="chat" data-testid="tab-chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="form" data-testid="tab-form" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ABC Form
              </TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent value="chat" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {!selectedStudent ? (
              <div className="flex items-center justify-center h-full p-4">
                <Card className="p-8 text-center max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Start Recording an Incident</h2>
                  <p className="text-muted-foreground mb-6">
                    Select a student to begin documenting a behavioral incident using our AI assistant.
                  </p>
                  <Select value={selectedStudent} onValueChange={handleStudentChange}>
                    <SelectTrigger data-testid="select-student">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - Grade {student.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <Card className="p-8 max-w-2xl">
                  <div className="mx-auto w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-chart-2" />
                  </div>
                  <p className="text-center mb-6">
                    Hi! I'm here to help you quickly document a behavioral incident using the ABC Data method. This will only take a few minutes.
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-6">
                    <p className="font-semibold mb-4">I need the following information - you can tell me everything at once, either by typing or speaking:</p>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Date and Time:</strong> (if different from now)</li>
                      <li>• <strong>Location:</strong> Where did the incident occur?</li>
                      <li>• <strong>ANTECEDENT:</strong> What happened right before the behavior? What was the child doing/participating in?</li>
                      <li>• <strong>BEHAVIOR:</strong> Describe exactly what the child did</li>
                      <li>• <strong>CONSEQUENCE:</strong> What happened immediately after?</li>
                      <li>• <strong>Duration:</strong> How long did the incident last?</li>
                      <li>• <strong>Behavior Hypothesis:</strong> In your opinion, what do you hypothesize the function of the behavior to be?
                        <ul className="ml-6 mt-1 space-y-1">
                          <li><strong>Select One:</strong> Get/Obtain or Escape/Avoid</li>
                          <li><strong>Select One:</strong> Tasks/Demands, Activities, Attention, Settings, People, Objects, or Sensory Stimuli</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto p-4">
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-chart-2" />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-1 max-w-[70%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <Card
                        className={`p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card"
                        }`}
                        data-testid={`message-${message.role}-${message.id}`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </Card>
                      <span className="text-xs text-muted-foreground px-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {showMockConversation && (
                  <div className="flex justify-center pt-4">
                    <Card className="p-6 bg-chart-1/10 border-chart-1 max-w-md">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-chart-1" />
                        <h3 className="font-semibold">Conversation Complete</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        I have all the information needed. I'll now generate the ABC incident form for your review.
                      </p>
                      <Button className="w-full" data-testid="button-generate-form" onClick={handleGenerateForm} disabled={isLoadingResponse}>
                        View ABC Form
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="form" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 max-w-4xl mx-auto">
              {!selectedStudent ? (
                <div className="flex items-center justify-center h-full">
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Please select a student to view the ABC form
                    </p>
                  </Card>
                </div>
              ) : (
                <ABCFormEdit 
                  data={abcFormData}
                  onSave={handleFormSave}
                  onCancel={() => setActiveTab("chat")}
                />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {selectedStudent && (
          <div className="p-4 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant={isRecording ? "default" : "outline"}
                  onClick={toggleRecording}
                  className={isRecording ? "bg-destructive hover:bg-destructive/90" : ""}
                  data-testid="button-voice-input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message or use voice input..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedStudent}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || !selectedStudent || isLoadingResponse}
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isLoadingResponse && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  AI is thinking...
                </p>
              )}
              {isRecording && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                  Recording... Click the microphone to stop
                </p>
              )}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
