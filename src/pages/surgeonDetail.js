/**
 * Surgeon Detail Page
 * Shows surgeon information and their cases
 */

import { getSurgeons, getCases, deleteSurgeon, updateSurgeonPreferences } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError, showNotification } from '../utils/helpers.js';

let currentSurgeonId = null;
let currentMode = null; // 'rep' or 'scheduler'
let editingPreference = null; // Track which preference is being edited

export async function renderSurgeonDetailPage(surgeonId, mode = 'rep') {
    currentSurgeonId = surgeonId;
    currentMode = mode;

    const container = document.getElementById('surgeonDetailPage');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading surgeon details...</div>
            </div>
        </div>
    `;

    try {
        // Load surgeon data and their cases
        const [surgeons, allCases] = await Promise.all([
            getSurgeons(),
            getCases()
        ]);

        const surgeon = surgeons.find(s => s.id === surgeonId);
        if (!surgeon) {
            throw new Error('Surgeon not found');
        }

        // Filter cases for this surgeon
        const surgeonCases = allCases.filter(c => c.surgeon_id === surgeonId);
        const now = new Date();
        const upcomingCases = surgeonCases
            .filter(c => new Date(c.case_datetime) >= now)
            .sort((a, b) => new Date(a.case_datetime) - new Date(b.case_datetime));
        const pastCases = surgeonCases
            .filter(c => new Date(c.case_datetime) < now)
            .sort((a, b) => new Date(b.case_datetime) - new Date(a.case_datetime))
            .slice(0, 10); // Show last 10 past cases

        const backPath = mode === 'scheduler' ? '/scheduler' : '/rep';
        const schedulePath = mode === 'scheduler' ? '/scheduler/cases/new' : '/rep/schedule';

        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.navigateTo('${backPath}')" style="margin-bottom: 20px;">
                    ← Back to ${mode === 'scheduler' ? 'Scheduler' : 'Rep'} Dashboard
                </button>

                <!-- Surgeon Profile Card -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--forest); padding: 32px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 20px;">
                        <div style="display: flex; gap: 24px; align-items: center;">
                            <div style="font-size: 80px;">👨‍⚕️</div>
                            <div>
                                <h1 style="font-size: 32px; color: var(--forest); margin-bottom: 8px; font-weight: 700;">
                                    ${surgeon.name}
                                </h1>
                                <div style="color: var(--gray); font-size: 16px;">
                                    ${surgeonCases.length} total ${surgeonCases.length === 1 ? 'case' : 'cases'} •
                                    ${upcomingCases.length} upcoming
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${mode === 'scheduler' ? `
                                <button
                                    class="btn btn-primary"
                                    onclick="scheduleCase('${surgeonId}')"
                                    style="white-space: nowrap;"
                                >
                                    📅 Schedule Case
                                </button>
                            ` : ''}
                            <button
                                class="btn btn-secondary"
                                onclick="window.navigateTo('/${mode}/surgeons')"
                                style="white-space: nowrap;"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Surgeon Preferences (Rep View Only) -->
                ${mode === 'rep' ? `
                    <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px; margin-bottom: 24px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin-bottom: 20px; font-weight: 700;">
                            📝 Surgeon Preferences
                        </h2>

                        <div style="display: grid; gap: 20px;">
                            ${renderPreferenceSection(surgeon, 'general', surgeon.general_preferences)}
                            ${renderPreferenceSection(surgeon, 'implant', surgeon.implant_preferences)}
                            ${renderPreferenceSection(surgeon, 'technique', surgeon.technique_notes)}
                        </div>
                    </div>
                ` : ''}

                <!-- Upcoming Cases -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px; margin-bottom: 24px;">
                    <h2 style="font-size: 20px; color: var(--forest); margin-bottom: 20px; font-weight: 700;">
                        📅 Upcoming Cases (${upcomingCases.length})
                    </h2>

                    ${upcomingCases.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                            <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                            <p style="font-size: 16px; margin-bottom: 20px;">No upcoming cases scheduled</p>
                            ${mode === 'scheduler' ? `
                                <button class="btn btn-primary" onclick="scheduleCase('${surgeonId}')">
                                    Schedule First Case
                                </button>
                            ` : ''}
                        </div>
                    ` : `
                        <div style="display: grid; gap: 12px;">
                            ${upcomingCases.map(c => `
                                <div
                                    class="case-item"
                                    style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                                    onclick="window.navigateTo('/${mode}/cases/${c.id}')"
                                    onmouseover="this.style.borderColor='var(--gold)'; this.style.backgroundColor='rgba(184, 134, 11, 0.05)';"
                                    onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                                >
                                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 12px;">
                                        <div style="flex: 1; min-width: 200px;">
                                            <div style="font-weight: 700; color: var(--forest); font-size: 16px; margin-bottom: 4px;">
                                                ${c.procedure}
                                            </div>
                                            <div style="color: var(--gray); font-size: 14px; margin-top: 8px;">
                                                🏥 ${c.hospital ? c.hospital.name : 'Unknown Hospital'}
                                            </div>
                                            ${c.notes ? `
                                                <div style="color: var(--gray); font-size: 13px; margin-top: 8px; font-style: italic;">
                                                    ${c.notes}
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 600; color: var(--slate); font-size: 14px;">
                                                ${formatDate(c.case_datetime)}
                                            </div>
                                            <div style="color: var(--gray); font-size: 13px;">
                                                ${formatTime(c.case_datetime)}
                                            </div>
                                            <span class="badge badge-${c.status === 'completed' ? 'green' : c.status === 'canceled' ? 'danger' : 'gray'}" style="margin-top: 8px;">
                                                ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Past Cases -->
                ${pastCases.length > 0 ? `
                    <div style="background: white; border-radius: 12px; border: 2px solid #e5e7eb; padding: 24px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin-bottom: 20px; font-weight: 700;">
                            📋 Recent Past Cases (${pastCases.length})
                        </h2>
                        <div style="display: grid; gap: 12px;">
                            ${pastCases.map(c => `
                                <div
                                    class="case-item"
                                    style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; opacity: 0.8;"
                                    onclick="window.navigateTo('/${mode}/cases/${c.id}')"
                                    onmouseover="this.style.opacity='1'; this.style.borderColor='var(--slate)';"
                                    onmouseout="this.style.opacity='0.8'; this.style.borderColor='#e5e7eb';"
                                >
                                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 12px;">
                                        <div style="flex: 1; min-width: 200px;">
                                            <div style="font-weight: 600; color: var(--slate); font-size: 15px; margin-bottom: 4px;">
                                                ${c.procedure}
                                            </div>
                                            <div style="color: var(--gray); font-size: 14px; margin-top: 4px;">
                                                🏥 ${c.hospital ? c.hospital.name : 'Unknown Hospital'}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="color: var(--gray); font-size: 13px;">
                                                ${formatDate(c.case_datetime)}
                                            </div>
                                            <span class="badge badge-${c.status === 'completed' ? 'green' : 'danger'}" style="margin-top: 4px;">
                                                ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Add schedule case function to window
        window.scheduleCase = (surgeonId) => {
            // Store surgeon ID for prefill in case form
            sessionStorage.setItem('prefillSurgeonId', surgeonId);
            navigateTo(`/${mode}/cases/new`);
        };

    } catch (error) {
        handleError(error, 'renderSurgeonDetailPage');
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load surgeon</div>
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            </div>
        `;
    }
}

// Helper function to render a preference section
function renderPreferenceSection(surgeon, type, value) {
    const fieldMap = {
        general: 'general_preferences',
        implant: 'implant_preferences',
        technique: 'technique_notes'
    };

    const titleMap = {
        general: 'General Preferences',
        implant: 'Implant Preferences',
        technique: 'Technique Notes'
    };

    const isEditing = editingPreference === type;
    const hasValue = value && value.trim();

    return `
        <div class="pref-section" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: ${hasValue || isEditing ? '12px' : '0'};">
                <div>
                    <h4 style="font-size: 16px; font-weight: 700; color: var(--forest); margin-bottom: 4px;">
                        ${titleMap[type]}
                    </h4>
                    ${hasValue ? `
                        <span class="badge badge-success" style="font-size: 11px;">✅ Complete</span>
                    ` : `
                        <span class="badge badge-warning" style="font-size: 11px;">⚠️ Empty</span>
                    `}
                </div>
                ${surgeon.preferences_last_updated && hasValue && !isEditing ? `
                    <div style="font-size: 12px; color: var(--gray-light);">
                        Updated ${getRelativeTime(surgeon.preferences_last_updated)}
                    </div>
                ` : ''}
            </div>

            ${isEditing ? `
                <div id="pref-edit-${type}">
                    <textarea
                        class="form-textarea"
                        id="pref-textarea-${type}"
                        placeholder="Enter ${titleMap[type].toLowerCase()}..."
                        rows="4"
                        maxlength="500"
                        style="width: 100%; margin-bottom: 12px;"
                    >${value || ''}</textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 12px; color: var(--gray);">
                            <span id="char-count-${type}">0</span>/500
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button
                                class="btn btn-secondary"
                                onclick="handleCancelPreference('${type}')"
                                style="font-size: 14px; padding: 8px 16px;"
                            >
                                Cancel
                            </button>
                            <button
                                class="btn btn-primary"
                                id="save-btn-${type}"
                                onclick="handleSavePreference('${surgeon.id}', '${type}', '${fieldMap[type]}')"
                                style="font-size: 14px; padding: 8px 16px;"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ` : `
                <div>
                    ${hasValue ? `
                        <p style="color: var(--slate); line-height: 1.6; margin-bottom: 12px; white-space: pre-wrap;">${value}</p>
                        <button
                            class="btn btn-secondary"
                            onclick="handleEditPreference('${type}')"
                            style="font-size: 13px; padding: 6px 12px;"
                        >
                            ✏️ Edit
                        </button>
                    ` : `
                        <button
                            class="btn btn-primary"
                            onclick="handleEditPreference('${type}')"
                            style="font-size: 13px; padding: 6px 12px; background: var(--gold); border-color: var(--gold);"
                        >
                            + Add ${titleMap[type]}
                        </button>
                    `}
                </div>
            `}
        </div>
    `;
}

// Helper function for relative timestamps
function getRelativeTime(timestamp) {
    if (!timestamp) return 'Never';

    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return updated.toLocaleDateString();
}

// Global functions for preference editing
window.handleEditPreference = function(type) {
    editingPreference = type;
    renderSurgeonDetailPage(currentSurgeonId, currentMode);

    // Focus textarea and update char count after render
    setTimeout(() => {
        const textarea = document.getElementById(`pref-textarea-${type}`);
        const charCount = document.getElementById(`char-count-${type}`);

        if (textarea) {
            textarea.focus();
            if (charCount) {
                charCount.textContent = textarea.value.length;
            }

            // Update char count on input
            textarea.addEventListener('input', function() {
                if (charCount) {
                    charCount.textContent = this.value.length;
                }
            });
        }
    }, 0);
};

window.handleCancelPreference = function(type) {
    editingPreference = null;
    renderSurgeonDetailPage(currentSurgeonId, currentMode);
};

window.handleSavePreference = async function(surgeonId, type, fieldName) {
    const textarea = document.getElementById(`pref-textarea-${type}`);
    const saveBtn = document.getElementById(`save-btn-${type}`);

    if (!textarea) return;

    const value = textarea.value.trim();

    try {
        // Disable button and show loading state
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }

        // Update preference
        await updateSurgeonPreferences(surgeonId, {
            [fieldName]: value || null
        });

        showNotification('Preference saved successfully!', 'success');
        editingPreference = null;

        // Reload the page to show updated data
        await renderSurgeonDetailPage(surgeonId, currentMode);

    } catch (error) {
        handleError(error, 'handleSavePreference');
        showNotification('Failed to save preference: ' + error.message, 'error');

        // Re-enable button
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    }
};
