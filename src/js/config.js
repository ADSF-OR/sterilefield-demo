/**
 * SterileField Configuration
 * Centralized configuration for Supabase and application settings
 */

// Supabase configuration - loaded from environment variables
// Supports both Vite (VITE_*) and Vercel/Next.js (NEXT_PUBLIC_*) naming conventions
export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

// Validate configuration
export function validateConfig() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('❌ Missing Supabase configuration!');
        console.error('Checked for: VITE_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL');
        console.error('Checked for: VITE_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return false;
    }
    return true;
}

// Application configuration
export const APP_CONFIG = {
    name: 'SterileField',
    version: '2.0.0',
    defaultTerritory: 'South Jersey',

    // Case code configuration
    caseCodePrefix: 'CASE-',

    // Pagination
    defaultPageSize: 50,

    // Time format
    timeFormat: '12h', // 12h or 24h

    // Filters
    defaultCaseFilter: 'today' // today, all, mine, unconfirmed
};

// User roles
export const USER_ROLES = {
    REP: 'rep',
    SCHEDULER: 'scheduler',
    ADMIN: 'admin'
};

// Case statuses
export const CASE_STATUS = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// UI Constants
export const UI_CONSTANTS = {
    colors: {
        cream: '#faf8f3',
        forest: '#1a4d2e',
        forestLight: '#2d6b45',
        gold: '#b8860b',
        goldLight: '#d4a942',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    },

    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
    }
};

// Feature flags
export const FEATURES = {
    enableRealtime: true,  // Enable Supabase Realtime subscriptions
    enableNotifications: true,  // Enable browser notifications
    enableAnalytics: false  // Enable usage analytics
};
