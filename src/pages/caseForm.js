/**
 * Case Form Page (Create/Edit)
 */

import { getCase, createCase, updateCase, getSurgeons, getHospitals, getReps } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { handleError, showNotification } from '../utils/helpers.js';
import { getCurrentUserProfile } from '../js/auth.js';

let currentCaseId = null;
let surgeons = [];
let hospitals = [];
let reps = [];

export async function renderCaseFormPage(caseId = null) {
    currentCaseId = caseId;
    const isEdit = !!caseId;

    const container = document.getElementById('caseFormPage');
    if (!container) {
        console.error('Case form page container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading form...</div>
            </div>
        </div>
    `;

    try {
        // Load data in parallel
        const [surgeonsData, hospitalsData, repsData, caseData] = await Promise.all([
            getSurgeons(),
            getHospitals(),
            getReps(),
            isEdit ? getCase(caseId) : null
        ]);

        surgeons = surgeonsData;
        hospitals = hospitalsData;
        reps = repsData;

        // Render form
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>

                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px;">
                    <h1 class="page-title" style="margin-bottom: 8px;">
                        ${isEdit ? 'Edit Case' : 'Create New Case'}
                    </h1>
                    <p class="page-subtitle" style="margin-bottom: 24px;">
                        ${isEdit ? 'Update case details' : 'Schedule a new surgical case'}
                    </p>

                    <form id="caseForm">
                        <!-- Surgeon Selection -->
                        <div class="form-group">
                            <label class="form-label">Surgeon *</label>
                            <select class="form-select" id="surgeonSelect" required>
                                <option value="">Select surgeon...</option>
                                ${surgeons.map(s => `
                                    <option value="${s.id}" ${caseData?.surgeon_id === s.id ? 'selected' : ''}>
                                        ${s.name} - ${s.specialty || 'N/A'}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Procedure -->
                        <div class="form-group">
                            <label class="form-label">Procedure *</label>
                            <input
                                type="text"
                                class="form-input"
                                id="procedureInput"
                                placeholder="e.g., L4-L5 Posterior Fusion"
                                value="${caseData?.procedure || ''}"
                                required
                            />
                        </div>

                        <!-- Date and Time -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Date *</label>
                                <input
                                    type="date"
                                    class="form-input"
                                    id="dateInput"
                                    value="${caseData?.scheduled_date || ''}"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Scheduled Start Time *</label>
                                <input
                                    type="time"
                                    class="form-input"
                                    id="timeInput"
                                    value="${caseData?.scheduled_time ? new Date(caseData.scheduled_time).toTimeString().slice(0, 5) : ''}"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Hospital and Room -->
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Hospital *</label>
                                <select class="form-select" id="hospitalSelect" required>
                                    <option value="">Select hospital...</option>
                                    ${hospitals.map(h => `
                                        <option value="${h.id}" ${caseData?.hospital_id === h.id ? 'selected' : ''}>
                                            ${h.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">OR Room</label>
                                <input
                                    type="text"
                                    class="form-input"
                                    id="roomInput"
                                    placeholder="e.g., OR 2"
                                    value="${caseData?.room || ''}"
                                />
                            </div>
                        </div>

                        <!-- Assigned Rep -->
                        <div class="form-group">
                            <label class="form-label">Assigned Rep *</label>
                            <select class="form-select" id="repSelect" required>
                                <option value="">Select rep...</option>
                                ${reps.map(r => `
                                    <option value="${r.id}" ${caseData?.assigned_rep_id === r.id ? 'selected' : ''}>
                                        ${r.full_name}${r.territory ? ' - ' + r.territory : ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Notes -->
                        <div class="form-group">
                            <label class="form-label">Special Notes</label>
                            <textarea
                                class="form-textarea"
                                id="notesTextarea"
                                placeholder="Any special requirements or notes..."
                                rows="4"
                            >${caseData?.notes || ''}</textarea>
                        </div>

                        <!-- Action Buttons -->
                        <div class="action-buttons" style="margin-top: 24px;">
                            <button type="submit" class="btn btn-primary" style="flex: 1;">
                                ${isEdit ? 'Update Case' : 'Create Case'}
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="window.history.back()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add form submit handler
        const form = document.getElementById('caseForm');
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    } catch (error) {
        handleError(error, 'renderCaseFormPage');
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load form</div>
                    <div style="font-size: 14px; color: var(--gray-light);">${error.message}</div>
                    <button class="btn btn-primary" style="margin-top: 20px;" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    // Get form values
    const surgeonId = document.getElementById('surgeonSelect')?.value;
    const procedure = document.getElementById('procedureInput')?.value?.trim();
    const date = document.getElementById('dateInput')?.value;
    const time = document.getElementById('timeInput')?.value;
    const hospitalId = document.getElementById('hospitalSelect')?.value;
    const room = document.getElementById('roomInput')?.value?.trim();
    const repId = document.getElementById('repSelect')?.value;
    const notes = document.getElementById('notesTextarea')?.value?.trim();

    // Validate
    if (!surgeonId || !procedure || !date || !time || !hospitalId || !repId) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = currentCaseId ? 'Updating...' : 'Creating...';
    }

    try {
        const userProfile = getCurrentUserProfile();

        if (currentCaseId) {
            // Update existing case
            const updates = {
                surgeon_id: surgeonId,
                procedure: procedure,
                scheduled_date: date,
                scheduled_time: `${date}T${time}:00`,
                hospital_id: hospitalId,
                room: room || null,
                assigned_rep_id: repId,
                notes: notes || null
            };

            await updateCase(currentCaseId, updates);
            showNotification('Case updated successfully!', 'success');

            // Navigate to case detail
            navigateTo(`/cases/${currentCaseId}`);
        } else {
            // Create new case
            const caseData = {
                surgeonId,
                procedure,
                scheduledDate: date,
                scheduledTime: `${date}T${time}:00`,
                hospitalId,
                room: room || null,
                assignedRepId: repId,
                notes: notes || null,
                createdById: userProfile.id
            };

            const newCase = await createCase(caseData);
            showNotification('Case created successfully! Rep has been notified.', 'success');

            // Navigate to new case detail
            navigateTo(`/cases/${newCase.id}`);
        }
    } catch (error) {
        handleError(error, 'handleSubmit');
        showNotification(`Failed to ${currentCaseId ? 'update' : 'create'} case`, 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = currentCaseId ? 'Update Case' : 'Create Case';
        }
    }
}
