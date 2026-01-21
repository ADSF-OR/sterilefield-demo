/**
 * Case Form Page (Create/Edit)
 */

import { getCase, createCase, updateCase, getSurgeons, getHospitals, createSurgeon, createHospital } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { handleError, showNotification } from '../utils/helpers.js';

let currentCaseId = null;
let currentMode = 'rep';
let surgeons = [];
let hospitals = [];

export async function renderCaseFormPage(caseId = null, mode = 'rep') {
    currentCaseId = caseId;
    currentMode = mode;
    const isEdit = !!caseId;

    // Check for prefilled surgeon from schedule flow
    const prefillSurgeonId = sessionStorage.getItem('prefillSurgeonId');
    if (prefillSurgeonId && !isEdit) {
        sessionStorage.removeItem('prefillSurgeonId'); // Clear after reading
    }

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
        const [surgeonsData, hospitalsData, caseData] = await Promise.all([
            getSurgeons(),
            getHospitals(),
            isEdit ? getCase(caseId) : null
        ]);

        surgeons = surgeonsData;
        hospitals = hospitalsData;

        // Extract date and time if editing
        let dateValue = '';
        let timeValue = '';
        if (caseData) {
            const dt = new Date(caseData.case_datetime);
            dateValue = dt.toISOString().split('T')[0];
            timeValue = dt.toTimeString().slice(0, 5);
        }

        // Render form
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>

                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px;">
                    <h1 class="page-title" style="margin-bottom: 8px;">
                        ${isEdit ? 'Edit Case' : 'Schedule New Case'}
                    </h1>
                    <p class="page-subtitle" style="margin-bottom: 24px;">
                        ${isEdit ? 'Update case details' : 'Schedule a new surgical case'}
                    </p>

                    <form id="caseForm">
                        <!-- Surgeon Selection -->
                        <div class="form-group">
                            <label class="form-label">Surgeon *</label>
                            <div style="display: flex; gap: 8px;">
                                <select class="form-select" id="surgeonSelect" required style="flex: 1;">
                                    <option value="">Select surgeon...</option>
                                    ${surgeons.map(s => `
                                        <option value="${s.id}" ${(caseData?.surgeon_id === s.id || prefillSurgeonId === s.id) ? 'selected' : ''}>
                                            ${s.name}
                                        </option>
                                    `).join('')}
                                </select>
                                <button type="button" class="btn btn-secondary" id="addSurgeonBtn" style="white-space: nowrap;">
                                    + Add New
                                </button>
                            </div>
                        </div>

                        <!-- Hospital Selection -->
                        <div class="form-group">
                            <label class="form-label">Hospital *</label>
                            <div style="display: flex; gap: 8px;">
                                <select class="form-select" id="hospitalSelect" required style="flex: 1;">
                                    <option value="">Select hospital...</option>
                                    ${hospitals.map(h => `
                                        <option value="${h.id}" ${caseData?.hospital_id === h.id ? 'selected' : ''}>
                                            ${h.name}
                                        </option>
                                    `).join('')}
                                </select>
                                <button type="button" class="btn btn-secondary" id="addHospitalBtn" style="white-space: nowrap;">
                                    + Add New
                                </button>
                            </div>
                        </div>

                        <!-- Procedure -->
                        <div class="form-group">
                            <label class="form-label">Procedure *</label>
                            <input
                                type="text"
                                class="form-input"
                                id="procedureInput"
                                placeholder="e.g., Total Hip Replacement"
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
                                    value="${dateValue}"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Time *</label>
                                <input
                                    type="time"
                                    class="form-input"
                                    id="timeInput"
                                    value="${timeValue}"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Notes -->
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea
                                class="form-textarea"
                                id="notesTextarea"
                                placeholder="Any special requirements or notes..."
                                rows="4"
                            >${caseData?.notes || ''}</textarea>
                        </div>

                        <!-- Status (only for edit) -->
                        ${isEdit ? `
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="statusSelect">
                                    <option value="PENDING" ${caseData?.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                                    <option value="CONFIRMED" ${caseData?.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                                    <option value="COMPLETED" ${caseData?.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                    <option value="CANCELLED" ${caseData?.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                        ` : ''}

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

        // Add event listeners
        document.getElementById('caseForm')?.addEventListener('submit', handleSubmit);
        document.getElementById('addSurgeonBtn')?.addEventListener('click', handleAddSurgeon);
        document.getElementById('addHospitalBtn')?.addEventListener('click', handleAddHospital);
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
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">
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
    const hospitalId = document.getElementById('hospitalSelect')?.value;
    const procedure = document.getElementById('procedureInput')?.value?.trim();
    const date = document.getElementById('dateInput')?.value;
    const time = document.getElementById('timeInput')?.value;
    const notes = document.getElementById('notesTextarea')?.value?.trim();
    const status = document.getElementById('statusSelect')?.value;

    // Validate
    if (!surgeonId || !hospitalId || !procedure || !date || !time) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Combine date and time
    const caseDateTime = `${date}T${time}:00`;

    // Show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = currentCaseId ? 'Updating...' : 'Creating...';
    }

    try {
        if (currentCaseId) {
            // Update existing case
            const updates = {
                surgeon_id: surgeonId,
                hospital_id: hospitalId,
                procedure: procedure,
                case_datetime: caseDateTime,
                notes: notes || null
            };

            if (status) {
                updates.status = status;
            }

            await updateCase(currentCaseId, updates);
            showNotification('Case updated successfully!', 'success');

            // Navigate to case detail
            navigateTo(`/${currentMode}/cases/${currentCaseId}`);
        } else {
            // Create new case
            const caseData = {
                surgeon_id: surgeonId,
                hospital_id: hospitalId,
                procedure: procedure,
                case_datetime: caseDateTime,
                notes: notes || null,
                status: 'PENDING'
            };

            const newCase = await createCase(caseData);
            showNotification('Case created successfully!', 'success');

            // Navigate to new case detail
            navigateTo(`/${currentMode}/cases/${newCase.id}`);
        }
    } catch (error) {
        handleError(error, 'handleSubmit');
        showNotification(`Failed to ${currentCaseId ? 'update' : 'create'} case: ${error.message}`, 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = currentCaseId ? 'Update Case' : 'Create Case';
        }
    }
}

async function handleAddSurgeon() {
    const name = prompt('Enter surgeon name:');
    if (!name || !name.trim()) return;

    try {
        const newSurgeon = await createSurgeon(name);
        surgeons.push(newSurgeon);

        // Update select dropdown
        const select = document.getElementById('surgeonSelect');
        if (select) {
            const option = document.createElement('option');
            option.value = newSurgeon.id;
            option.textContent = newSurgeon.name;
            option.selected = true;
            select.appendChild(option);
        }

        showNotification('Surgeon added successfully!', 'success');
    } catch (error) {
        handleError(error, 'handleAddSurgeon');
        showNotification('Failed to add surgeon: ' + error.message, 'error');
    }
}

async function handleAddHospital() {
    const name = prompt('Enter hospital name:');
    if (!name || !name.trim()) return;

    try {
        const newHospital = await createHospital(name);
        hospitals.push(newHospital);

        // Update select dropdown
        const select = document.getElementById('hospitalSelect');
        if (select) {
            const option = document.createElement('option');
            option.value = newHospital.id;
            option.textContent = newHospital.name;
            option.selected = true;
            select.appendChild(option);
        }

        showNotification('Hospital added successfully!', 'success');
    } catch (error) {
        handleError(error, 'handleAddHospital');
        showNotification('Failed to add hospital: ' + error.message, 'error');
    }
}
