-- Anesthesia Cases Seed Data
-- Demo quality cases for testing the Anesthesia module

-- Create the anesthesia_cases table
CREATE TABLE IF NOT EXISTS anesthesia_cases (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    surgeon_name TEXT NOT NULL,
    room_name TEXT NOT NULL,
    coordinator_name TEXT,
    scheduled_start_at TIMESTAMPTZ NOT NULL,
    scheduled_duration_minutes INTEGER NOT NULL,
    actual_start_at TIMESTAMPTZ,
    actual_end_at TIMESTAMPTZ,
    coverage_assigned_to TEXT,
    break_status TEXT DEFAULT 'PENDING' CHECK (break_status IN ('PENDING', 'COMPLETED', 'MISSED')),
    case_status TEXT DEFAULT 'UPCOMING' CHECK (case_status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_anesthesia_cases_date ON anesthesia_cases(date);
CREATE INDEX IF NOT EXISTS idx_anesthesia_cases_status ON anesthesia_cases(case_status);

-- Insert seed data for today (demo cases)
-- Note: Using CURRENT_DATE to make this work on any day

DELETE FROM anesthesia_cases WHERE date = CURRENT_DATE;

-- IN_PROGRESS cases (2)
INSERT INTO anesthesia_cases (id, date, surgeon_name, room_name, coordinator_name, scheduled_start_at, scheduled_duration_minutes, actual_start_at, coverage_assigned_to, break_status, case_status)
VALUES
('CASE-001', CURRENT_DATE, 'Dr. Sarah Mitchell', 'OR 1', 'Jennifer Martinez, CRNA', CURRENT_DATE + TIME '07:30:00', 120, NOW() - INTERVAL '45 minutes', 'Dr. Sarah Chen, MD', 'COMPLETED', 'IN_PROGRESS'),
('CASE-002', CURRENT_DATE, 'Dr. Robert Thompson', 'OR 3', 'David Thompson, CRNA', CURRENT_DATE + TIME '08:00:00', 90, NOW() - INTERVAL '30 minutes', 'Jennifer Martinez, CRNA', 'PENDING', 'IN_PROGRESS');

-- UPCOMING cases (4)
INSERT INTO anesthesia_cases (id, date, surgeon_name, room_name, coordinator_name, scheduled_start_at, scheduled_duration_minutes, coverage_assigned_to, break_status, case_status)
VALUES
('CASE-003', CURRENT_DATE, 'Dr. Emily Rodriguez', 'OR 2', 'Maria Garcia, CRNA', CURRENT_DATE + TIME '09:00:00', 150, 'Dr. Michael Roberts, MD', 'PENDING', 'UPCOMING'),
('CASE-004', CURRENT_DATE, 'Dr. Michael Chen', 'OR 4', 'Robert Johnson, CRNA', CURRENT_DATE + TIME '09:30:00', 180, 'Dr. Emily Williams, MD', 'PENDING', 'UPCOMING'),
('CASE-005', CURRENT_DATE, 'Dr. Jennifer Lee', 'OR 5', 'Jennifer Martinez, CRNA', CURRENT_DATE + TIME '10:00:00', 120, 'Robert Johnson, CRNA', 'PENDING', 'UPCOMING'),
('CASE-006', CURRENT_DATE, 'Dr. David Martinez', 'OR 6', 'James Wilson, CRNA', CURRENT_DATE + TIME '10:30:00', 90, NULL, 'PENDING', 'UPCOMING');

-- COMPLETED cases (4)
INSERT INTO anesthesia_cases (id, date, surgeon_name, room_name, coordinator_name, scheduled_start_at, scheduled_duration_minutes, actual_start_at, actual_end_at, coverage_assigned_to, break_status, case_status)
VALUES
('CASE-007', CURRENT_DATE, 'Dr. Amanda White', 'OR 2', 'Maria Garcia, CRNA', CURRENT_DATE + TIME '06:30:00', 60, CURRENT_DATE + TIME '06:35:00', CURRENT_DATE + TIME '07:40:00', 'Dr. Thomas Lee, MD', 'COMPLETED', 'COMPLETED'),
('CASE-008', CURRENT_DATE, 'Dr. James Park', 'OR 4', 'David Thompson, CRNA', CURRENT_DATE + TIME '07:00:00', 75, CURRENT_DATE + TIME '07:05:00', CURRENT_DATE + TIME '08:25:00', 'Maria Garcia, CRNA', 'COMPLETED', 'COMPLETED'),
('CASE-009', CURRENT_DATE, 'Dr. Lisa Anderson', 'OR 5', 'Robert Johnson, CRNA', CURRENT_DATE + TIME '07:15:00', 90, CURRENT_DATE + TIME '07:20:00', CURRENT_DATE + TIME '08:55:00', 'Dr. Lisa Anderson, MD', 'MISSED', 'COMPLETED'),
('CASE-010', CURRENT_DATE, 'Dr. Kevin Brown', 'OR 6', 'Jennifer Martinez, CRNA', CURRENT_DATE + TIME '06:45:00', 105, CURRENT_DATE + TIME '06:50:00', CURRENT_DATE + TIME '08:40:00', 'James Wilson, CRNA', 'COMPLETED', 'COMPLETED');

-- Additional UPCOMING cases for later in the day
INSERT INTO anesthesia_cases (id, date, surgeon_name, room_name, coordinator_name, scheduled_start_at, scheduled_duration_minutes, coverage_assigned_to, break_status, case_status)
VALUES
('CASE-011', CURRENT_DATE, 'Dr. Patricia Davis', 'OR 1', 'Maria Garcia, CRNA', CURRENT_DATE + TIME '11:00:00', 135, 'Dr. Sarah Chen, MD', 'PENDING', 'UPCOMING'),
('CASE-012', CURRENT_DATE, 'Dr. Christopher Wilson', 'OR 3', 'David Thompson, CRNA', CURRENT_DATE + TIME '11:30:00', 120, NULL, 'PENDING', 'UPCOMING');
