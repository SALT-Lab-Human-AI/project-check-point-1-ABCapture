# AI Model Settings

Configuration details for the Groq AI models used in ABCapture.

## Source
Extracted from: `app/server/groq.ts`

---

## Chat Assistant Model

Used for conversational incident documentation with teachers.

### Model Configuration
```typescript
{
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 1,
  stream: false
}
```

### Parameter Explanations

- **model**: `llama-3.3-70b-versatile`
  - LLaMA 3.3 70B model optimized for versatile tasks
  - Excellent balance of speed, capability, and cost
  - Good at following instructions and structured output

- **temperature**: `0.7`
  - Medium randomness/creativity
  - Balances natural conversation with consistency
  - Not too rigid (0.0) or too creative (1.0)

- **max_tokens**: `1024`
  - Maximum response length
  - Sufficient for conversational responses
  - Prevents excessively long outputs

- **top_p**: `1`
  - Nucleus sampling parameter
  - 1.0 = consider all tokens (full vocabulary)
  - Allows natural, varied language

- **stream**: `false`
  - Returns complete response at once
  - Simpler error handling
  - Could be changed to `true` for real-time streaming in future

---

## ABC Extraction Model

Used for extracting structured data from conversations.

### Model Configuration
```typescript
{
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  max_tokens: 1024,
  response_format: { type: "json_object" }
}
```

### Parameter Explanations

- **model**: `llama-3.3-70b-versatile`
  - Same model as chat for consistency
  - Strong at structured data extraction

- **temperature**: `0.3`
  - **Lower** temperature for more deterministic output
  - Reduces randomness in extraction
  - Ensures consistent JSON structure

- **max_tokens**: `1024`
  - Enough for complete JSON object
  - ABC data is typically concise

- **response_format**: `{ type: "json_object" }`
  - Forces valid JSON output
  - Prevents markdown or extra text
  - Makes parsing reliable

---

## Voice Transcription Model

Used for converting audio recordings to text.

### Model Configuration
```typescript
{
  model: "whisper-large-v3"
}
```

### Parameter Explanations

- **model**: `whisper-large-v3`
  - OpenAI's Whisper v3 (large variant)
  - State-of-the-art speech recognition
  - Handles various accents, background noise
  - Multilingual support (though ABCapture uses English)

### Supported Audio Formats
- WebM (primary format for browser recording)
- MP3
- WAV

---

## Groq API Rate Limits

### Free Tier
- **Requests**: 30 per minute
- **Daily Limit**: 14,400 requests per day
- **Sufficient for**: Small to medium classrooms

### Recommendations
- Monitor usage at: https://console.groq.com/usage
- Consider paid tier for larger schools (1000+ requests/day)
- Implement request throttling if approaching limits

---

## Future Optimization Opportunities

1. **Streaming Responses**: Set `stream: true` for real-time chat experience
2. **Model Selection**: Test smaller models (e.g., LLaMA 3.1 8B) for cost optimization
3. **Temperature Tuning**: A/B test different temperatures for optimal teacher experience
4. **Context Window**: Utilize larger context for multi-turn conversations
5. **Fine-tuning**: Custom-train model on educational behavioral data

---

## Related Files
- Implementation: `app/server/groq.ts`
- Chat UI: `app/client/src/pages/chat.tsx`
- Voice Recording: `app/client/src/hooks/useVoiceRecording.ts`
