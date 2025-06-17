/**
 * Path Service - Centralized path management for Dropi Web App
 * Provides consistent path resolution across all pages and components
 */

(function () {
    'use strict';

    // Detect the current page depth to calculate relative paths
    function getCurrentDepth() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment.length > 0);

        // If we're in a subdirectory, we need to go up one level
        if (segments.length > 0 && !path.endsWith('.html')) {
            return 1;
        }
        return 0;
    }

    const depth = getCurrentDepth();
    const basePath = depth > 0 ? '../' : './';

    window.pathService = {
        // Asset paths (CSS, JS, images)
        asset: function (path) {
            return basePath + 'assets/' + path;
        },

        // Component paths
        component: function (componentName) {
            return basePath + 'assets/components/' + componentName;
        },

        // Page paths
        page: function (pageName) {
            return basePath + pageName;
        },

        // API base URL
        api: function (endpoint = '') {
            return 'https://dropi-research-api.onrender.com' + (endpoint ? '/' + endpoint : '');
        },

        // Utility to get base path
        getBasePath: function () {
            return basePath;
        }
    };

    // Make it available globally
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.pathService;
    }
})();
