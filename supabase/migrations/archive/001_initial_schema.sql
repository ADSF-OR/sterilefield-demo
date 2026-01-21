-- SterileField Database Schema
-- Migration 001: Initial schema creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('rep', 'scheduler', 'admin');
CREATE TYPE case_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');

-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'rep',
    territory TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HOSPITALS TABLE
-- =====================================================
CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'NJ',
    address TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, city)
);

-- =====================================================
-- SURGEONS TABLE
-- =====================================================
CREATE TABLE public.surgeons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    primary_hospital_id UUID REFERENCES public.hospitals(id),
    scheduler_name TEXT,
    scheduler_email TEXT,
    scheduler_phone TEXT,
    cases_ytd INTEGER DEFAULT 0,
    pref_general TEXT,
    pref_implants TEXT,
    pref_technique TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CASES TABLE
-- =====================================================
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_code TEXT UNIQUE NOT NULL,
    surgeon_id UUID NOT NULL REFERENCES public.surgeons(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id),
    assigned_rep_id UUID REFERENCES public.users(id),

    -- Case details
    procedure TEXT NOT NULL,
    room TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,

    -- Time tracking
    time_in TIMESTAMPTZ,
    time_out TIMESTAMPTZ,
    delay_minutes INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN time_in IS NOT NULL THEN
                EXTRACT(EPOCH FROM (time_in - (scheduled_date + scheduled_time)::TIMESTAMPTZ)) / 60
            ELSE NULL
        END
    ) STORED,

    -- Status and confirmation
    status case_status DEFAULT 'scheduled',
    confirmed BOOLEAN DEFAULT false,
    confirmed_by_id UUID REFERENCES public.users(id),
    confirmed_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    -- Metadata
    created_by_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CHECK (scheduled_date >= CURRENT_DATE - INTERVAL '30 days'), -- Don't allow scheduling too far in the past
    CHECK (time_out IS NULL OR time_out > time_in) -- Time out must be after time in
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_cases_surgeon_id ON public.cases(surgeon_id);
CREATE INDEX idx_cases_hospital_id ON public.cases(hospital_id);
CREATE INDEX idx_cases_assigned_rep_id ON public.cases(assigned_rep_id);
CREATE INDEX idx_cases_scheduled_date ON public.cases(scheduled_date);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_confirmed ON public.cases(confirmed) WHERE confirmed = false;
CREATE INDEX idx_surgeons_hospital_id ON public.surgeons(primary_hospital_id);
CREATE INDEX idx_users_role ON public.users(role);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surgeons_updated_at BEFORE UPDATE ON public.surgeons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all active users"
    ON public.users FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Hospitals policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view hospitals"
    ON public.hospitals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Schedulers can manage hospitals"
    ON public.hospitals FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

-- Surgeons policies
CREATE POLICY "Authenticated users can view active surgeons"
    ON public.surgeons FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Schedulers can manage surgeons"
    ON public.surgeons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

-- Cases policies
CREATE POLICY "Users can view cases they're involved with"
    ON public.cases FOR SELECT
    TO authenticated
    USING (
        assigned_rep_id = auth.uid()
        OR created_by_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

CREATE POLICY "Schedulers can create cases"
    ON public.cases FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

CREATE POLICY "Schedulers can update any case"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

CREATE POLICY "Reps can update their assigned cases"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (assigned_rep_id = auth.uid())
    WITH CHECK (assigned_rep_id = auth.uid());

CREATE POLICY "Schedulers can delete cases"
    ON public.cases FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('scheduler', 'admin')
        )
    );

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE public.users IS 'User accounts with role-based access (reps, schedulers, admins)';
COMMENT ON TABLE public.hospitals IS 'Hospital facilities where surgeries take place';
COMMENT ON TABLE public.surgeons IS 'Surgeon profiles with preferences and contact information';
COMMENT ON TABLE public.cases IS 'Surgical cases with scheduling, tracking, and confirmation data';

COMMENT ON COLUMN public.cases.delay_minutes IS 'Automatically calculated delay in minutes (negative = early, positive = late)';
COMMENT ON COLUMN public.cases.confirmed IS 'Whether the assigned rep has confirmed they will cover this case';
