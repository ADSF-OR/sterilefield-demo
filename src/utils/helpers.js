/**
 * SterileField Helper Functions
 * Common utility functions used throughout the application
 */

// =====================================================
// DATE & TIME FORMATTING
// =====================================================

export function formatDate(date) {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);

    const diffTime = compareDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function formatTime(timeStr) {
    if (!timeStr) return null;

    // Handle full timestamp
    if (timeStr.includes('T') || timeStr.includes(' ')) {
        const date = new Date(timeStr);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    // Handle time string (HH:MM or HH:MM:SS)
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';

    const date = new Date(timestamp);
    return `${formatDate(date)} at ${formatTime(timestamp)}`;
}

export function formatConfirmTime(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(date);
}

export function calculateDelay(scheduledTime, actualTime) {
    if (!scheduledTime || !actualTime) return null;

    const scheduled = new Date(scheduledTime);
    const actual = new Date(actualTime);

    const diffMs = actual - scheduled;
    const diffMins = Math.round(diffMs / 60000);

    return diffMins;
}

export function formatDelay(delayMinutes) {
    if (delayMinutes === null || delayMinutes === undefined) return '';

    const absDelay = Math.abs(delayMinutes);
    const hours = Math.floor(absDelay / 60);
    const mins = absDelay % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || hours === 0) result += `${mins}m`;

    if (delayMinutes < 0) {
        return `${result} early`;
    } else if (delayMinutes > 0) {
        return `${result} late`;
    } else {
        return 'on time';
    }
}

// =====================================================
// DATE COMPARISON
// =====================================================

export function isToday(date) {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return dateObj.toDateString() === today.toDateString();
}

export function isTomorrow(date) {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return dateObj.toDateString() === tomorrow.toDateString();
}

export function isPast(date) {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dateObj < today;
}

export function isFuture(date) {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dateObj > today;
}

// =====================================================
// INPUT FORMATTING
// =====================================================

export function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentTimeString() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function getCurrentTimestamp() {
    return new Date().toISOString();
}

// =====================================================
// CASE FILTERING
// =====================================================

export function filterCasesByDate(cases, filterType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterType) {
        case 'today':
            return cases.filter(c => isToday(c.scheduled_date));

        case 'upcoming':
            return cases.filter(c => {
                const caseDate = new Date(c.scheduled_date);
                caseDate.setHours(0, 0, 0, 0);
                return caseDate >= today;
            });

        case 'past':
            return cases.filter(c => isPast(c.scheduled_date));

        case 'all':
        default:
            return cases;
    }
}

export function filterCasesByStatus(cases, status) {
    if (!status || status === 'all') return cases;
    return cases.filter(c => c.status === status);
}

export function filterCasesByConfirmation(cases, confirmed) {
    if (confirmed === undefined || confirmed === null) return cases;
    return cases.filter(c => c.confirmed === confirmed);
}

// =====================================================
// SORTING
// =====================================================

export function sortCasesByDate(cases, ascending = true) {
    return [...cases].sort((a, b) => {
        const dateA = new Date(`${a.scheduled_date} ${a.scheduled_time}`);
        const dateB = new Date(`${b.scheduled_date} ${b.scheduled_time}`);

        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function sortSurgeonsByName(surgeons) {
    return [...surgeons].sort((a, b) => a.name.localeCompare(b.name));
}

// =====================================================
// VALIDATION
// =====================================================

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

export function validatePassword(password) {
    return password && password.length >= 6;
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

// =====================================================
// UI HELPERS
// =====================================================

export function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

export function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

export function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden');
    }
}

export function setActiveTab(tabId, tabClass = 'tab') {
    document.querySelectorAll(`.${tabClass}`).forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

export function setActiveNavButton(buttonId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(buttonId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

export function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================================================
// ERROR HANDLING
// =====================================================

export function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    const message = error.message || 'An unexpected error occurred';
    showNotification(message, 'error');

    return message;
}

// =====================================================
// LOCAL STORAGE
// =====================================================

export function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

export function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
    }
}
