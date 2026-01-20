/**
 * Case Detail Page
 */

import { getCase, updateCase, confirmCase, deleteCase } from '../js/database.js';
import { navigateTo, goBack } from '../js/router.js';
import { formatDate, formatTime, formatDateTime, handleError, showNotification } from '../utils/helpers.js';
import { getCurrentUserProfile } from '../js/auth.js';

let currentCaseId = null;
let currentCaseData = null;

export async function renderCaseDetailPage(caseId) {
    currentCaseId = caseId;

    const container = document.getElementById('caseDetailPage');
    if (!container) {
        console.error('Case detail page container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading case details...</div>
            </div>
        </div>
    `;

    try {
        // Fetch case details
        const caseData = await getCase(caseId);
        currentCaseData = caseData;

        const userProfile = getCurrentUserProfile();
        const isAssigned = caseData.assigned_rep_id === userProfile?.id;
        const isScheduler = userProfile?.role === 'scheduler';

        // Render case details
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>

                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px; margin-bottom: 20px;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <span class="case-id" style="font-size: 16px;">${caseData.case_code}</span>
                            ${renderStatusBadges(caseData, isAssigned)}
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${renderActionButtons(caseData, isAssigned, isScheduler)}
                        </div>
                    </div>

                    <!-- Procedure Info -->
                    <h1 style="font-family: Georgia, serif; font-size: 28px; color: var(--forest); margin-bottom: 12px; line-height: 1.3;">
                        ${caseData.procedure}
                    </h1>

                    <!-- Surgeon and Location -->
                    <div style="display: grid; gap: 12px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 16px;">
                            <span style="font-size: 20px;">👨‍⚕️</span>
                            <span style="font-weight: 600; color: var(--slate);">
                                ${caseData.surgeon_name || 'Unknown Surgeon'}
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 16px;">
                            <span style="font-size: 20px;">📍</span>
                            <span style="color: var(--slate);">
                                ${caseData.hospital_name}${caseData.room ? ' • ' + caseData.room : ''}
                            </span>
                        </div>
                    </div>

                    <!-- Time Details -->
                    <div style="background: linear-gradient(135deg, rgba(26, 77, 46, 0.06) 0%, rgba(184, 134, 11, 0.04) 100%); border: 1px solid rgba(26, 77, 46, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="font-size: 14px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                            Schedule & Times
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 4px;">Date</div>
                                <div style="font-weight: 600; color: var(--forest); font-size: 16px;">
                                    ${formatDate(caseData.scheduled_date)}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 4px;">Scheduled Start</div>
                                <div style="font-weight: 600; color: var(--forest); font-size: 16px;">
                                    ${formatTime(caseData.scheduled_time)}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 4px;">Actual Time In</div>
                                <div style="font-weight: 600; font-size: 16px; ${caseData.time_in ? 'color: var(--forest);' : 'color: var(--gray-lighter); font-style: italic;'}">
                                    ${caseData.time_in ? formatTime(caseData.time_in) : 'Not set'}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 4px;">Time Out</div>
                                <div style="font-weight: 600; font-size: 16px; ${caseData.time_out ? 'color: var(--forest);' : 'color: var(--gray-lighter); font-style: italic;'}">
                                    ${caseData.time_out ? formatTime(caseData.time_out) : 'Not set'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Assigned Rep -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 14px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                            Assigned Representative
                        </h3>
                        <div style="font-size: 16px; color: var(--slate); font-weight: 600;">
                            ${caseData.assigned_rep_name || 'Unassigned'}
                        </div>
                    </div>

                    <!-- Notes -->
                    ${caseData.notes ? `
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 14px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                                Notes
                            </h3>
                            <div style="background: rgba(184,134,11,0.08); border-left: 4px solid var(--gold); padding: 12px; border-radius: 8px; font-size: 15px; color: var(--slate); line-height: 1.6;">
                                ${caseData.notes}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Confirmation Status -->
                    ${renderConfirmationStatus(caseData)}

                    <!-- Update Status Section -->
                    ${caseData.status !== 'completed' ? `
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--gray-bg);">
                            <h3 style="font-size: 16px; font-weight: 700; color: var(--forest); margin-bottom: 16px;">
                                Update Status
                            </h3>
                            <div id="statusUpdateForm">
                                ${renderStatusUpdateForm(caseData)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add event listeners for status update form
        setupStatusUpdateHandlers(caseData);
    } catch (error) {
        handleError(error, 'renderCaseDetailPage');
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load case details</div>
                    <div style="font-size: 14px; color: var(--gray-light);">${error.message}</div>
                    <button class="btn btn-primary" style="margin-top: 20px;" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderStatusBadges(caseData, isAssigned) {
    let badges = '';

    if (isAssigned) {
        badges += '<span class="badge badge-gold" style="margin-left: 8px;">Assigned to Me</span>';
    }

    if (caseData.status === 'completed') {
        badges += '<span class="badge badge-green" style="margin-left: 8px;">Completed</span>';
    } else if (caseData.status === 'in-progress') {
        badges += '<span class="badge badge-blue" style="margin-left: 8px;">In Progress</span>';
    } else if (caseData.status === 'scheduled') {
        badges += '<span class="badge badge-gray" style="margin-left: 8px;">Scheduled</span>';
    }

    if (caseData.confirmed) {
        badges += '<span class="badge badge-green" style="margin-left: 8px;">✓ Confirmed</span>';
    } else if (caseData.status === 'scheduled') {
        badges += '<span class="badge badge-pending" style="margin-left: 8px;">⚠ Unconfirmed</span>';
    }

    return badges;
}

function renderActionButtons(caseData, isAssigned, isScheduler) {
    let buttons = '';

    // Confirm button (for assigned reps, unconfirmed cases)
    if (!caseData.confirmed && caseData.status === 'scheduled' && isAssigned) {
        buttons += `
            <button class="btn btn-primary" id="confirmCaseBtn">
                ✓ Confirm Case
            </button>
        `;
    }

    // Edit button (for schedulers)
    if (isScheduler) {
        buttons += `
            <button class="btn btn-secondary" id="editCaseBtn">
                ✏️ Edit
            </button>
            <button class="btn btn-danger" id="deleteCaseBtn">
                🗑️ Delete
            </button>
        `;
    }

    return buttons;
}

function renderConfirmationStatus(caseData) {
    if (caseData.confirmed) {
        return `
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">✅</span>
                <div>
                    <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">
                        Confirmed by ${caseData.confirmed_by_name || 'Rep'}
                    </div>
                    <div style="font-size: 13px; color: #059669;">
                        ${caseData.confirmed_at ? formatDateTime(caseData.confirmed_at) : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (caseData.status === 'scheduled') {
        return `
            <div style="background: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">⚠️</span>
                <div style="color: #c2410c; font-weight: 600;">
                    Awaiting confirmation from assigned representative
                </div>
            </div>
        `;
    }

    return '';
}

function renderStatusUpdateForm(caseData) {
    return `
        <div style="display: grid; gap: 16px;">
            <div>
                <label class="form-label">Status</label>
                <select class="form-select" id="statusSelect">
                    <option value="scheduled" ${caseData.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="in-progress" ${caseData.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${caseData.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <label class="form-label">Actual Time In</label>
                    <input
                        type="time"
                        class="form-input"
                        id="timeInInput"
                        value="${caseData.time_in ? new Date(caseData.time_in).toTimeString().slice(0, 5) : ''}"
                    />
                </div>
                <div>
                    <label class="form-label">Time Out</label>
                    <input
                        type="time"
                        class="form-input"
                        id="timeOutInput"
                        value="${caseData.time_out ? new Date(caseData.time_out).toTimeString().slice(0, 5) : ''}"
                    />
                </div>
            </div>

            <button class="btn btn-primary" id="updateStatusBtn">
                Save Changes
            </button>
        </div>
    `;
}

function setupStatusUpdateHandlers(caseData) {
    // Confirm button
    const confirmBtn = document.getElementById('confirmCaseBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            await handleConfirmCase();
        });
    }

    // Edit button
    const editBtn = document.getElementById('editCaseBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            navigateTo(`/cases/${currentCaseId}/edit`);
        });
    }

    // Delete button
    const deleteBtn = document.getElementById('deleteCaseBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            await handleDeleteCase();
        });
    }

    // Update status button
    const updateBtn = document.getElementById('updateStatusBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            await handleUpdateStatus();
        });
    }
}

async function handleConfirmCase() {
    try {
        const userProfile = getCurrentUserProfile();
        await confirmCase(currentCaseId, userProfile.id, userProfile.full_name);

        showNotification('Case confirmed successfully!', 'success');

        // Reload case details
        await renderCaseDetailPage(currentCaseId);
    } catch (error) {
        handleError(error, 'handleConfirmCase');
        showNotification('Failed to confirm case', 'error');
    }
}

async function handleUpdateStatus() {
    try {
        const status = document.getElementById('statusSelect')?.value;
        const timeIn = document.getElementById('timeInInput')?.value;
        const timeOut = document.getElementById('timeOutInput')?.value;

        const updates = {};

        if (status) {
            updates.status = status;
        }

        if (timeIn) {
            const date = currentCaseData.scheduled_date;
            updates.time_in = `${date}T${timeIn}:00`;
        }

        if (timeOut) {
            const date = currentCaseData.scheduled_date;
            updates.time_out = `${date}T${timeOut}:00`;
        }

        await updateCase(currentCaseId, updates);

        showNotification('Case updated successfully!', 'success');

        // Reload case details
        await renderCaseDetailPage(currentCaseId);
    } catch (error) {
        handleError(error, 'handleUpdateStatus');
        showNotification('Failed to update case', 'error');
    }
}

async function handleDeleteCase() {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
        return;
    }

    try {
        await deleteCase(currentCaseId);

        showNotification('Case deleted successfully!', 'success');

        // Navigate back to cases list
        navigateTo('/cases');
    } catch (error) {
        handleError(error, 'handleDeleteCase');
        showNotification('Failed to delete case', 'error');
    }
}
