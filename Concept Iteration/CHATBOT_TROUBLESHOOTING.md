# Chatbot Troubleshooting Guide

## Quick Diagnostics Checklist

Before diving into fixes, run through this checklist:

- [ ] Groq SDK installed: `npm list groq-sdk`
- [ ] GROQ_API_KEY set in `.env` file
- [ ] API key starts with `gsk_`
- [ ] Server restarted after adding API key
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows `/api/chat` request being made
- [ ] Server logs show `[Groq]` messages

---

## Common Error Messages & Solutions

### 1. "Groq API key is not configured"

**Symptom**: Chat shows error immediately when sending message

**Cause**: `GROQ_API_KEY` not set in environment variables

**Solution**:
```bash
# 1. Check if .env file exists
ls -la .env

# 2. Open .env and add:
GROQ_API_KEY=gsk_your_actual_key_here

# 3. Restart server
npm run dev
```

**Verify**:
- Check server logs on startup - should NOT see "GROQ_API_KEY is not set"
- API key should start with `gsk_`

---

### 2. "Cannot find module 'groq-sdk'"

**Symptom**: Server crashes on startup with module not found error

**Cause**: Groq SDK package not installed

**Solution**:
```bash
npm install groq-sdk
```

**Verify**:
```bash
npm list groq-sdk
# Should show: groq-sdk@x.x.x
```

---

### 3. "API authentication failed"

**Symptom**: Chat returns authentication error

**Cause**: Invalid or expired API key

**Solution**:
1. Visit https://console.groq.com/keys
2. Verify your API key is active
3. If expired, create a new key
4. Update `.env` file with new key
5. Restart server

**Verify**:
- Key in `.env` matches key in Groq console
- No extra spaces or quotes around the key
- Key starts with `gsk_`

---

### 4. "Rate limit exceeded"

**Symptom**: Works initially, then fails after several messages

**Cause**: Exceeded Groq free tier limits (30 requests/minute)

**Solution**:
- **Short term**: Wait 60 seconds before trying again
- **Long term**: Upgrade to Groq paid tier at https://console.groq.com/settings/billing

**Free Tier Limits**:
- 30 requests per minute
- 14,400 requests per day
- Sufficient for ~10-15 students per day

---

### 5. "Network error - unable to reach Groq API"

**Symptom**: Connection timeout or network error

**Cause**: Internet connection issue or firewall blocking

**Solution**:
1. Check internet connection
2. Test API directly:
   ```bash
   curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer $GROQ_API_KEY"
   ```
3. Check firewall settings
4. Verify no proxy blocking HTTPS requests

---

### 6. "Invalid request: ..."

**Symptom**: 400 Bad Request error

**Cause**: Malformed request payload

**Solution**:
1. Check browser console for request payload
2. Verify messages array format:
   ```json
   {
     "messages": [
       { "role": "user", "content": "Hello" }
     ]
   }
   ```
3. Check server logs for detailed error

**Debug**:
- Look for `[Groq] API Error Details:` in server logs
- Check the `message` field for specific issue

---

### 7. "Failed to parse AI response"

**Symptom**: ABC form generation fails

**Cause**: Conversation lacks sufficient detail for extraction

**Solution**:
1. Have at least 3-4 message exchanges
2. Include details about:
   - What happened before (antecedent)
   - What the student did (behavior)
   - What happened after (consequence)
3. Answer AI's clarifying questions

**Example Good Conversation**:
```
User: "Student threw materials during math"
AI: "What was happening right before they threw the materials?"
User: "They were working on a difficult worksheet and got frustrated"
AI: "What happened immediately after they threw the materials?"
User: "I gave them a break and redirected to a calming activity"
```

---

## Debugging Steps

### Step 1: Check Server Logs

Look for these log messages:

**Good Signs**:
```
[Groq] Sending 2 messages to API
[Groq] Successfully received response (245 chars)
```

**Bad Signs**:
```
GROQ_API_KEY is not set in environment variables
[Groq] API Error Details: { status: 401, ... }
Cannot find module 'groq-sdk'
```

### Step 2: Check Browser Console

**Good Signs**:
```
[Chat] Sending message to API...
[Chat] Received response from API
```

**Bad Signs**:
```
[Chat] Error details: { message: "...", ... }
POST http://localhost:5050/api/chat 500 (Internal Server Error)
```

### Step 3: Check Network Tab

1. Open DevTools > Network
2. Send a chat message
3. Look for `/api/chat` request
4. Check:
   - Status code (should be 200)
   - Request payload (messages array)
   - Response (should have `message` field)

**Example Good Response**:
```json
{
  "message": "Thank you for sharing that. Can you tell me..."
}
```

**Example Error Response**:
```json
{
  "message": "API authentication failed. Please verify..."
}
```

### Step 4: Test API Key Directly

```bash
# Set your API key
export GROQ_API_KEY="gsk_your_key_here"

# Test with curl
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Expected**: JSON response with AI message
**If fails**: API key is invalid or expired

---

## Advanced Debugging

### Enable Detailed Logging

The code already includes comprehensive logging. To see all logs:

1. Check server terminal for `[Groq]` prefixed messages
2. Check browser console for `[Chat]` prefixed messages
3. Look for error stack traces

### Test Individual Components

**Test 1: API Key Loading**
```typescript
// Add to server/groq.ts temporarily
console.log("API Key loaded:", process.env.GROQ_API_KEY?.substring(0, 10) + "...");
```

**Test 2: Message Format**
```typescript
// Add to server/routes.ts in /api/chat endpoint
console.log("Received messages:", JSON.stringify(messages, null, 2));
```

**Test 3: Response Parsing**
```typescript
// Add to client/src/pages/chat.tsx
console.log("API response:", response);
```

---

## Environment Setup Verification

### Check .env File

```bash
# View .env (without exposing full key)
cat .env | grep GROQ
# Should show: GROQ_API_KEY=gsk_...
```

### Verify Environment Variables Loaded

Add to `server/index.ts` temporarily:
```typescript
console.log("Environment check:", {
  hasGroqKey: !!process.env.GROQ_API_KEY,
  keyPrefix: process.env.GROQ_API_KEY?.substring(0, 4),
});
```

---

## Model Configuration

Current model: `llama-3.3-70b-versatile`

**Alternative models** (if current fails):
- `llama-3.1-70b-versatile` - Slightly older, very stable
- `mixtral-8x7b-32768` - Good for longer contexts
- `llama-3.1-8b-instant` - Faster, less capable

To change model, edit `server/groq.ts`:
```typescript
model: "llama-3.1-70b-versatile", // Change this line
```

---

## Performance Issues

### Slow Responses

**Normal**: 1-3 seconds per response
**Slow**: 5+ seconds

**Solutions**:
1. Check internet speed
2. Try faster model: `llama-3.1-8b-instant`
3. Reduce `max_tokens` in `server/groq.ts`

### Timeout Errors

**Cause**: Response taking too long

**Solution**:
1. Increase timeout in frontend (if needed)
2. Use faster model
3. Reduce conversation length

---

## Testing Procedure

### Test 1: Simple Message
```
1. Select a student
2. Type: "Hello"
3. Send
4. Expected: AI greeting response
```

### Test 2: Incident Description
```
1. Type: "Student threw materials during math"
2. Send
3. Expected: AI asks clarifying question
4. Answer the question
5. Expected: AI asks another question or acknowledges
```

### Test 3: Form Generation
```
1. Have 3-4 message exchanges about an incident
2. Click "Generate ABC Form"
3. Expected: Form tab opens with populated fields
4. Verify: Summary, antecedent, behavior, consequence filled
```

---

## Still Having Issues?

### Collect Debug Information

1. **Server logs** (last 50 lines):
   ```bash
   # Copy from terminal where npm run dev is running
   ```

2. **Browser console errors**:
   - Open DevTools > Console
   - Copy any red error messages

3. **Network request details**:
   - DevTools > Network > /api/chat
   - Copy Request Headers, Payload, Response

4. **Environment info**:
   ```bash
   node --version
   npm --version
   cat package.json | grep groq-sdk
   ```

### Check Groq Status

- Visit: https://status.groq.com
- Check for any ongoing incidents

### Review Recent Changes

- Did you recently update dependencies?
- Did you change the .env file?
- Did you modify server/groq.ts?

---

## Prevention Tips

1. **Always restart server** after changing `.env`
2. **Keep API key secure** - don't commit to git
3. **Monitor usage** at https://console.groq.com/usage
4. **Test after updates** - run a simple chat test
5. **Check logs regularly** - catch issues early

---

## Quick Reference

### Important Files
- `server/groq.ts` - Groq API integration
- `server/routes.ts` - Chat endpoints
- `client/src/pages/chat.tsx` - Chat UI
- `.env` - API key configuration

### Important Logs
- `[Groq]` - Backend Groq operations
- `[Chat]` - Frontend chat operations
- `Auth check` - Authentication status

### Important URLs
- Groq Console: https://console.groq.com
- API Keys: https://console.groq.com/keys
- Usage: https://console.groq.com/usage
- Status: https://status.groq.com

### Support Resources
- Groq Docs: https://console.groq.com/docs
- Model List: https://console.groq.com/docs/models
- Rate Limits: https://console.groq.com/docs/rate-limits
