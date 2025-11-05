# Data Connectors

Overview of all external services and data connections used in ABCapture.

---

## 1. Groq AI API

### Purpose
- Voice-to-text transcription (Whisper)
- Chat assistant for incident documentation (LLaMA)
- ABC data extraction from conversations

### Configuration
- **API Key**: `GROQ_API_KEY` (environment variable)
- **Endpoint**: `https://api.groq.com`
- **Models Used**:
  - `whisper-large-v3` - Audio transcription
  - `llama-3.3-70b-versatile` - Chat and extraction

### Setup
1. Create account at: https://console.groq.com
2. Generate API key: https://console.groq.com/keys
3. Add to `.env`: `GROQ_API_KEY=gsk_...`

### Rate Limits
- Free tier: 30 requests/minute, 14,400/day
- Monitor usage: https://console.groq.com/usage

### Implementation
- Primary file: `app/server/groq.ts`
- Functions:
  - `sendChatMessage()` - Chat completions
  - `transcribeAudio()` - Voice transcription
  - `extractABCData()` - Structured data extraction

---

## 2. PostgreSQL Database (Neon)

### Purpose
- Store users, students, incidents, and guardian data
- Session management
- Incident history and analytics

### Configuration
- **Provider**: Neon (Serverless Postgres)
- **Connection String**: `DATABASE_URL` (environment variable)
- **Host**: `ep-red-dust-ahdm5ufw-pooler.c-3.us-east-1.aws.neon.tech`
- **Database**: `neondb`
- **SSL Mode**: Required

### Current Data
- 14 users
- 20 students
- 25 incidents
- Active production database

### Setup
1. Create Neon account: https://neon.tech
2. Create PostgreSQL database
3. Add to `.env`: `DATABASE_URL=postgresql://user:pass@host/db?sslmode=require`
4. Push schema: `npm run db:push`

### ORM & Schema
- **ORM**: Drizzle ORM
- **Schema**: `app/shared/schema.ts`
- **Queries**: `app/server/storage.ts`
- **Config**: `app/drizzle.config.ts`

### Key Tables
- `users` - Teacher accounts (auth)
- `students` - Student roster
- `incidents` - Behavioral incidents (ABC data)
- `guardians` - Parent/guardian contacts
- `sessions` - User sessions (passport.js)

### Implementation
- Connection: `app/server/db.ts`
- Migrations: `app/migrations/`
- Storage layer: `app/server/storage.ts`

---

## 3. Gmail SMTP (Email Service)

### Purpose
- Send guardian notifications for incidents
- Email incident reports and summaries

### Configuration
- **Service**: Gmail SMTP
- **Email**: `EMAIL_USER` (environment variable)
- **Password**: `EMAIL_PASSWORD` (App Password - 16 characters)
- **SMTP Host**: `smtp.gmail.com`
- **Port**: 465 (SSL)

### Setup
1. Create dedicated Gmail account (e.g., noreply.abcapture@gmail.com)
2. Enable 2-factor authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Add to `.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=noreply.abcapture@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Implementation
- Email service: `app/server/email.ts`
- Nodemailer integration

---

## 4. Google OAuth (Optional)

### Purpose
- Alternative login method (Sign in with Google)
- Simplifies teacher authentication

### Configuration
- **Client ID**: `GOOGLE_CLIENT_ID` (environment variable)
- **Client Secret**: `GOOGLE_CLIENT_SECRET` (environment variable)
- **Callback URL**: `GOOGLE_CALLBACK_URL`

### Setup
1. Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:5050/auth/google/callback`
4. Copy credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_CALLBACK_URL=http://localhost:5050/auth/google/callback
   ```

### Implementation
- Passport.js strategy: `app/server/passport.ts`
- Routes: `app/server/routes.ts`

---

## 5. Session Store

### Purpose
- Persistent user sessions
- Secure authentication state

### Configuration
- **Strategy**: PostgreSQL-backed sessions (connect-pg-simple)
- **Secret**: `SESSION_SECRET` (environment variable)
- **Table**: `session` (auto-created in database)

### Setup
- Add to `.env`: `SESSION_SECRET=your-long-random-string-here`
- Generate secure secret: `openssl rand -base64 32`

### Implementation
- Session config: `app/server/index.ts`
- Database integration: Auto-managed by connect-pg-simple

---

## Data Flow Diagram

```
Teacher Browser
    ↓
    ├── Voice Recording → Groq Whisper API → Transcribed Text
    ├── Chat Input → Groq LLaMA API → AI Response
    └── Generate Form → Groq LLaMA API → ABC Data (JSON)
    ↓
Express Server (app/server/)
    ↓
    ├── Authentication → PostgreSQL (sessions table)
    ├── Student Data → PostgreSQL (students table)
    ├── Save Incident → PostgreSQL (incidents table)
    └── Send Notification → Gmail SMTP → Guardian Email
```

---

## Environment Variables Summary

All data connectors require these environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Groq AI
GROQ_API_KEY=gsk_...

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=noreply.abcapture@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5050/auth/google/callback

# Session
SESSION_SECRET=your-long-random-string

# Server
PORT=5050
```

See: `setup-instructions/.env.example` for complete template.

---

## Security Notes

1. **Never commit secrets** to git repository
2. **Use .env file** for local development
3. **Use Replit Secrets** for production deployment
4. **Rotate API keys** periodically
5. **Monitor API usage** to detect unauthorized access
6. **Use app passwords** (not real Gmail password) for email

---

## Monitoring & Debugging

### Groq API
- Dashboard: https://console.groq.com
- Usage: Check request counts and rate limits
- Errors: 401 (invalid key), 429 (rate limit)

### Neon Database
- Dashboard: https://console.neon.tech
- Check connection health
- Monitor query performance
- View database size and limits

### Gmail
- Check sent emails in Gmail account
- Review SMTP logs in server console
- Test with: `npm run test-email` (if implemented)

---

## Related Files
- Environment template: `setup-instructions/.env.example`
- Groq integration: `app/server/groq.ts`
- Database schema: `app/shared/schema.ts`
- Email service: `app/server/email.ts`
- Auth setup: `app/server/passport.ts`
