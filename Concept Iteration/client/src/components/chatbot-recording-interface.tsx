import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ABCFormData = {
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
};

interface ChatbotRecordingInterfaceProps {
  studentName: string;
  onFormGenerated: (formData: ABCFormData) => void;
  formData: ABCFormData | null;
  onFormUpdate: (formData: ABCFormData) => void;
}

export function ChatbotRecordingInterface({
  studentName,
  onFormGenerated,
  formData,
  onFormUpdate,
}: ChatbotRecordingInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm here to help you document an incident for ${studentName}. Please describe what happened - I'll extract the ABC (Antecedent-Behavior-Consequence) information automatically.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send chat message mutation
  const sendMessage = useMutation({
    mutationFn: async (msgs: { role: string; content: string }[]) => {
      const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
      const res = await apiRequest("POST", "/api/chat", { messages: cleanMessages });
      return await res.json();
    },
  });

  // Extract ABC data mutation
  const extractABC = useMutation({
    mutationFn: async (msgs: { role: string; content: string }[]) => {
      const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
      const res = await apiRequest("POST", "/api/chat/extract-abc", { messages: cleanMessages });
      return await res.json();
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      // Send to chatbot
      const messagesToSend = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await sendMessage.mutateAsync(messagesToSend);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // ALWAYS try to extract ABC from the conversation (even on first message)
      // The AI will extract what it can and we'll update the form
      console.log("[ChatbotRecording] Attempting ABC extraction...");
      setIsExtracting(true);
      
      try {
        const conversationForExtraction = [...messages, userMessage, assistantMessage].map(({ role, content }) => ({
          role,
          content,
        }));
        
        console.log("[ChatbotRecording] Sending to extract-abc:", conversationForExtraction.length, "messages");
        
        const extracted = await extractABC.mutateAsync(conversationForExtraction);

        console.log("[ChatbotRecording] ✅ ABC extracted successfully:", extracted);

        // Auto-fill the form with extracted data
        const newFormData: ABCFormData = {
          id: Date.now().toString(),
          studentName,
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          summary: extracted.summary || "",
          antecedent: extracted.antecedent || "",
          behavior: extracted.behavior || "",
          consequence: extracted.consequence || "",
          incidentType: extracted.incidentType || "Other",
          functionOfBehavior: extracted.functionOfBehavior || [],
          status: "draft",
        };

        console.log("[ChatbotRecording] 📝 Calling form update with:", newFormData);

        // If this is the first extraction, call onFormGenerated
        if (!formData) {
          console.log("[ChatbotRecording] First extraction - calling onFormGenerated");
          onFormGenerated(newFormData);
        } else {
          // Update existing form
          console.log("[ChatbotRecording] Updating existing form - calling onFormUpdate");
          onFormUpdate(newFormData);
        }
        
        console.log("[ChatbotRecording] ✅ Form update callback called successfully");
      } catch (error) {
        console.error("[ChatbotRecording] ❌ Error extracting ABC:", error);
        // Don't crash - just continue conversation
      } finally {
        setIsExtracting(false);
      }
    } catch (error: any) {
      console.error("[ChatbotRecording] Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${error.message || "I encountered an error. Please try again."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Incident Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recording for {studentName}
              </p>
            </div>
          </div>
          {isExtracting && (
            <Badge variant="secondary" className="animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Analyzing...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe what happened..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessage.isPending}
              size="icon"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • The form will auto-fill as we chat
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
