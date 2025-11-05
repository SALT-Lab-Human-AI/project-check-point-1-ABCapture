-- Database setup script for ABCapture
-- Run this in your Neon database console

-- Enable pgcrypto for gen_random_uuid (if not already available)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar NOT NULL UNIQUE,
  password varchar NOT NULL,
  first_name varchar,
  last_name varchar,
  role varchar NOT NULL, -- 'teacher' | 'parent'
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Sessions table (for connect-pg-simple)
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade text,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Parent-Student relationships (not yet used in UI)
CREATE TABLE IF NOT EXISTS parent_students (
  id serial PRIMARY KEY,
  parent_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Incidents (ABC forms)
CREATE TABLE IF NOT EXISTS incidents (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date text NOT NULL,
  time text NOT NULL,
  summary text NOT NULL,
  antecedent text NOT NULL,
  behavior text NOT NULL,
  consequence text NOT NULL,
  incident_type text NOT NULL,
  function_of_behavior text[] NOT NULL,
  location text,
  signature text,
  signed_at timestamp,
  status text NOT NULL DEFAULT 'draft', -- draft | signed
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Conversations (scaffold for AI chat; not yet used in UI)
CREATE TABLE IF NOT EXISTS conversations (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id integer REFERENCES students(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active', -- active | completed | cancelled
  incident_id integer REFERENCES incidents(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Messages (for conversations; not yet used in UI)
CREATE TABLE IF NOT EXISTS messages (
  id serial PRIMARY KEY,
  conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL, -- user | assistant | system
  content text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'sessions', 'students', 'parent_students', 'incidents', 'conversations', 'messages')
ORDER BY tablename;