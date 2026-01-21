/**
 * Home Dashboard Page
 */

import { getDashboardStats, getUpcomingCases } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError } from '../utils/helpers.js';

export async function renderHomePage() {
    const container = document.getElementById('homePage');
    if (!container) {
        console.error('Home page container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading dashboard...</div>
            </div>
        </div>
    `;

    try {
        // Load stats and upcoming cases
        const [stats, upcomingCases] = await Promise.all([
            getDashboardStats(),
            getUpcomingCases(7)
        ]);

        // Render dashboard
        container.innerHTML = `
            <div class="content">
                <h1 class="page-title">SterileField Dashboard</h1>
                <p class="page-subtitle">Case Tracking & Scheduling</p>

                <!-- Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.todayCount}</div>
                        <div class="stat-label">Cases Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.upcoming7Days}</div>
                        <div class="stat-label">Next 7 Days</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalScheduled}</div>
                        <div class="stat-label">Total Scheduled</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px; margin-bottom: 32px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: var(--forest); margin-bottom: 20px;">Quick Actions</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <button class="btn btn-primary" onclick="window.navigateTo('/cases/new')" style="padding: 16px;">
                            ➕ Schedule New Case
                        </button>
                        <button class="btn btn-secondary" onclick="window.navigateTo('/schedule')" style="padding: 16px;">
                            📋 View Schedule
                        </button>
                        <button class="btn btn-secondary" onclick="window.navigateTo('/hospitals')" style="padding: 16px;">
                            🏥 Manage Hospitals
                        </button>
                        <button class="btn btn-secondary" onclick="window.navigateTo('/surgeons')" style="padding: 16px;">
                            👨‍⚕️ Manage Surgeons
                        </button>
                    </div>
                </div>

                <!-- Upcoming Cases -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; font-weight: 700; color: var(--forest); margin: 0;">Upcoming Cases</h2>
                        <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/schedule')">
                            View All →
                        </button>
                    </div>
                    <div id="upcomingCasesList">
                        ${renderUpcomingCases(upcomingCases)}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        handleError(error, 'renderHomePage');
        container.innerHTML = `
            <div class="content">
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load dashboard</div>
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderUpcomingCases(cases) {
    if (cases.length === 0) {
        return `
            <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 12px;">📅</div>
                <div style="font-size: 16px;">No upcoming cases in the next 7 days</div>
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="window.navigateTo('/cases/new')">
                    Schedule Your First Case
                </button>
            </div>
        `;
    }

    return cases.slice(0, 5).map(c => `
        <div class="case-card" style="cursor: pointer; margin-bottom: 12px;" onclick="window.navigateTo('/cases/${c.id}')">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <div style="font-weight: 700; font-size: 18px; color: var(--forest); margin-bottom: 4px;">
                        ${c.procedure}
                    </div>
                    <div style="font-size: 14px; color: var(--gray-light);">
                        ${formatDate(c.case_datetime)} at ${formatTime(c.case_datetime)}
                    </div>
                </div>
                ${renderStatusBadge(c.status)}
            </div>
            <div style="display: flex; gap: 16px; font-size: 14px; color: var(--slate);">
                <div>👨‍⚕️ ${c.surgeon?.name || 'Unknown'}</div>
                <div>📍 ${c.hospital?.name || 'Unknown'}</div>
            </div>
        </div>
    `).join('') + (cases.length > 5 ? `
        <div style="text-align: center; margin-top: 16px;">
            <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/schedule')">
                View ${cases.length - 5} More Cases →
            </button>
        </div>
    ` : '');
}

function renderStatusBadge(status) {
    const badges = {
        'scheduled': '<span class="badge badge-gray">Scheduled</span>',
        'completed': '<span class="badge badge-green">Completed</span>',
        'canceled': '<span class="badge badge-danger">Canceled</span>'
    };
    return badges[status] || badges.scheduled;
}
