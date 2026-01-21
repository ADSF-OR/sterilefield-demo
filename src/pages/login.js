/**
 * Login Page
 */

import { signIn, handleAuthError } from '../js/auth.js';
import { navigateTo } from '../js/router.js';
import { showElement, hideElement } from '../utils/helpers.js';

export async function renderLoginPage() {
    const container = document.getElementById('loginPage');
    if (!container) {
        console.error('Login page container not found');
        return;
    }

    container.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--cream) 0%, #fff 100%); padding: 20px;">
            <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(26, 77, 46, 0.1); max-width: 400px; width: 100%; border: 2px solid var(--gold);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-family: Georgia, serif; font-size: 36px; color: var(--forest); margin-bottom: 8px;">
                        SterileField
                    </h1>
                    <p style="color: var(--gray-light); font-size: 14px;">
                        Medical Device Case Tracking
                    </p>
                </div>

                <div id="loginError" class="hidden" style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
                </div>

                <form id="loginForm" style="display: flex; flex-direction: column; gap: 20px;">
                    <div>
                        <label style="display: block; font-weight: 600; color: var(--slate); margin-bottom: 8px; font-size: 14px;">
                            Email
                        </label>
                        <input
                            type="email"
                            id="loginEmail"
                            class="form-input"
                            placeholder="your.email@example.com"
                            required
                            autocomplete="email"
                        />
                    </div>

                    <div>
                        <label style="display: block; font-weight: 600; color: var(--slate); margin-bottom: 8px; font-size: 14px;">
                            Password
                        </label>
                        <input
                            type="password"
                            id="loginPassword"
                            class="form-input"
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        id="loginButton"
                        class="btn btn-primary"
                        style="width: 100%; padding: 14px; font-size: 16px; font-weight: 600;"
                    >
                        Sign In
                    </button>
                </form>

                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--gray-bg); text-align: center;">
                    <p style="font-size: 14px; color: var(--gray-light);">
                        Demo Account:<br>
                        <code style="background: var(--gray-bg); padding: 4px 8px; border-radius: 4px; font-size: 13px; display: inline-block; margin-top: 8px;">
                            demo@sterilefield.com / demo123
                        </code>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add form submit handler
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    // Show loading state
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';
    }
    hideElement('loginError');

    try {
        await signIn(email, password);

        // Redirect to home page
        await navigateTo('/');
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = handleAuthError(error);
        showError(errorMessage);
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        }
    }
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        showElement('loginError');
    }
}
