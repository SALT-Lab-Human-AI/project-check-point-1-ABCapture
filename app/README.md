# ABCapture - Behavioral Incident Recording System

A specialized educational tool for special education teachers to efficiently record and document behavioral incidents using AI-powered voice-to-text and automated ABC (Antecedent-Behavior-Consequence) form generation.

## Live Demo

Check out our latest prototype: [https://abcapture.replit.app](https://abcapture.replit.app)

## Quick Start

For detailed installation instructions, see [`setup-instructions/INSTALL.md`](setup-instructions/INSTALL.md)

### Basic Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp "setup-instructions/.env.example" .env

# Configure your environment variables (DATABASE_URL, GROQ_API_KEY, etc.)

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## Key Features

- 🎤 **Voice-to-Text Recording** - Speak incident descriptions naturally
- 🤖 **AI-Powered ABC Generation** - Automated form completion using Groq AI
- 👥 **Student Management** - Organize and track student rosters
- 📊 **Analytics Dashboard** - Visualize behavioral trends
- 📧 **Guardian Notifications** - Email incident reports automatically
- 🔒 **Secure Authentication** - Local auth + Google OAuth support

## Technology Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL (Neon)
- **AI:** Groq (Whisper for voice, LLaMA for chatbot)
- **Email:** Gmail SMTP
- **Build:** Vite + esbuild

## Project Structure

```
app/
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # Shared types (Drizzle schema)
├── migrations/       # Database migrations
├── docs/             # Documentation
├── prompts/          # AI configuration
└── setup-instructions/ # Installation guides & scripts
```

## Documentation

- **[Installation Guide](setup-instructions/INSTALL.md)** - Complete setup instructions
- **[Architecture](docs/architecture.md)** - System design and components
- **[Use Cases](docs/use-cases.md)** - User workflows and testing
- **[Replit Setup](replit.md)** - Replit-specific configuration

## Database

This project uses **Neon PostgreSQL** (external database):
- Host: `ep-red-dust-ahdm5ufw-pooler.c-3.us-east-1.aws.neon.tech`
- Database: `neondb`
- Production data: 14 users, 20 students, 25 incidents

**Note:** Do NOT use Replit's auto-provisioned PostgreSQL database.

## License

MIT
