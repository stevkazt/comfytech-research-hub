/**
 * FILE: header.js (518 lines)
 * PURPOSE: Enhanced header component with dynamic functionality and navigation
 * SECTIONS:
 * 1-50: Class initialization and page detection
 * 51-150: Dialog system integration
 * 151-250: Navigation and page management
 * 251-350: Online/offline status handling
 * 351-450: Product count and stats display
 * 451-518: Event handlers and UI interactions
 * KEY FUNCTIONS:
 * - detectCurrentPage()
 * - initializeDialogSystem()
 * - setProductCount()
 * - handleNavigation()
 * - updateOnlineStatus()
 * LAST UPDATED: 2025-06-16 — Added modular architecture documentation
 */

class HeaderComponent {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.productCount = 0;
        this.isOnline = navigator.onLine;
        this.dropdownActive = false;

        this.init();
    }

    /**
     * Initialize dialog system
     */
    async initializeDialogSystem() {
        // Load dialog system if not already loaded
        if (!window.dialogSystem) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'assets/js/utils/dialog-system.js';
                script.onload = () => {
                    console.log('✅ Dialog system loaded');
                    // Initialize the dialog system
                    window.dialogSystem = new DialogSystem();
                    console.log('✅ Dialog system initialized');
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load dialog system');
                    reject(new Error('Failed to load dialog system'));
                };
                document.head.appendChild(script);
            });
        }
        return Promise.resolve();
    }

    init() {
        this.setupEventListeners();
        this.updateNavigation();
        this.updateStatusIndicator();
        this.loadProductCount();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Settings dropdown toggle
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsDropdown = document.getElementById('settingsDropdown');

        if (settingsToggle && settingsDropdown) {
            settingsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                this.closeDropdown();
            });
        }

        // Dropdown menu items
        this.setupDropdownActions();

        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateStatusIndicator();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatusIndicator();
        });

        // Navigation clicks with page detection
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') !== '#') {
                    this.handleNavigation(e, link);
                }
            });
        });
    }

    /**
     * Setup dropdown menu actions
     */
    setupDropdownActions() {
        const refreshData = document.getElementById('refreshData');
        const viewShortcuts = document.getElementById('viewShortcuts');
        const aboutApp = document.getElementById('aboutApp');

        if (refreshData) {
            refreshData.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshData();
            });
        }

        if (viewShortcuts) {
            viewShortcuts.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.showKeyboardShortcuts();
            });
        }

        if (aboutApp) {
            aboutApp.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.showAboutDialog();
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt/Cmd + R: Refresh data
            if ((e.altKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.handleRefreshData();
            }

            // Alt/Cmd + 1: Dashboard
            if ((e.altKey || e.metaKey) && e.key === '1') {
                e.preventDefault();
                window.location.href = 'index.html';
            }

            // Alt/Cmd + 2: Products
            if ((e.altKey || e.metaKey) && e.key === '2') {
                e.preventDefault();
                window.location.href = 'product-viewer.html';
            }

            // Escape: Close dropdown
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    /**
     * Detect current page based on URL or page identifier
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        if (filename.includes('index.html') || filename === '') {
            return 'dashboard';
        } else if (filename.includes('product-viewer.html')) {
            return 'products';
        } else if (filename.includes('product-details.html')) {
            return 'product-details';
        }

        return 'dashboard';
    }

    /**
     * Update navigation active state
     */
    updateNavigation() {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const currentNavLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
        }

        // Show/hide product details nav item
        const productDetailsNav = document.getElementById('productDetailsNav');
        if (productDetailsNav) {
            if (this.currentPage === 'product-details') {
                productDetailsNav.style.display = 'block';
            } else {
                productDetailsNav.style.display = 'none';
            }
        }
    }

    /**
     * Update status indicator
     */
    updateStatusIndicator() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');

        if (statusDot && statusText) {
            if (this.isOnline) {
                statusDot.className = 'status-dot online';
                statusText.textContent = 'Online';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = 'Offline';
            }
        }
    }

    /**
     * Load and update product count
     */
    async loadProductCount() {
        try {
            if (typeof axios !== 'undefined') {
                const response = await axios.get('https://dropi-research-api.onrender.com/products?fields=id');
                this.productCount = response.data.length;
            } else {
                // Fallback for environments without axios
                this.productCount = parseInt(localStorage.getItem('productCount') || '0');
            }

            this.updateProductCount();
        } catch (error) {
            console.warn('Could not load product count:', error);
            // Use cached count if available
            this.productCount = parseInt(localStorage.getItem('productCount') || '0');
            this.updateProductCount();
        }
    }

    /**
     * Update product count display
     */
    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = this.productCount.toString();

            // Cache the count
            localStorage.setItem('productCount', this.productCount.toString());
        }
    }

    /**
     * Toggle settings dropdown
     */
    toggleDropdown() {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown) {
            this.dropdownActive = !this.dropdownActive;
            dropdown.classList.toggle('active', this.dropdownActive);
        }
    }

    /**
     * Close settings dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown && this.dropdownActive) {
            this.dropdownActive = false;
            dropdown.classList.remove('active');
        }
    }

    /**
     * Handle data refresh
     */
    async handleRefreshData() {
        try {
            this.showProgress(0);
            this.showNotification('Refreshing data...', 'info');

            // Refresh product count
            this.showProgress(33);
            await this.loadProductCount();

            // Refresh current page data
            this.showProgress(67);
            if (this.currentPage === 'products' && typeof loadProducts === 'function') {
                await loadProducts();
            } else if (this.currentPage === 'product-details' && typeof fetchAndRenderProduct === 'function') {
                const productId = window.productId;
                if (productId) {
                    await fetchAndRenderProduct(productId);
                }
            }

            this.showProgress(100);
            this.showNotification('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Error refreshing data', 'error');
        } finally {
            this.hideProgress();
        }
    }

    /**
     * Handle navigation clicks
     */
    handleNavigation(e, link) {
        const href = link.getAttribute('href');
        const page = link.getAttribute('data-page');

        // Update current page
        if (page) {
            this.currentPage = page;
            this.updateNavigation();
        }

        // Add loading state
        this.showProgress(0);
        setTimeout(() => this.hideProgress(), 1000);
    }

    /**
     * Show progress bar
     */
    showProgress(percentage) {
        const progressBar = document.getElementById('headerProgressBar');
        const progressFill = progressBar?.querySelector('.progress-fill');

        if (progressBar && progressFill) {
            progressBar.classList.add('active');
            progressFill.style.width = percentage + '%';
        }
    }

    /**
     * Hide progress bar
     */
    hideProgress() {
        const progressBar = document.getElementById('headerProgressBar');
        if (progressBar) {
            setTimeout(() => {
                progressBar.classList.remove('active');
                const progressFill = progressBar.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = '0%';
                }
            }, 300);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use the global notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type);
        } else {
            // Fallback to console log if notification system isn't loaded
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }

    /**
     * Show keyboard shortcuts dialog
     */
    async showKeyboardShortcuts() {
        // Ensure dialog system is loaded
        await this.initializeDialogSystem();

        if (!window.dialogSystem) {
            console.error('Dialog system not available');
            return;
        }

        const shortcuts = [
            { key: 'Alt/Cmd + R', action: 'Refresh data' },
            { key: 'Alt/Cmd + 1', action: 'Go to Dashboard' },
            { key: 'Alt/Cmd + 2', action: 'Go to Products' },
            { key: 'Escape', action: 'Close modals/dropdowns' }
        ];

        const shortcutList = shortcuts.map(s =>
            `<div style="display: flex; align-items: center; margin-bottom: 12px;">
                <kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-right: 16px; min-width: 100px; text-align: center;">${s.key}</kbd>
                <span style="color: #4b5563;">${s.action}</span>
            </div>`
        ).join('');

        await window.dialogSystem.showDialog({
            type: 'info',
            title: 'Keyboard Shortcuts',
            message: shortcutList,
            buttons: [
                { text: 'Close', action: 'ok', class: 'primary' }
            ]
        });
    }

    /**
     * Show about dialog
     */
    async showAboutDialog() {
        // Ensure dialog system is loaded
        await this.initializeDialogSystem();

        if (!window.dialogSystem) {
            console.error('Dialog system not available');
            return;
        }

        const aboutContent = `<div style="text-align: center;">
<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">
<span style="font-size: 20px;">🔍</span>
<span>Comfytech Research Hub</span>
</div>
<p style="margin: 4px 0; color: #6b7280; font-weight: 500;">Version 2.0</p>
<p style="margin: 8px 0; color: #4b5563; font-size: 14px;">Advanced product research and market analysis tool for e-commerce professionals.</p>
<div style="display: flex; gap: 16px; justify-content: center; margin-top: 12px; padding: 8px; background: #f9fafb; border-radius: 6px;">
<div style="text-align: center;">
<div style="font-weight: 600; color: #1f2937;">${this.productCount}</div>
<div style="font-size: 11px; color: #6b7280;">Products</div>
</div>
<div style="text-align: center;">
<div style="font-weight: 600; color: #1f2937;">${this.isOnline ? 'Online' : 'Offline'}</div>
<div style="font-size: 11px; color: #6b7280;">Status</div>
</div>
</div>
</div>`;

        await window.dialogSystem.showDialog({
            type: 'info',
            title: 'About Comfytech Research Hub',
            message: aboutContent,
            buttons: [
                { text: 'Close', action: 'ok', class: 'primary' }
            ]
        });
    }

    /**
     * Update product count from external source
     */
    setProductCount(count) {
        this.productCount = count;
        this.updateProductCount();
    }

    /**
     * Manually refresh header state
     */
    refresh() {
        this.currentPage = this.detectCurrentPage();
        this.updateNavigation();
        this.loadProductCount();
    }
}

// Prevent auto-initialization to avoid conflicts
// Manual initialization is required - call new HeaderComponent() after loading header HTML
// 
// Usage:
// 1. Load header HTML into the DOM
// 2. Call: window.headerComponent = new HeaderComponent();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderComponent;
}
