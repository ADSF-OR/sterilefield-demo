/**
 * Schedule List Page
 */

import { getCases, getSurgeons, getHospitals, confirmCase } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError, showNotification } from '../utils/helpers.js';

let currentFilters = {
    surgeonId: null,
    hospitalId: null,
    days: 7,
    status: 'all' // all, PENDING, CONFIRMED
};

let currentMode = 'rep'; // Track current mode

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

        // Render page structure
        container.innerHTML = `
            <div class="content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h1 class="page-title">Schedule</h1>
                        <p class="page-subtitle">View and manage cases</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.navigateTo('/${mode}/cases/new')">
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
                            <label class="form-label">Status</label>
                            <select class="form-select" id="statusFilter">
                                <option value="all">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
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
        document.getElementById('statusFilter')?.addEventListener('change', handleFilterChange);
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
    const statusValue = document.getElementById('statusFilter')?.value;
    const surgeonId = document.getElementById('surgeonFilter')?.value;
    const hospitalId = document.getElementById('hospitalFilter')?.value;

    currentFilters = {
        days: daysValue === 'all' ? null : parseInt(daysValue),
        status: statusValue || 'all',
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

        // Build filters
        const filters = {
            dateFrom: new Date().toISOString()
        };

        // Only filter by status if not "all"
        if (currentFilters.status && currentFilters.status !== 'all') {
            filters.status = currentFilters.status;
        }

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

        // Fetch cases
        let cases = await getCases(filters);

        // If no status filter, only show PENDING and CONFIRMED (not COMPLETED or CANCELLED)
        if (!currentFilters.status || currentFilters.status === 'all') {
            cases = cases.filter(c => c.status === 'PENDING' || c.status === 'CONFIRMED');
        }

        if (cases.length === 0) {
            listContainer.innerHTML = renderEmptyState();
            return;
        }

        // Group cases by date
        const groupedCases = groupCasesByDate(cases);

        // Render grouped cases
        let html = '';
        Object.keys(groupedCases).sort().forEach(dateKey => {
            const casesForDate = groupedCases[dateKey];
            const dateLabel = getDateLabel(dateKey);

            html += `
                <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid var(--gold);">
                        <h3 style="font-family: Georgia, serif; font-size: 24px; color: var(--forest); margin: 0;">
                            ${dateLabel}
                        </h3>
                        <div style="margin-left: auto; background: var(--forest); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700;">
                            ${casesForDate.length} ${casesForDate.length === 1 ? 'case' : 'cases'}
                        </div>
                    </div>
                    ${casesForDate.map(c => renderCaseCard(c)).join('')}
                </div>
            `;
        });

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

function groupCasesByDate(cases) {
    const grouped = {};
    cases.forEach(c => {
        const date = c.case_datetime.split('T')[0];
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(c);
    });
    return grouped;
}

function getDateLabel(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const caseDate = new Date(date);
    caseDate.setHours(0, 0, 0, 0);

    if (caseDate.getTime() === today.getTime()) {
        return 'Today - ' + formatDate(dateStr);
    } else if (caseDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow - ' + formatDate(dateStr);
    } else {
        return formatDate(dateStr);
    }
}

function renderCaseCard(caseData) {
    const isPending = caseData.status === 'PENDING';
    const isConfirmed = caseData.status === 'CONFIRMED';
    const statusBadge = isPending ? 'badge-warning' : isConfirmed ? 'badge-success' : 'badge-gray';
    const statusLabel = isPending ? 'Pending' : isConfirmed ? 'Confirmed' : caseData.status;

    return `
        <div class="case-card" style="cursor: pointer; margin-bottom: 14px;" onclick="window.navigateTo('/${currentMode}/cases/${caseData.id}')">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 20px; color: var(--forest); margin-bottom: 6px;">
                        ${caseData.procedure}
                    </div>
                    <div style="display: flex; gap: 20px; font-size: 15px; color: var(--slate); flex-wrap: wrap;">
                        <div>⏰ ${formatTime(caseData.case_datetime)}</div>
                        <div>👨‍⚕️ ${caseData.surgeon?.name || 'Unknown'}</div>
                        <div>📍 ${caseData.hospital?.name || 'Unknown'}</div>
                    </div>
                    ${caseData.notes ? `
                        <div style="margin-top: 8px; font-size: 14px; color: var(--gray-light); font-style: italic;">
                            ${caseData.notes}
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge ${statusBadge}">${statusLabel}</span>
                    ${isPending && currentMode === 'rep' ? `
                        <button
                            class="btn btn-primary"
                            style="font-size: 13px; padding: 6px 14px; white-space: nowrap;"
                            onclick="event.stopPropagation(); handleConfirmCase('${caseData.id}')"
                        >
                            ✓ Confirm
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📅</div>
            <div style="font-size: 20px; font-weight: 600; color: var(--forest); margin-bottom: 8px;">
                No cases found
            </div>
            <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">
                Try adjusting your filters or schedule a new case
            </div>
            <button class="btn btn-primary" onclick="window.navigateTo('/${currentMode}/cases/new')">
                Schedule New Case
            </button>
        </div>
    `;
}

// Global function for confirming cases
window.handleConfirmCase = async function(caseId) {
    try {
        await confirmCase(caseId, 'Rep');
        showNotification('Case confirmed successfully!', 'success');
        await loadCases(); // Reload cases to show updated status
    } catch (error) {
        handleError(error, 'handleConfirmCase');
        showNotification('Failed to confirm case: ' + error.message, 'error');
    }
};

// Export for use in other modules
window.handleScheduleFilterChange = handleFilterChange;
