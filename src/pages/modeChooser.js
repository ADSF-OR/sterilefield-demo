/**
 * Mode Chooser Page
 * Landing screen where users choose between Rep View and Scheduler View
 */

export function renderModeChooserPage() {
    const container = document.getElementById('modeChooserPage');
    if (!container) return;

    container.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%); padding: 20px;">
            <div style="max-width: 800px; width: 100%;">
                <!-- App Title -->
                <div style="text-align: center; margin-bottom: 48px;">
                    <h1 style="font-family: Georgia, serif; font-size: 48px; color: white; margin-bottom: 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        SterileField
                    </h1>
                    <p style="font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500;">
                        Surgical Case Coordination
                    </p>
                </div>

                <!-- Mode Selection Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                    <!-- Rep View Card -->
                    <button
                        id="repModeBtn"
                        class="mode-card"
                        style="background: white; border: 3px solid transparent; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
                        onmouseover="this.style.borderColor='var(--gold)'; this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 30px rgba(0,0,0,0.2)';"
                        onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)';"
                    >
                        <div style="font-size: 64px; margin-bottom: 16px;">👨‍💼</div>
                        <h2 style="font-size: 28px; color: var(--forest); margin-bottom: 12px; font-weight: 700;">
                            Rep View
                        </h2>
                        <p style="color: var(--slate); line-height: 1.6; margin-bottom: 20px;">
                            Track your assigned cases, view surgeon preferences, and manage your territory hospitals.
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left; color: var(--gray); font-size: 14px;">
                            <div>✓ View assigned cases</div>
                            <div>✓ Surgeon directory & preferences</div>
                            <div>✓ Hospital territory management</div>
                        </div>
                    </button>

                    <!-- Scheduler View Card -->
                    <button
                        id="schedulerModeBtn"
                        class="mode-card"
                        style="background: white; border: 3px solid transparent; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
                        onmouseover="this.style.borderColor='var(--gold)'; this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 30px rgba(0,0,0,0.2)';"
                        onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)';"
                    >
                        <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                        <h2 style="font-size: 28px; color: var(--forest); margin-bottom: 12px; font-weight: 700;">
                            Scheduler View
                        </h2>
                        <p style="color: var(--slate); line-height: 1.6; margin-bottom: 20px;">
                            Schedule surgical cases, manage surgeon availability, and coordinate hospital logistics.
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left; color: var(--gray); font-size: 14px;">
                            <div>✓ Schedule cases for surgeons</div>
                            <div>✓ Manage surgeon roster</div>
                            <div>✓ Coordinate hospital resources</div>
                        </div>
                    </button>
                </div>

                <!-- Footer Note -->
                <div style="text-align: center; margin-top: 32px; color: rgba(255,255,255,0.8); font-size: 14px;">
                    Your selection will be remembered for future visits
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('repModeBtn')?.addEventListener('click', () => {
        localStorage.setItem('appMode', 'rep');
        window.location.href = '/rep';
    });

    document.getElementById('schedulerModeBtn')?.addEventListener('click', () => {
        localStorage.setItem('appMode', 'scheduler');
        window.location.href = '/scheduler';
    });
}
