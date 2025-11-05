# Voice-to-Chat Testing Guide

## 🎯 Purpose
This guide will help you run and test the current voice-to-chat implementation to identify and reproduce any bugs before making fixes or improvements.

---

## 📋 Prerequisites

### Required
- Node.js v18+ installed
- PostgreSQL database (Neon) - Already configured in `.env`
- Groq API key - Already configured in `.env`
- Chrome/Firefox browser (for microphone access)
- Working microphone

### Environment Variables
Your `.env` file is already configured with:
- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `GROQ_API_KEY` - For Whisper transcription and chat
- ✅ `SESSION_SECRET` - Session management
- ✅ `GOOGLE_CLIENT_ID/SECRET` - OAuth (optional for this test)

---

## 🚀 Setup Instructions

### Step 1: Verify Dependencies

All required dependencies are already in `package.json`:
- `multer@^2.0.2` - File upload handling
- `form-data@^4.0.4` - FormData for Node.js
- `redact-pii@^3.4.0` - PII redaction
- `@types/multer@^2.0.0` - TypeScript types

Dependencies should already be installed from the previous `npm install --legacy-peer-deps`.

### Step 2: Start the Server

```bash
npm run dev
```

**Expected Output:**
```
Setting up session middleware...
DATABASE_URL exists: true
SESSION_SECRET exists: true
Session middleware setup complete
[express] serving on port 5050
```

### Step 3: Open the Application

1. Open browser: http://localhost:5050
2. Log in with your credentials
3. Navigate to the incident recording page (chatbot interface)

---

## 🧪 Testing the Voice-to-Chat Feature

### Test Flow Overview

```
User clicks mic → Records audio → Clicks mic again → 
Audio transcribed → Student names redacted → 
Auto-sent to chat → ABC form auto-fills
```

### Step-by-Step Test

#### 1. **Locate the Microphone Button**
- Look for the microphone icon in the chatbot interface
- It should be near the text input field
- Icon: 🎤 (Mic icon from lucide-react)

#### 2. **Start Recording**
- Click the microphone button
- Browser will request microphone permission (first time only)
- **Grant permission** when prompted
- You should see:
  - Red pulsing "Recording..." badge
  - Microphone icon changes to MicOff
  - Text input becomes disabled
  - Helper text: "Recording... Click the microphone to stop"

#### 3. **Speak Your Incident Description**
Example script to test:
```
"Today at 2 PM, John Smith was disrupting the class. 
He was talking loudly during the lesson. 
I asked him to be quiet, but he continued. 
Eventually, I had to move him to a different seat."
```

**Note:** Replace "John Smith" with an actual student name from your database.

#### 4. **Stop Recording**
- Click the microphone button again
- You should see:
  - "Transcribing..." badge with spinner
  - Text input still disabled
  - Processing state active

#### 5. **Observe Transcription**
Watch the browser console (F12) for logs:
```
[ChatbotRecording] Voice transcript received: [transcript text]
[ChatbotRecording] Auto-sending voice message
```

#### 6. **Verify Auto-Send**
- Transcript should automatically appear in the chat
- Message should be sent to the chatbot
- You should see "Analyzing..." badge
- ABC form should start auto-filling

#### 7. **Check PII Redaction**
In the server logs, you should see:
```
[PII Redaction] Redacting student names from transcript
[PII Redaction] Found X student names to redact
[PII Redaction] Redacted transcript: [Student] was disrupting...
```

**Important:** The student name should be replaced with `[Student]` in the transcript sent to the LLM.

---

## 🐛 Known Bug to Reproduce

Based on the implementation, here are potential bugs to look for:

### Bug 1: Empty Transcription
**Symptoms:**
- Recording completes but no text appears
- Error message: "No transcription received"

**How to Reproduce:**
1. Click mic to start recording
2. Don't speak (silence)
3. Click mic to stop
4. Check for error handling

### Bug 2: Microphone Permission Denied
**Symptoms:**
- Browser blocks microphone access
- Error message should appear

**How to Reproduce:**
1. Block microphone permission in browser settings
2. Click mic button
3. Verify error message displays

### Bug 3: Audio Format Issues
**Symptoms:**
- Recording works but transcription fails
- Server error: "Unsupported audio format"

**How to Reproduce:**
1. Try on different browsers (Chrome, Firefox, Safari)
2. Check server logs for format errors

### Bug 4: PII Redaction Not Working
**Symptoms:**
- Student names appear in chat/LLM
- Server logs don't show redaction

**How to Reproduce:**
1. Record audio mentioning a student name
2. Check server logs for redaction activity
3. Verify `[Student]` placeholder in transcript

### Bug 5: Multiple Students Not Redacted
**Symptoms:**
- Only first student name redacted
- Other names remain visible

**How to Reproduce:**
1. Record audio mentioning multiple student names
2. Check if all names are replaced with `[Student]`

### Bug 6: Auto-Send Failure
**Symptoms:**
- Transcript appears but doesn't send to chat
- Manual send required

**How to Reproduce:**
1. Complete recording and transcription
2. Check if message auto-sends or requires manual action

---

## 🔍 Debugging Tools

### Browser Console (F12)
Look for these log messages:
```javascript
[VoiceRecording] Starting recording...
[VoiceRecording] Recording stopped
[VoiceRecording] Sending audio for transcription...
[VoiceRecording] Transcript received: [text]
[ChatbotRecording] Voice transcript received: [text]
[ChatbotRecording] Auto-sending voice message
```

### Server Logs
Look for these log messages:
```
POST /api/chat/transcribe-audio
[Transcription] Received audio file: [size] bytes
[Transcription] Calling Groq Whisper API...
[PII Redaction] Redacting student names from transcript
[PII Redaction] Found X student names to redact
[Transcription] Returning redacted transcript
```

### Network Tab (F12 → Network)
Monitor these requests:
1. `POST /api/chat/transcribe-audio` - Audio upload
   - Check request payload (audio file)
   - Check response (transcript JSON)
2. `POST /api/chat` - Chat message
   - Check if transcript is sent
   - Check ABC extraction response

---

## 📊 Expected vs Actual Behavior

### Expected Behavior
| Step | Expected |
|------|----------|
| Click mic | Recording starts, visual indicator shows |
| Speak | Audio captured in browser memory |
| Click mic again | Recording stops, transcription begins |
| Transcription | Groq Whisper returns text |
| PII Redaction | Student names replaced with `[Student]` |
| Auto-send | Message sent to chat automatically |
| ABC Extraction | Form auto-fills from conversation |

### Actual Behavior (Document Your Findings)
| Step | Actual | Bug? |
|------|--------|------|
| Click mic | _[Your observation]_ | _[Yes/No]_ |
| Speak | _[Your observation]_ | _[Yes/No]_ |
| Click mic again | _[Your observation]_ | _[Yes/No]_ |
| Transcription | _[Your observation]_ | _[Yes/No]_ |
| PII Redaction | _[Your observation]_ | _[Yes/No]_ |
| Auto-send | _[Your observation]_ | _[Yes/No]_ |
| ABC Extraction | _[Your observation]_ | _[Yes/No]_ |

---

## 🎯 Test Cases

### Test Case 1: Happy Path
**Scenario:** Normal voice recording with one student name

**Steps:**
1. Click mic
2. Say: "John Smith was talking during class"
3. Click mic to stop
4. Verify transcript appears
5. Verify "John Smith" → "[Student]" in server logs
6. Verify message auto-sends

**Expected Result:** ✅ All steps work smoothly

---

### Test Case 2: Multiple Students
**Scenario:** Recording mentions multiple students

**Steps:**
1. Click mic
2. Say: "John Smith and Jane Doe were fighting"
3. Click mic to stop
4. Verify both names redacted

**Expected Result:** ✅ Both names replaced with `[Student]`

---

### Test Case 3: No Speech
**Scenario:** Recording with silence

**Steps:**
1. Click mic
2. Wait 5 seconds (silence)
3. Click mic to stop

**Expected Result:** ⚠️ Error message or empty transcript handling

---

### Test Case 4: Permission Denied
**Scenario:** User denies microphone access

**Steps:**
1. Block microphone in browser settings
2. Click mic
3. Observe error message

**Expected Result:** ✅ Clear error message displayed

---

### Test Case 5: Long Recording
**Scenario:** Recording longer than 1 minute

**Steps:**
1. Click mic
2. Speak continuously for 60+ seconds
3. Click mic to stop

**Expected Result:** ✅ Transcription works (check file size limit)

---

## 🔧 Troubleshooting

### Issue: Microphone button not visible
**Solution:**
- Check if you're on the chatbot interface page
- Look for the text input field - mic button should be nearby
- Check browser console for React errors

### Issue: Permission prompt doesn't appear
**Solution:**
- Check browser settings → Privacy → Microphone
- Try a different browser
- Use HTTPS (localhost is okay)

### Issue: Transcription fails
**Solution:**
- Check Groq API key in `.env`
- Check server logs for API errors
- Verify audio format (WebM should work)
- Check file size (max 25MB)

### Issue: Student names not redacted
**Solution:**
- Check if student exists in database
- Check server logs for redaction activity
- Verify `redact-pii` package installed
- Check `server/utils/pii-redaction.ts` implementation

### Issue: Auto-send doesn't work
**Solution:**
- Check browser console for errors
- Verify `onTranscript` callback in `use-voice-recording.ts`
- Check if `handleSend()` is called in `chatbot-recording-interface.tsx`

---

## 📝 Bug Report Template

When you find a bug, document it using this template:

```markdown
## Bug: [Short Description]

**Severity:** [Critical/High/Medium/Low]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Browser Console Logs:**
```
[Paste relevant console logs]
```

**Server Logs:**
```
[Paste relevant server logs]
```

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [macOS/Windows/Linux]
- Node version: [version]
```

---

## 🎬 Quick Start Commands

```bash
# 1. Ensure you're in the correct directory
cd "/Users/rithikavennamaneni/Desktop/project-check-point-1-ABCapture/Concept Iteration"

# 2. Start the server
npm run dev

# 3. Open browser
open http://localhost:5050

# 4. Check server logs for startup messages
# Look for: "serving on port 5050"

# 5. Test microphone access
# Navigate to chatbot → Click mic → Grant permission
```

---

## 📚 Key Files to Review

If you want to understand the implementation before testing:

1. **Voice Recording Hook:**
   - `client/src/hooks/use-voice-recording.ts`
   - Handles recording, transcription API call

2. **UI Integration:**
   - `client/src/components/chatbot-recording-interface.tsx`
   - Mic button, visual states, auto-send logic

3. **Server Endpoint:**
   - `server/routes.ts` (search for `/api/chat/transcribe-audio`)
   - Handles file upload, calls Whisper API

4. **Transcription Function:**
   - `server/groq.ts` (search for `transcribeAudio`)
   - Calls Groq Whisper API

5. **PII Redaction:**
   - `server/utils/pii-redaction.ts`
   - Redacts student names from transcript

---

## ✅ Testing Checklist

Before reporting results, verify:

- [ ] Server starts without errors
- [ ] Can access application at localhost:5050
- [ ] Can log in successfully
- [ ] Can navigate to chatbot interface
- [ ] Microphone button is visible
- [ ] Can grant microphone permission
- [ ] Recording indicator shows when recording
- [ ] Can stop recording
- [ ] Transcription request is sent (check Network tab)
- [ ] Transcript is received (check Console)
- [ ] Student names are redacted (check Server logs)
- [ ] Message auto-sends to chat
- [ ] ABC form auto-fills
- [ ] Error handling works (test permission denied)

---

## 🎯 Next Steps After Testing

1. **Document all bugs found** using the bug report template
2. **Prioritize bugs** by severity
3. **Identify root causes** using logs and debugging
4. **Plan fixes** for each bug
5. **Test fixes** using this same guide

---

## 📞 Support

If you encounter issues not covered in this guide:
1. Check `VOICE_INPUT_IMPLEMENTATION.md` for implementation details
2. Review server logs carefully
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

---

**Good luck with testing! 🚀**
