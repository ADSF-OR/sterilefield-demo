/**
 * SterileField Database Module
 * Handles all Supabase database operations
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG, validateConfig, CASE_STATUS } from './config.js';

// Initialize Supabase client
let supabase = null;

export function initSupabase() {
    if (!validateConfig()) {
        throw new Error('Invalid Supabase configuration');
    }

    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionUrl: true
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
// AUTHENTICATION
// =====================================================

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// SURGEONS
// =====================================================

export async function getSurgeons() {
    const { data, error } = await supabase
        .from('surgeons')
        .select(`
            *,
            primary_hospital:hospitals(*)
        `)
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return data;
}

export async function getSurgeon(surgeonId) {
    const { data, error } = await supabase
        .from('surgeons')
        .select(`
            *,
            primary_hospital:hospitals(*)
        `)
        .eq('id', surgeonId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateSurgeonPreferences(surgeonId, preferences) {
    const { data, error } = await supabase
        .from('surgeons')
        .update({
            pref_general: preferences.general,
            pref_implants: preferences.implants,
            pref_technique: preferences.technique
        })
        .eq('id', surgeonId)
        .select()
        .single();

    if (error) throw error;
    return data;
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
    return data;
}

export async function getHospital(hospitalId) {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', hospitalId)
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// CASES
// =====================================================

export async function getCases(filters = {}) {
    let query = supabase
        .from('cases_detailed')
        .select('*');

    // Apply filters
    if (filters.repId) {
        query = query.eq('assigned_rep_id', filters.repId);
    }

    if (filters.surgeonId) {
        query = query.eq('surgeon_id', filters.surgeonId);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.confirmed !== undefined) {
        query = query.eq('confirmed', filters.confirmed);
    }

    if (filters.date) {
        query = query.eq('scheduled_date', filters.date);
    }

    if (filters.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
    }

    // Default ordering
    query = query.order('scheduled_date', { ascending: true })
                 .order('scheduled_time', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getCase(caseId) {
    const { data, error } = await supabase
        .from('cases_detailed')
        .select('*')
        .eq('id', caseId)
        .single();

    if (error) throw error;
    return data;
}

export async function createCase(caseData) {
    // Generate case code
    const { data: caseCode } = await supabase.rpc('generate_case_code');

    const { data, error } = await supabase
        .from('cases')
        .insert([{
            case_code: caseCode,
            surgeon_id: caseData.surgeonId,
            hospital_id: caseData.hospitalId,
            assigned_rep_id: caseData.assignedRepId,
            procedure: caseData.procedure,
            room: caseData.room,
            scheduled_date: caseData.scheduledDate,
            scheduled_time: caseData.scheduledTime,
            notes: caseData.notes,
            created_by_id: caseData.createdById
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCase(caseId, updates) {
    const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', caseId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCase(caseId) {
    const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);

    if (error) throw error;
}

export async function confirmCase(caseId, userId, userName) {
    const { data, error } = await supabase
        .from('cases')
        .update({
            confirmed: true,
            confirmed_by_id: userId,
            confirmed_at: new Date().toISOString()
        })
        .eq('id', caseId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCaseTime(caseId, timeType, timestamp) {
    const updates = {};

    if (timeType === 'in') {
        updates.time_in = timestamp;
    } else if (timeType === 'out') {
        updates.time_out = timestamp;
    }

    return updateCase(caseId, updates);
}

export async function getUnconfirmedCount(repId) {
    const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_rep_id', repId)
        .eq('confirmed', false)
        .eq('status', CASE_STATUS.SCHEDULED)
        .gte('scheduled_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return count;
}

// =====================================================
// USERS / REPS
// =====================================================

export async function getReps() {
    const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, territory')
        .eq('role', 'rep')
        .eq('is_active', true)
        .order('full_name');

    if (error) throw error;
    return data;
}

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export function subscribeToCases(callback) {
    const channel = supabase
        .channel('cases_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'cases'
            },
            callback
        )
        .subscribe();

    return channel;
}

export function unsubscribe(channel) {
    if (channel) {
        supabase.removeChannel(channel);
    }
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
        return 'A record with this information already exists';
    } else if (error.code === '23503') {
        return 'Cannot delete this record as it is referenced by other records';
    } else if (error.message.includes('JWT')) {
        return 'Session expired. Please log in again.';
    } else if (error.message.includes('permission')) {
        return 'You do not have permission to perform this action';
    }

    return error.message || 'An unexpected error occurred';
}
