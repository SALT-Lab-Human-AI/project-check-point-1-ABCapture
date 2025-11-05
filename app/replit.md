# ABCapture - Behavioral Incident Recording System

## Overview

ABCapture is a specialized educational tool designed for special education teachers to efficiently record and document behavioral incidents using speech-to-text technology and AI-powered ABC (Antecedent-Behavior-Consequence) form generation. The application streamlines the incident documentation process, allowing teachers to quickly capture behavioral data and generate professional reports for student records.

**Core Purpose:** Transform verbal incident descriptions into structured ABC behavioral analysis forms using AI assistance, reducing documentation time while maintaining accuracy and compliance with special education requirements.

**Key Features:**
- Voice-to-text incident recording
- AI-powered ABC form generation via Google Gemini
- Student roster management
- Incident history tracking and analytics
- Dashboard with behavioral trend visualization

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 4, 2025)

### Replit Environment Setup
- **Database**: **Neon PostgreSQL** (external, NOT Replit's database)
  - Production database: `ep-red-dust-ahdm5ufw-pooler.c-3.us-east-1.aws.neon.tech/neondb`
  - Tables: users, students, conversations, messages, incidents, edit_history, parents, parent_students, sessions
  - 14 users, 20 students, 25 incidents (production data)
  - **IMPORTANT**: Replit may auto-provision a PostgreSQL database - DO NOT USE IT. Always use the Neon DATABASE_URL.
- **Dependencies**: All npm packages installed successfully using `--legacy-peer-deps` flag for compatibility
- **API Integration**: Groq API key configured for AI-powered chatbot functionality
- **Email Service**: Gmail SMTP configured for incident reports to guardians
- **Development Server**: Configured to run on port 5000 with proper Replit proxy support
- **Deployment**: Autoscale deployment configuration set up for production

### Configuration Files Updated
- **vite.config.ts**: Updated to bind to 0.0.0.0:5000 with HMR support for Replit environment
- **.gitignore**: Created standard Node.js gitignore file
- **Deployment**: Build and start scripts configured for production deployment
- **package.json**: Root delegation pattern for deployment

### Environment Variables Required
- `DATABASE_URL`: **Neon PostgreSQL connection string** (user-provided, ep-red-dust-ahdm5ufw-pooler.c-3.us-east-1.aws.neon.tech)
- `GROQ_API_KEY`: API key for Groq AI services (speech-to-text, chatbot)
- `SESSION_SECRET`: Secret key for session management
- `EMAIL_SERVICE`: Gmail (for sending incident reports)
- `EMAIL_USER`: Gmail account for sending emails
- `EMAIL_PASSWORD`: Gmail app-specific password
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: (Optional) For Google OAuth login

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Framework:** Shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design system following Material Design principles

**Design System:**
- Custom theme with light/dark mode support
- Material Design-inspired components with educational focus
- Color palette emphasizing trust (blue), success (green), and alert states (orange/red)
- Typography: Inter for UI, JetBrains Mono for technical data
- Responsive layout with mobile-first approach

**Key UI Patterns:**
- Sidebar navigation with collapsible states
- Card-based layouts for student and incident data
- Modal dialogs for data entry
- Real-time form validation with React Hook Form + Zod

### Backend Architecture

**Server Framework:** Express.js with TypeScript
- **Runtime:** Node.js with ES modules
- **Build Tool:** Vite for frontend, esbuild for backend bundling
- **Development Server:** Vite middleware integration for HMR

**API Design:**
- RESTful API structure (routes prefixed with `/api`)
- Express middleware for request logging and error handling
- Session-based architecture prepared (connect-pg-simple for session storage)

**Storage Layer:**
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based design (`IStorage`) allowing easy swap to database implementation
- Prepared for PostgreSQL/Neon database integration via Drizzle ORM

### Data Storage Solutions

**Database ORM:** Drizzle ORM
- **Dialect:** PostgreSQL (Neon serverless)
- **Connection:** Neon serverless driver with WebSocket support
- **Migration Strategy:** Schema-first with `drizzle-kit push` commands

**Schema Design:**
- `users` - Teacher accounts with authentication
- `students` - Student roster with grades and metadata
- `conversations` - AI conversation sessions for incident recording
- `incidents` - Behavioral incident records (referenced in schema, not fully implemented)
- `messages` - Conversation message history (referenced in schema)

**Data Relationships:**
- User → Students (one-to-many)
- User → Conversations (one-to-many)
- Student → Conversations (one-to-many)
- Conversation → Incident (one-to-one)

### Authentication and Authorization

**Current State:** Basic user schema prepared
- User model with username/password fields
- Session storage configured (PostgreSQL-backed sessions)
- No active authentication middleware implemented yet

**Intended Pattern:**
- Session-based authentication using Express sessions
- User credentials stored with hashed passwords
- Row-level security via userId foreign keys on all user data

### External Dependencies

**AI Integration:**
- **Groq API** (`groq-sdk`) - Primary AI service for:
  - Speech-to-text transcription using Whisper Large V3
  - Natural language understanding of incident descriptions using Llama 3.3 70B
  - Automated ABC form generation from conversational data
  - Behavioral function analysis
  - Free tier: 30 requests/minute, 14,400 requests/day

**Database Services:**
- **Neon PostgreSQL** - Serverless PostgreSQL database (PRIMARY DATABASE)
  - Host: `ep-red-dust-ahdm5ufw-pooler.c-3.us-east-1.aws.neon.tech`
  - Database: `neondb`
  - Accessed via `@neondatabase/serverless` driver
  - WebSocket connections for serverless compatibility
  - Environment variable: `DATABASE_URL` (user's existing Neon database)
  - **Contains production data**: 14 users, 20 students, 25 incidents
  - **CRITICAL**: Do NOT use Replit's auto-provisioned PostgreSQL - always use this Neon database

**UI Component Libraries:**
- **Radix UI** - Headless accessible component primitives for:
  - Dialog/Modal systems
  - Dropdown menus and popovers
  - Form controls (checkboxes, radio groups, selects)
  - Navigation components
  - Toast notifications
  
**Utility Libraries:**
- **date-fns** - Date formatting and manipulation
- **recharts** - Data visualization for incident trend charts
- **React Hook Form** + **Zod** - Form validation and type-safe schemas
- **class-variance-authority** + **clsx** - Dynamic className management

**Development Tools:**
- **Vite** - Build tool and dev server with HMR
- **esbuild** - Production backend bundling
- **TypeScript** - Type safety across full stack
- **Replit-specific plugins** - Error overlay, dev banner, cartographer for Replit environment

**Session Management:**
- **connect-pg-simple** - PostgreSQL session store for Express sessions