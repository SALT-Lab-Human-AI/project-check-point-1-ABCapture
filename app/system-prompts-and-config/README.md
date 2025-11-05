# System Prompts & Configuration

This directory contains all AI-related configuration, system prompts, model settings, and external service integrations for ABCapture.

---

## 📁 Directory Contents

### Core Configuration Files

#### 1. **chat-assistant-prompt.md**
The primary system prompt used by the AI chatbot assistant when helping teachers document behavioral incidents.

**Key Features:**
- Prioritizes speed over perfection
- Extracts ABC data from natural language immediately
- Minimal questions to reduce teacher friction
- Structured response format for auto-filling forms

**Used by:** `app/server/groq.ts` → `sendChatMessage()`

---

#### 2. **abc-extraction-prompt.md**
System prompt for extracting structured ABC data from conversations into JSON format for auto-filling incident forms.

**Extracts:**
- Summary (1-2 sentence overview)
- Antecedent (what happened before)
- Behavior (observable description)
- Consequence (what happened after)
- Incident Type (Physical Aggression, Verbal Outburst, etc.)
- Function of Behavior (Escape, Attention-Seeking, etc.)

**Used by:** `app/server/groq.ts` → `extractABCData()`

---

#### 3. **model-settings.md**
Complete configuration details for all AI models used in ABCapture:

- **Chat Model**: LLaMA 3.3 70B (temperature: 0.7)
- **Extraction Model**: LLaMA 3.3 70B (temperature: 0.3, JSON mode)
- **Voice Model**: Whisper Large v3

Includes parameter explanations, optimization opportunities, and rate limits.

---

#### 4. **data-connectors.md**
Documentation for all external services and data connections:

- **Groq AI API** - Voice transcription and chat
- **PostgreSQL/Neon** - Database
- **Gmail SMTP** - Email notifications
- **Google OAuth** - Authentication
- **Session Store** - User sessions

Includes setup instructions, environment variables, and troubleshooting.

---

### Implementation Guides

#### 5. **CHATBOT_AUTO_FILL_IMPLEMENTATION.md**
Complete documentation of the chatbot auto-fill feature:
- Split-screen interface architecture
- Real-time form synchronization
- ABC extraction logic
- Visual feedback system

#### 6. **VOICE_INPUT_IMPLEMENTATION.md**
Voice recording and transcription implementation:
- Groq Whisper API integration
- PII redaction system
- Audio format handling
- Error handling and recovery

#### 7. **VOICE_TESTING_GUIDE.md**
Testing procedures and troubleshooting for voice input functionality.

---

## 🔧 Usage

### Modifying System Prompts

When updating prompts, make sure to:

1. **Test thoroughly** - System prompts directly affect user experience
2. **Update source code** - Edit `app/server/groq.ts` to reflect changes
3. **Document changes** - Update the corresponding `.md` file with version notes
4. **Maintain formatting** - ABC extraction requires specific Markdown formatting

### Modifying Model Settings

When changing model parameters:

1. **Consider implications** - Temperature affects consistency vs. creativity
2. **Update documentation** - Keep `model-settings.md` in sync
3. **Monitor performance** - Track response quality and speed
4. **Check rate limits** - Ensure new settings stay within Groq quotas

### Adding New Data Connectors

When integrating new services:

1. **Document in** `data-connectors.md`
2. **Add environment variables** to `setup-instructions/.env.example`
3. **Update** `setup-instructions/INSTALL.md` with setup instructions
4. **Test thoroughly** before deploying

---

## 🎯 Design Philosophy

### Speed Over Perfection
Teachers work in time-critical situations. Our AI configuration prioritizes:
- Fast extraction from natural language
- Minimal back-and-forth questions
- Accepting incomplete data (can be edited later)

### Teacher Agency
Teachers maintain full control:
- Can edit any auto-filled field
- Can clear and restart forms
- Final decision on saving incidents

### Privacy & Security
- Student names redacted before sending to AI
- All data encrypted in transit
- API keys stored securely in environment variables

---

## 📊 Performance Metrics

### Current Configuration Performance

**Chat Response Time:** ~1-3 seconds  
**Voice Transcription:** ~2-5 seconds (varies by audio length)  
**ABC Extraction:** ~2-4 seconds

**Rate Limits (Groq Free Tier):**
- 30 requests/minute
- 14,400 requests/day

### Optimization Opportunities

See `model-settings.md` for:
- Streaming responses for faster perceived performance
- Smaller models for cost optimization
- Fine-tuning opportunities

---

## 🔗 Related Files

- **Implementation:** `app/server/groq.ts`
- **Chat UI:** `app/client/src/pages/chat.tsx`
- **Voice Hook:** `app/client/src/hooks/useVoiceRecording.ts`
- **Environment Template:** `setup-instructions/.env.example`
- **Main README:** `app/README.md`

---

## 📝 Version History

- **v1.0** - Initial system prompts with fast ABC extraction
- **v1.1** - Added PII redaction for student names
- **v1.2** - Improved formatting rules for consistent parsing
- **v1.3** - Reorganized into `system-prompts-and-config/` folder

---

## 🤝 Contributing

When modifying AI configuration:

1. Test changes with real classroom scenarios
2. Update all relevant documentation
3. Consider teacher workflow impact
4. Monitor API usage and costs
5. Get teacher feedback on changes

---

## 📚 Further Reading

- [Groq Documentation](https://console.groq.com/docs)
- [LLaMA Model Cards](https://ai.meta.com/llama/)
- [Whisper Model Details](https://github.com/openai/whisper)
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
