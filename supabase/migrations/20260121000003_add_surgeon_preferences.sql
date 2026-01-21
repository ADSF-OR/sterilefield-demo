-- Add surgeon preference columns
-- Migration: Add preference fields to surgeons table for Rep notes

-- Step 1: Add preference columns if they don't exist
ALTER TABLE surgeons ADD COLUMN IF NOT EXISTS general_preferences TEXT;
ALTER TABLE surgeons ADD COLUMN IF NOT EXISTS implant_preferences TEXT;
ALTER TABLE surgeons ADD COLUMN IF NOT EXISTS technique_notes TEXT;
ALTER TABLE surgeons ADD COLUMN IF NOT EXISTS preferences_last_updated TIMESTAMPTZ;

-- Step 2: Add index for better query performance on updated timestamp
CREATE INDEX IF NOT EXISTS idx_surgeons_preferences_updated ON surgeons(preferences_last_updated);
