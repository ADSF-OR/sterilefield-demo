/**
 * SterileField Authentication Module
 * Handles user authentication and session management
 */

import { getSupabase } from './database.js';
import { USER_ROLES } from './config.js';

// Current session state
let currentUser = null;
let currentUserProfile = null;

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

export async function signIn(email, password) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    // Fetch user profile
    await loadUserProfile(data.user.id);

    return data;
}

export async function signUp(email, password, userData) {
    const supabase = getSupabase();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: userData.fullName,
                role: userData.role || USER_ROLES.REP
            }
        }
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
        .from('users')
        .insert([{
            id: authData.user.id,
            email: email,
            full_name: userData.fullName,
            role: userData.role || USER_ROLES.REP,
            territory: userData.territory,
            phone: userData.phone
        }]);

    if (profileError) throw profileError;

    return authData;
}

export async function signOut() {
    const supabase = getSupabase();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    currentUser = null;
    currentUserProfile = null;

    // Redirect to login
    window.location.href = '/';
}

export async function resetPassword(email) {
    const supabase = getSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
}

export async function updatePassword(newPassword) {
    const supabase = getSupabase();

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
}

// =====================================================
// SESSION MANAGEMENT
// =====================================================

export async function checkSession() {
    const supabase = getSupabase();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (session) {
        currentUser = session.user;
        await loadUserProfile(session.user.id);
        return true;
    }

    return false;
}

export async function loadUserProfile(userId) {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;

    currentUserProfile = data;
    return data;
}

export function getCurrentUser() {
    return currentUser;
}

export function getCurrentUserProfile() {
    return currentUserProfile;
}

export function isAuthenticated() {
    return currentUser !== null;
}

export function getUserRole() {
    return currentUserProfile?.role;
}

export function isRep() {
    return getUserRole() === USER_ROLES.REP;
}

export function isScheduler() {
    return getUserRole() === USER_ROLES.SCHEDULER;
}

export function isAdmin() {
    return getUserRole() === USER_ROLES.ADMIN;
}

// =====================================================
// AUTH STATE LISTENERS
// =====================================================

export function onAuthStateChange(callback) {
    const supabase = getSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            console.log('Auth state changed:', event);

            if (session) {
                currentUser = session.user;
                await loadUserProfile(session.user.id);
            } else {
                currentUser = null;
                currentUserProfile = null;
            }

            callback(event, session, currentUserProfile);
        }
    );

    return subscription;
}

// =====================================================
// DEMO MODE (for testing without authentication)
// =====================================================

export function enableDemoMode(role = USER_ROLES.REP) {
    console.warn('⚠️ DEMO MODE ENABLED - Not for production use!');

    // Create mock user
    currentUser = {
        id: 'demo-user-id',
        email: 'demo@sterilefield.com'
    };

    currentUserProfile = {
        id: 'demo-user-id',
        email: 'demo@sterilefield.com',
        full_name: role === USER_ROLES.REP ? 'Demo Rep' : 'Demo Scheduler',
        role: role,
        territory: 'South Jersey',
        is_active: true
    };

    return currentUserProfile;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function handleAuthError(error) {
    console.error('Auth error:', error);

    if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password';
    } else if (error.message.includes('Email not confirmed')) {
        return 'Please confirm your email address';
    } else if (error.message.includes('User already registered')) {
        return 'An account with this email already exists';
    } else if (error.message.includes('Password')) {
        return 'Password must be at least 6 characters';
    }

    return error.message || 'An authentication error occurred';
}

// Initialize auth state check on load
export async function initAuth() {
    try {
        const hasSession = await checkSession();

        if (!hasSession) {
            console.log('No active session');
            // For development/demo purposes, enable demo mode if no Supabase config
            const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
            if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
                console.warn('⚠️ No Supabase configuration found, enabling demo mode');
                enableDemoMode();
                return true;
            }
        } else {
            console.log('✅ User authenticated:', currentUserProfile.full_name);
        }

        return hasSession;
    } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Try demo mode as fallback
        console.warn('⚠️ Auth error, enabling demo mode');
        enableDemoMode();
        return true;
    }
}
