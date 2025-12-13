import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import * as schema from './shared/schema.ts';
import { sql } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function main() {
  console.log('Setting up database schema...');
  
  try {
    // Create tables directly using SQL
    await pool.query(`
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
        password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        role VARCHAR NOT NULL,
        photo_url TEXT,
        email_notifications VARCHAR DEFAULT 'true',
        draft_reminders VARCHAR DEFAULT 'true',
        google_id VARCHAR UNIQUE,
        provider VARCHAR NOT NULL DEFAULT 'local',
        display_name VARCHAR,
        reset_token VARCHAR,
        reset_token_expiry TIMESTAMP,
        email_verified VARCHAR DEFAULT 'false',
        verification_token VARCHAR,
        verification_token_expiry TIMESTAMP,
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

      -- Conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        student_id INTEGER REFERENCES students(id),
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Incidents table
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        student_id INTEGER NOT NULL REFERENCES students(id),
        status TEXT NOT NULL DEFAULT 'draft',
        summary TEXT,
        antecedent TEXT,
        behavior TEXT,
        consequence TEXT,
        incident_type TEXT,
        function_of_behavior JSONB,
        date DATE,
        time TIME,
        location TEXT,
        duration TEXT,
        intervention TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        parent_signature TEXT,
        parent_signature_date TIMESTAMP,
        teacher_signature TEXT,
        teacher_signature_date TIMESTAMP
      );

      -- Edit history table
      CREATE TABLE IF NOT EXISTS edit_history (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        changed_fields JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('✓ Database schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
