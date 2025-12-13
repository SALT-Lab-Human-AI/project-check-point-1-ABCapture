-- Migration: Add Google OAuth support to users table
-- Run this migration to update your existing users table

-- Add OAuth columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE,
  ADD COLUMN IF NOT EXISTS provider VARCHAR NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS display_name VARCHAR;

-- Make password nullable for OAuth-only users
ALTER TABLE users 
  ALTER COLUMN password DROP NOT NULL;

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index on provider for filtering
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
