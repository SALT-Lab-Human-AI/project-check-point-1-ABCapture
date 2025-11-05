# ABCapture System Architecture Diagram

## System Architecture

```mermaid
graph TB
    subgraph Client["CLIENT LAYER - React + TypeScript"]
        UI[User Interface]
        Pages[Pages: Login, Teacher, Admin, Parent]
        Components[Components: Forms, Charts, Voice Input]
        State[State Management: TanStack Query]
    end

    subgraph Server["SERVER LAYER - Express + Node.js"]
        API[REST API]
        Auth[Authentication]
        Storage[Storage Layer]
        Email[Email Service]
    end

    subgraph External["EXTERNAL SERVICES"]
        Groq[Groq AI: Whisper + LLaMA 3.1]
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
    E -->|Generate| F[ABC Form]
    F -->|Review| G[Sign Form]
    G -->|Submit| H[Save & Email]
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
    API->>Groq: Process with LLaMA 3.1
    Groq-->>API: AI Response
    API-->>Client: Display Response

    Note over Teacher,Database: Form Generation
    Teacher->>Client: Request ABC Form
    Client->>API: Extract ABC Data
    API->>Groq: Analyze Conversation
    Groq-->>API: Structured ABC Data
    API-->>Client: Populate Form

    Note over Teacher,Email: Submit and Notify
    Teacher->>Client: Sign and Submit
    Client->>API: Save Incident
    API->>Database: Store Record
    Database-->>API: Confirmed
    API->>Email: Notify Parents
    Email-->>API: Sent
    API-->>Client: Success
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : creates
    USERS ||--o{ INCIDENTS : records
    STUDENTS ||--o{ INCIDENTS : has
    STUDENTS ||--o{ PARENT_STUDENTS : linked_to
    PARENTS ||--o{ PARENT_STUDENTS : has
    INCIDENTS ||--o{ EDIT_HISTORY : tracks

    USERS {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        string role
        string googleId UK
        timestamp createdAt
    }

    STUDENTS {
        int id PK
        uuid userId FK
        string name
        string grade
        timestamp createdAt
    }

    INCIDENTS {
        int id PK
        uuid userId FK
        int studentId FK
        string date
        string time
        text antecedent
        text behavior
        text consequence
        string incidentType
        string status
        timestamp createdAt
    }

    PARENTS {
        int id PK
        string email
        string firstName
        string lastName
        timestamp createdAt
    }

    PARENT_STUDENTS {
        int id PK
        int parentId FK
        int studentId FK
    }

    EDIT_HISTORY {
        int id PK
        int incidentId FK
        jsonb changes
        timestamp editedAt
    }
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
  - LLaMA 3.1 70B (chat & ABC extraction)

### Authentication
- Local (email/password with bcrypt)
- Google OAuth 2.0
- Express sessions

## System Components

### Frontend Components
- Authentication (login, signup, OAuth)
- Navigation (sidebar, routing)
- Forms (student, incident, ABC)
- Dashboards (teacher, admin, parent)
- Voice Input (audio recording)
- Chat Interface (AI assistant)

### Backend Services
- Auth Service (authentication, authorization)
- Storage Service (database operations)
- Email Service (notifications)
- AI Service (Groq integration)
- PII Redaction (privacy protection)

### Data Layer
- Users (teachers, admins, parents)
- Students (student records)
- Incidents (behavioral records)
- Parents (parent information)
- Edit History (audit trail)

## Role-Based Access Control

```mermaid
graph LR
    subgraph Administrator
        A1[View All Teachers]
        A2[View All Students]
        A3[View All Incidents]
        A4[System Settings]
    end
    
    subgraph Teacher
        T1[Record Incidents]
        T2[Manage My Students]
        T3[View My Incidents]
        T4[Dashboard Analytics]
        T5[Chat with AI]
    end
    
    subgraph Parent
        P1[View My Children]
        P2[View Their Incidents]
        P3[Receive Email Alerts]
    end
```

## Deployment Architecture

```mermaid
graph TB
    Users[Users] --> LB[Load Balancer]
    
    LB --> App1[App Server 1]
    LB --> App2[App Server 2]
    
    App1 --> DB[PostgreSQL Primary]
    App2 --> DB
    
    DB --> DBR[PostgreSQL Replica]
    
    App1 --> Groq[Groq API]
    App2 --> Groq
    
    App1 --> Gmail[Gmail SMTP]
    App2 --> Gmail
    
    App1 --> OAuth[Google OAuth]
    App2 --> OAuth
```
