import { getHospitals, createHospital, updateHospital, deleteHospital, handleDatabaseError } from '../js/database.js';
import { showNotification, handleError } from '../utils/helpers.js';

export async function renderHospitalsPage() {
    const container = document.getElementById('hospitalsPage');
    if (!container) return;

    container.innerHTML = '<div class="content"><div style="text-align:center;padding:60px 20px;color:var(--gray-light)"><div style="font-size:48px;margin-bottom:16px">⏳</div><div>Loading hospitals...</div></div></div>';

    try {
        const hospitals = await getHospitals();

        const hospitalsList = hospitals.length > 0 ? hospitals.map(h =>
            `<div class="case-card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div style="font-weight:600;font-size:18px;color:var(--forest)">${h.name}</div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-secondary btn-sm" onclick="window.editHospital('${h.id}','${h.name.replace(/'/g, "\\'")}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteHospitalClick('${h.id}')">Delete</button>
                </div>
            </div>`
        ).join('') : '<div style="text-align:center;padding:60px 20px;color:var(--gray-light)"><div style="font-size:48px;margin-bottom:12px">🏥</div><div>No hospitals yet. Add one to get started!</div></div>';

        container.innerHTML = `
            <div class="content">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
                    <div>
                        <h1 class="page-title">Hospitals</h1>
                        <p class="page-subtitle">Manage hospital locations</p>
                    </div>
                    <button class="btn btn-primary" id="addHospitalBtn">+ Add Hospital</button>
                </div>
                <div id="hospitalsList">${hospitalsList}</div>
            </div>`;

        document.getElementById('addHospitalBtn')?.addEventListener('click', addHospital);
    } catch (error) {
        handleError(error, 'renderHospitalsPage');
        container.innerHTML = '<div class="content"><div style="text-align:center;padding:60px 20px;color:var(--danger)"><div style="font-size:48px;margin-bottom:16px">❌</div><div style="font-weight:600;margin-bottom:8px">Failed to load hospitals</div><div style="font-size:14px">' + error.message + '</div></div></div>';
    }
}

async function addHospital() {
    const name = prompt('Enter hospital name:');
    if (!name || !name.trim()) return;
    try {
        await createHospital(name);
        showNotification('Hospital added successfully!', 'success');
        await renderHospitalsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
}

window.editHospital = async (id, oldName) => {
    const name = prompt('Edit hospital name:', oldName);
    if (!name || !name.trim() || name === oldName) return;
    try {
        await updateHospital(id, name);
        showNotification('Hospital updated successfully!', 'success');
        await renderHospitalsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
};

window.deleteHospitalClick = async (id) => {
    if (!confirm('Are you sure you want to delete this hospital? Cases using it will prevent deletion.')) return;
    try {
        await deleteHospital(id);
        showNotification('Hospital deleted successfully!', 'success');
        await renderHospitalsPage();
    } catch (error) {
        showNotification(handleDatabaseError(error), 'error');
    }
};
