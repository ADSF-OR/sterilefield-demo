-- SterileField Database Schema
-- Migration 002: Seed data for demo

-- =====================================================
-- SEED: HOSPITALS
-- =====================================================
INSERT INTO public.hospitals (id, name, city, state) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Shore Medical Center', 'Somers Point', 'NJ'),
    ('22222222-2222-2222-2222-222222222222', 'AtlantiCare Regional Medical Center', 'Atlantic City', 'NJ'),
    ('33333333-3333-3333-3333-333333333333', 'Cooper University Hospital', 'Camden', 'NJ'),
    ('44444444-4444-4444-4444-444444444444', 'Virtua Voorhees Hospital', 'Voorhees', 'NJ'),
    ('55555555-5555-5555-5555-555555555555', 'Inspira Medical Center Vineland', 'Vineland', 'NJ'),
    ('66666666-6666-6666-6666-666666666666', 'Kennedy University Hospital', 'Cherry Hill', 'NJ')
ON CONFLICT (name, city) DO NOTHING;

-- =====================================================
-- SEED: DEMO USERS (Reps & Schedulers)
-- =====================================================
-- Note: In production, these would be created via Supabase Auth
-- This is for demo purposes to show the structure
-- Actual user creation requires using Supabase Auth API

-- These IDs should match users created via Supabase Auth
-- For demo, we'll use placeholder UUIDs
-- INSERT INTO public.users (id, email, full_name, role, territory) VALUES
--     ('rep1-uuid-here', 'john.smith@sterilefield.com', 'John Smith', 'rep', 'South Jersey'),
--     ('rep2-uuid-here', 'sarah.johnson@sterilefield.com', 'Sarah Johnson', 'rep', 'South Jersey'),
--     ('rep3-uuid-here', 'michael.chen@sterilefield.com', 'Michael Chen', 'rep', 'South Jersey'),
--     ('scheduler1-uuid', 'scheduler@sterilefield.com', 'Admin Scheduler', 'scheduler', 'South Jersey');

-- =====================================================
-- SEED: SURGEONS
-- =====================================================
INSERT INTO public.surgeons (id, name, specialty, primary_hospital_id, scheduler_name, cases_ytd, pref_general, pref_implants, pref_technique) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Dr. Jennifer Thompson',
    'Spine Surgery',
    '11111111-1111-1111-1111-111111111111',
    'Linda Chen',
    48,
    'Opens implants at incision. Very punctual - starts on time. Likes reps in room for closing.',
    'Prefers 5.5mm screws for L4-L5. Uses Expedium system. Always requests BMP-2.',
    'Posterior midline approach. Patient positioned prone. Meticulous about positioning.'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Dr. Rajesh Patel',
    'Neurosurgery',
    '22222222-2222-2222-2222-222222222222',
    'Maria Rodriguez',
    34,
    'Very particular about positioning. Needs all sizes available. Cases may run longer than estimated.',
    'Uses Synthes cervical system. Wants complete cage size range (6-12mm).',
    'Anterior cervical approach. Meticulous dissection. Patient positioning critical.'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Dr. Michael Romano',
    'Orthopedic Spine',
    '33333333-3333-3333-3333-333333333333',
    'Patricia Green',
    56,
    'High volume surgeon. Wants everything ready before patient arrival. Fast-paced.',
    'Uses BMP frequently. Prefers Viper 2 system. Standard screw sizes.',
    'Transforaminal approach for TLIF. Efficient workflow. Minimal conversation during case.'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Dr. Sarah Kim',
    'Spine Surgery',
    '44444444-4444-4444-4444-444444444444',
    'Jennifer Lee',
    41,
    'Tech-savvy. Open to rep input. Friendly OR environment. Flexible timing.',
    'Prefers minimally invasive systems. Uses percutaneous screws when possible.',
    'MIS approach preferred. Uses navigation. Patient safety priority.'
);

-- =====================================================
-- SEED: CASES (Demo cases)
-- =====================================================
-- Note: These INSERT statements use placeholder UUIDs for rep IDs
-- In production, these would be actual user UUIDs from Supabase Auth

-- CASE 1: Completed case (yesterday)
-- INSERT INTO public.cases (
--     case_code, surgeon_id, hospital_id, assigned_rep_id,
--     procedure, room, scheduled_date, scheduled_time,
--     time_in, time_out, status, confirmed, confirmed_by_id, confirmed_at, notes
-- ) VALUES (
--     'CASE-4721',
--     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     '11111111-1111-1111-1111-111111111111',
--     'rep1-uuid-here',
--     'L4-L5 Posterior Fusion',
--     'OR 2',
--     CURRENT_DATE - INTERVAL '1 day',
--     '07:30',
--     (CURRENT_DATE - INTERVAL '1 day') + TIME '07:42',
--     (CURRENT_DATE - INTERVAL '1 day') + TIME '10:35',
--     'completed',
--     true,
--     'rep1-uuid-here',
--     NOW() - INTERVAL '25 hours',
--     'Patient positioned prone. All implants ready.'
-- );

-- CASE 2: In-progress case (today)
-- INSERT INTO public.cases (
--     case_code, surgeon_id, hospital_id, assigned_rep_id,
--     procedure, room, scheduled_date, scheduled_time,
--     time_in, status, confirmed, confirmed_by_id, confirmed_at, notes
-- ) VALUES (
--     'CASE-4722',
--     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
--     '22222222-2222-2222-2222-222222222222',
--     'rep1-uuid-here',
--     'C5-C6 ACDF',
--     'OR 4',
--     CURRENT_DATE,
--     '13:00',
--     CURRENT_DATE + TIME '13:05',
--     'in-progress',
--     true,
--     'rep1-uuid-here',
--     NOW() - INTERVAL '2 hours',
--     'Need all cage sizes available.'
-- );

-- CASE 3: Scheduled, unconfirmed (tomorrow)
-- INSERT INTO public.cases (
--     case_code, surgeon_id, hospital_id, assigned_rep_id,
--     procedure, room, scheduled_date, scheduled_time,
--     status, confirmed, notes
-- ) VALUES (
--     'CASE-4723',
--     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     '33333333-3333-3333-3333-333333333333',
--     'rep1-uuid-here',
--     'L5-S1 TLIF',
--     'OR 1',
--     CURRENT_DATE + INTERVAL '1 day',
--     '08:00',
--     'scheduled',
--     false,
--     'Will need navigation system.'
-- );

-- CASE 4: Scheduled, unconfirmed (day after tomorrow)
-- INSERT INTO public.cases (
--     case_code, surgeon_id, hospital_id, assigned_rep_id,
--     procedure, room, scheduled_date, scheduled_time,
--     status, confirmed, notes
-- ) VALUES (
--     'CASE-4724',
--     'cccccccc-cccc-cccc-cccc-cccccccccccc',
--     '33333333-3333-3333-3333-333333333333',
--     'rep2-uuid-here',
--     'L3-L4 Posterior Fusion',
--     'OR 3',
--     CURRENT_DATE + INTERVAL '2 days',
--     '07:00',
--     'scheduled',
--     false,
--     'Early start. Have trays ready night before.'
-- );

-- =====================================================
-- FUNCTIONS: Helper functions for the application
-- =====================================================

-- Function to generate next case code
CREATE OR REPLACE FUNCTION generate_case_code()
RETURNS TEXT AS $$
DECLARE
    max_number INTEGER;
    next_number INTEGER;
BEGIN
    -- Get the highest case number
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_code FROM 6) AS INTEGER)), 4720)
    INTO max_number
    FROM public.cases
    WHERE case_code LIKE 'CASE-%';

    next_number := max_number + 1;

    RETURN 'CASE-' || next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get unconfirmed case count for a rep
CREATE OR REPLACE FUNCTION get_unconfirmed_count(rep_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.cases
        WHERE assigned_rep_id = rep_id
        AND confirmed = false
        AND status = 'scheduled'
        AND scheduled_date >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update case status based on time tracking
CREATE OR REPLACE FUNCTION update_case_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If time_in is set and time_out is null, status should be in-progress
    IF NEW.time_in IS NOT NULL AND NEW.time_out IS NULL THEN
        NEW.status := 'in-progress';
    END IF;

    -- If both time_in and time_out are set, status should be completed
    IF NEW.time_in IS NOT NULL AND NEW.time_out IS NOT NULL THEN
        NEW.status := 'completed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_case_status
    BEFORE INSERT OR UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION update_case_status();

-- =====================================================
-- VIEWS: Useful views for the application
-- =====================================================

-- View: Cases with full details (surgeon, hospital, rep names)
CREATE OR REPLACE VIEW cases_detailed AS
SELECT
    c.id,
    c.case_code,
    c.procedure,
    c.room,
    c.scheduled_date,
    c.scheduled_time,
    c.time_in,
    c.time_out,
    c.delay_minutes,
    c.status,
    c.confirmed,
    c.confirmed_at,
    c.notes,
    c.created_at,
    c.updated_at,
    -- Surgeon details
    s.id as surgeon_id,
    s.name as surgeon_name,
    s.specialty as surgeon_specialty,
    -- Hospital details
    h.id as hospital_id,
    h.name as hospital_name,
    h.city as hospital_city,
    -- Rep details
    u.id as assigned_rep_id,
    u.full_name as assigned_rep_name,
    -- Confirmed by details
    conf.full_name as confirmed_by_name
FROM public.cases c
LEFT JOIN public.surgeons s ON c.surgeon_id = s.id
LEFT JOIN public.hospitals h ON c.hospital_id = h.id
LEFT JOIN public.users u ON c.assigned_rep_id = u.id
LEFT JOIN public.users conf ON c.confirmed_by_id = conf.id;

COMMENT ON VIEW cases_detailed IS 'Cases with all related information joined (surgeon, hospital, rep names)';
