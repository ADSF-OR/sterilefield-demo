/**
 * SterileField Application Main Module
 * Handles UI logic and integrates with Supabase database
 */

// Import modules
import { initSupabase } from './database.js';
import { enableDemoMode, getCurrentUserProfile } from './auth.js';
import * as db from './database.js';
import {
    formatDate,
    formatTime,
    formatDateTime,
    formatConfirmTime,
    calculateDelay,
    formatDelay,
    getTodayDateString,
    getCurrentTimeString,
    getCurrentTimestamp,
    isToday,
    showNotification,
    handleError,
    showElement,
    hideElement,
    toggleElement,
    setActiveNavButton
} from '../utils/helpers.js';

// =====================================================
// APPLICATION STATE
// =====================================================

let currentView = null; // 'rep' or 'scheduler'
let currentTab = 'surgeons'; // 'surgeons', 'cases', 'territory', 'more'
let selectedSurgeonId = null;

// Cached data
let surgeonsCache = [];
let hospitalsCache = [];
let repsCache = [];
let casesCache = [];

// Realtime subscription
let casesSubscription = null;

// =====================================================
// INITIALIZATION
// =====================================================

export async function initApp() {
    try {
        console.log('🚀 Initializing SterileField application...');

        // Initialize Supabase
        initSupabase();

        // Enable demo mode for now (no real authentication)
        enableDemoMode('rep');
        console.log('⚠️ Demo mode enabled');

        // Load initial data
        await loadInitialData();

        // Show welcome screen
        showElement('welcome');

        // Set up event listeners
        setupEventListeners();

        console.log('✅ Application initialized successfully');
    } catch (error) {
        handleError(error, 'initApp');
        showNotification('Failed to initialize application', 'error');
    }
}

async function loadInitialData() {
    try {
        // Load hospitals and reps in parallel
        [hospitalsCache, repsCache] = await Promise.all([
            db.getHospitals(),
            db.getReps()
        ]);

        console.log(`✅ Loaded ${hospitalsCache.length} hospitals and ${repsCache.length} reps`);
    } catch (error) {
        handleError(error, 'loadInitialData');
        throw error;
    }
}

function setupEventListeners() {
    // Nav buttons
    const navSurgeons = document.getElementById('navSurgeons');
    const navCases = document.getElementById('navCases');
    const navTerritory = document.getElementById('navTerritory');
    const navMore = document.getElementById('navMore');

    if (navSurgeons) navSurgeons.addEventListener('click', () => navigate('surgeons'));
    if (navCases) navCases.addEventListener('click', () => navigate('cases'));
    if (navTerritory) navTerritory.addEventListener('click', () => navigate('territory'));
    if (navMore) navMore.addEventListener('click', () => navigate('more'));

    // Switch view button
    const switchViewBtn = document.getElementById('switchViewBtn');
    if (switchViewBtn) {
        switchViewBtn.addEventListener('click', () => {
            const newView = currentView === 'rep' ? 'scheduler' : 'rep';
            selectView(newView);
        });
    }
}

// =====================================================
// VIEW SELECTION
// =====================================================

export async function selectView(view) {
    currentView = view;
    hideElement('welcome');

    const viewMode = document.getElementById('viewMode');
    const viewBadge = document.getElementById('viewBadge');

    if (viewMode) {
        viewMode.textContent = view === 'rep' ? 'Rep View' : 'Scheduler View';
    }

    if (viewBadge) {
        if (view === 'rep') {
            viewBadge.textContent = '👤 REP MODE';
            viewBadge.className = 'view-badge view-badge-rep';
        } else {
            viewBadge.textContent = '📋 SCHEDULER MODE';
            viewBadge.className = 'view-badge view-badge-scheduler';
        }
    }

    // Subscribe to realtime updates
    if (!casesSubscription) {
        casesSubscription = db.subscribeToCases(handleCaseUpdate);
    }

    if (view === 'rep') {
        await navigate('surgeons');
        await updateCasesNotificationBadge();
    } else {
        await renderSchedulerView();
    }
}

function handleCaseUpdate(payload) {
    console.log('📡 Case update received:', payload);

    // Refresh current view
    if (currentView === 'rep') {
        if (currentTab === 'surgeons') {
            renderRepSurgeonList();
        } else if (currentTab === 'cases') {
            const activeTab = document.querySelector('#repCasesList .tab.active');
            if (activeTab) {
                const filter = activeTab.dataset.filter || 'today';
                renderCasesList(filter);
            }
        }
    } else if (currentView === 'scheduler' && selectedSurgeonId) {
        showSchedulerSurgeonDetail(selectedSurgeonId);
    }

    updateCasesNotificationBadge();
}

// =====================================================
// NAVIGATION
// =====================================================

export async function navigate(page) {
    // Hide all pages
    hideElement('repSurgeonList');
    hideElement('repCasesList');
    hideElement('repTerritory');
    hideElement('repMore');

    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    currentTab = page;

    if (page === 'surgeons') {
        if (currentView === 'rep') {
            await renderRepSurgeonList();
            showElement('repSurgeonList');
        }
        setActiveNavButton('navSurgeons');
    } else if (page === 'cases') {
        if (currentView === 'rep') {
            showElement('repCasesList');
            await renderCasesList('today');
            // Set first tab as active
            setTimeout(() => {
                const tabs = document.querySelectorAll('#repCasesList .tab');
                tabs.forEach(t => t.classList.remove('active'));
                if (tabs[0]) tabs[0].classList.add('active');
            }, 10);
        }
        setActiveNavButton('navCases');
    } else if (page === 'territory') {
        if (currentView === 'rep') {
            await renderRepTerritory();
            showElement('repTerritory');
        }
        setActiveNavButton('navTerritory');
    } else if (page === 'more') {
        if (currentView === 'rep') {
            showElement('repMore');
        }
        setActiveNavButton('navMore');
    }
}

// =====================================================
// DATA LOADING
// =====================================================

export async function loadSurgeons() {
    try {
        surgeonsCache = await db.getSurgeons();
        return surgeonsCache;
    } catch (error) {
        handleError(error, 'loadSurgeons');
        return [];
    }
}

export async function loadCases(filters = {}) {
    try {
        casesCache = await db.getCases(filters);
        return casesCache;
    } catch (error) {
        handleError(error, 'loadCases');
        return [];
    }
}

// =====================================================
// REP VIEW: SURGEON LIST
// =====================================================

export async function renderRepSurgeonList() {
    const content = document.getElementById('repSurgeonListContent');
    if (!content) return;

    try {
        // Show loading state
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gray-light);">Loading surgeons...</div>';

        // Load surgeons
        const surgeons = await loadSurgeons();

        if (surgeons.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">👨‍⚕️</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--forest);">No surgeons found</div>
                </div>
            `;
            return;
        }

        // Get all cases for counting
        const allCases = await loadCases();

        const surgeonsHTML = await Promise.all(surgeons.map(async surgeon => {
            const surgeonCases = allCases.filter(c => c.surgeon_id === surgeon.id);
            const upcomingCases = surgeonCases.filter(c => c.status === 'scheduled');
            const currentCases = surgeonCases.filter(c => c.status === 'in-progress');

            return `
                <div class="surgeon-card" style="cursor: default; margin-bottom: 24px;">
                    <div class="surgeon-card-header">
                        <div>
                            <div class="surgeon-name">${surgeon.name}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${upcomingCases.length > 0 ? `<div class="pending-badge">${upcomingCases.length} upcoming</div>` : ''}
                            ${currentCases.length > 0 ? `<div class="pending-badge" style="background: var(--info);">${currentCases.length} current</div>` : ''}
                        </div>
                    </div>
                    <div class="surgeon-specialty">${surgeon.specialty || 'N/A'}</div>
                    <div class="surgeon-hospital">📍 ${surgeon.primary_hospital?.name || 'N/A'}</div>

                    <!-- Preferences Section -->
                    <div style="margin-top: 20px;">
                        <button class="btn btn-secondary btn-small" onclick="window.appToggleSection('pref-${surgeon.id}')" style="width: 100%;">
                            <span id="pref-icon-${surgeon.id}">▶</span> View Preferences & Techniques
                        </button>
                        <div id="pref-${surgeon.id}" class="hidden" style="margin-top: 12px; animation: slideIn 0.3s ease-out;">
                            <div class="pref-section">
                                <div class="pref-title">General Preferences</div>
                                <div class="pref-text">${surgeon.pref_general || 'No preferences recorded'}</div>
                            </div>

                            <div class="pref-section">
                                <div class="pref-title">Implant Preferences</div>
                                <div class="pref-text">${surgeon.pref_implants || 'No preferences recorded'}</div>
                            </div>

                            <div class="pref-section" style="margin-bottom: 0;">
                                <div class="pref-title">Technique Notes</div>
                                <div class="pref-text">${surgeon.pref_technique || 'No notes recorded'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cases Section -->
                    ${surgeonCases.length > 0 ? `
                        <div style="margin-top: 16px;">
                            <button class="btn btn-gold btn-small" onclick="window.appToggleSection('cases-${surgeon.id}')" style="width: 100%;">
                                <span id="cases-icon-${surgeon.id}">▶</span> View Cases (${surgeonCases.length})
                            </button>
                            <div id="cases-${surgeon.id}" class="hidden" style="margin-top: 12px; animation: slideIn 0.3s ease-out;">
                                ${upcomingCases.length > 0 ? `
                                    <h4 style="font-size: 14px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 12px 0;">
                                        Upcoming (${upcomingCases.length})
                                    </h4>
                                    ${upcomingCases.map(c => renderInlineCaseCard(c)).join('')}
                                ` : ''}

                                ${currentCases.length > 0 ? `
                                    <h4 style="font-size: 14px; font-weight: 700; color: var(--info); text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 12px 0;">
                                        Current (${currentCases.length})
                                    </h4>
                                    ${currentCases.map(c => renderInlineCaseCard(c)).join('')}
                                ` : ''}
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top: 16px; padding: 12px; background: rgba(26, 77, 46, 0.05); border-radius: 8px; text-align: center; color: var(--gray-light); font-size: 14px;">
                            No cases scheduled for this surgeon
                        </div>
                    `}
                </div>
            `;
        }));

        content.innerHTML = surgeonsHTML.join('');
    } catch (error) {
        handleError(error, 'renderRepSurgeonList');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                Failed to load surgeons. Please try again.
            </div>
        `;
    }
}

// =====================================================
// REP VIEW: CASES LIST
// =====================================================

export async function renderCasesList(filter = 'today') {
    const content = document.getElementById('repCasesListContent');
    if (!content) return;

    try {
        // Show loading state
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gray-light);">Loading cases...</div>';

        // Get current user profile
        const userProfile = getCurrentUserProfile();
        const currentUserId = userProfile?.id;

        // Build filters based on selected filter
        let filters = {};
        const today = getTodayDateString();

        if (filter === 'today') {
            filters.date = today;
        } else if (filter === 'mine') {
            filters.repId = currentUserId;
        } else if (filter === 'unconfirmed') {
            filters.confirmed = false;
            filters.status = 'scheduled';
        }

        // Load cases
        const cases = await loadCases(filters);

        if (cases.length === 0) {
            let emptyMessage = 'No cases found.';
            let emptyIcon = '📋';
            let emptyAction = '';

            if (filter === 'today') {
                emptyMessage = 'No cases scheduled for today';
                emptyIcon = '🎉';
                emptyAction = '<div style="margin-top: 12px; font-size: 14px; color: var(--gray-light);">Check the "All Cases" tab to see upcoming cases</div>';
            } else if (filter === 'mine') {
                emptyMessage = 'No cases assigned to you yet';
                emptyIcon = '👤';
                emptyAction = '<div style="margin-top: 12px; font-size: 14px; color: var(--gray-light);">Browse "All Cases" to find cases you can assign to yourself</div>';
            } else if (filter === 'unconfirmed') {
                emptyMessage = 'All cases are confirmed!';
                emptyIcon = '✅';
                emptyAction = '<div style="margin-top: 12px; font-size: 14px; color: var(--success); font-weight: 600;">Great work! You\'re all caught up.</div>';
            }

            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">${emptyIcon}</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--forest); margin-bottom: 8px;">${emptyMessage}</div>
                    ${emptyAction}
                </div>
            `;
            return;
        }

        // Group by date
        const groupedCases = {};
        cases.forEach(c => {
            const dateKey = c.scheduled_date;
            if (!groupedCases[dateKey]) {
                groupedCases[dateKey] = [];
            }
            groupedCases[dateKey].push(c);
        });

        let html = '';
        Object.keys(groupedCases).sort().forEach(dateKey => {
            const casesForDate = groupedCases[dateKey];

            html += `
                <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid var(--gold);">
                        <h3 style="font-family: Georgia, serif; font-size: 24px; color: var(--forest); margin: 0;">
                            ${formatDate(dateKey)}
                        </h3>
                        <div style="margin-left: auto; background: var(--forest); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700;">
                            ${casesForDate.length} ${casesForDate.length === 1 ? 'case' : 'cases'}
                        </div>
                    </div>
                    ${casesForDate.map(c => renderCasesListCard(c, currentUserId)).join('')}
                </div>
            `;
        });

        content.innerHTML = html;
    } catch (error) {
        handleError(error, 'renderCasesList');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                Failed to load cases. Please try again.
            </div>
        `;
    }
}

// =====================================================
// REP VIEW: TERRITORY
// =====================================================

export async function renderRepTerritory() {
    const content = document.getElementById('repTerritoryContent');
    if (!content) return;

    try {
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gray-light);">Loading hospitals...</div>';

        const hospitals = hospitalsCache.length > 0 ? hospitalsCache : await db.getHospitals();
        const surgeons = surgeonsCache.length > 0 ? surgeonsCache : await loadSurgeons();
        const allCases = await loadCases();

        const hospitalsHTML = hospitals.map(hospital => {
            // Find surgeons at this hospital
            const hospitalSurgeons = surgeons.filter(s => s.primary_hospital_id === hospital.id);
            const surgeonList = hospitalSurgeons.map(s => s.name).join(', ');

            // Count cases at this hospital
            const hospitalCases = allCases.filter(c => c.hospital_id === hospital.id);

            return `
                <div class="hospital-card" style="cursor: default;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div>
                            <div style="font-weight: 600; color: var(--forest); font-size: 18px; margin-bottom: 6px;">
                                ${hospital.name}
                            </div>
                            <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 8px;">
                                📍 ${hospital.city || 'N/A'}, ${hospital.state || 'N/A'}
                            </div>
                        </div>
                        <div class="pending-badge ${hospitalCases.length === 0 ? 'none' : ''}">
                            ${hospitalCases.length} ${hospitalCases.length === 1 ? 'case' : 'cases'}
                        </div>
                    </div>
                    ${surgeonList ? `
                        <div style="padding: 10px; background: rgba(26, 77, 46, 0.05); border-radius: 8px; margin-top: 12px;">
                            <div style="font-size: 12px; color: var(--gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                                Available Surgeons
                            </div>
                            <div style="font-size: 14px; color: var(--slate);">
                                ${surgeonList}
                            </div>
                        </div>
                    ` : `
                        <div style="font-size: 13px; color: var(--gray-lighter); font-style: italic;">
                            No surgeons currently assigned
                        </div>
                    `}
                </div>
            `;
        }).join('');

        content.innerHTML = hospitalsHTML;
    } catch (error) {
        handleError(error, 'renderRepTerritory');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                Failed to load territory. Please try again.
            </div>
        `;
    }
}

// =====================================================
// SCHEDULER VIEW
// =====================================================

export async function renderSchedulerView() {
    hideElement('repSurgeonList');
    hideElement('repCasesList');
    hideElement('repTerritory');
    hideElement('repMore');
    hideElement('schedulerSurgeonDetail');
    showElement('schedulerSurgeonList');

    await renderSchedulerSurgeonList();
}

async function renderSchedulerSurgeonList() {
    const content = document.getElementById('schedulerSurgeonListContent');
    if (!content) return;

    try {
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gray-light);">Loading surgeons...</div>';

        const surgeons = await loadSurgeons();
        const allCases = await loadCases();

        const surgeonsHTML = surgeons.map(surgeon => {
            const pending = allCases.filter(c => c.surgeon_id === surgeon.id && c.status !== 'completed').length;

            return `
                <div class="surgeon-card" onclick="window.appShowSchedulerSurgeonDetail(${surgeon.id})">
                    <div class="surgeon-card-header">
                        <div>
                            <div class="surgeon-name">${surgeon.name}</div>
                        </div>
                        <div class="pending-badge ${pending === 0 ? 'none' : ''}">${pending} pending</div>
                    </div>
                    <div class="surgeon-specialty">${surgeon.specialty || 'N/A'}</div>
                    <div class="surgeon-hospital">📍 ${surgeon.primary_hospital?.name || 'N/A'}</div>
                </div>
            `;
        }).join('');

        content.innerHTML = surgeonsHTML;
    } catch (error) {
        handleError(error, 'renderSchedulerSurgeonList');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                Failed to load surgeons. Please try again.
            </div>
        `;
    }
}

export async function showSchedulerSurgeonDetail(surgeonId) {
    selectedSurgeonId = surgeonId;

    try {
        const surgeon = await db.getSurgeon(surgeonId);
        if (!surgeon) {
            showNotification('Surgeon not found', 'error');
            return;
        }

        hideElement('schedulerSurgeonList');
        showElement('schedulerSurgeonDetail');

        const surgeonCases = await loadCases({ surgeonId });

        const content = `
            <h1 class="page-title" style="margin-top: 20px;">${surgeon.name}</h1>
            <p class="page-subtitle">${surgeon.specialty || 'N/A'} • ${surgeon.primary_hospital?.name || 'N/A'}</p>

            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <button class="btn btn-primary" onclick="window.appOpenScheduleCase(${surgeonId})">
                    ➕ Schedule New Case
                </button>
                <button class="btn btn-gold" onclick="window.appOpenEditPreferences(${surgeonId})">
                    ✏️ Edit Preferences
                </button>
            </div>

            <div class="pref-section">
                <div class="pref-title">General Preferences</div>
                <div class="pref-text">${surgeon.pref_general || 'No preferences recorded'}</div>
            </div>

            <div class="pref-section">
                <div class="pref-title">Implant Preferences</div>
                <div class="pref-text">${surgeon.pref_implants || 'No preferences recorded'}</div>
            </div>

            <div class="pref-section">
                <div class="pref-title">Technique Notes</div>
                <div class="pref-text">${surgeon.pref_technique || 'No notes recorded'}</div>
            </div>

            <h2 style="font-family: Georgia, serif; font-size: 24px; color: var(--forest); margin: 32px 0 16px 0;">
                All Cases (${surgeonCases.length})
            </h2>

            ${surgeonCases.map(c => renderSchedulerCaseCard(c)).join('')}
        `;

        const detailContent = document.getElementById('schedulerDetailContent');
        if (detailContent) {
            detailContent.innerHTML = content;
        }
    } catch (error) {
        handleError(error, 'showSchedulerSurgeonDetail');
    }
}

export function backToSchedulerList() {
    selectedSurgeonId = null;
    hideElement('schedulerSurgeonDetail');
    renderSchedulerView();
}

// =====================================================
// CASE MANAGEMENT
// =====================================================

export async function confirmCase(caseId) {
    try {
        const userProfile = getCurrentUserProfile();
        await db.confirmCase(caseId, userProfile.id, userProfile.full_name);

        showNotification('Case confirmed! Scheduler has been notified.', 'success');

        // Refresh current view
        await updateCasesNotificationBadge();
        if (currentTab === 'surgeons') {
            await renderRepSurgeonList();
        } else if (currentTab === 'cases') {
            const activeTab = document.querySelector('#repCasesList .tab.active');
            if (activeTab) {
                const filter = activeTab.dataset.filter || 'today';
                await renderCasesList(filter);
            }
        }
    } catch (error) {
        handleError(error, 'confirmCase');
        showNotification('Failed to confirm case', 'error');
    }
}

export async function updateCaseTimes(caseId, timeIn, timeOut) {
    try {
        const updates = {};

        if (timeIn) {
            const timeInTimestamp = new Date().toISOString().split('T')[0] + 'T' + timeIn + ':00';
            updates.time_in = timeInTimestamp;
        }

        if (timeOut) {
            const timeOutTimestamp = new Date().toISOString().split('T')[0] + 'T' + timeOut + ':00';
            updates.time_out = timeOutTimestamp;
            updates.status = 'completed';
        } else if (timeIn) {
            updates.status = 'in-progress';
        }

        await db.updateCase(caseId, updates);

        showNotification('Times updated successfully!', 'success');

        // Refresh current view
        if (currentView === 'rep') {
            if (currentTab === 'surgeons') {
                await renderRepSurgeonList();
            } else if (currentTab === 'cases') {
                const activeTab = document.querySelector('#repCasesList .tab.active');
                if (activeTab) {
                    const filter = activeTab.dataset.filter || 'today';
                    await renderCasesList(filter);
                }
            }
        }
    } catch (error) {
        handleError(error, 'updateCaseTimes');
        showNotification('Failed to update times', 'error');
    }
}

export async function scheduleCase(formData) {
    try {
        const userProfile = getCurrentUserProfile();

        const caseData = {
            surgeonId: formData.surgeonId,
            hospitalId: formData.hospitalId,
            assignedRepId: formData.assignedRepId,
            procedure: formData.procedure,
            room: formData.room,
            scheduledDate: formData.scheduledDate,
            scheduledTime: formData.scheduledTime,
            notes: formData.notes,
            createdById: userProfile.id
        };

        await db.createCase(caseData);

        showNotification('Case scheduled successfully! Rep has been notified.', 'success');

        // Refresh scheduler view
        if (selectedSurgeonId) {
            await showSchedulerSurgeonDetail(selectedSurgeonId);
        }
    } catch (error) {
        handleError(error, 'scheduleCase');
        showNotification('Failed to schedule case', 'error');
        throw error;
    }
}

export async function editCase(caseId, formData) {
    try {
        const updates = {
            procedure: formData.procedure,
            hospital_id: formData.hospitalId,
            assigned_rep_id: formData.assignedRepId,
            room: formData.room,
            scheduled_date: formData.scheduledDate,
            scheduled_time: formData.scheduledTime,
            notes: formData.notes
        };

        await db.updateCase(caseId, updates);

        showNotification('Case updated successfully!', 'success');

        // Refresh scheduler view
        if (selectedSurgeonId) {
            await showSchedulerSurgeonDetail(selectedSurgeonId);
        }
    } catch (error) {
        handleError(error, 'editCase');
        showNotification('Failed to update case', 'error');
        throw error;
    }
}

export async function deleteCase(caseId) {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
        return;
    }

    try {
        await db.deleteCase(caseId);

        showNotification('Case deleted successfully!', 'success');

        // Refresh scheduler view
        if (selectedSurgeonId) {
            await showSchedulerSurgeonDetail(selectedSurgeonId);
        }
    } catch (error) {
        handleError(error, 'deleteCase');
        showNotification('Failed to delete case', 'error');
    }
}

export async function updatePreferences(surgeonId, preferences) {
    try {
        await db.updateSurgeonPreferences(surgeonId, preferences);

        showNotification('Preferences updated successfully!', 'success');

        // Refresh view
        await showSchedulerSurgeonDetail(surgeonId);
    } catch (error) {
        handleError(error, 'updatePreferences');
        showNotification('Failed to update preferences', 'error');
        throw error;
    }
}

// =====================================================
// RENDERING HELPERS
// =====================================================

function renderInlineCaseCard(caseData) {
    const userProfile = getCurrentUserProfile();
    const isAssigned = caseData.assigned_rep_id === userProfile?.id;

    const delay = calculateDelay(caseData.scheduled_time, caseData.time_in);
    const delayText = formatDelay(delay);

    let statusBadge = '';
    if (caseData.status === 'completed') statusBadge = '<span class="badge badge-green">Completed</span>';
    else if (caseData.status === 'in-progress') statusBadge = '<span class="badge badge-blue">In Progress</span>';
    else if (caseData.status === 'scheduled') statusBadge = '<span class="badge badge-gray">Scheduled</span>';

    let confirmBadge = '';
    if (caseData.confirmed) {
        confirmBadge = '<span class="badge badge-green">✓ Confirmed</span>';
    } else if (caseData.status === 'scheduled') {
        confirmBadge = '<span class="badge badge-pending">⚠ Awaiting Confirmation</span>';
    }

    return `
        <div style="background: white; border: 2px solid ${isAssigned ? 'var(--gold)' : 'var(--gray-bg)'}; border-radius: 10px; padding: 16px; margin-bottom: 10px; ${isAssigned ? 'background: linear-gradient(135deg, #fffbf0 0%, white 100%);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="case-id">${caseData.case_code}</span>
                    ${isAssigned ? '<span class="badge badge-gold">Assigned to Me</span>' : ''}
                    ${statusBadge}
                    ${confirmBadge}
                </div>
                <div style="display: flex; gap: 6px;">
                    ${caseData.status !== 'completed' ? `
                        <button class="btn btn-gold btn-small" onclick="window.appOpenTimeEntry('${caseData.id}'); event.stopPropagation();">
                            ⏱️ Times
                        </button>
                    ` : ''}
                    ${!caseData.confirmed && caseData.status === 'scheduled' && isAssigned ? `
                        <button class="btn btn-primary btn-small" onclick="window.appConfirmCase('${caseData.id}'); event.stopPropagation();">
                            ✓ Confirm
                        </button>
                    ` : ''}
                </div>
            </div>

            <div style="font-weight: 600; font-size: 16px; color: var(--slate); margin-bottom: 6px;">
                ${caseData.procedure}
            </div>
            <div style="font-size: 14px; color: var(--gray-light); margin-bottom: 10px;">
                📍 ${caseData.hospital_name} • ${caseData.room || 'TBD'}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; padding: 10px; background: rgba(26, 77, 46, 0.04); border-radius: 8px; font-size: 13px;">
                <div>
                    <div style="font-size: 10px; color: var(--gold); font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">Date</div>
                    <div style="font-weight: 600;">${formatDate(caseData.scheduled_date)}</div>
                </div>
                <div>
                    <div style="font-size: 10px; color: var(--gold); font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">Scheduled</div>
                    <div style="font-weight: 600;">${formatTime(caseData.scheduled_time)}</div>
                </div>
                <div>
                    <div style="font-size: 10px; color: var(--gold); font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">Time In</div>
                    <div style="font-weight: 600; ${delay > 0 ? 'color: var(--danger);' : ''} ${!caseData.time_in ? 'color: var(--gray-lighter); font-style: italic;' : ''}">
                        ${caseData.time_in ? formatTime(caseData.time_in) : 'Not set'}
                        ${delayText && caseData.time_in ? `<br><small style="font-size: 10px;">(${delayText})</small>` : ''}
                    </div>
                </div>
                <div>
                    <div style="font-size: 10px; color: var(--gold); font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">Time Out</div>
                    <div style="font-weight: 600; ${!caseData.time_out ? 'color: var(--gray-lighter); font-style: italic;' : ''}">
                        ${caseData.time_out ? formatTime(caseData.time_out) : 'Not set'}
                    </div>
                </div>
            </div>

            ${caseData.notes ? `
                <div style="margin-top: 10px; padding: 10px; background: rgba(184,134,11,0.08); border-radius: 8px; font-size: 13px; border-left: 3px solid var(--gold);">
                    <strong>Notes:</strong> ${caseData.notes}
                </div>
            ` : ''}

            ${caseData.confirmed ? `
                <div style="margin-top: 10px; padding: 8px; background: rgba(34, 197, 94, 0.08); border-radius: 6px; font-size: 12px; color: #059669;">
                    ✓ Confirmed by ${caseData.confirmed_by_name || 'Rep'} • ${formatConfirmTime(caseData.confirmed_at)}
                </div>
            ` : ''}
        </div>
    `;
}

function renderCasesListCard(caseData, currentUserId) {
    const isAssigned = caseData.assigned_rep_id === currentUserId;

    const delay = calculateDelay(caseData.scheduled_time, caseData.time_in);
    const delayText = formatDelay(delay);

    let statusBadge = '';
    if (caseData.status === 'completed') statusBadge = '<span class="badge badge-green">Completed</span>';
    else if (caseData.status === 'in-progress') statusBadge = '<span class="badge badge-blue">In Progress</span>';
    else if (caseData.status === 'scheduled') statusBadge = '<span class="badge badge-gray">Scheduled</span>';

    let confirmBadge = '';
    if (caseData.confirmed) {
        confirmBadge = '<span class="badge badge-green">✓ Confirmed</span>';
    } else if (caseData.status === 'scheduled') {
        confirmBadge = '<span class="badge badge-pending">⚠ Awaiting Confirmation</span>';
    }

    return `
        <div class="case-card ${isAssigned ? 'assigned' : ''}" style="margin-bottom: 14px;">
            <div class="case-header">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span class="case-id">${caseData.case_code}</span>
                    ${isAssigned ? '<span class="badge badge-gold">Assigned to Me</span>' : ''}
                    ${statusBadge}
                    ${confirmBadge}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${caseData.status !== 'completed' ? `
                        <button class="btn btn-gold btn-small" onclick="window.appOpenTimeEntry('${caseData.id}')">
                            ⏱️ Times
                        </button>
                    ` : ''}
                    ${!caseData.confirmed && caseData.status === 'scheduled' && isAssigned ? `
                        <button class="btn btn-primary btn-small" onclick="window.appConfirmCase('${caseData.id}')">
                            ✓ Confirm
                        </button>
                    ` : ''}
                </div>
            </div>

            <div style="font-weight: 700; font-size: 20px; color: var(--forest); margin-bottom: 8px; line-height: 1.3;">
                ${caseData.procedure}
            </div>
            <div class="case-surgeon" style="font-size: 15px; margin-bottom: 10px;">${caseData.surgeon_name || 'Unknown Surgeon'}</div>
            <div class="case-location" style="font-size: 15px;">📍 ${caseData.hospital_name} • ${caseData.room || 'TBD'}</div>

            <div class="case-times" style="background: linear-gradient(135deg, rgba(26, 77, 46, 0.06) 0%, rgba(184, 134, 11, 0.04) 100%); border: 1px solid rgba(26, 77, 46, 0.1); margin-top: 14px;">
                <div class="time-item">
                    <div class="time-label">Scheduled Start</div>
                    <div class="time-value" style="font-size: 17px; font-weight: 700;">${formatTime(caseData.scheduled_time)}</div>
                </div>
                <div class="time-item">
                    <div class="time-label">Actual Time In</div>
                    <div class="time-value ${caseData.time_in ? '' : 'empty'} ${delay > 0 ? 'delayed' : ''}" style="font-size: 17px; font-weight: 700;">
                        ${caseData.time_in ? formatTime(caseData.time_in) : 'Not set'}
                        ${delayText && caseData.time_in ? `<br><small style="font-size: 11px; font-weight: 600;">(${delayText})</small>` : ''}
                    </div>
                </div>
                <div class="time-item">
                    <div class="time-label">Time Out</div>
                    <div class="time-value ${caseData.time_out ? '' : 'empty'}" style="font-size: 17px; font-weight: 700;">
                        ${caseData.time_out ? formatTime(caseData.time_out) : 'Not set'}
                    </div>
                </div>
                <div class="time-item">
                    <div class="time-label">Assigned Rep</div>
                    <div class="time-value" style="font-size: 15px; font-weight: 600;">${caseData.assigned_rep_name || 'Unassigned'}</div>
                </div>
            </div>

            ${caseData.notes ? `
                <div style="margin-top: 14px; padding: 12px; background: rgba(184,134,11,0.08); border-radius: 8px; font-size: 14px; border-left: 4px solid var(--gold);">
                    <strong style="color: var(--gold);">📝 Notes:</strong> ${caseData.notes}
                </div>
            ` : ''}

            ${caseData.confirmed ? `
                <div style="margin-top: 14px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; font-size: 13px; color: #059669; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">✅</span>
                    <div>
                        <strong>Confirmed</strong> by ${caseData.confirmed_by_name || 'Rep'} • ${formatConfirmTime(caseData.confirmed_at)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderSchedulerCaseCard(caseData) {
    let statusBadge = '';
    if (caseData.status === 'completed') statusBadge = '<span class="badge badge-green">Completed</span>';
    else if (caseData.status === 'in-progress') statusBadge = '<span class="badge badge-blue">In Progress</span>';
    else if (caseData.status === 'scheduled') statusBadge = '<span class="badge badge-gray">Scheduled</span>';

    let confirmBadge = '';
    if (caseData.confirmed) {
        confirmBadge = '<span class="badge badge-green">✓ Rep Confirmed</span>';
    } else if (caseData.status === 'scheduled') {
        confirmBadge = '<span class="badge badge-orange">⚠ Pending Rep Confirmation</span>';
    }

    return `
        <div class="case-card">
            <div class="case-header">
                <div>
                    <span class="case-id">${caseData.case_code}</span>
                    ${statusBadge}
                    ${confirmBadge}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-small" onclick="window.appOpenEditCase('${caseData.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="window.appDeleteCase('${caseData.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>

            <div class="case-title">${caseData.procedure}</div>
            <div class="case-location">📍 ${caseData.hospital_name} • ${caseData.room || 'TBD'}</div>

            <div class="case-times">
                <div class="time-item">
                    <div class="time-label">Date</div>
                    <div class="time-value">${formatDate(caseData.scheduled_date)}</div>
                </div>
                <div class="time-item">
                    <div class="time-label">Scheduled</div>
                    <div class="time-value">${formatTime(caseData.scheduled_time)}</div>
                </div>
                <div class="time-item">
                    <div class="time-label">Assigned Rep</div>
                    <div class="time-value">${caseData.assigned_rep_name || 'Unassigned'}</div>
                </div>
                ${caseData.confirmed ? `
                <div class="time-item">
                    <div class="time-label">Confirmed By</div>
                    <div class="time-value" style="color: var(--success);">${caseData.confirmed_by_name || 'Rep'}</div>
                </div>
                ` : ''}
            </div>

            ${caseData.notes ? `
                <div style="margin-top: 12px; padding: 10px; background: rgba(184,134,11,0.08); border-radius: 8px; font-size: 14px;">
                    <strong>Notes:</strong> ${caseData.notes}
                </div>
            ` : ''}

            ${caseData.confirmed ? `
                <div style="margin-top: 12px; padding: 10px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; font-size: 13px; color: #059669;">
                    ✓ Confirmed by ${caseData.confirmed_by_name || 'Rep'} • ${formatConfirmTime(caseData.confirmed_at)}
                </div>
            ` : `
                <div style="margin-top: 12px; padding: 10px; background: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; font-size: 13px; color: #c2410c;">
                    ⚠ Awaiting rep confirmation
                </div>
            `}
        </div>
    `;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const iconId = sectionId.replace('cases-', 'cases-icon-').replace('pref-', 'pref-icon-');
    const icon = document.getElementById(iconId);

    if (section && section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        if (icon) icon.textContent = '▼';
    } else if (section) {
        section.classList.add('hidden');
        if (icon) icon.textContent = '▶';
    }
}

async function updateCasesNotificationBadge() {
    try {
        const userProfile = getCurrentUserProfile();
        if (!userProfile) return;

        const unconfirmedCount = await db.getUnconfirmedCount(userProfile.id);
        const badge = document.getElementById('casesNotificationBadge');

        if (badge) {
            if (unconfirmedCount > 0) {
                badge.textContent = unconfirmedCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Failed to update notification badge:', error);
    }
}

// =====================================================
// MODAL FUNCTIONS
// =====================================================

export function openTimeEntry(caseId) {
    // This will be called from the HTML
    // Implementation will be in modal handler
    const event = new CustomEvent('openTimeEntryModal', { detail: { caseId } });
    window.dispatchEvent(event);
}

export function openScheduleCase(surgeonId) {
    const event = new CustomEvent('openScheduleCaseModal', { detail: { surgeonId } });
    window.dispatchEvent(event);
}

export function openEditCase(caseId) {
    const event = new CustomEvent('openEditCaseModal', { detail: { caseId } });
    window.dispatchEvent(event);
}

export function openEditPreferences(surgeonId) {
    const event = new CustomEvent('openEditPreferencesModal', { detail: { surgeonId } });
    window.dispatchEvent(event);
}

// =====================================================
// EXPORT WINDOW FUNCTIONS (for onclick handlers)
// =====================================================

// Make functions available globally for onclick handlers
window.appInitApp = initApp;
window.appSelectView = selectView;
window.appNavigate = navigate;
window.appConfirmCase = confirmCase;
window.appToggleSection = toggleSection;
window.appOpenTimeEntry = openTimeEntry;
window.appOpenScheduleCase = openScheduleCase;
window.appOpenEditCase = openEditCase;
window.appDeleteCase = deleteCase;
window.appShowSchedulerSurgeonDetail = showSchedulerSurgeonDetail;
window.appBackToSchedulerList = backToSchedulerList;
window.appOpenEditPreferences = openEditPreferences;

// Export for use in other modules
export {
    currentView,
    currentTab,
    selectedSurgeonId,
    surgeonsCache,
    hospitalsCache,
    repsCache,
    casesCache
};
