/**
 * Anesthesia Module - Main Entry Point
 * Coordinator & Coverage Views with Schedule Tab
 */

import { getAnesthesiaCases, updateAnesthesiaCase } from '../../js/database.js';
import { showNotification } from '../../utils/notifications.js';

let currentRole = 'coordinator'; // 'coordinator' or 'coverage'
let currentMode = 'scheduled'; // 'scheduled' or 'live'
let currentDate = new Date().toISOString().split('T')[0];

// Demo seed data for anesthesia providers
const ANESTHESIA_PROVIDERS = [
    { id: '1', name: 'Dr. Sarah Chen, MD' },
    { id: '2', name: 'Dr. Michael Roberts, MD' },
    { id: '3', name: 'Jennifer Martinez, CRNA' },
    { id: '4', name: 'David Thompson, CRNA' },
    { id: '5', name: 'Dr. Emily Williams, MD' },
    { id: '6', name: 'Robert Johnson, CRNA' },
    { id: '7', name: 'Dr. Lisa Anderson, MD' },
    { id: '8', name: 'James Wilson, CRNA' },
    { id: '9', name: 'Maria Garcia, CRNA' },
    { id: '10', name: 'Dr. Thomas Lee, MD' }
];

export async function renderAnesthesiaMain() {
    const container = document.getElementById('anesthesiaPage');

    container.innerHTML = `
        <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
            <!-- Header with Role Switcher -->
            <div style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Anesthesia</h1>
                        <p style="margin: 0; opacity: 0.9; font-size: 14px;">Coverage coordination & live case tracking</p>
                    </div>

                    <!-- Role Switcher -->
                    <div style="display: flex; gap: 4px; background: rgba(255,255,255,0.15); padding: 4px; border-radius: 8px;">
                        <button id="coordinatorRoleBtn" class="role-switch-btn active" data-role="coordinator"
                            style="padding: 8px 20px; background: white; color: #1b4332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            Coordinator
                        </button>
                        <button id="coverageRoleBtn" class="role-switch-btn" data-role="coverage"
                            style="padding: 8px 20px; background: transparent; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
                            Coverage
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="display: flex; gap: 8px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px;">
                    <button id="scheduleTab" class="anesth-tab active"
                        style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid #1b4332; color: #1b4332; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: -2px;">
                        Schedule
                    </button>
                    <button id="moreTab" class="anesth-tab"
                        style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid transparent; color: #6b7280; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: -2px;">
                        More
                    </button>
                </div>

                <!-- Schedule Controls -->
                <div id="scheduleControls" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <!-- Mode Toggle (Scheduled / Live) -->
                    <div style="display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 8px;">
                        <button id="scheduledModeBtn" class="mode-toggle-btn active" data-mode="scheduled"
                            style="padding: 8px 20px; background: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; color: #111827; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            Scheduled
                        </button>
                        <button id="liveModeBtn" class="mode-toggle-btn" data-mode="live"
                            style="padding: 8px 20px; background: transparent; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; color: #6b7280; transition: all 0.2s;">
                            🔴 Live
                        </button>
                    </div>

                    <!-- Date Picker -->
                    <div>
                        <input type="date" id="dateFilter" value="${currentDate}"
                            style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                    </div>
                </div>
            </div>

            <!-- Schedule Content -->
            <div id="scheduleContent">
                <div style="text-align: center; padding: 60px; color: #9ca3af;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                    <div>Loading schedule...</div>
                </div>
            </div>

            <!-- More Tab Content (hidden by default) -->
            <div id="moreContent" class="hidden">
                <div style="background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #111827;">More Options</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Additional features coming soon</p>
                </div>
            </div>
        </div>
    `;

    await loadSchedule();
    setupEventListeners();
}

async function loadSchedule() {
    try {
        const cases = await getAnesthesiaCases({ date: currentDate });
        renderSchedule(cases);
    } catch (error) {
        console.error('Error loading schedule:', error);
        showNotification('Failed to load schedule', 'error');
    }
}

function renderSchedule(cases) {
    const container = document.getElementById('scheduleContent');

    if (!cases || cases.length === 0) {
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 60px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #111827;">No Cases Scheduled</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">No cases found for ${formatDate(currentDate)}</p>
            </div>
        `;
        return;
    }

    // Sort cases based on mode
    let sortedCases = [...cases];
    if (currentMode === 'live') {
        sortedCases = sortCasesForLiveView(cases);
    }

    // Render based on current role
    if (currentRole === 'coordinator') {
        renderCoordinatorView(sortedCases);
    } else {
        renderCoverageView(sortedCases);
    }
}

function sortCasesForLiveView(cases) {
    return cases.sort((a, b) => {
        // IN_PROGRESS first
        if (a.case_status === 'IN_PROGRESS' && b.case_status !== 'IN_PROGRESS') return -1;
        if (a.case_status !== 'IN_PROGRESS' && b.case_status === 'IN_PROGRESS') return 1;

        // UPCOMING next (soonest first)
        if (a.case_status === 'UPCOMING' && b.case_status !== 'UPCOMING') return -1;
        if (a.case_status !== 'UPCOMING' && b.case_status === 'UPCOMING') return 1;
        if (a.case_status === 'UPCOMING' && b.case_status === 'UPCOMING') {
            return new Date(a.scheduled_start_at) - new Date(b.scheduled_start_at);
        }

        // COMPLETED last (most recent first)
        if (a.case_status === 'COMPLETED' && b.case_status === 'COMPLETED') {
            return new Date(b.actual_end_at) - new Date(a.actual_end_at);
        }

        return 0;
    });
}

function renderCoordinatorView(cases) {
    const container = document.getElementById('scheduleContent');

    container.innerHTML = `
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 1000px;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Case</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Surgeon</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Room</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Coordinator</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Coverage Assigned</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Time Comparison</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 700; color: #374151;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cases.map(caseItem => createCoordinatorRow(caseItem)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createCoordinatorRow(caseItem) {
    const statusBadge = createStatusBadge(caseItem.case_status);
    const timeComparison = createTimeComparison(caseItem);

    return `
        <tr style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;"
            onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${caseItem.id || 'Case'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; color: #374151;">${caseItem.surgeon_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; font-weight: 600; color: #1b4332;">${caseItem.room_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; color: #374151;">${caseItem.coordinator_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <select onchange="updateCoverage('${caseItem.id}', this.value)"
                    style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white;">
                    <option value="">-- Assign Coverage --</option>
                    ${ANESTHESIA_PROVIDERS.map(provider => `
                        <option value="${provider.name}" ${caseItem.coverage_assigned_to === provider.name ? 'selected' : ''}>
                            ${provider.name}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td style="padding: 12px 16px;">
                ${timeComparison}
            </td>
            <td style="padding: 12px 16px; text-align: center;">
                ${statusBadge}
            </td>
        </tr>
    `;
}

function renderCoverageView(cases) {
    const container = document.getElementById('scheduleContent');

    container.innerHTML = `
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 1000px;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Case</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Surgeon</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Room</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Coordinator</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #374151;">Time Comparison</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 700; color: #374151;">Break Status</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 700; color: #374151;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cases.map(caseItem => createCoverageRow(caseItem)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createCoverageRow(caseItem) {
    const timeComparison = createTimeComparison(caseItem);
    const breakStatusControl = createBreakStatusControl(caseItem);
    const caseActions = createCaseActions(caseItem);

    return `
        <tr style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;"
            onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${caseItem.id || 'Case'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; color: #374151;">${caseItem.surgeon_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; font-weight: 600; color: #1b4332;">${caseItem.room_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                <div style="font-size: 14px; color: #374151;">${caseItem.coordinator_name || '--'}</div>
            </td>
            <td style="padding: 12px 16px;">
                ${timeComparison}
            </td>
            <td style="padding: 12px 16px; text-align: center;">
                ${breakStatusControl}
            </td>
            <td style="padding: 12px 16px;">
                ${caseActions}
            </td>
        </tr>
    `;
}

function createTimeComparison(caseItem) {
    const scheduledStart = caseItem.scheduled_start_at ? new Date(caseItem.scheduled_start_at) : null;
    const scheduledDuration = caseItem.scheduled_duration_minutes || 0;
    const scheduledEnd = scheduledStart ? new Date(scheduledStart.getTime() + scheduledDuration * 60000) : null;

    const actualStart = caseItem.actual_start_at ? new Date(caseItem.actual_start_at) : null;
    const actualEnd = caseItem.actual_end_at ? new Date(caseItem.actual_end_at) : null;

    return `
        <div style="font-size: 12px;">
            <div style="margin-bottom: 4px;">
                <strong style="color: #6b7280;">Scheduled:</strong>
                <span style="color: #111827;">${scheduledStart ? formatTime(scheduledStart) : '--'}</span>
                <span style="color: #6b7280;"> → </span>
                <span style="color: #111827;">${scheduledEnd ? formatTime(scheduledEnd) : '--'}</span>
            </div>
            <div>
                <strong style="color: #6b7280;">Actual:</strong>
                <span style="color: ${actualStart ? '#10b981' : '#9ca3af'};">${actualStart ? formatTime(actualStart) : '--'}</span>
                <span style="color: #6b7280;"> → </span>
                <span style="color: ${actualEnd ? '#10b981' : '#9ca3af'};">${actualEnd ? formatTime(actualEnd) : '--'}</span>
            </div>
        </div>
    `;
}

function createBreakStatusControl(caseItem) {
    const currentStatus = caseItem.break_status || 'PENDING';
    const colors = {
        'PENDING': '#f59e0b',
        'COMPLETED': '#10b981',
        'MISSED': '#ef4444'
    };

    return `
        <select onchange="updateBreakStatus('${caseItem.id}', this.value)"
            style="padding: 6px 12px; border: 1px solid ${colors[currentStatus]}40; border-radius: 6px; font-size: 13px; font-weight: 600; color: ${colors[currentStatus]}; background: ${colors[currentStatus]}15; cursor: pointer;">
            <option value="PENDING" ${currentStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
            <option value="COMPLETED" ${currentStatus === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
            <option value="MISSED" ${currentStatus === 'MISSED' ? 'selected' : ''}>MISSED</option>
        </select>
    `;
}

function createCaseActions(caseItem) {
    const hasActualStart = !!caseItem.actual_start_at;
    const hasActualEnd = !!caseItem.actual_end_at;

    return `
        <div style="display: flex; gap: 8px; justify-content: center;">
            <button onclick="handleCaseStart('${caseItem.id}')"
                ${hasActualStart ? 'disabled' : ''}
                style="padding: 6px 12px; background: ${hasActualStart ? '#e5e7eb' : '#10b981'}; color: ${hasActualStart ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${hasActualStart ? 'not-allowed' : 'pointer'}; font-size: 12px; font-weight: 600; transition: all 0.2s;">
                Case Start
            </button>
            <button onclick="handleCaseEnd('${caseItem.id}')"
                ${!hasActualStart || hasActualEnd ? 'disabled' : ''}
                style="padding: 6px 12px; background: ${!hasActualStart || hasActualEnd ? '#e5e7eb' : '#ef4444'}; color: ${!hasActualStart || hasActualEnd ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${!hasActualStart || hasActualEnd ? 'not-allowed' : 'pointer'}; font-size: 12px; font-weight: 600; transition: all 0.2s;">
                Case End
            </button>
        </div>
    `;
}

function createStatusBadge(status) {
    const colors = {
        'UPCOMING': { bg: '#dbeafe', text: '#1e40af' },
        'IN_PROGRESS': { bg: '#dcfce7', text: '#166534' },
        'COMPLETED': { bg: '#e5e7eb', text: '#374151' }
    };

    const color = colors[status] || colors['UPCOMING'];

    return `
        <span style="background: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block;">
            ${status || 'UPCOMING'}
        </span>
    `;
}

function setupEventListeners() {
    // Role switcher
    document.querySelectorAll('.role-switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const role = e.target.dataset.role;
            switchRole(role);
        });
    });

    // Mode toggle
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            switchMode(mode);
        });
    });

    // Date filter
    document.getElementById('dateFilter')?.addEventListener('change', (e) => {
        currentDate = e.target.value;
        loadSchedule();
    });

    // Tab switching
    document.getElementById('scheduleTab')?.addEventListener('click', () => {
        switchTab('schedule');
    });

    document.getElementById('moreTab')?.addEventListener('click', () => {
        switchTab('more');
    });
}

function switchRole(role) {
    currentRole = role;

    // Update button styles
    document.querySelectorAll('.role-switch-btn').forEach(btn => {
        if (btn.dataset.role === role) {
            btn.style.background = 'white';
            btn.style.color = '#1b4332';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            btn.classList.add('active');
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'white';
            btn.style.boxShadow = 'none';
            btn.classList.remove('active');
        }
    });

    loadSchedule();
}

function switchMode(mode) {
    currentMode = mode;

    // Update button styles
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.style.background = 'white';
            btn.style.color = '#111827';
            btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            btn.classList.add('active');
        } else {
            btn.style.background = 'transparent';
            btn.style.color = '#6b7280';
            btn.style.boxShadow = 'none';
            btn.classList.remove('active');
        }
    });

    loadSchedule();
}

function switchTab(tab) {
    if (tab === 'schedule') {
        document.getElementById('scheduleControls').style.display = 'flex';
        document.getElementById('scheduleContent').classList.remove('hidden');
        document.getElementById('moreContent').classList.add('hidden');

        document.getElementById('scheduleTab').style.borderBottomColor = '#1b4332';
        document.getElementById('scheduleTab').style.color = '#1b4332';
        document.getElementById('moreTab').style.borderBottomColor = 'transparent';
        document.getElementById('moreTab').style.color = '#6b7280';
    } else {
        document.getElementById('scheduleControls').style.display = 'none';
        document.getElementById('scheduleContent').classList.add('hidden');
        document.getElementById('moreContent').classList.remove('hidden');

        document.getElementById('scheduleTab').style.borderBottomColor = 'transparent';
        document.getElementById('scheduleTab').style.color = '#6b7280';
        document.getElementById('moreTab').style.borderBottomColor = '#1b4332';
        document.getElementById('moreTab').style.color = '#1b4332';
    }
}

// Global action handlers
window.updateCoverage = async function(caseId, providerName) {
    try {
        await updateAnesthesiaCase(caseId, {
            coverage_assigned_to: providerName
        });
        showNotification(`Coverage assigned to ${providerName}`, 'success');
        await loadSchedule();
    } catch (error) {
        console.error('Error updating coverage:', error);
        showNotification('Failed to update coverage', 'error');
    }
};

window.updateBreakStatus = async function(caseId, status) {
    try {
        await updateAnesthesiaCase(caseId, {
            break_status: status
        });
        showNotification(`Break status updated to ${status}`, 'success');
        await loadSchedule();
    } catch (error) {
        console.error('Error updating break status:', error);
        showNotification('Failed to update break status', 'error');
    }
};

window.handleCaseStart = async function(caseId) {
    try {
        await updateAnesthesiaCase(caseId, {
            actual_start_at: new Date().toISOString(),
            case_status: 'IN_PROGRESS'
        });
        showNotification('Case started', 'success');
        await loadSchedule();
    } catch (error) {
        console.error('Error starting case:', error);
        showNotification('Failed to start case', 'error');
    }
};

window.handleCaseEnd = async function(caseId) {
    try {
        await updateAnesthesiaCase(caseId, {
            actual_end_at: new Date().toISOString(),
            case_status: 'COMPLETED'
        });
        showNotification('Case ended', 'success');
        await loadSchedule();
    } catch (error) {
        console.error('Error ending case:', error);
        showNotification('Failed to end case', 'error');
    }
};

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
