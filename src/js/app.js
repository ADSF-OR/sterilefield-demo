/**
 * SterileField MVP Application
 * Simple case tracking without authentication
 */

import { initSupabase } from './database.js';
import { defineRoute, navigateTo, showPage, hideAllPages } from './router.js';

// Import pages
import { renderHomePage } from '../pages/home.js';
import { renderSchedulePage } from '../pages/schedule.js';
import { renderCaseFormPage } from '../pages/caseForm.js';
import { renderCaseDetailPage } from '../pages/caseDetail.js';
import { renderHospitalsPage } from '../pages/hospitals.js';
import { renderSurgeonsPage } from '../pages/surgeons.js';

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
        if (path === '/' || path === '') {
            await navigateTo('/', true);
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
    // Home dashboard
    defineRoute('/', async () => {
        hideAllPages();
        showPage('homePage');
        await renderHomePage();
    }, { requiresAuth: false });

    // Schedule list
    defineRoute('/schedule', async () => {
        hideAllPages();
        showPage('schedulePage');
        await renderSchedulePage();
    }, { requiresAuth: false });

    // New case form
    defineRoute('/cases/new', async () => {
        hideAllPages();
        showPage('caseFormPage');
        await renderCaseFormPage();
    }, { requiresAuth: false });

    // Case detail
    defineRoute('/cases/:id', async (params) => {
        hideAllPages();
        showPage('caseDetailPage');
        await renderCaseDetailPage(params.id);
    }, { requiresAuth: false });

    // Edit case
    defineRoute('/cases/:id/edit', async (params) => {
        hideAllPages();
        showPage('caseFormPage');
        await renderCaseFormPage(params.id);
    }, { requiresAuth: false });

    // Hospitals management
    defineRoute('/hospitals', async () => {
        hideAllPages();
        showPage('hospitalsPage');
        await renderHospitalsPage();
    }, { requiresAuth: false });

    // Surgeons management
    defineRoute('/surgeons', async () => {
        hideAllPages();
        showPage('surgeonsPage');
        await renderSurgeonsPage();
    }, { requiresAuth: false });
}

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
