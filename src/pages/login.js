/**
 * Login Page
 * Simple authentication for Rep and Scheduler users
 */

import { login } from '../utils/auth.js';
import { navigateTo } from '../js/router.js';
import { showNotification } from '../utils/helpers.js';

export async function renderLoginPage() {
    const container = document.getElementById('loginPage');
    if (!container) return;

    container.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%); padding: 20px;">
            <div style="background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 440px; width: 100%; padding: 48px 40px;">
                <!-- Logo/Brand -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">🏥</div>
                    <h1 style="font-family: Georgia, serif; font-size: 32px; color: var(--forest); margin-bottom: 8px; font-weight: 700;">
                        SterileField
                    </h1>
                    <p style="color: var(--gray); font-size: 16px;">
                        Surgical Case Management
                    </p>
                </div>

                <!-- Login Form -->
                <form id="loginForm" style="display: grid; gap: 24px;">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input
                            type="text"
                            class="form-input"
                            id="usernameInput"
                            placeholder="Enter username"
                            autocomplete="username"
                            required
                            autofocus
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input
                            type="password"
                            class="form-input"
                            id="passwordInput"
                            placeholder="Enter password"
                            autocomplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" class="btn btn-primary" id="loginBtn" style="width: 100%; padding: 14px; font-size: 16px; font-weight: 600;">
                        Sign In
                    </button>
                </form>

                <!-- Demo Credentials -->
                <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 13px; color: var(--gray); margin-bottom: 16px; text-align: center; font-weight: 600;">
                        Demo Credentials
                    </p>
                    <div style="display: grid; gap: 12px;">
                        <div style="background: rgba(184, 134, 11, 0.08); border-radius: 8px; padding: 12px;">
                            <div style="font-size: 12px; color: var(--gold); font-weight: 700; margin-bottom: 4px;">REP USER</div>
                            <div style="font-size: 13px; color: var(--slate); font-family: monospace;">
                                Username: <strong>rep</strong><br>
                                Password: <strong>rep123</strong>
                            </div>
                        </div>
                        <div style="background: rgba(45, 106, 79, 0.08); border-radius: 8px; padding: 12px;">
                            <div style="font-size: 12px; color: var(--forest); font-weight: 700; margin-bottom: 4px;">SCHEDULER USER</div>
                            <div style="font-size: 13px; color: var(--slate); font-family: monospace;">
                                Username: <strong>scheduler</strong><br>
                                Password: <strong>scheduler123</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submit handler
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    const username = usernameInput?.value.trim();
    const password = passwordInput?.value;

    if (!username || !password) {
        showNotification('Please enter username and password', 'error');
        return;
    }

    // Show loading state
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';
    }

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    // Attempt login
    const result = login(username, password);

    if (result.success) {
        showNotification(`Welcome, ${result.user.displayName}!`, 'success');

        // Check for redirect path
        const redirectPath = localStorage.getItem('sterileFieldRedirect');
        localStorage.removeItem('sterileFieldRedirect');

        // Navigate to appropriate dashboard or redirect path
        if (redirectPath && redirectPath !== '#/' && redirectPath !== '#/login') {
            window.location.hash = redirectPath;
        } else {
            // Navigate to role-specific dashboard
            navigateTo(result.user.role === 'rep' ? '/rep' : '/scheduler');
        }
    } else {
        showNotification(result.error, 'error');

        // Reset form
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
        passwordInput.value = '';
        passwordInput.focus();
    }
}
