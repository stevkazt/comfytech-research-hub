/**
 * FILE: component-loader.js (119 lines)
 * PURPOSE: Load and initialize HTML components across pages
 * SECTIONS:
 * 1-30: Component loading utilities
 * 31-60: Header and footer initialization
 * 61-119: Common initialization logic and error handling
 * KEY FUNCTIONS:
 * - loadComponent()
 * - initializeCommonComponents()
 * - setupHeaderComponent()
 * LAST UPDATED: 2025-06-16 — Updated line count for modular architecture compliance
 */

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
    }

    /**
     * Load an HTML component into a target element
     * @param {string} componentPath - Path to component HTML file
     * @param {string} targetSelector - CSS selector for target element
     * @param {boolean} reinitializeIcons - Whether to reinitialize Lucide icons
     * @returns {Promise<string>} - Returns loaded HTML content
     */
    async loadComponent(componentPath, targetSelector, reinitializeIcons = true) {
        try {
            const response = await fetch(componentPath);
            const html = await response.text();

            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;

                if (reinitializeIcons && typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                this.loadedComponents.add(componentPath);
                console.log(`✅ Loaded component: ${componentPath}`);
                return html;
            } else {
                console.error(`❌ Target element not found: ${targetSelector}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Failed to load component ${componentPath}:`, error);
            return null;
        }
    }

    /**
     * Initialize header component with fallback
     */
    async setupHeaderComponent() {
        try {
            await this.loadComponent('assets/components/header.html', '#header-placeholder');

            // Initialize header functionality
            if (typeof HeaderComponent !== 'undefined') {
                console.log('🔧 Initializing HeaderComponent');
                window.headerComponent = new HeaderComponent();
                console.log('✅ HeaderComponent initialized');
            } else {
                console.error('❌ HeaderComponent class not found');
            }
        } catch (error) {
            console.error('❌ Failed to setup header component:', error);
            // Fallback header
            document.querySelector('#header-placeholder').innerHTML = `
                <header class="header">
                    <div class="header-content">
                        <div class="brand-section">
                            <div class="logo">
                                <i data-lucide="search" class="logo-icon"></i>
                                <span class="logo-text">Product Research Hub</span>
                            </div>
                        </div>
                    </div>
                </header>
            `;
            lucide.createIcons();
        }
    }

    /**
     * Initialize common components (header, footer, etc.)
     */
    async initializeCommonComponents() {
        console.log('🚀 Loading common components...');

        // Load header
        await this.setupHeaderComponent();

        // Load footer if placeholder exists
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        if (footerPlaceholder) {
            await this.loadComponent('assets/components/footer.html', '#footer-placeholder');
        }

        // Initialize notification system
        if (!document.querySelector('script[src*="notifications.js"]')) {
            const notificationScript = document.createElement('script');
            notificationScript.src = 'assets/js/notifications.js';
            document.head.appendChild(notificationScript);
        }

        // Initialize dialog system
        if (window.headerComponent && window.headerComponent.initializeDialogSystem) {
            await window.headerComponent.initializeDialogSystem();
        }

        console.log('✅ Common components initialized');
    }
}

// Export for global use
window.ComponentLoader = ComponentLoader;
