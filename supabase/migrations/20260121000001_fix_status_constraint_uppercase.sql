-- Fix status constraint to use UPPERCASE values
-- Migration: Update all status values to UPPERCASE and fix constraint

-- Step 1: Update all existing status values to UPPERCASE
UPDATE cases SET status = 'PENDING' WHERE status IN ('pending', 'Pending', 'Pending Rep Confirmation');
UPDATE cases SET status = 'CONFIRMED' WHERE status IN ('confirmed', 'Confirmed', 'scheduled', 'Scheduled');
UPDATE cases SET status = 'COMPLETED' WHERE status IN ('completed', 'Completed');
UPDATE cases SET status = 'CANCELLED' WHERE status IN ('canceled', 'Canceled', 'cancelled', 'Cancelled');

-- Step 2: Drop the old constraint
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;

-- Step 3: Add new constraint with UPPERCASE values only
ALTER TABLE cases ADD CONSTRAINT cases_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'));

-- Step 4: Set default status to UPPERCASE 'PENDING' for new cases
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'PENDING';
