/**
 * Rep Home Page
 * Dashboard showing cases and surgeons for rep view
 */

import { getCases, getSurgeons } from '../js/database.js';
import { navigateTo } from '../js/router.js';
import { formatDate, formatTime, handleError } from '../utils/helpers.js';

export async function renderRepHomePage() {
    const container = document.getElementById('repHomePage');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="content">
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <div style="font-size: 18px;">Loading dashboard...</div>
            </div>
        </div>
    `;

    try {
        // Load data in parallel
        const [cases, surgeons] = await Promise.all([
            getCases(),
            getSurgeons()
        ]);

        // Filter upcoming cases (PENDING and CONFIRMED)
        const now = new Date();
        const upcomingCases = cases
            .filter(c => new Date(c.case_datetime) >= now && (c.status === 'PENDING' || c.status === 'CONFIRMED'))
            .sort((a, b) => new Date(a.case_datetime) - new Date(b.case_datetime))
            .slice(0, 10); // Show next 10 cases

        container.innerHTML = `
            <div class="content">
                <h1 class="page-title">Rep Dashboard</h1>
                <p class="page-subtitle">Your cases and surgeon directory</p>

                <!-- Upcoming Cases Section -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--gold); padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                            📅 Upcoming Cases (${upcomingCases.length})
                        </h2>
                        <button class="btn btn-primary" onclick="window.navigateTo('/rep/schedule')">
                            View All Cases
                        </button>
                    </div>

                    ${upcomingCases.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                            <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                            <p style="font-size: 16px;">No upcoming cases scheduled</p>
                        </div>
                    ` : `
                        <div style="display: grid; gap: 12px;">
                            ${upcomingCases.map(c => {
                                const isPending = c.status === 'PENDING';
                                const statusColor = isPending ? '#f59e0b' : '#10b981';
                                const statusLabel = isPending ? 'Pending' : 'Confirmed';

                                return `
                                    <div
                                        class="case-item"
                                        style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                                        onclick="window.navigateTo('/rep/cases/${c.id}')"
                                        onmouseover="this.style.borderColor='var(--gold)'; this.style.backgroundColor='rgba(184, 134, 11, 0.05)';"
                                        onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                                    >
                                        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 12px;">
                                            <div style="flex: 1; min-width: 200px;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                                    <div style="font-weight: 700; color: var(--forest); font-size: 16px;">
                                                        ${c.procedure}
                                                    </div>
                                                    <span class="badge" style="background: ${statusColor}; color: white; font-size: 11px;">
                                                        ${statusLabel}
                                                    </span>
                                                </div>
                                                <div style="color: var(--gray); font-size: 14px; display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">
                                                    <span>👨‍⚕️ ${c.surgeon ? c.surgeon.name : 'Unknown'}</span>
                                                    <span>🏥 ${c.hospital ? c.hospital.name : 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 600; color: var(--slate); font-size: 14px;">
                                                    ${formatDate(c.case_datetime)}
                                                </div>
                                                <div style="color: var(--gray); font-size: 13px;">
                                                    ${formatTime(c.case_datetime)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- Surgeons Directory Section -->
                <div style="background: white; border-radius: 12px; border: 2px solid var(--forest-light); padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 20px; color: var(--forest); margin: 0; font-weight: 700;">
                            👨‍⚕️ Surgeon Directory (${surgeons.length})
                        </h2>
                        <button class="btn btn-secondary" onclick="window.navigateTo('/rep/surgeons')">
                            View All Surgeons
                        </button>
                    </div>

                    ${surgeons.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--gray-light);">
                            <div style="font-size: 48px; margin-bottom: 12px;">👨‍⚕️</div>
                            <p style="font-size: 16px;">No surgeons in directory</p>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                            ${surgeons.slice(0, 6).map(s => `
                                <div
                                    class="surgeon-card"
                                    style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: center;"
                                    onclick="window.navigateTo('/rep/surgeons/${s.id}')"
                                    onmouseover="this.style.borderColor='var(--forest-light)'; this.style.backgroundColor='rgba(45, 106, 79, 0.05)';"
                                    onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                                >
                                    <div style="font-size: 40px; margin-bottom: 12px;">👨‍⚕️</div>
                                    <div style="font-weight: 700; color: var(--forest); font-size: 16px; margin-bottom: 4px;">
                                        ${s.name}
                                    </div>
                                    <div style="color: var(--gray); font-size: 13px;">
                                        Click to view profile
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${surgeons.length > 6 ? `
                            <div style="text-align: center; margin-top: 16px;">
                                <button class="btn btn-secondary" onclick="window.navigateTo('/rep/surgeons')">
                                    View All ${surgeons.length} Surgeons →
                                </button>
                            </div>
                        ` : ''}
                    `}
                </div>
            </div>
        `;

    } catch (error) {
        handleError(error, 'renderRepHomePage');
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
