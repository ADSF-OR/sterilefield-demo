/**
 * SterileField Application Main Module (Refactored with Routing)
 * Handles UI logic and integrates with Supabase database
 */

// Import modules
import { initSupabase } from './database.js';
import { isAuthenticated, initAuth, signOut, getCurrentUserProfile } from './auth.js';
import { defineRoute, navigateTo, setAuthCheck, showPage, hideAllPages, showHeader, showBottomNav, setActiveNav } from './router.js';

// Import pages
import { renderLoginPage } from '../pages/login.js';
import { renderCaseListPage } from '../pages/caseList.js';
import { renderCaseDetailPage } from '../pages/caseDetail.js';
import { renderCaseFormPage } from '../pages/caseForm.js';

// =====================================================
// INITIALIZATION
// =====================================================

export async function initApp() {
    try {
        console.log('🚀 Initializing SterileField application...');

        // Initialize Supabase
        initSupabase();

        // Set up authentication check for router
        setAuthCheck(async () => {
            return isAuthenticated();
        });

        // Define all routes
        defineRoutes();

        // Initialize auth and check session
        const hasSession = await initAuth();

        console.log('✅ Application initialized successfully');

        // Navigate to initial route
        const path = window.location.pathname;
        if (path === '/' || path === '') {
            if (hasSession) {
                await navigateTo('/cases', true);
            } else {
                await navigateTo('/login', true);
            }
        } else {
            await navigateTo(path, true);
        }
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

// =====================================================
// ROUTE DEFINITIONS
// =====================================================

function defineRoutes() {
    // Public routes
    defineRoute('/login', async () => {
        hideAllPages();
        showHeader(false);
        showBottomNav(false);
        showPage('loginPage');
        await renderLoginPage();
    }, { requiresAuth: false });

    // Protected routes
    defineRoute('/', async () => {
        await navigateTo('/cases', true);
    });

    defineRoute('/cases', async () => {
        hideAllPages();
        showHeader(true);
        showBottomNav(true);
        setActiveNav('navCases');
        showPage('caseListPage');
        await renderCaseListPage();
    });

    defineRoute('/cases/new', async () => {
        hideAllPages();
        showHeader(true);
        showBottomNav(false);
        showPage('caseFormPage');
        await renderCaseFormPage();
    });

    // Dynamic routes with params
    defineRoute('/cases/:id/edit', async (params) => {
        hideAllPages();
        showHeader(true);
        showBottomNav(false);
        showPage('caseFormPage');
        await renderCaseFormPage(params.id);
    });

    defineRoute('/cases/:id', async (params) => {
        hideAllPages();
        showHeader(true);
        showBottomNav(false);
        showPage('caseDetailPage');
        await renderCaseDetailPage(params.id);
    });
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #fee;
        border: 1px solid #fcc;
        color: #c33;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// =====================================================
// EXPORT WINDOW FUNCTIONS
// =====================================================

// Make navigation function available globally
window.navigateTo = navigateTo;

// Sign out handler
window.handleSignOut = async () => {
    try {
        await signOut();
    } catch (error) {
        console.error('Sign out error:', error);
    }
};

// Update header with sign out button
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    if (header) {
        // Add sign out button to header
        const switchBtn = header.querySelector('.switch-btn');
        if (switchBtn) {
            switchBtn.textContent = 'Sign Out';
            switchBtn.onclick = window.handleSignOut;
        }
    }

    // Update bottom nav to use navigateTo
    const navButtons = {
        navSurgeons: '/cases',
        navCases: '/cases',
        navTerritory: '/cases',
        navMore: '/cases'
    };

    Object.entries(navButtons).forEach(([id, path]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = () => navigateTo(path);
        }
    });
});
