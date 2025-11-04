import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Sparkles, Mic, MicOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import aBlockIcon from "@assets/A Block.png";
import bBlockIcon from "@assets/B Block.png";
import cBlockIcon from "@assets/C Block.png";

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
  studentId: string | number;
  studentName: string;
  onFormGenerated: (formData: ABCFormData) => void;
  formData: ABCFormData | null;
  onFormUpdate: (formData: ABCFormData) => void;
}

export function ChatbotRecordingInterface({
  studentId,
  studentName,
  onFormGenerated,
  formData,
  onFormUpdate,
}: ChatbotRecordingInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "instructions",
      role: "assistant",
      content: `Please tell me as much as you can about the incident — you can type or speak!

📅 Date & Time
📍 Location
🔁 Antecedent (What happened before the incident?)
🎯 Behavior (What did the student do?)
✅ Consequence (What happened after the incident?)
🧠 Behavior Hypothesis (Why do you think it happened?)`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Format message content with proper HTML for display
  const formatMessageContent = (content: string): string => {
    // First, handle the ABC response format specifically
    if (content.includes('Incident analyzed:')) {
      // Split the content into lines for more precise control
      const lines = content.split('\n');
      let inABCFormat = false;
      
      const processedLines = lines.map(line => {
        // Remove all asterisks from the line
        const cleanLine = line.replace(/\*/g, '');
        
        // Check if this is an ABC component line
        const abcMatch = cleanLine.match(/^\s*[-•]?\s*(Antecedent|Behavior|Consequence):\s*(.*)/i);
        if (abcMatch) {
          inABCFormat = true;
          const [_, label, text] = abcMatch;
          // Clean up any extra spaces in the label and text
          const cleanLabel = label.trim().replace(/:\s*$/, '');
          const cleanText = text.trim();
          
          // Determine which icon to use based on the label
          let iconSrc = '';
          if (cleanLabel.toLowerCase() === 'antecedent') {
            iconSrc = aBlockIcon;
          } else if (cleanLabel.toLowerCase() === 'behavior') {
            iconSrc = bBlockIcon;
          } else if (cleanLabel.toLowerCase() === 'consequence') {
            iconSrc = cBlockIcon;
          }
          
          // Ensure the icon src is properly formatted for HTML
          const escapedIconSrc = iconSrc.replace(/"/g, '&quot;');
          return `- <img src="${escapedIconSrc}" alt="${cleanLabel.charAt(0)}" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;" /> <strong>${cleanLabel}:</strong> ${cleanText}`;
        }
        
        // For non-ABC lines or continuation lines
        if (inABCFormat && cleanLine.trim() === '') {
          return ''; // Remove extra blank lines within ABC format
        }
        
        // Reset ABC format state if we hit the confirmation message
        if (cleanLine.includes('ABC form has been auto-filled')) {
          inABCFormat = false;
          return cleanLine.trim();
        }
        
        // Preserve other lines as-is but without asterisks
        return cleanLine;
      });
      
      // Process lines to ensure single spacing between bullet points
      const filteredLines = processedLines.filter(line => line !== '');
      const result = [];
      
      for (let i = 0; i < filteredLines.length; i++) {
        const current = filteredLines[i];
        const next = filteredLines[i + 1];
        
        result.push(current);
        
        // Only add a line break if the next line is not a bullet point
        // and we're not at the last line
        if (i < filteredLines.length - 1 && 
            !next.match(/^\s*[-•]?\s*(Antecedent|Behavior|Consequence):/i)) {
          result.push('');
        }
      }
      
      return result.join('\n').replace(/\n/g, '<br />');
    }
    
    // For non-ABC messages, just remove asterisks and do basic formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** but keep the text between them
      .replace(/\*/g, '')  // Remove any remaining asterisks
      .replace(/\n/g, '<br />');
  };

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

  // Handle sending message with content (used by both text and voice input)
  const handleSendMessageWithContent = async (content: string, userMessage: ChatMessage) => {
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

  // Voice recording hook
  const {
    state: recordingState,
    error: recordingError,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    reset: resetRecording,
  } = useVoiceRecording({
    onTranscript: (transcript) => {
      console.log("[ChatbotRecording] Voice transcript received:", transcript);
      // Auto-fill input and send message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: transcript,
        timestamp: new Date(),
      };
      handleSendMessageWithContent(transcript, userMessage);
    },
    onError: (error) => {
      console.error("[ChatbotRecording] Voice recording error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Voice input error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    handleSendMessageWithContent(inputValue, userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col" style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
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
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Recording...
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Transcribing...
              </Badge>
            )}
            {isExtracting && (
              <Badge variant="secondary" className="animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Analyzing...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Fixed welcome header */}
        <div className="p-4 bg-muted/50 border-b flex-shrink-0">
          <p className="text-sm">
            Hi! I'm here to help you quickly document a behavioral incident using the ABC (Antecedent-Behavior-Consequence) Data Method. This will only take a few minutes.
          </p>
        </div>
        
        <ScrollArea className="flex-1 p-4 overflow-auto" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex-1 max-w-md rounded-lg p-3 break-words overflow-hidden ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div 
                    className="text-sm" 
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content)
                    }} 
                  />
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
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
          <div className="flex items-center gap-2">
            <Input
              placeholder="Describe what happened..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending || isRecording || isProcessing}
              className="flex-1"
            />
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={sendMessage.isPending || isProcessing}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessage.isPending || isRecording || isProcessing}
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
            {isRecording 
              ? "Recording... Click the microphone to stop" 
              : isProcessing
              ? "Transcribing your voice..."
              : "Type or click the microphone to use voice • Press Enter to send"}
          </p>
          {recordingError && (
            <p className="text-xs text-destructive mt-1">{recordingError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
