import { getSurgeons, createSurgeon, updateSurgeon, deleteSurgeon, handleDatabaseError } from '../js/database.js';
import { showNotification, handleError } from '../utils/helpers.js';

export async function renderSurgeonsPage() {
    const container = document.getElementById('surgeonsPage');
    if (!container) return;

    container.innerHTML = '<div class="content"><div style="text-align:center;padding:60px 20px;color:var(--gray-light)"><div style="font-size:48px;margin-bottom:16px">⏳</div><div>Loading surgeons...</div></div></div>';

    try {
        const surgeons = await getSurgeons();

        const surgeonsList = surgeons.length > 0 ? surgeons.map(s =>
            `<div class="case-card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div style="font-weight:600;font-size:18px;color:var(--forest)">${s.name}</div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-secondary btn-sm" onclick="window.editSurgeon('${s.id}','${s.name.replace(/'/g, "\\'")}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteSurgeonClick('${s.id}')">Delete</button>
                </div>
            </div>`
        ).join('') : '<div style="text-align:center;padding:60px 20px;color:var(--gray-light)"><div style="font-size:48px;margin-bottom:12px">👨‍⚕️</div><div>No surgeons yet. Add one to get started!</div></div>';

        container.innerHTML = `
            <div class="content">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
                    <div>
                        <h1 class="page-title">Surgeons</h1>
                        <p class="page-subtitle">Manage surgeon profiles</p>
                    </div>
                    <button class="btn btn-primary" id="addSurgeonBtn">+ Add Surgeon</button>
                </div>
                <div id="surgeonsList">${surgeonsList}</div>
            </div>`;

        document.getElementById('addSurgeonBtn')?.addEventListener('click', addSurgeon);
    } catch (error) {
        handleError(error, 'renderSurgeonsPage');
        container.innerHTML = '<div class="content"><div style="text-align:center;padding:60px 20px;color:var(--danger)"><div style="font-size:48px;margin-bottom:16px">❌</div><div style="font-weight:600;margin-bottom:8px">Failed to load surgeons</div><div style="font-size:14px">' + error.message + '</div></div></div>';
    }
}

async function addSurgeon() {
    const name = prompt('Enter surgeon name (e.g., Dr. John Smith):');
    if (!name || !name.trim()) return;
    try {
        await createSurgeon(name);
        showNotification('Surgeon added successfully!', 'success');
        await renderSurgeonsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
}

window.editSurgeon = async (id, oldName) => {
    const name = prompt('Edit surgeon name:', oldName);
    if (!name || !name.trim() || name === oldName) return;
    try {
        await updateSurgeon(id, name);
        showNotification('Surgeon updated successfully!', 'success');
        await renderSurgeonsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
};

window.deleteSurgeonClick = async (id) => {
    if (!confirm('Are you sure you want to delete this surgeon? Cases using them will prevent deletion.')) return;
    try {
        await deleteSurgeon(id);
        showNotification('Surgeon deleted successfully!', 'success');
        await renderSurgeonsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
};
