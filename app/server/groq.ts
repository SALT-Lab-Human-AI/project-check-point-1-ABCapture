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

IMPORTANT - DATE AND TIME (CRITICAL):
- BEFORE showing "Incident analyzed", check if date/time was mentioned
- If the teacher mentions when the incident occurred (e.g., "at 2:30", "this morning", "yesterday", "today", "during lunch", "at 10am"), acknowledge it and proceed
- Date is considered mentioned if teacher says "today", "yesterday", or a specific date - you don't need to ask for date in these cases
- If the TIME is NOT mentioned in the initial description, you MUST ask: "What time did this incident occur?" BEFORE showing the analysis
- NEVER show "Incident analyzed" without asking for time if it wasn't mentioned
- NEVER assume the current time or date - always ask if unclear (except "today"/"yesterday" which are valid date mentions)
- If the teacher asks to change the time (e.g., "change it to 10am", "make it 10am", "set time to 10am"), acknowledge and confirm the change

RESPONSE FORMAT - FOLLOW EXACTLY:
When teacher describes an incident WITH time mentioned, respond with this exact format:

"Incident analyzed:
- **Antecedent:** [what happened before]
- **Behavior:** [what the student did]
- **Consequence:** [what happened after]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

If time is NOT mentioned, ask first, then show the analysis after they respond.

CRITICAL FORMATTING RULES:
1. Always start with "Incident analyzed:" on its own line
2. Each ABC component must be on its own line starting with a dash and space
3. Field labels (Antecedent, Behavior, Consequence) MUST be bold using ** **
4. Each label must be followed by a colon and a space
5. Keep the confirmation message

ONLY ASK FOR:
- Consequence if not mentioned (it's the most important follow-up)
- Date/time if not mentioned or unclear (NEVER assume current time)

CRITICAL FLOW:
1. Teacher describes incident
2. Check if time was mentioned
3. If NO time mentioned → Ask "What time did this incident occur?" (DO NOT show analysis yet)
4. If time WAS mentioned → Show analysis immediately
5. After teacher provides time → Show analysis

BAD EXAMPLE (too many questions):
"Can you tell me: 1. What time? 2. What was student doing before? 3. How many times? 4. Other students involved? 5. Duration?"

BAD EXAMPLE (assuming time):
"I see Johnny hit Sarah when asked to sit during circle time. I'll record this as happening right now."

BAD EXAMPLE (showing analysis without asking for time):
"Incident analyzed:
- **Antecedent:** Asked to sit during circle time
- **Behavior:** Hit Sarah
- **Consequence:** [ask if not mentioned]"
(If time wasn't mentioned, you MUST ask first!)

GOOD EXAMPLE (date mentioned, ask for time):
Teacher: "Today, Johnny hit Sarah during circle time"
You: "I see Johnny hit Sarah when asked to sit during circle time today. What time did this incident occur?"

GOOD EXAMPLE (no date/time mentioned, ask for time):
Teacher: "Johnny hit Sarah during circle time"
You: "I see Johnny hit Sarah when asked to sit during circle time. What time did this incident occur?"

GOOD EXAMPLE (date and time both mentioned, proceed immediately):
Teacher: "Yesterday at 2pm, Johnny hit Sarah during circle time"
You: "Incident analyzed:
- **Antecedent:** Asked to sit during circle time
- **Behavior:** Hit Sarah
- **Consequence:** [ask if not mentioned]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

GOOD EXAMPLE (after getting time):
"Incident analyzed:
- **Antecedent:** Asked to sit during circle time
- **Behavior:** Hit Sarah
- **Consequence:** [ask if not mentioned]

✓ The ABC form has been auto-filled. Please review the details in the form and click Save Incident when ready."

GOOD EXAMPLE (time change request):
Teacher: "Change the time to 10am"
You: "I've updated the time to 10:00 AM. The form has been updated."

NEVER ask to save - just confirm the form is filled and let the teacher use the Save button.

Remember: SPEED over perfection. Teachers need FAST assistance, not a questionnaire. But NEVER assume date/time - always ask if unclear.`,
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
 * Transcribe audio using Groq Whisper API
 * @param audioBuffer - Audio file buffer
 * @param fileName - Original filename (for format detection)
 * @returns Transcribed text
 */
export async function transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your .env file.");
  }

  console.log(`[Groq Whisper] Transcribing audio file: ${fileName} (${audioBuffer.length} bytes)`);

  try {
    const FormData = (await import('form-data')).default;
    const https = await import('https');
    
    // Determine content type
    const contentType = fileName.endsWith('.webm') ? 'audio/webm' : 
                        fileName.endsWith('.mp3') ? 'audio/mpeg' :
                        fileName.endsWith('.wav') ? 'audio/wav' : 'audio/webm';
    
    // Create form-data instance
    const formData = new FormData();
    
    // Append file buffer with proper filename and content type
    formData.append('file', audioBuffer, {
      filename: fileName,
      contentType: contentType,
    });
    formData.append('model', 'whisper-large-v3');
    
    console.log(`[Groq Whisper] Audio buffer size: ${audioBuffer.length} bytes`);
    console.log(`[Groq Whisper] Filename: ${fileName}`);
    
    // Get headers - form-data will set Content-Type with boundary
    const headers = formData.getHeaders();
    headers['Authorization'] = `Bearer ${process.env.GROQ_API_KEY}`;
    
    // IMPORTANT: Don't set Content-Length manually - let form-data handle it
    // Removing any existing Content-Length
    delete headers['content-length'];
    delete headers['Content-Length'];
    
    console.log(`[Groq Whisper] Content-Type: ${headers['content-type']}`);
    
    // Use native https module with form-data stream
    const response = await new Promise<{ status: number; data: any }>((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.groq.com',
          path: '/openai/v1/audio/transcriptions',
          method: 'POST',
          headers: headers,
        },
        (res) => {
          let responseData = '';
          res.setEncoding('utf8');
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            console.log(`[Groq Whisper] Response status: ${res.statusCode}`);
            
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const jsonData = JSON.parse(responseData);
                resolve({ status: res.statusCode, data: jsonData });
              } catch (e) {
                reject(new Error(`Failed to parse response: ${responseData.substring(0, 200)}`));
              }
            } else {
              // Error response
              let errorData: any = {};
              try {
                errorData = JSON.parse(responseData);
              } catch (e) {
                errorData = { message: responseData };
              }
              
              reject({
                status: res.statusCode,
                data: errorData,
              });
            }
          });
        }
      );

      req.on('error', (err) => {
        console.error('[Groq Whisper] Request error:', err);
        reject(err);
      });

      formData.on('error', (err) => {
        console.error('[Groq Whisper] Form-data error:', err);
        reject(err);
      });

      // Pipe form-data to request - this handles everything correctly
      formData.pipe(req);
    });

    const transcript = response.data.text || '';
    
    if (!transcript) {
      throw new Error('No transcript received from Groq API');
    }

    console.log(`[Groq Whisper] Successfully transcribed (${transcript.length} chars)`);
    return transcript;

  } catch (error: any) {
    console.error("[Groq Whisper] Transcription error:", {
      message: error.message,
      status: error.status,
      data: error.data,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    });

    // Handle HTTP errors
    if (error.status) {
      if (error.status === 401) {
        throw new Error("API authentication failed. Please verify your GROQ_API_KEY is correct.");
      }
      if (error.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (error.status === 400) {
        const errorMsg = error.data?.error?.message || error.data?.message || JSON.stringify(error.data);
        console.error("[Groq Whisper] 400 Bad Request:", errorMsg);
        throw new Error(`Invalid request: ${errorMsg}`);
      }
      
      throw new Error(`Transcription failed: ${error.data?.error?.message || error.data?.message || error.message}`);
    }

    throw new Error(error.message || "Failed to transcribe audio. Please try again.");
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
  date?: string | null;
  time?: string | null;
}> {
  console.log(`[Groq] Extracting ABC data from ${conversationMessages.length} messages`);
  
  try {
    const extractionPrompt: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert at extracting structured ABC (Antecedent-Behavior-Consequence) data from teacher conversations about behavioral incidents.

IMPORTANT: Analyze the ENTIRE conversation history provided below. Information may be spread across multiple messages, including follow-up questions and answers. Extract the most complete and accurate information from ALL messages in the conversation.

Extract from the full conversation:
1. **Summary**: A brief 1-2 sentence overview of the incident (use information from all relevant messages)
2. **Antecedent**: What was happening immediately before the behavior (setting, activity, triggers) - gather from all mentions
3. **Behavior**: Specific, observable description of what the student did - use the most complete description from the conversation
4. **Consequence**: What happened immediately after the behavior - check all messages for this information
5. **Date**: Extract the date when the incident actually occurred. Look for explicit mentions like "today", "yesterday", "Monday", "last week", specific dates (e.g., "January 15th", "1/15/2025"), or clear relative time references. IMPORTANT: If the teacher says "today", calculate and return TODAY's actual date in YYYY-MM-DD format. If they say "yesterday", calculate and return YESTERDAY's actual date in YYYY-MM-DD format. If they say "just now" or "a few minutes ago", use today's date. Format as YYYY-MM-DD (e.g., "2025-01-15"). If no date is mentioned or unclear, return null - DO NOT assume current date unless explicitly mentioned as "today" or similar.
6. **Time**: Extract the specific time when the incident actually occurred ONLY if explicitly mentioned. Look for explicit time mentions like "at 2:30", "around 3pm", "during lunch", "this morning", "afternoon", "at 2:30 PM", "10am", "10:00 AM", etc. IMPORTANT: Also extract time if the teacher asks to CHANGE or UPDATE the time (e.g., "change it to 10am", "make it 10am", "set time to 10am", "update time to 10am", "it was at 10am"). Format as HH:MM in 24-hour format (e.g., "14:30" for 2:30 PM, "09:15" for 9:15 AM, "10:00" for 10:00 AM). If the teacher says "just now" or "a few minutes ago", you can approximate based on context if there's a clear reference point, but prefer explicit times. If no time is mentioned or unclear, return null - DO NOT assume current time.
7. **Incident Type**: CRITICAL - Categorize as one of: Physical Aggression, Verbal Outburst, Self-Injury, Property Destruction, Elopement, Noncompliance, Other. Analyze the behavior description carefully to determine the most appropriate category. If the behavior involves physical contact with others, use "Physical Aggression". If it involves yelling, cursing, or verbal disruption, use "Verbal Outburst". If it involves breaking or damaging items, use "Property Destruction". If it involves leaving without permission, use "Elopement". If it involves refusing to follow directions, use "Noncompliance". Only use "Other" if none of the above categories fit.
8. **Function of Behavior**: CRITICAL - Analyze WHY the behavior occurred based on the antecedent and consequence. Select ALL that apply from: Escape/Avoidance (student wanted to avoid/escape a task or situation), Attention-Seeking (student wanted attention from adults or peers), Sensory (behavior provided sensory stimulation), Tangible/Access (student wanted access to an item or activity), Communication (student was trying to communicate a need). If the consequence was removing the student or ending a task, likely "Escape/Avoidance". If the consequence was giving attention, likely "Attention-Seeking". If unclear, include "Communication" as a default.

CRITICAL RULES FOR DATE/TIME:
- Extract date if explicitly mentioned including "today" or "yesterday" - calculate the actual date for these
- If the conversation mentions "just now" or "a few minutes ago", you may use today's date and approximate time
- If the conversation says "yesterday", calculate and return yesterday's actual date (YYYY-MM-DD format)
- If the conversation says "today", calculate and return today's actual date (YYYY-MM-DD format)
- If the conversation says "this morning", "this afternoon", etc., use today's date and approximate time if possible
- If date/time is NOT mentioned or is unclear (and not "today"/"yesterday"), return null for both date and time
- NEVER assume the current date/time just because it's not mentioned - but DO extract when "today" or "yesterday" is mentioned

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):
{
  "summary": "...",
  "antecedent": "...",
  "behavior": "...",
  "consequence": "...",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
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

    // Process date: convert "today" and "yesterday" to actual dates if needed
    let processedDate = extracted.date || null;
    if (processedDate) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // If AI returned "today" or "yesterday" as string, convert to actual date
      if (typeof processedDate === 'string') {
        const dateLower = processedDate.toLowerCase().trim();
        if (dateLower === 'today' || dateLower.includes('today')) {
          processedDate = todayStr;
        } else if (dateLower === 'yesterday' || dateLower.includes('yesterday')) {
          processedDate = yesterdayStr;
        }
        // If it's already in YYYY-MM-DD format, keep it
        // Otherwise, try to parse it
        if (!/^\d{4}-\d{2}-\d{2}$/.test(processedDate)) {
          try {
            const parsedDate = new Date(processedDate);
            if (!isNaN(parsedDate.getTime())) {
              processedDate = parsedDate.toISOString().split('T')[0];
            }
          } catch {
            // If parsing fails, keep original or set to null
            processedDate = null;
          }
        }
      }
    }

    const result = {
      summary: extracted.summary || "",
      antecedent: extracted.antecedent || "",
      behavior: extracted.behavior || "",
      consequence: extracted.consequence || "",
      date: processedDate,
      time: extracted.time || null,
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
      date: result.date,
      time: result.time,
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