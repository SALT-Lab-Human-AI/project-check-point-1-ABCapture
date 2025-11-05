# System Prompts & Configuration

This directory contains all AI-related configuration, system prompts, model settings, and external service integrations for ABCapture.

---

## 📁 Files in This Directory

### Core Configuration

#### **chat-assistant-prompt.md**
The main system prompt used by the AI chatbot when helping teachers document behavioral incidents.

- Prioritizes speed over perfection
- Extracts ABC data from natural language immediately
- Uses structured response format for auto-filling forms
- **Source:** `app/server/groq.ts` → `sendChatMessage()`

#### **abc-extraction-prompt.md**
System prompt for extracting structured ABC data from conversations into JSON format.

**Extracts:**
- Summary (1-2 sentence overview)
- Antecedent (what happened before)
- Behavior (observable description)
- Consequence (what happened after)
- Incident Type (Physical Aggression, Verbal Outburst, etc.)
- Function of Behavior (Escape/Avoidance, Attention-Seeking, etc.)

**Source:** `app/server/groq.ts` → `extractABCData()`

#### **model-settings.md**
Complete AI model configuration and parameter documentation:

- **Chat Model:** LLaMA 3.3 70B (temperature: 0.7)
- **Extraction Model:** LLaMA 3.3 70B (temperature: 0.3, JSON mode)
- **Voice Model:** Whisper Large v3
- Parameter explanations and optimization opportunities
- Rate limits and performance metrics

#### **data-connectors.md**
Documentation for all external service integrations:

- **Groq AI API** - Voice transcription and chat
- **PostgreSQL/Neon** - Database
- **Gmail SMTP** - Email notifications
- **Google OAuth** - Authentication (optional)
- **Session Store** - User sessions

Includes setup instructions, environment variables, security notes, and troubleshooting.

### Implementation Documentation

#### **CHATBOT_AUTO_FILL_IMPLEMENTATION.md**
Complete technical documentation of the chatbot auto-fill feature:

- Split-screen interface architecture
- Real-time form synchronization
- ABC extraction logic and data flow
- Visual feedback system
- Component structure and API routes

---

## 🎯 Design Philosophy

### Speed Over Perfection
Teachers work in time-sensitive situations. Our AI is optimized for:
- Fast information extraction from natural language
- Minimal clarifying questions (1-2 max)
- Accepting incomplete data (teachers can edit later)

### Teacher Control
Teachers maintain full agency over their data:
- Edit any auto-filled field
- Clear and restart forms anytime
- Final decision on saving incidents

### Privacy & Security
- Student names redacted before sending to AI
- All API communications encrypted in transit
- Credentials stored securely in environment variables
- No PII stored in AI conversation logs

---

## 📊 Performance Metrics

**Current Configuration Performance:**
- Chat Response Time: ~1-3 seconds  
- Voice Transcription: ~2-5 seconds (varies by audio length)  
- ABC Extraction: ~2-4 seconds

**Groq Free Tier Rate Limits:**
- 30 requests/minute
- 14,400 requests/day
- Sufficient for small-to-medium classrooms

---

## 🔗 Related Files

**Implementation:**
- `app/server/groq.ts` - AI integration code
- `app/client/src/pages/chat.tsx` - Chat UI
- `app/client/src/hooks/useVoiceRecording.ts` - Voice recording hook

**Configuration:**
- `setup-instructions/.env.example` - Environment template
- `setup-instructions/INSTALL.md` - Installation guide
- `app/README.md` - Main project README

---

## 📝 Version History

- **v1.0** (Oct 2024) - Initial system prompts with fast ABC extraction
- **v1.1** (Oct 2024) - Added PII redaction for student names
- **v1.2** (Nov 2024) - Improved formatting rules for consistent parsing
- **v1.3** (Nov 2024) - Reorganized into `system-prompts-and-config/` folder

---

## 📚 External Resources

- [Groq Documentation](https://console.groq.com/docs)
- [LLaMA Model Cards](https://ai.meta.com/llama/)
- [Whisper Model Details](https://github.com/openai/whisper)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
