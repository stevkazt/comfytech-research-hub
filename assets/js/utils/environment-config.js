/**
 * Environment Configuration Loader
 * 
 * NOTE: This is a simple frontend environment loader.
 * In production, sensitive keys like OpenAI API should NOT be exposed in frontend.
 * The sendPromptToOpenAI functionality should be delegated to the external API.
 */

class EnvironmentConfig {
    constructor() {
        this.config = {
            // Default configuration
            API_BASE_URL: 'https://dropi-research-api.onrender.com',
            NODE_ENV: 'development',
            DEBUG: true,

            // WARNING: API keys should NOT be stored in frontend code
            // This is here for development purposes only
            // TODO: Move AI functionality to backend API
            OPENAI_API_KEY: null
        };

        this.loadConfig();
    }

    loadConfig() {
        // Try to load from localStorage (for development)
        const storedConfig = localStorage.getItem('dropi_env_config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                this.config = { ...this.config, ...parsed };
            } catch (error) {
                console.warn('Failed to parse stored environment config:', error);
            }
        }

        // Load from window object if available (set by build process)
        if (window.DROPI_CONFIG) {
            this.config = { ...this.config, ...window.DROPI_CONFIG };
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    saveConfig() {
        try {
            localStorage.setItem('dropi_env_config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save environment config:', error);
        }
    }

    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }

    isDebugMode() {
        return this.get('DEBUG') === true;
    }

    getApiBaseUrl() {
        return this.get('API_BASE_URL');
    }

    // WARNING: This method exposes sensitive data
    // Only use in development and migrate to backend
    getOpenAIKey() {
        if (!this.isDevelopment()) {
            console.error('OpenAI API key should not be accessed in production!');
            return null;
        }
        return this.get('OPENAI_API_KEY');
    }
}

// Global instance
window.environmentConfig = new EnvironmentConfig();

// Development helper to set API key
if (window.environmentConfig.isDevelopment()) {
    window.setOpenAIKey = (key) => {
        console.warn('⚠️  Setting OpenAI API key in frontend is not secure!');
        console.warn('📝 TODO: Move AI functionality to backend API');
        window.environmentConfig.set('OPENAI_API_KEY', key);
    };
}
