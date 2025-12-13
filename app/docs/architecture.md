# ABCapture System Architecture Diagram

## System Architecture

```mermaid
graph TB
    subgraph Client["CLIENT: React + TypeScript"]
        UI[User Interface]
        Pages[Page Type: Login, Teacher Interface, Admin Interface]
        Components[Components: Forms, Charts, Voice Input]
        State[State Management: TanStack Query]
    end

    subgraph Server["SERVER: Express + Node.js"]
        API[REST API]
        Auth[Authentication]
        Storage[Storage Layer]
        Email[Email Service]
    end

    subgraph External["EXTERNAL SERVICES"]
        Groq[Groq AI: Whisper + LLaMA 3.3 70B]
        OAuth[Google OAuth 2.0]
        SMTP[Email SMTP]
    end

    subgraph DB["DATABASE - PostgreSQL"]
        Tables[Tables: Users, Students, Incidents, Parents]
    end

    UI --> Pages
    Pages --> Components
    Components --> State
    State --> API
    
    API --> Auth
    API --> Storage
    API --> Email
    
    Storage --> Tables
    
    API --> Groq
    API --> OAuth
    Email --> SMTP
```

## User Flow - Teacher Recording Incident

```mermaid
graph LR
    A[Teacher] -->|Select| B[Choose Student]
    B -->|Record| C[Voice Input]
    C -->|Transcribe| D[AI Assistant]
    D -->|Chat| E[Refine Details]
    E -->|Auto-extract| F[ABC Form]
    F -->|Review| G[Sign Form]
    G -->|Submit| H[Save & Optional Share]
```

## Data Flow - Incident Recording Process

```mermaid
sequenceDiagram
    actor Teacher
    participant Client
    participant API
    participant Groq
    participant Database
    participant Email

    Note over Teacher,Groq: Audio Transcription
    Teacher->>Client: Record Audio
    Client->>API: Upload Audio File
    API->>Groq: Transcribe with Whisper
    Groq-->>API: Text Transcript
    API->>API: Redact Student Names
    API-->>Client: Safe Transcript

    Note over Teacher,Groq: AI Conversation
    Teacher->>Client: Chat with AI
    Client->>API: Send Message
    API->>Groq: Process with LLaMA 3.3 70B
    Groq-->>API: AI Response
    API-->>Client: Display Response

    Note over Teacher,Database: Automatic ABC Extraction
    Client->>API: Auto-extract ABC Data
    API->>Groq: Analyze Conversation
    Groq-->>API: Structured ABC Data
    API-->>Client: Populate Form (Real-time)

    Note over Teacher,Email: Submit and Optional Sharing
    Teacher->>Client: Sign and Submit
    Client->>API: Save Incident
    API->>Database: Store Record
    Database-->>API: Confirmed
    API-->>Client: Success
    Note right of Email: Parent notifications are manual via share endpoint
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (state management)
- Wouter (routing)
- Recharts (data visualization)
- Vite (build tool)

### Backend
- Node.js + Express.js
- TypeScript
- Passport.js (authentication)
- Drizzle ORM (database)
- Multer (file upload)
- Nodemailer (email)

### Database
- PostgreSQL
- Drizzle Kit (migrations)
- Session Store

### AI Services
- Groq Cloud
  - Whisper Large v3 (speech-to-text)
  - LLaMA 3.3 70B Versatile (chat & ABC extraction)

### Authentication
- Local (email/password with bcrypt)
- Google OAuth 2.0
- Express sessions

## System Components

### Frontend Components
- Authentication (login, signup, OAuth)
- Navigation (sidebar, routing)
- Forms (student, incident, ABC)
- Dashboards (teacher, admin)
- Voice Input (audio recording)
- Chat Interface (AI assistant)

### Backend Services
- Auth Service (authentication, authorization)
- Storage Service (database operations)
- Email Service (notifications)
- AI Service (Groq integration)
- PII Redaction (privacy protection)

### Data Layer
- Users (teachers, admins - authenticated users only)
- Students (student records)
- Incidents (behavioral records)
- Edit History (audit trail)

## Role-Based Access Control

```mermaid
graph LR
    subgraph Administrator
        A1[View All Teachers]
        A2[Manage Teachers: Add/Delete]
        A3[View All Students]
        A4[View All Incidents]
        A5[Dashboard Analytics]
        A6[Account Settings]
    end
    
    subgraph Teacher
        T1[Record Incidents]
        T2[Manage My Students]
        T3[View My Incidents]
        T4[Dashboard Analytics]
        T5[Chat with AI]
        T6[Share Incidents via Email]
    end
```


