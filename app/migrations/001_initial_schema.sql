-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR NOT NULL,
  photo_url TEXT,
  email_notifications VARCHAR DEFAULT 'true',
  draft_reminders VARCHAR DEFAULT 'true',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parent-Student relationship table
CREATE TABLE IF NOT EXISTS parent_students (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES students(id),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  summary TEXT NOT NULL,
  antecedent TEXT NOT NULL,
  behavior TEXT NOT NULL,
  consequence TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  function_of_behavior TEXT[] NOT NULL,
  location TEXT,
  signature TEXT,
  signed_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  student_id INTEGER REFERENCES students(id),
  status TEXT NOT NULL DEFAULT 'active',
  incident_id INTEGER REFERENCES incidents(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
