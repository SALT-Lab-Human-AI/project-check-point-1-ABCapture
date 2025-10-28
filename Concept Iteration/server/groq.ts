import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Send a chat message to Groq AI and get a response
 * @param messages - Array of chat messages (conversation history)
 * @returns AI assistant's response text
 * @throws Error with specific message for different failure types
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  // Validate API key is configured
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set in environment variables");
    throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your .env file.");
  }

  console.log(`[Groq] Sending ${messages.length} messages to API`);
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a FAST, EFFICIENT AI assistant helping teachers quickly document behavioral incidents using ABC (Antecedent-Behavior-Consequence) format.

CRITICAL RULES - PRIORITIZE SPEED:
1. Extract ABC from teacher's natural language IMMEDIATELY - don't ask unnecessary questions
2. Maximum 1-2 clarifying questions ONLY if critical information is genuinely missing
3. Teachers are busy - make their life EASIER, not harder
4. Accept incomplete information - teachers can fill gaps in the form later
5. Be conversational but CONCISE - no interrogations
6. NEVER ask "Do you want to save?" - that's the teacher's decision via the form button

RESPONSE FORMAT:
When teacher describes an incident, immediately analyze and present:
"Incident analyzed:
- Antecedent: [what happened before]
- Behavior: [what the student did]
- Consequence: [what happened after]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

ONLY ASK FOR CONSEQUENCE if not mentioned (it's the most important follow-up).

BAD EXAMPLE (too many questions):
"Can you tell me: 1. What time? 2. What was student doing before? 3. How many times? 4. Other students involved? 5. Duration?"

GOOD EXAMPLE (extract immediately):
"I see Johnny hit Sarah when asked to sit during circle time. What did you do after the incident?"

NEVER ask to save - just confirm the form is filled and let the teacher use the Save button.

Remember: SPEED over perfection. Teachers need FAST assistance, not a questionnaire.`,
        },
        ...messages,
      ],
      model: "llama-3.3-70b-versatile", // Fast and capable model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      console.error("[Groq] Empty response from API");
      throw new Error("Received empty response from AI. Please try again.");
    }

    console.log(`[Groq] Successfully received response (${responseContent.length} chars)`);
    return responseContent;
    
  } catch (error: any) {
    // Log full error details for debugging
    console.error("[Groq] API Error Details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
    });
    
    // Provide specific error messages based on error type
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      throw new Error("Rate limit exceeded. Groq free tier allows 30 requests/minute. Please wait a moment and try again.");
    }
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      throw new Error("API authentication failed. Please verify your GROQ_API_KEY in the .env file is correct and starts with 'gsk_'.");
    }

    if (error.status === 400) {
      throw new Error(`Invalid request: ${error.message || 'Please check the message format'}`);
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error("Network error - unable to reach Groq API. Please check your internet connection.");
    }

    // Generic error with actual message
    throw new Error(error.message || "Failed to get AI response. Please try again.");
  }
}

/**
 * Extract structured ABC data from a conversation about a behavioral incident
 * @param conversationMessages - Full conversation history between teacher and AI
 * @returns Structured ABC data object ready for incident form
 * @throws Error if extraction fails or conversation lacks sufficient detail
 */
export async function extractABCData(conversationMessages: ChatMessage[]): Promise<{
  summary: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  incidentType: string;
  functionOfBehavior: string[];
}> {
  console.log(`[Groq] Extracting ABC data from ${conversationMessages.length} messages`);
  
  try {
    const extractionPrompt: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert at extracting structured ABC (Antecedent-Behavior-Consequence) data from teacher conversations about behavioral incidents.

Analyze the conversation and extract:
1. **Summary**: A brief 1-2 sentence overview of the incident
2. **Antecedent**: What was happening immediately before the behavior (setting, activity, triggers)
3. **Behavior**: Specific, observable description of what the student did
4. **Consequence**: What happened immediately after the behavior
5. **Incident Type**: Categorize as one of: Physical Aggression, Verbal Outburst, Self-Injury, Property Destruction, Elopement, Noncompliance, Other
6. **Function of Behavior**: Select from: Escape/Avoidance, Attention-Seeking, Sensory, Tangible/Access, Communication

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):
{
  "summary": "...",
  "antecedent": "...",
  "behavior": "...",
  "consequence": "...",
  "incidentType": "...",
  "functionOfBehavior": ["..."]
}`,
      },
      {
        role: "user",
        content: `Extract ABC data from this conversation:\n\n${conversationMessages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`,
      },
    ];

    const completion = await groq.chat.completions.create({
      messages: extractionPrompt,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    console.log(`[Groq] Received extraction response: ${responseText.substring(0, 100)}...`);
    
    const extracted = JSON.parse(responseText);

    const result = {
      summary: extracted.summary || "",
      antecedent: extracted.antecedent || "",
      behavior: extracted.behavior || "",
      consequence: extracted.consequence || "",
      incidentType: extracted.incidentType || "Other",
      functionOfBehavior: Array.isArray(extracted.functionOfBehavior) 
        ? extracted.functionOfBehavior 
        : [extracted.functionOfBehavior || "Communication"],
    };

    console.log(`[Groq] Successfully extracted ABC data:`, {
      summaryLength: result.summary.length,
      hasAntecedent: !!result.antecedent,
      hasBehavior: !!result.behavior,
      hasConsequence: !!result.consequence,
      incidentType: result.incidentType,
    });

    return result;
    
  } catch (error: any) {
    console.error("[Groq] ABC extraction error:", {
      message: error.message,
      status: error.status,
      type: error.type,
    });
    
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. The conversation may not have enough detail. Please provide more information about the incident.");
    }
    
    throw new Error(error.message || "Failed to extract ABC data from conversation. Please ensure the conversation includes details about what happened before, during, and after the incident.");
  }
}
