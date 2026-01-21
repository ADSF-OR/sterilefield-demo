-- Consolidated migration: Add confirmation columns and fix status constraint
-- This migration is safe and idempotent - it can be run multiple times without issues

-- Step 1: Add confirmation columns if they don't exist
ALTER TABLE cases ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- Step 2: Update all existing status values to UPPERCASE
UPDATE cases SET status = 'PENDING' WHERE status IN ('pending', 'Pending', 'Pending Rep Confirmation');
UPDATE cases SET status = 'CONFIRMED' WHERE status IN ('confirmed', 'Confirmed', 'scheduled', 'Scheduled');
UPDATE cases SET status = 'COMPLETED' WHERE status IN ('completed', 'Completed');
UPDATE cases SET status = 'CANCELLED' WHERE status IN ('canceled', 'Canceled', 'cancelled', 'Cancelled');

-- Step 3: Drop the old status constraint if it exists
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;

-- Step 4: Add new constraint with UPPERCASE values only
ALTER TABLE cases ADD CONSTRAINT cases_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'));

-- Step 5: Set default status to 'PENDING' for new cases
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'PENDING';

-- Step 6: Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- Step 7: Add index on case_datetime for better scheduling queries
CREATE INDEX IF NOT EXISTS idx_cases_datetime ON cases(case_datetime);
