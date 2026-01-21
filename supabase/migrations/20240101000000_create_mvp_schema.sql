-- SterileField MVP Database Schema
-- Simple case tracking: hospitals, surgeons, cases

-- =====================================================
-- TABLES
-- =====================================================

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on lowercase hospital name
CREATE UNIQUE INDEX IF NOT EXISTS hospitals_name_lower_idx ON hospitals(LOWER(name));

-- Surgeons table
CREATE TABLE IF NOT EXISTS surgeons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on lowercase surgeon name
CREATE UNIQUE INDEX IF NOT EXISTS surgeons_name_lower_idx ON surgeons(LOWER(name));

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_datetime TIMESTAMPTZ NOT NULL,
    procedure TEXT NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    surgeon_id UUID NOT NULL REFERENCES surgeons(id) ON DELETE RESTRICT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cases_case_datetime_idx ON cases(case_datetime);
CREATE INDEX IF NOT EXISTS cases_hospital_id_idx ON cases(hospital_id);
CREATE INDEX IF NOT EXISTS cases_surgeon_id_idx ON cases(surgeon_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow public read/write (no PHI, private app)
-- These policies allow anonymous users to perform all operations

-- Hospitals policies
DROP POLICY IF EXISTS "Allow public read access to hospitals" ON hospitals;
CREATE POLICY "Allow public read access to hospitals"
    ON hospitals FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access to hospitals" ON hospitals;
CREATE POLICY "Allow public insert access to hospitals"
    ON hospitals FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to hospitals" ON hospitals;
CREATE POLICY "Allow public update access to hospitals"
    ON hospitals FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to hospitals" ON hospitals;
CREATE POLICY "Allow public delete access to hospitals"
    ON hospitals FOR DELETE
    USING (true);

-- Surgeons policies
DROP POLICY IF EXISTS "Allow public read access to surgeons" ON surgeons;
CREATE POLICY "Allow public read access to surgeons"
    ON surgeons FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access to surgeons" ON surgeons;
CREATE POLICY "Allow public insert access to surgeons"
    ON surgeons FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to surgeons" ON surgeons;
CREATE POLICY "Allow public update access to surgeons"
    ON surgeons FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to surgeons" ON surgeons;
CREATE POLICY "Allow public delete access to surgeons"
    ON surgeons FOR DELETE
    USING (true);

-- Cases policies
DROP POLICY IF EXISTS "Allow public read access to cases" ON cases;
CREATE POLICY "Allow public read access to cases"
    ON cases FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access to cases" ON cases;
CREATE POLICY "Allow public insert access to cases"
    ON cases FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to cases" ON cases;
CREATE POLICY "Allow public update access to cases"
    ON cases FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access to cases" ON cases;
CREATE POLICY "Allow public delete access to cases"
    ON cases FOR DELETE
    USING (true);

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================

-- Insert sample hospitals
INSERT INTO hospitals (name) VALUES
    ('Memorial Hospital'),
    ('St. Mary''s Medical Center'),
    ('Regional Surgery Center')
ON CONFLICT DO NOTHING;

-- Insert sample surgeons
INSERT INTO surgeons (name) VALUES
    ('Dr. Jennifer Smith'),
    ('Dr. Michael Chen'),
    ('Dr. Sarah Johnson')
ON CONFLICT DO NOTHING;

-- Insert sample cases (optional)
INSERT INTO cases (case_datetime, procedure, hospital_id, surgeon_id, notes, status)
SELECT
    NOW() + INTERVAL '2 days',
    'Total Hip Replacement',
    (SELECT id FROM hospitals WHERE name = 'Memorial Hospital' LIMIT 1),
    (SELECT id FROM surgeons WHERE name = 'Dr. Jennifer Smith' LIMIT 1),
    'Patient prefers morning slot',
    'scheduled'
WHERE EXISTS (SELECT 1 FROM hospitals WHERE name = 'Memorial Hospital')
  AND EXISTS (SELECT 1 FROM surgeons WHERE name = 'Dr. Jennifer Smith')
ON CONFLICT DO NOTHING;
