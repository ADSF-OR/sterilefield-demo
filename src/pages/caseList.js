/**
 * Case List Page
 */

import { getCases } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError } from '../utils/helpers.js';
import { getCurrentUserProfile } from '../js/auth.js';

let currentFilter = 'all';

export async function renderCaseListPage() {
    const container = document.getElementById('caseListPage');
    if (!container) {
        console.error('Case list page container not found');
        return;
    }

    // Set up initial structure
    container.innerHTML = `
        <div class="content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h1 class="page-title">Cases</h1>
                    <p class="page-subtitle">View and manage all cases</p>
                </div>
                <button class="btn btn-primary" id="createCaseBtn">
                    ➕ New Case
                </button>
            </div>

            <div class="tabs">
                <button class="tab active" data-filter="all">All Cases</button>
                <button class="tab" data-filter="today">Today</button>
                <button class="tab" data-filter="mine">My Cases</button>
                <button class="tab" data-filter="unconfirmed">Unconfirmed</button>
            </div>

            <div id="caseListContent">
                <!-- Cases will be rendered here -->
            </div>
        </div>
    `;

    // Add event listeners
    const createBtn = document.getElementById('createCaseBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            navigateTo('/cases/new');
        });
    }

    // Tab click handlers
    const tabs = container.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Load cases with filter
            const filter = tab.dataset.filter || 'all';
            currentFilter = filter;
            loadCases(filter);
        });
    });

    // Load initial cases
    await loadCases('all');
}

async function loadCases(filter) {
    const content = document.getElementById('caseListContent');
    if (!content) return;

    try {
        // Show loading state
        content.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading cases...</div>
            </div>
        `;

        // Build filters
        const userProfile = getCurrentUserProfile();
        let filters = {};
        const today = new Date().toISOString().split('T')[0];

        if (filter === 'today') {
            filters.date = today;
        } else if (filter === 'mine' && userProfile) {
            filters.repId = userProfile.id;
        } else if (filter === 'unconfirmed') {
            filters.confirmed = false;
            filters.status = 'scheduled';
        }

        // Fetch cases
        const cases = await getCases(filters);

        // Render cases
        if (cases.length === 0) {
            content.innerHTML = renderEmptyState(filter);
            return;
        }

        // Group by date
        const groupedCases = groupCasesByDate(cases);

        let html = '';
        Object.keys(groupedCases).sort().forEach(dateKey => {
            const casesForDate = groupedCases[dateKey];

            html += `
                <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid var(--gold);">
                        <h3 style="font-family: Georgia, serif; font-size: 24px; color: var(--forest); margin: 0;">
                            ${formatDate(dateKey)}
                        </h3>
                        <div style="margin-left: auto; background: var(--forest); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700;">
                            ${casesForDate.length} ${casesForDate.length === 1 ? 'case' : 'cases'}
                        </div>
                    </div>
                    ${casesForDate.map(c => renderCaseCard(c, userProfile)).join('')}
                </div>
            `;
        });

        content.innerHTML = html;
    } catch (error) {
        handleError(error, 'loadCases');
        content.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load cases</div>
                <div style="font-size: 14px; color: var(--gray-light);">${error.message}</div>
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="location.reload()">
                    Retry
                </button>
            </div>
        `;
    }
}

function groupCasesByDate(cases) {
    const grouped = {};
    cases.forEach(c => {
        const dateKey = c.scheduled_date;
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(c);
    });
    return grouped;
}

function renderCaseCard(caseData, userProfile) {
    const isAssigned = caseData.assigned_rep_id === userProfile?.id;

    let statusBadge = '';
    if (caseData.status === 'completed') {
        statusBadge = '<span class="badge badge-green">Completed</span>';
    } else if (caseData.status === 'in-progress') {
        statusBadge = '<span class="badge badge-blue">In Progress</span>';
    } else if (caseData.status === 'scheduled') {
        statusBadge = '<span class="badge badge-gray">Scheduled</span>';
    }

    let confirmBadge = '';
    if (caseData.confirmed) {
        confirmBadge = '<span class="badge badge-green">✓ Confirmed</span>';
    } else if (caseData.status === 'scheduled') {
        confirmBadge = '<span class="badge badge-pending">⚠ Unconfirmed</span>';
    }

    return `
        <div
            class="case-card ${isAssigned ? 'assigned' : ''}"
            style="cursor: pointer; margin-bottom: 14px;"
            onclick="window.navigateToCaseDetail('${caseData.id}')"
        >
            <div class="case-header">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span class="case-id">${caseData.case_code}</span>
                    ${isAssigned ? '<span class="badge badge-gold">Assigned to Me</span>' : ''}
                    ${statusBadge}
                    ${confirmBadge}
                </div>
            </div>

            <div style="font-weight: 700; font-size: 20px; color: var(--forest); margin-bottom: 8px; line-height: 1.3;">
                ${caseData.procedure}
            </div>
            <div class="case-surgeon" style="font-size: 15px; margin-bottom: 10px;">
                👨‍⚕️ ${caseData.surgeon_name || 'Unknown Surgeon'}
            </div>
            <div class="case-location" style="font-size: 15px;">
                📍 ${caseData.hospital_name} ${caseData.room ? '• ' + caseData.room : ''}
            </div>

            <div class="case-times" style="background: linear-gradient(135deg, rgba(26, 77, 46, 0.06) 0%, rgba(184, 134, 11, 0.04) 100%); border: 1px solid rgba(26, 77, 46, 0.1); margin-top: 14px;">
                <div class="time-item">
                    <div class="time-label">Scheduled</div>
                    <div class="time-value">${formatTime(caseData.scheduled_time)}</div>
                </div>
                <div class="time-item">
                    <div class="time-label">Assigned Rep</div>
                    <div class="time-value" style="font-size: 15px;">
                        ${caseData.assigned_rep_name || 'Unassigned'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState(filter) {
    let message = 'No cases found';
    let icon = '📋';
    let action = '';

    if (filter === 'today') {
        message = 'No cases scheduled for today';
        icon = '🎉';
        action = '<div style="margin-top: 12px; font-size: 14px; color: var(--gray-light);">Check "All Cases" to see upcoming cases</div>';
    } else if (filter === 'mine') {
        message = 'No cases assigned to you';
        icon = '👤';
    } else if (filter === 'unconfirmed') {
        message = 'All cases are confirmed!';
        icon = '✅';
        action = '<div style="margin-top: 12px; font-size: 14px; color: var(--success); font-weight: 600;">Great work! You\'re all caught up.</div>';
    }

    return `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">${icon}</div>
            <div style="font-size: 20px; font-weight: 600; color: var(--forest); margin-bottom: 8px;">
                ${message}
            </div>
            ${action}
        </div>
    `;
}

// Make function available globally for onclick
window.navigateToCaseDetail = (caseId) => {
    navigateTo(`/cases/${caseId}`);
};
