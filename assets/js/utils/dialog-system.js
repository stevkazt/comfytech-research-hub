/**
 * FILE: dialog-system.js (429 lines)
 * PURPOSE: Custom modal dialogs replacing browser alert(), confirm() and prompt()
 * SECTIONS:
 * 1-50: CSS injection and initialization
 * 51-150: Alert modal implementation
 * 151-250: Confirm modal implementation
 * 251-350: Prompt modal implementation
 * 351-429: Utility functions and cleanup
 * KEY FUNCTIONS:
 * - alert()
 * - confirm()
 * - prompt()
 * - createOverlay()
 * - injectCSS()
 * LAST UPDATED: 2025-06-16 — Added modular architecture documentation
 */

class DialogSystem {
    constructor() {
        this.injectCSS();
    }

    /**
     * Inject CSS styles for the dialog system
     */
    injectCSS() {
        if (document.getElementById('dialog-system-styles')) return;

        const styles = `
            <style id="dialog-system-styles">
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .dialog-overlay.active {
                    opacity: 1;
                }

                .dialog-modal {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    min-width: 320px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: scale(0.95) translateY(-20px);
                    transition: transform 0.2s ease;
                }

                .dialog-overlay.active .dialog-modal {
                    transform: scale(1) translateY(0);
                }

                .dialog-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .dialog-icon {
                    width: 24px;
                    height: 24px;
                    margin-right: 12px;
                    flex-shrink: 0;
                }

                .dialog-icon.success {
                    color: #10B981;
                }

                .dialog-icon.error {
                    color: #EF4444;
                }

                .dialog-icon.warning {
                    color: #F59E0B;
                }

                .dialog-icon.info {
                    color: #2563EB;
                }

                .dialog-icon.question {
                    color: #6B7280;
                }

                .dialog-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1F2937;
                    margin: 0;
                }

                .dialog-message {
                    color: #4B5563;
                    line-height: 1.5;
                    margin-bottom: 24px;
                    white-space: pre-wrap;
                }

                .dialog-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #D1D5DB;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 24px;
                    transition: border-color 0.2s ease;
                }

                .dialog-input:focus {
                    outline: none;
                    border-color: #2563EB;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .dialog-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .dialog-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .dialog-btn.primary {
                    background: #2563EB;
                    color: white;
                }

                .dialog-btn.primary:hover {
                    background: #1D4ED8;
                }

                .dialog-btn.secondary {
                    background: #F3F4F6;
                    color: #374151;
                    border: 1px solid #D1D5DB;
                }

                .dialog-btn.secondary:hover {
                    background: #E5E7EB;
                }

                .dialog-btn.danger {
                    background: #EF4444;
                    color: white;
                }

                .dialog-btn.danger:hover {
                    background: #DC2626;
                }

                .dialog-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Animation classes */
                @keyframes dialogSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes dialogSlideOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.95) translateY(-20px);
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Get icon for dialog type
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            question: '❓'
        };
        return icons[type] || icons.info;
    }

    /**
     * Create dialog modal
     */
    createDialog(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            buttons = [],
            input = null
        } = options;

        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';

        const modal = document.createElement('div');
        modal.className = 'dialog-modal';

        const icon = this.getIcon(type);
        const titleText = title || this.getDefaultTitle(type);

        modal.innerHTML = `
            <div class="dialog-header">
                <div class="dialog-icon ${type}">${icon}</div>
                <h3 class="dialog-title">${titleText}</h3>
            </div>
            <div class="dialog-message">${message}</div>
            ${input ? `<input type="${input.type || 'text'}" class="dialog-input" placeholder="${input.placeholder || ''}" value="${input.value || ''}">` : ''}
            <div class="dialog-buttons">
                ${buttons.map(btn => `
                    <button class="dialog-btn ${btn.class || 'secondary'}" data-action="${btn.action}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        return { overlay, modal };
    }

    /**
     * Get default title for dialog type
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            question: 'Confirm'
        };
        return titles[type] || 'Message';
    }

    /**
     * Show dialog and return promise
     */
    showDialog(options) {
        return new Promise((resolve) => {
            const { overlay, modal } = this.createDialog(options);
            const input = modal.querySelector('.dialog-input');

            // Show modal with animation
            setTimeout(() => overlay.classList.add('active'), 10);

            // Focus input if present
            if (input) {
                setTimeout(() => input.focus(), 200);
            }

            // Handle button clicks
            const buttons = modal.querySelectorAll('.dialog-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    const value = input ? input.value : null;

                    this.closeDialog(overlay, () => {
                        if (action === 'confirm' || action === 'ok') {
                            resolve(value !== null ? value : true);
                        } else {
                            resolve(false);
                        }
                    });
                });
            });

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    this.closeDialog(overlay, () => resolve(false));
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Handle click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.removeEventListener('keydown', handleEscape);
                    this.closeDialog(overlay, () => resolve(false));
                }
            });

            // Handle Enter key in input
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const confirmBtn = modal.querySelector('[data-action="confirm"], [data-action="ok"]');
                        if (confirmBtn) confirmBtn.click();
                    }
                });
            }
        });
    }

    /**
     * Close dialog with animation
     */
    closeDialog(overlay, callback) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (callback) callback();
        }, 200);
    }

    /**
     * Show alert dialog
     */
    alert(message, type = 'info') {
        return this.showDialog({
            type,
            message,
            buttons: [
                { text: 'OK', action: 'ok', class: 'primary' }
            ]
        });
    }

    /**
     * Show confirm dialog
     */
    confirm(message, title = null) {
        return this.showDialog({
            type: 'question',
            title: title || 'Confirm',
            message,
            buttons: [
                { text: 'Cancel', action: 'cancel', class: 'secondary' },
                { text: 'OK', action: 'confirm', class: 'primary' }
            ]
        });
    }

    /**
     * Show prompt dialog
     */
    prompt(message, defaultValue = '', title = null) {
        return this.showDialog({
            type: 'question',
            title: title || 'Input Required',
            message,
            input: {
                type: 'text',
                value: defaultValue,
                placeholder: 'Enter value...'
            },
            buttons: [
                { text: 'Cancel', action: 'cancel', class: 'secondary' },
                { text: 'OK', action: 'confirm', class: 'primary' }
            ]
        });
    }

    /**
     * Show success message
     */
    success(message, title = 'Success') {
        return this.alert(message, 'success');
    }

    /**
     * Show error message
     */
    error(message, title = 'Error') {
        return this.alert(message, 'error');
    }

    /**
     * Show warning message
     */
    warning(message, title = 'Warning') {
        return this.alert(message, 'warning');
    }

    /**
     * Show info message
     */
    info(message, title = 'Information') {
        return this.alert(message, 'info');
    }
}

// Create global instance
window.dialogSystem = new DialogSystem();

// Override native functions (optional)
window.customAlert = window.dialogSystem.alert.bind(window.dialogSystem);
window.customConfirm = window.dialogSystem.confirm.bind(window.dialogSystem);
window.customPrompt = window.dialogSystem.prompt.bind(window.dialogSystem);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialogSystem;
}
