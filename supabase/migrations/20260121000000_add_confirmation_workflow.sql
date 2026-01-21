-- Add confirmation workflow fields to cases table
-- Migration: Add pending/confirmed status workflow

-- Add confirmed_at and confirmed_by columns if they don't exist
ALTER TABLE cases ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- Update status check constraint to include pending and confirmed
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
    CHECK (status IN ('pending', 'confirmed', 'scheduled', 'completed', 'canceled'));

-- Update existing cases with 'scheduled' status to 'confirmed' (assume already confirmed)
UPDATE cases SET status = 'confirmed' WHERE status = 'scheduled';

-- Set default status to 'pending' for new cases
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'pending';
