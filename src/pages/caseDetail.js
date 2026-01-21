/**
 * Case Detail Page (Simplified for MVP)
 */

import { getCase, deleteCase } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError, showNotification } from '../utils/helpers.js';

let currentCaseId = null;

export async function renderCaseDetailPage(caseId) {
    currentCaseId = caseId;

    const container = document.getElementById('caseDetailPage');
    if (!container) return;

    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div>Loading case details...</div>
            </div>
        </div>
    `;

    try {
        const caseData = await getCase(caseId);

        const statusBadge = caseData.status === 'completed' ? 'green' :
                           caseData.status === 'canceled' ? 'danger' : 'gray';

        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back to Schedule
                </button>

                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h1 style="font-family: Georgia, serif; font-size: 28px; color: var(--forest); margin-bottom: 8px; line-height: 1.3;">
                                ${caseData.procedure}
                            </h1>
                            <span class="badge badge-${statusBadge}">${caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}</span>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-secondary" id="editBtn">✏️ Edit</button>
                            <button class="btn btn-danger" id="deleteBtn">🗑️ Delete</button>
                        </div>
                    </div>

                    <div style="display: grid; gap: 16px; font-size: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">👨‍⚕️</span>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 2px;">Surgeon</div>
                                <div style="font-weight: 600; color: var(--slate);">${caseData.surgeon ? caseData.surgeon.name : 'Unknown'}</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">📍</span>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 2px;">Hospital</div>
                                <div style="font-weight: 600; color: var(--slate);">${caseData.hospital ? caseData.hospital.name : 'Unknown'}</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">📅</span>
                            <div>
                                <div style="font-size: 12px; color: var(--gray-light); margin-bottom: 2px;">Date & Time</div>
                                <div style="font-weight: 600; color: var(--slate);">${formatDate(caseData.case_datetime)} at ${formatTime(caseData.case_datetime)}</div>
                            </div>
                        </div>

                        ${caseData.notes ? `
                            <div style="background: rgba(184, 134, 11, 0.08); border-left: 4px solid var(--gold); padding: 16px; border-radius: 8px; margin-top: 12px;">
                                <div style="font-size: 12px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Notes</div>
                                <div style="color: var(--slate); line-height: 1.6;">${caseData.notes}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('editBtn')?.addEventListener('click', () => {
            navigateTo(`/cases/${caseId}/edit`);
        });

        document.getElementById('deleteBtn')?.addEventListener('click', handleDelete);
    } catch (error) {
        handleError(error, 'renderCaseDetailPage');
        container.innerHTML = `
            <div class="content">
                <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom: 20px;">
                    ← Back
                </button>
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load case</div>
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            </div>
        `;
    }
}

async function handleDelete() {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
        return;
    }

    try {
        await deleteCase(currentCaseId);
        showNotification('Case deleted successfully!', 'success');
        navigateTo('/schedule');
    } catch (error) {
        handleError(error, 'handleDelete');
        showNotification('Failed to delete case: ' + error.message, 'error');
    }
}
