/**
 * Authentication Utilities
 * Simple hardcoded authentication for MVP
 */

// Hardcoded credentials
const CREDENTIALS = {
    rep: {
        username: 'rep',
        password: 'rep123',
        role: 'rep',
        displayName: 'Rep User'
    },
    scheduler: {
        username: 'scheduler',
        password: 'scheduler123',
        role: 'scheduler',
        displayName: 'Scheduler User'
    },
    coordinator: {
        username: 'coordinator',
        password: 'coordinator123',
        role: 'anesthesia',
        displayName: 'Anesthesia Coordinator',
        anesthesiaRole: 'coordinator'
    },
    coverage: {
        username: 'coverage',
        password: 'coverage123',
        role: 'anesthesia',
        displayName: 'Anesthesia Coverage',
        anesthesiaRole: 'coverage'
    }
};

// Check if user is authenticated
export function isAuthenticated() {
    const authData = localStorage.getItem('sterileFieldAuth');
    if (!authData) return false;

    try {
        const parsed = JSON.parse(authData);
        return !!(parsed.role && parsed.username);
    } catch (e) {
        return false;
    }
}

// Get current user data
export function getCurrentUser() {
    const authData = localStorage.getItem('sterileFieldAuth');
    if (!authData) return null;

    try {
        return JSON.parse(authData);
    } catch (e) {
        return null;
    }
}

// Login with username and password
export function login(username, password) {
    // Check credentials
    const user = Object.values(CREDENTIALS).find(
        cred => cred.username === username && cred.password === password
    );

    if (!user) {
        return {
            success: false,
            error: 'Invalid username or password'
        };
    }

    // Save auth data
    const authData = {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('sterileFieldAuth', JSON.stringify(authData));

    // Also set mode in localStorage for consistency
    localStorage.setItem('sterileFieldMode', user.role);

    return {
        success: true,
        user: authData
    };
}

// Logout
export function logout() {
    localStorage.removeItem('sterileFieldAuth');
    localStorage.removeItem('sterileFieldMode');
}

// Require authentication - redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        // Save current path to redirect after login
        const currentPath = window.location.hash || '#/';
        localStorage.setItem('sterileFieldRedirect', currentPath);
        return false;
    }
    return true;
}
