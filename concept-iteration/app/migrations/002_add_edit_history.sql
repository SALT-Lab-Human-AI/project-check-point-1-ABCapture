-- Add edit history tracking for incidents
CREATE TABLE IF NOT EXISTS incident_edit_history (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  edited_at TIMESTAMP DEFAULT NOW() NOT NULL,
  changes JSONB NOT NULL,
  edited_by_name VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_incident_edit_history_incident_id ON incident_edit_history(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_edit_history_edited_at ON incident_edit_history(edited_at);