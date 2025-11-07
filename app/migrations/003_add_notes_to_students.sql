-- Add notes column to students table
ALTER TABLE students ADD COLUMN notes TEXT;

-- Make grade column NOT NULL (since it's now required)
ALTER TABLE students ALTER COLUMN grade SET NOT NULL;
