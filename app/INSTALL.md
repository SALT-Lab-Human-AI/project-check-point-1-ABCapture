# ABCapture Installation Guide

ABCapture is a behavioral incident recording system for special education teachers with AI-powered voice-to-text and automated ABC (Antecedent-Behavior-Consequence) form generation.

## Prerequisites

- **Node.js** v20+ and npm
- **PostgreSQL Database** (Neon recommended)
- **Groq API Key** (free tier available)
- **Gmail Account** with app password (for email notifications)

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd app
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# Session Configuration
SESSION_SECRET=your-long-random-secret-string-here

# Server Configuration
PORT=5050

# Groq API Configuration (for AI Chatbot & Voice-to-Text)
# Get your API key from: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here

# Google OAuth Configuration (Optional)
# Get credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5050/auth/google/callback

# Email Configuration (for Guardian Notifications)
# Create dedicated Gmail account (e.g., noreply.abcapture@gmail.com)
# Get App Password from: https://myaccount.google.com/apppasswords
EMAIL_SERVICE=gmail
EMAIL_USER=noreply.abcapture@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here
```

### 3. Get Required API Keys

#### Groq API Key (Required)
1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for free account
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Paste into `.env` file

**Free Tier Limits:**
- 30 requests per minute
- 14,400 requests per day
- Sufficient for small-medium classrooms

#### Gmail App Password (Required for Email)
1. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create dedicated Gmail account if needed
3. Enable 2-factor authentication
4. Generate app password
5. Copy 16-character password into `.env`

#### Google OAuth (Optional)
1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:5050/auth/google/callback`
4. Copy client ID and secret to `.env`

### 4. Set Up Database

Push schema to your database:

```bash
npm run db:push
```

If you encounter data-loss warnings:

```bash
npm run db:push --force
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5050](http://localhost:5050)

## Production Deployment

### Build for Production

```bash
npm run build
```

This will:
1. Build the React frontend (Vite)
2. Bundle the Express backend (esbuild)
3. Output to `dist/` directory

### Start Production Server

```bash
npm run start
```

### Deploy to Replit

1. Click the "Deploy" button in Replit
2. Choose **Autoscale** deployment type (recommended for web apps)
3. Configure environment variables in deployment settings
4. Click "Publish"

**Important:** Remove Replit's auto-provisioned database from deployment config to use your existing Neon database.

## Database Management Scripts

```bash
# Push schema changes to database
npm run db:push

# Migrate data (if needed)
npm run db:migrate

# Import parent/guardian data from CSV
npm run db:import-parents

# Reset a user's password (admin utility)
npm run db:reset-password
```

## Project Structure

```
app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # React hooks (useAuth, useVoiceRecording, etc.)
│   │   ├── contexts/        # React contexts (PrivacyContext, etc.)
│   │   └── lib/             # Utilities (queryClient, authUtils)
│   └── index.html
├── server/                  # Express backend
│   ├── routes.ts            # API routes (auth, students, incidents)
│   ├── storage.ts           # Database queries (Drizzle ORM)
│   ├── groq.ts              # AI integration (voice-to-text, chatbot)
│   ├── email.ts             # Email service (Gmail SMTP)
│   ├── passport.ts          # Authentication (Local + Google OAuth)
│   ├── vite.ts              # Vite dev server integration
│   ├── db.ts                # Database connection (Neon)
│   ├── index.ts             # Server entry point
│   └── utils/               # Utilities (PII redaction, etc.)
├── shared/                  # Shared types/schema
│   └── schema.ts            # Drizzle schema (users, students, incidents)
├── migrations/              # Database migrations
│   ├── 001_initial_schema.sql
│   └── 002_add_edit_history.sql
├── docs/                    # Documentation
│   ├── architecture.md      # System architecture & design
│   ├── use-cases.md         # User workflows & testing
│   ├── DESIGN_SPEC.md       # Design specifications
│   ├── SETUP_GUIDE.md       # Setup instructions
│   └── TESTING.md           # Testing procedures
├── prompts/                 # AI prompts & configuration
│   ├── CHATBOT_AUTO_FILL_IMPLEMENTATION.md
│   ├── VOICE_INPUT_IMPLEMENTATION.md
│   └── VOICE_TESTING_GUIDE.md
├── attached_assets/         # Static assets (logo, images)
├── initial_prototype/       # Initial prototype files
├── .env.example             # Environment template (no secrets)
├── INSTALL.md              # This file
├── README.md               # Project overview
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── components.json         # Shadcn/ui components config
```

## Troubleshooting

### Cannot find module errors

```bash
npm install --legacy-peer-deps
```

### API authentication failed

- Check `GROQ_API_KEY` in `.env`
- Verify key is active at [https://console.groq.com/keys](https://console.groq.com/keys)
- Ensure no extra spaces in `.env` file

### Database connection issues

- Verify `DATABASE_URL` is correct
- Test connection: `psql $DATABASE_URL`
- Check if database endpoint is enabled (Neon)

### Port already in use

Change `PORT` in `.env` to a different port (e.g., 5051)

### Email not sending

- Verify Gmail app password is correct (16 characters, no spaces)
- Check 2-factor authentication is enabled on Gmail account
- Review server logs for SMTP errors

## Development Tips

### Type Checking

```bash
npm run check
```

### Hot Module Replacement

The dev server supports HMR for instant updates during development.

### Database Schema Changes

1. Edit `shared/schema.ts`
2. Run `npm run db:push`
3. Schema changes sync automatically

## Support & Documentation

- **Architecture:** `docs/architecture.md`
- **Use Cases:** `docs/use-cases.md`
- **Privacy & Security:** `docs/safety-privacy.md`
- **Logging & Debugging:** `docs/telemetry-observability.md`
- **AI Prompts:** `prompts/`

## Next Steps

1. Create your first teacher account
2. Add students to your classroom
3. Record your first incident using voice or chat
4. Review the auto-generated ABC form
5. Share incidents with guardians via email

## License

MIT
