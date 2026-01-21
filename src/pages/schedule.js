/**
 * Schedule List Page
 * Shows pending and confirmed cases with confirmation workflow
 */

import { getCases, getSurgeons, getHospitals, confirmCase } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError, showNotification } from '../utils/helpers.js';

let currentFilters = {
    surgeonId: null,
    hospitalId: null,
    days: 7
};

let currentMode = 'rep'; // Track if we're in rep or scheduler mode

export async function renderSchedulePage(mode = 'rep') {
    currentMode = mode;
    const container = document.getElementById('schedulePage');
    if (!container) {
        console.error('Schedule page container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading schedule...</div>
            </div>
        </div>
    `;

    try {
        // Load surgeons and hospitals for filters
        const [surgeons, hospitals] = await Promise.all([
            getSurgeons(),
            getHospitals()
        ]);

        const newCasePath = mode === 'rep' ? '/rep/cases/new' : '/scheduler/cases/new';

        // Render page structure
        container.innerHTML = `
            <div class="content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h1 class="page-title">Schedule</h1>
                        <p class="page-subtitle">View and manage cases</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.navigateTo('${newCasePath}')">
                        ➕ New Case
                    </button>
                </div>

                <!-- Filters -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 20px; margin-bottom: 20px;">
                    <h3 style="font-size: 16px; font-weight: 700; color: var(--forest); margin-bottom: 16px;">Filters</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div>
                            <label class="form-label">Time Range</label>
                            <select class="form-select" id="daysFilter">
                                <option value="7">Next 7 Days</option>
                                <option value="30">Next 30 Days</option>
                                <option value="all">All Upcoming</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Surgeon</label>
                            <select class="form-select" id="surgeonFilter">
                                <option value="">All Surgeons</option>
                                ${surgeons.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Hospital</label>
                            <select class="form-select" id="hospitalFilter">
                                <option value="">All Hospitals</option>
                                ${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Cases List -->
                <div id="casesList">
                    <!-- Will be populated by loadCases() -->
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('daysFilter')?.addEventListener('change', handleFilterChange);
        document.getElementById('surgeonFilter')?.addEventListener('change', handleFilterChange);
        document.getElementById('hospitalFilter')?.addEventListener('change', handleFilterChange);

        // Load initial cases
        await loadCases();
    } catch (error) {
        handleError(error, 'renderSchedulePage');
        container.innerHTML = `
            <div class="content">
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load schedule</div>
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

async function handleFilterChange() {
    const daysValue = document.getElementById('daysFilter')?.value;
    const surgeonId = document.getElementById('surgeonFilter')?.value;
    const hospitalId = document.getElementById('hospitalFilter')?.value;

    currentFilters = {
        days: daysValue === 'all' ? null : parseInt(daysValue),
        surgeonId: surgeonId || null,
        hospitalId: hospitalId || null
    };

    await loadCases();
}

async function loadCases() {
    const listContainer = document.getElementById('casesList');
    if (!listContainer) return;

    try {
        // Show loading
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                <div style="font-size: 36px; margin-bottom: 12px;">⏳</div>
                <div>Loading cases...</div>
            </div>
        `;

        // Build filters for upcoming cases (pending or confirmed)
        const filters = {
            dateFrom: new Date().toISOString()
        };

        if (currentFilters.days) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + currentFilters.days);
            filters.dateTo = futureDate.toISOString();
        }

        if (currentFilters.surgeonId) {
            filters.surgeonId = currentFilters.surgeonId;
        }

        if (currentFilters.hospitalId) {
            filters.hospitalId = currentFilters.hospitalId;
        }

        // Fetch all upcoming cases
        const allCases = await getCases(filters);

        // Separate into pending and confirmed
        const pendingCases = allCases.filter(c => c.status === 'pending');
        const confirmedCases = allCases.filter(c => c.status === 'confirmed');
        const completedCases = allCases.filter(c => c.status === 'completed');

        // Render sections
        let html = '';

        // Pending Cases Section
        html += `
            <div style="background: white; border-radius: 12px; border: 2px solid #f59e0b; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                        ⏳ Pending Confirmation
                    </h2>
                    <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                        ${pendingCases.length}
                    </span>
                </div>
                ${pendingCases.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                        <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                        <div style="font-size: 16px;">No pending cases</div>
                    </div>
                ` : `
                    <div style="display: grid; gap: 12px;">
                        ${pendingCases.map(c => renderCaseCard(c, 'pending')).join('')}
                    </div>
                `}
            </div>
        `;

        // Confirmed Cases Section
        html += `
            <div style="background: white; border-radius: 12px; border: 2px solid #10b981; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                        ✅ Confirmed
                    </h2>
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                        ${confirmedCases.length}
                    </span>
                </div>
                ${confirmedCases.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                        <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
                        <div style="font-size: 16px;">No confirmed cases yet</div>
                    </div>
                ` : `
                    <div style="display: grid; gap: 12px;">
                        ${confirmedCases.map(c => renderCaseCard(c, 'confirmed')).join('')}
                    </div>
                `}
            </div>
        `;

        // Completed Cases Section (if any)
        if (completedCases.length > 0) {
            html += `
                <div style="background: white; border-radius: 12px; border: 2px solid #9ca3af; padding: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                            ✔️ Completed
                        </h2>
                        <span style="background: #9ca3af; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                            ${completedCases.length}
                        </span>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        ${completedCases.map(c => renderCaseCard(c, 'completed')).join('')}
                    </div>
                </div>
            `;
        }

        if (allCases.length === 0) {
            html = renderEmptyState();
        }

        listContainer.innerHTML = html;
    } catch (error) {
        handleError(error, 'loadCases');
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--danger);">
                <div style="font-size: 36px; margin-bottom: 12px;">❌</div>
                <div style="font-weight: 600; margin-bottom: 8px;">Failed to load cases</div>
                <div style="font-size: 14px; color: var(--gray-light);">${error.message}</div>
            </div>
        `;
    }
}

function renderCaseCard(caseData, status) {
    const statusConfig = {
        pending: { badge: 'badge-warning', label: 'Pending', color: '#f59e0b' },
        confirmed: { badge: 'badge-success', label: 'Confirmed', color: '#10b981' },
        completed: { badge: 'badge-gray', label: 'Completed', color: '#9ca3af' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const casePath = `/${currentMode}/cases/${caseData.id}`;

    return `
        <div class="case-card" style="position: relative; margin-bottom: 14px; ${status === 'pending' ? 'border-left: 4px solid #f59e0b;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px;">
                <div style="flex: 1; cursor: pointer;" onclick="window.navigateTo('${casePath}')">
                    <div style="font-weight: 700; font-size: 18px; color: var(--forest); margin-bottom: 6px;">
                        ${caseData.procedure}
                    </div>
                    <div style="display: flex; gap: 20px; font-size: 14px; color: var(--slate); flex-wrap: wrap; margin-bottom: 8px;">
                        <div>⏰ ${formatDate(caseData.case_datetime)} at ${formatTime(caseData.case_datetime)}</div>
                        <div>👨‍⚕️ ${caseData.surgeon?.name || 'Unknown'}</div>
                        <div>📍 ${caseData.hospital?.name || 'Unknown'}</div>
                    </div>
                    ${caseData.notes ? `
                        <div style="margin-top: 8px; font-size: 13px; color: var(--gray-light); font-style: italic;">
                            ${caseData.notes}
                        </div>
                    ` : ''}
                    ${caseData.confirmed_by && caseData.confirmed_at ? `
                        <div style="margin-top: 8px; font-size: 12px; color: var(--gray); background: rgba(16, 185, 129, 0.1); padding: 6px 10px; border-radius: 6px; display: inline-block;">
                            ✓ Confirmed by ${caseData.confirmed_by} on ${formatDate(caseData.confirmed_at)}
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <span class="${config.badge}" style="background: ${config.color}; white-space: nowrap;">
                        ${config.label}
                    </span>
                    ${status === 'pending' && currentMode === 'rep' ? `
                        <button
                            class="btn btn-primary"
                            style="font-size: 13px; padding: 6px 14px; white-space: nowrap;"
                            onclick="event.stopPropagation(); handleConfirmCase('${caseData.id}')"
                        >
                            ✓ Confirm Case
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    const newCasePath = currentMode === 'rep' ? '/rep/cases/new' : '/scheduler/cases/new';
    return `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📅</div>
            <div style="font-size: 20px; font-weight: 600; color: var(--forest); margin-bottom: 8px;">
                No cases found
            </div>
            <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">
                Try adjusting your filters or schedule a new case
            </div>
            <button class="btn btn-primary" onclick="window.navigateTo('${newCasePath}')">
                Schedule New Case
            </button>
        </div>
    `;
}

// Handle case confirmation
window.handleConfirmCase = async function(caseId) {
    try {
        // Show loading state on button
        const button = event.target;
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Confirming...';

        // Confirm the case
        await confirmCase(caseId, 'Rep');

        // Show success notification
        showNotification('Case confirmed successfully!', 'success');

        // Reload cases to update UI
        await loadCases();
    } catch (error) {
        handleError(error, 'handleConfirmCase');
        showNotification('Failed to confirm case: ' + error.message, 'error');

        // Reset button
        if (event.target) {
            event.target.disabled = false;
            event.target.innerHTML = '✓ Confirm Case';
        }
    }
};

// Export for use in other modules
window.handleScheduleFilterChange = handleFilterChange;
