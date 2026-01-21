/**
 * Scheduler Home Page
 * Surgeon-focused dashboard for scheduling cases
 */

import { getSurgeons, getCases } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { handleError } from '../utils/helpers.js';

export async function renderSchedulerHomePage() {
    const container = document.getElementById('schedulerHomePage');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading surgeons...</div>
            </div>
        </div>
    `;

    try {
        // Load surgeons and cases to show case counts
        const [surgeons, cases] = await Promise.all([
            getSurgeons(),
            getCases()
        ]);

        // Count upcoming cases per surgeon
        const now = new Date();
        const caseCounts = {};
        cases.forEach(c => {
            if (c.surgeon_id && new Date(c.case_datetime) >= now && c.status === 'scheduled') {
                caseCounts[c.surgeon_id] = (caseCounts[c.surgeon_id] || 0) + 1;
            }
        });

        container.innerHTML = `
            <div class="content">
                <h1 class="page-title">Scheduler Dashboard</h1>
                <p class="page-subtitle">Select a surgeon to schedule a case</p>

                <!-- Surgeons List -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                            👨‍⚕️ Surgeons (${surgeons.length})
                        </h2>
                        <button class="btn btn-secondary" onclick="window.navigateTo('/scheduler/surgeons')">
                            Manage Surgeons
                        </button>
                    </div>

                    ${surgeons.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                            <div style="font-size: 48px; margin-bottom: 12px;">👨‍⚕️</div>
                            <p style="font-size: 16px; margin-bottom: 20px;">No surgeons in system</p>
                            <button class="btn btn-primary" onclick="window.navigateTo('/scheduler/surgeons')">
                                Add First Surgeon
                            </button>
                        </div>
                    ` : `
                        <div style="display: grid; gap: 12px;">
                            ${surgeons.map(s => {
                                const upcomingCount = caseCounts[s.id] || 0;
                                return `
                                    <div
                                        class="surgeon-item"
                                        style="padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s;"
                                        onclick="window.navigateTo('/scheduler/surgeons/${s.id}')"
                                        onmouseover="this.style.borderColor='var(--gold)'; this.style.backgroundColor='rgba(184, 134, 11, 0.05)';"
                                        onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                                    >
                                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                                            <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                                                <div style="font-size: 48px;">👨‍⚕️</div>
                                                <div style="flex: 1;">
                                                    <div style="font-weight: 700; color: var(--forest); font-size: 18px; margin-bottom: 4px;">
                                                        ${s.name}
                                                    </div>
                                                    <div style="color: var(--gray); font-size: 14px;">
                                                        ${upcomingCount} upcoming ${upcomingCount === 1 ? 'case' : 'cases'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    class="btn btn-primary"
                                                    onclick="event.stopPropagation(); window.navigateTo('/scheduler/surgeons/${s.id}')"
                                                    style="white-space: nowrap;"
                                                >
                                                    📅 Schedule Case
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
                    <div style="background: white; border: 2px solid var(--forest-light); border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--forest); margin-bottom: 4px;">
                            ${surgeons.length}
                        </div>
                        <div style="color: var(--gray); font-size: 14px;">Total Surgeons</div>
                    </div>
                    <div style="background: white; border: 2px solid var(--gold); border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--gold); margin-bottom: 4px;">
                            ${Object.values(caseCounts).reduce((a, b) => a + b, 0)}
                        </div>
                        <div style="color: var(--gray); font-size: 14px;">Upcoming Cases</div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        handleError(error, 'renderSchedulerHomePage');
        container.innerHTML = `
            <div class="content">
                <div style="text-align: center; padding: 60px 20px; color: var(--danger);">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load dashboard</div>
                    <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 20px;">${error.message}</div>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            </div>
        `;
    }
}
