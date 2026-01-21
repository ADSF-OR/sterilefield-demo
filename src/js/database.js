/**
 * SterileField Database Module (MVP)
 * Handles all Supabase database operations
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
let supabase = null;

export function initSupabase() {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

    // Check for missing environment variables
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase configuration!');
        console.error('Required environment variables:');
        console.error('  - VITE_SUPABASE_URL');
        console.error('  - VITE_SUPABASE_ANON_KEY');
        throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
    }

    // Check for placeholder values
    if (supabaseUrl.includes('your-project-id')) {
        console.error('❌ Supabase URL is still a placeholder!');
        throw new Error('Please replace VITE_SUPABASE_URL with your actual Supabase project URL.');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('✅ Supabase client initialized');
    return supabase;
}

export function getSupabase() {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
}

// =====================================================
// HOSPITALS
// =====================================================

export async function getHospitals() {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function getHospital(id) {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createHospital(name) {
    const { data, error } = await supabase
        .from('hospitals')
        .insert([{ name: name.trim() }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateHospital(id, name) {
    const { data, error } = await supabase
        .from('hospitals')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteHospital(id) {
    const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// =====================================================
// SURGEONS
// =====================================================

export async function getSurgeons() {
    const { data, error } = await supabase
        .from('surgeons')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function getSurgeon(id) {
    const { data, error } = await supabase
        .from('surgeons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createSurgeon(name) {
    const { data, error } = await supabase
        .from('surgeons')
        .insert([{ name: name.trim() }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateSurgeon(id, name) {
    const { data, error } = await supabase
        .from('surgeons')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteSurgeon(id) {
    const { error } = await supabase
        .from('surgeons')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// =====================================================
// CASES
// =====================================================

export async function getCases(filters = {}) {
    let query = supabase
        .from('cases')
        .select(`
            *,
            hospital:hospitals(id, name),
            surgeon:surgeons(id, name)
        `);

    // Apply filters
    if (filters.surgeonId) {
        query = query.eq('surgeon_id', filters.surgeonId);
    }

    if (filters.hospitalId) {
        query = query.eq('hospital_id', filters.hospitalId);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
        query = query.gte('case_datetime', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('case_datetime', filters.dateTo);
    }

    // Default ordering by date/time
    query = query.order('case_datetime', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

export async function getCase(id) {
    const { data, error } = await supabase
        .from('cases')
        .select(`
            *,
            hospital:hospitals(id, name),
            surgeon:surgeons(id, name)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createCase(caseData) {
    const { data, error } = await supabase
        .from('cases')
        .insert([{
            case_datetime: caseData.case_datetime,
            procedure: caseData.procedure,
            hospital_id: caseData.hospital_id,
            surgeon_id: caseData.surgeon_id,
            notes: caseData.notes || null,
            status: caseData.status || 'pending'
        }])
        .select(`
            *,
            hospital:hospitals(id, name),
            surgeon:surgeons(id, name)
        `)
        .single();

    if (error) throw error;
    return data;
}

export async function updateCase(id, updates) {
    const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select(`
            *,
            hospital:hospitals(id, name),
            surgeon:surgeons(id, name)
        `)
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCase(id) {
    const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function confirmCase(id, confirmedBy = 'Rep') {
    const { data, error} = await supabase
        .from('cases')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: confirmedBy
        })
        .eq('id', id)
        .select(`
            *,
            hospital:hospitals(id, name),
            surgeon:surgeons(id, name)
        `)
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function handleDatabaseError(error) {
    console.error('Database error:', error);

    // Check for specific error types
    if (error.code === 'PGRST116') {
        return 'Record not found';
    } else if (error.code === '23505') {
        return 'A record with this name already exists';
    } else if (error.code === '23503') {
        return 'Cannot delete this record because it is referenced by cases';
    } else if (error.message && error.message.includes('duplicate key')) {
        return 'A record with this name already exists';
    }

    return error.message || 'An unexpected error occurred';
}

// Get upcoming cases (next 7 days by default)
export async function getUpcomingCases(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return getCases({
        dateFrom: now.toISOString(),
        dateTo: futureDate.toISOString()
    });
}

// Get statistics for dashboard
export async function getDashboardStats() {
    try {
        const [allCases, upcomingCases] = await Promise.all([
            getCases({ status: 'scheduled' }),
            getUpcomingCases(7)
        ]);

        return {
            totalScheduled: allCases.length,
            upcoming7Days: upcomingCases.length,
            todayCount: upcomingCases.filter(c => {
                const caseDate = new Date(c.case_datetime);
                const today = new Date();
                return caseDate.toDateString() === today.toDateString();
            }).length
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            totalScheduled: 0,
            upcoming7Days: 0,
            todayCount: 0
        };
    }
}
