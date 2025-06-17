/**
 * FILE: notifications.js (168 lines)
 * PURPOSE: Modern toast notification system replacing alert() dialogs
 * SECTIONS:
 * 1-30: Class initialization and container setup
 * 31-80: Core notification display and management
 * 81-130: Animation and timing controls
 * 131-168: Global alert override and cleanup
 * KEY FUNCTIONS:
 * - show()
 * - createContainer()
 * - overrideAlert()
 * - removeNotification()
 * LAST UPDATED: 2025-06-16 — Added modular architecture documentation
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        // Create notification container
        this.createContainer();

        // Override alert function globally
        this.overrideAlert();
    }

    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    overrideAlert() {
        // Store original alert function
        const originalAlert = window.alert;

        // Override alert with toast notifications
        window.alert = (message) => {
            // Determine notification type based on message content
            let type = 'info';
            if (message.includes('✅') || message.toLowerCase().includes('success')) {
                type = 'success';
                message = message.replace('✅', '').trim();
            } else if (message.includes('❌') || message.toLowerCase().includes('error')) {
                type = 'error';
                message = message.replace('❌', '').trim();
            } else if (message.includes('⚠️') || message.toLowerCase().includes('warning')) {
                type = 'warning';
                message = message.replace('⚠️', '').trim();
            }

            this.show(message, type);
        };

        // Store reference to original alert for emergencies
        window.originalAlert = originalAlert;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type, duration);
        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Trigger animation
        setTimeout(() => {
            notification.element.classList.add('toast-show');
        }, 10);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type, duration) {
        const id = Date.now() + Math.random();
        const element = document.createElement('div');
        element.className = `toast toast-${type}`;
        element.setAttribute('data-id', id);

        // Icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        element.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="notificationSystem.removeById('${id}')">&times;</button>
            </div>
            ${duration > 0 ? `<div class="toast-progress"></div>` : ''}
        `;

        // Add progress bar animation
        if (duration > 0) {
            const progressBar = element.querySelector('.toast-progress');
            progressBar.style.animationDuration = `${duration}ms`;
        }

        return {
            id,
            element,
            type,
            message,
            duration
        };
    }

    remove(notification) {
        if (!notification || !notification.element) return;

        notification.element.classList.add('toast-hide');

        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
        }, 300);
    }

    removeById(id) {
        const notification = this.notifications.find(n => n.id == id);
        if (notification) {
            this.remove(notification);
        }
    }

    // Helper methods for different notification types
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    // Clear all notifications
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }
}

// Initialize the notification system
const notificationSystem = new NotificationSystem();

// Make it globally available
window.notificationSystem = notificationSystem;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
