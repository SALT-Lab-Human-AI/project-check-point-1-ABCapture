# Quick Setup Guide - ABCapture Fixes

## Prerequisites
- Node.js installed
- Neon PostgreSQL database set up
- Groq API account (free tier available)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd "Concept Iteration"
npm install groq-sdk
```

### 2. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```bash
# Your existing variables
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
SESSION_SECRET=your-existing-secret
PORT=5050

# NEW: Add Groq API Key
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### 3. Get Groq API Key

1. Visit https://console.groq.com/keys
2. Sign up for free account (if needed)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Paste into `.env` file

### 4. Restart Server
```bash
npm run dev
```

Server should start on http://localhost:5050

### 5. Verify Fixes

#### Test Student Detail Fix:
1. Login to app
2. Go to "My Students"
3. Click on any student
4. **Verify**: Correct student name and data appears
5. **Verify**: Statistics match that student's incidents

#### Test Chatbot:
1. Go to Chat/Record Incident page
2. Select a student
3. Type: "Student had a meltdown during reading time"
4. **Verify**: AI responds with a question
5. Continue conversation
6. Click "Generate ABC Form"
7. **Verify**: Form populates with extracted data

## Troubleshooting

### "Cannot find module 'groq-sdk'"
```bash
npm install groq-sdk
```

### "API authentication failed"
- Check `GROQ_API_KEY` in `.env`
- Verify key is active at https://console.groq.com/keys
- Ensure no extra spaces in `.env` file

### Student detail shows wrong data
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for errors

### Database connection issues
- Verify `DATABASE_URL` is correct
- Test connection: `psql $DATABASE_URL`
- Ensure sessions table exists (see setup-instructions/database-setup.sql)

## What Was Fixed

### Issue 1: Student Data Mismatch ✅
- **Before**: Clicking students showed hardcoded mock data
- **After**: Shows real student data from database
- **Files**: `client/src/pages/student-detail.tsx`

### Issue 2: Non-Functional Chatbot ✅
- **Before**: Chat UI existed but didn't work
- **After**: Full Groq AI integration with intelligent responses
- **Files**: `server/groq.ts`, `server/routes.ts`, `client/src/pages/chat.tsx`

## Next Steps

1. **Test thoroughly** with real student data
2. **Monitor Groq usage** at https://console.groq.com/usage
3. **Review documentation** in FIXES_DOCUMENTATION.md
4. **Consider upgrades**:
   - Groq paid tier for higher rate limits
   - Voice input integration
   - Conversation history storage

## Support

For detailed information, see:
- `FIXES_DOCUMENTATION.md` - Complete technical documentation
- `TESTING.md` - Testing procedures
- `.env.example` - Environment variable template

## Free Tier Limits

**Groq Free Tier:**
- 30 requests per minute
- 14,400 requests per day
- Sufficient for small-medium classrooms

**Upgrade if needed:**
- Visit https://console.groq.com/settings/billing
- Pay-as-you-go pricing available
