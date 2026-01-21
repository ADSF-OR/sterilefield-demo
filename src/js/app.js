/**
 * SterileField MVP Application
 * Simple case tracking without authentication
 */

import { initSupabase } from './database.js';
import { defineRoute, navigateTo, showPage, hideAllPages } from './router.js';

// Import pages
import { renderModeChooserPage } from '../pages/modeChooser.js';
import { renderRepHomePage } from '../pages/repHome.js';
import { renderSchedulerHomePage } from '../pages/schedulerHome.js';
import { renderSchedulePage } from '../pages/schedule.js';
import { renderCaseFormPage } from '../pages/caseForm.js';
import { renderCaseDetailPage } from '../pages/caseDetail.js';
import { renderHospitalsPage } from '../pages/hospitals.js';
import { renderSurgeonsPage } from '../pages/surgeons.js';
import { renderSurgeonDetailPage } from '../pages/surgeonDetail.js';

// =====================================================
// INITIALIZATION
// =====================================================

export async function initApp() {
    try {
        console.log('🚀 Initializing SterileField MVP...');

        // Initialize Supabase
        initSupabase();

        // Define all routes
        defineRoutes();

        console.log('✅ Application initialized successfully');

        // Navigate to initial route
        const path = window.location.pathname;

        // Check for saved mode preference
        const savedMode = localStorage.getItem('appMode');

        if (path === '/' || path === '') {
            // If we have a saved mode, redirect to that mode's home
            if (savedMode === 'rep') {
                await navigateTo('/rep', true);
            } else if (savedMode === 'scheduler') {
                await navigateTo('/scheduler', true);
            } else {
                // Show mode chooser
                await navigateTo('/', true);
            }
        } else {
            await navigateTo(path, true);
        }
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showConfigError(error.message);
    }
}

// =====================================================
// ROUTE DEFINITIONS
// =====================================================

function defineRoutes() {
    // =====================================================
    // MODE CHOOSER
    // =====================================================
    defineRoute('/', async () => {
        hideAllPages();
        hideNavigation();
        showPage('modeChooserPage');
        await renderModeChooserPage();
    }, { requiresAuth: false });

    // =====================================================
    // REP VIEW ROUTES
    // =====================================================

    // Rep Home
    defineRoute('/rep', async () => {
        hideAllPages();
        showNavigation('rep');
        showPage('repHomePage');
        await renderRepHomePage();
    }, { requiresAuth: false });

    // Rep Schedule
    defineRoute('/rep/schedule', async () => {
        hideAllPages();
        showNavigation('rep');
        showPage('schedulePage');
        await renderSchedulePage('rep');
    }, { requiresAuth: false });

    // Rep Hospitals
    defineRoute('/rep/hospitals', async () => {
        hideAllPages();
        showNavigation('rep');
        showPage('hospitalsPage');
        await renderHospitalsPage();
    }, { requiresAuth: false });

    // Rep Surgeons
    defineRoute('/rep/surgeons', async () => {
        hideAllPages();
        showNavigation('rep');
        showPage('surgeonsPage');
        await renderSurgeonsPage();
    }, { requiresAuth: false });

    // Rep Surgeon Detail
    defineRoute('/rep/surgeons/:id', async (params) => {
        hideAllPages();
        showNavigation('rep');
        showPage('surgeonDetailPage');
        await renderSurgeonDetailPage(params.id, 'rep');
    }, { requiresAuth: false });

    // Rep New Case
    defineRoute('/rep/cases/new', async () => {
        hideAllPages();
        showNavigation('rep');
        showPage('caseFormPage');
        await renderCaseFormPage(null, 'rep');
    }, { requiresAuth: false });

    // Rep Case Detail
    defineRoute('/rep/cases/:id', async (params) => {
        hideAllPages();
        showNavigation('rep');
        showPage('caseDetailPage');
        await renderCaseDetailPage(params.id, 'rep');
    }, { requiresAuth: false });

    // Rep Edit Case
    defineRoute('/rep/cases/:id/edit', async (params) => {
        hideAllPages();
        showNavigation('rep');
        showPage('caseFormPage');
        await renderCaseFormPage(params.id, 'rep');
    }, { requiresAuth: false });

    // =====================================================
    // SCHEDULER VIEW ROUTES
    // =====================================================

    // Scheduler Home
    defineRoute('/scheduler', async () => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('schedulerHomePage');
        await renderSchedulerHomePage();
    }, { requiresAuth: false });

    // Scheduler Hospitals
    defineRoute('/scheduler/hospitals', async () => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('hospitalsPage');
        await renderHospitalsPage();
    }, { requiresAuth: false });

    // Scheduler Surgeons
    defineRoute('/scheduler/surgeons', async () => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('surgeonsPage');
        await renderSurgeonsPage();
    }, { requiresAuth: false });

    // Scheduler Surgeon Detail
    defineRoute('/scheduler/surgeons/:id', async (params) => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('surgeonDetailPage');
        await renderSurgeonDetailPage(params.id, 'scheduler');
    }, { requiresAuth: false });

    // Scheduler New Case
    defineRoute('/scheduler/cases/new', async () => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('caseFormPage');
        await renderCaseFormPage(null, 'scheduler');
    }, { requiresAuth: false });

    // Scheduler Case Detail
    defineRoute('/scheduler/cases/:id', async (params) => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('caseDetailPage');
        await renderCaseDetailPage(params.id, 'scheduler');
    }, { requiresAuth: false });

    // Scheduler Edit Case
    defineRoute('/scheduler/cases/:id/edit', async (params) => {
        hideAllPages();
        showNavigation('scheduler');
        showPage('caseFormPage');
        await renderCaseFormPage(params.id, 'scheduler');
    }, { requiresAuth: false });
}

// =====================================================
// NAVIGATION HELPERS
// =====================================================

function hideNavigation() {
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
}

function showNavigation(mode) {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.display = 'flex';
        updateNavigationForMode(mode);
    }
}

function updateNavigationForMode(mode) {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Update mode indicator and navigation
    const modeLabel = mode === 'rep' ? 'Rep View' : 'Scheduler View';
    const modeColor = mode === 'rep' ? '#3b82f6' : '#f59e0b';

    // Create navigation HTML based on mode
    if (mode === 'rep') {
        nav.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="font-family: Georgia, serif; font-size: 24px; font-weight: bold;">SterileField</div>
                    <span style="background: ${modeColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${modeLabel}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="nav-link" onclick="window.navigateTo('/rep')">🏠 Home</button>
                    <button class="nav-link" onclick="window.navigateTo('/rep/schedule')">📋 Schedule</button>
                    <button class="nav-link" onclick="window.navigateTo('/rep/hospitals')">🏥 Hospitals</button>
                    <button class="nav-link" onclick="window.navigateTo('/rep/surgeons')">👨‍⚕️ Surgeons</button>
                    <button class="nav-link" onclick="switchMode()" style="background: rgba(255,255,255,0.2);">🔄 Switch Mode</button>
                </div>
            </div>
        `;
    } else {
        nav.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="font-family: Georgia, serif; font-size: 24px; font-weight: bold;">SterileField</div>
                    <span style="background: ${modeColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${modeLabel}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="nav-link" onclick="window.navigateTo('/scheduler')">🏠 Home</button>
                    <button class="nav-link" onclick="window.navigateTo('/scheduler/hospitals')">🏥 Hospitals</button>
                    <button class="nav-link" onclick="window.navigateTo('/scheduler/surgeons')">👨‍⚕️ Surgeons</button>
                    <button class="nav-link" onclick="switchMode()" style="background: rgba(255,255,255,0.2);">🔄 Switch Mode</button>
                </div>
            </div>
        `;
    }
}

// Add switch mode function to window
window.switchMode = function() {
    localStorage.removeItem('appMode');
    window.navigateTo('/');
};

// =====================================================
// ERROR HANDLING
// =====================================================

function showConfigError(message) {
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fee 0%, #fdd 100%); padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 600px; border: 2px solid #c33;">
                <div style="font-size: 64px; text-align: center; margin-bottom: 20px;">⚠️</div>
                <h1 style="font-size: 24px; color: #c33; margin-bottom: 16px; text-align: center;">Configuration Error</h1>
                <p style="color: #666; margin-bottom: 24px; line-height: 1.6;">${message}</p>

                <div style="background: #f9f9f9; border-left: 4px solid #c33; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="font-weight: 600; margin-bottom: 12px; color: #333;">Required Environment Variables (use either naming convention):</div>
                    <code style="display: block; background: #fff; padding: 12px; border-radius: 4px; font-size: 13px; line-height: 1.8;">
                        <strong>Option 1 (Vite):</strong><br>
                        VITE_SUPABASE_URL=https://your-project-id.supabase.co<br>
                        VITE_SUPABASE_ANON_KEY=your-anon-key-here<br>
                        <br>
                        <strong>Option 2 (Vercel/Next.js):</strong><br>
                        NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co<br>
                        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
                    </code>
                </div>

                <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 16px; border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #0066cc;">For Local Development:</div>
                    <ol style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                        <li>Create a <code>.env.local</code> file in the project root</li>
                        <li>Add your Supabase credentials using <code>VITE_*</code> prefix</li>
                        <li>Restart the dev server</li>
                    </ol>
                </div>

                <div style="background: #f0f9ff; border-left: 4px solid #0891b2; padding: 16px; border-radius: 8px; margin-top: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #0891b2;">For Vercel Deployment:</div>
                    <ol style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                        <li>Go to Project Settings → Environment Variables</li>
                        <li>Add variables using either <code>VITE_*</code> or <code>NEXT_PUBLIC_*</code> prefix</li>
                        <li>Redeploy your application</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// EXPORT WINDOW FUNCTIONS
// =====================================================

// Make navigation function available globally
window.navigateTo = navigateTo;
