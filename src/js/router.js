/**
 * SterileField Router Module
 * Simple client-side router for navigation
 */

// Route definitions
const routes = {};
let currentRoute = null;
let authCheckFn = null;

// =====================================================
// ROUTER CORE
// =====================================================

export function defineRoute(path, handler, options = {}) {
    routes[path] = {
        handler,
        requiresAuth: options.requiresAuth !== false, // default to true
        roles: options.roles || []
    };
}

export function setAuthCheck(fn) {
    authCheckFn = fn;
}

export async function navigateTo(path, replaceState = false) {
    console.log('🧭 Navigating to:', path);

    // Try exact match first
    let route = routes[path];
    let params = {};

    // If no exact match, try pattern matching
    if (!route) {
        for (const [pattern, routeConfig] of Object.entries(routes)) {
            const match = matchRoute(pattern, path);
            if (match) {
                route = routeConfig;
                params = match.params;
                break;
            }
        }
    }

    if (!route) {
        console.warn('Route not found:', path);
        // Navigate to home if route not found
        path = '/';
        const homeRoute = routes[path];
        if (homeRoute) {
            await handleRoute(path, homeRoute, {}, replaceState);
        }
        return;
    }

    await handleRoute(path, route, params, replaceState);
}

function matchRoute(pattern, path) {
    // Convert route pattern to regex
    // Example: /cases/:id -> /cases/([^/]+)
    const paramNames = [];
    const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match) {
        return null;
    }

    const params = {};
    paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
    });

    return { params };
}

async function handleRoute(path, route, params, replaceState) {
    // Check authentication
    if (route.requiresAuth && authCheckFn) {
        const isAuthed = await authCheckFn();
        if (!isAuthed) {
            console.log('🔒 Auth required, redirecting to login');
            if (replaceState) {
                window.history.replaceState({}, '', '/login');
            } else {
                window.history.pushState({}, '', '/login');
            }
            currentRoute = '/login';
            const loginRoute = routes['/login'];
            if (loginRoute) {
                await loginRoute.handler({});
            }
            return;
        }
    }

    // Update history
    if (replaceState) {
        window.history.replaceState({}, '', path);
    } else {
        window.history.pushState({}, '', path);
    }

    currentRoute = path;

    // Execute route handler
    try {
        await route.handler(params);
    } catch (error) {
        console.error('Route handler error:', error);
    }
}

export function getCurrentRoute() {
    return currentRoute;
}

export function goBack() {
    window.history.back();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', async () => {
    const path = window.location.pathname;
    console.log('🔙 Browser navigation to:', path);

    // Try exact match first
    let route = routes[path];
    let params = {};

    // If no exact match, try pattern matching
    if (!route) {
        for (const [pattern, routeConfig] of Object.entries(routes)) {
            const match = matchRoute(pattern, path);
            if (match) {
                route = routeConfig;
                params = match.params;
                break;
            }
        }
    }

    if (!route) {
        route = routes['/'];
    }

    if (route) {
        currentRoute = path;
        await route.handler(params);
    }
});

// =====================================================
// ROUTE HELPERS
// =====================================================

export function hideAllPages() {
    // Hide all main content sections
    const pages = [
        'welcome',
        'loginPage',
        'repSurgeonList',
        'repCasesList',
        'repTerritory',
        'repMore',
        'schedulerSurgeonList',
        'schedulerSurgeonDetail',
        'caseListPage',
        'caseDetailPage',
        'caseFormPage'
    ];

    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('hidden');
        }
    });

    // Hide modals
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.classList.add('hidden'));
}

export function showPage(pageId) {
    hideAllPages();
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    }
}

export function setActiveNav(navId) {
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn =>
        btn.classList.remove('active')
    );

    // Add active to specified nav button
    const navBtn = document.getElementById(navId);
    if (navBtn) {
        navBtn.classList.add('active');
    }
}

export function showHeader(show = true) {
    const header = document.querySelector('.header');
    if (header) {
        if (show) {
            header.style.display = 'flex';
        } else {
            header.style.display = 'none';
        }
    }
}

export function showBottomNav(show = true) {
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
        if (show) {
            nav.style.display = 'flex';
        } else {
            nav.style.display = 'none';
        }
    }
}
