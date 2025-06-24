/**
 * FILE: api-client.js (114 lines)
 * PURPOSE: Centralized API communication for Comfytech Research Hub
 * SECTIONS:
 * 1-30: Class initialization and configuration
 * 31-70: Core request handling and error management
 * 71-114: Specific API endpoints and utility methods
 * KEY FUNCTIONS:
 * - request()
 * - get()
 * - post()
 * - put()
 * - delete()
 * LAST UPDATED: 2025-06-16 — Added modular architecture documentation
 */

class APIClient {
    constructor(baseURL = 'https://dropi-research-api.onrender.com') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response:`, data);
            return data;
        } catch (error) {
            console.error('❌ API Request failed:', error);
            throw error;
        }
    }

    // Product methods
    async getProducts(fields) {
        const query = fields ? `?fields=${fields}` : '';
        return this.request(`/products${query}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async createProduct(productData) {
        // Normalize product data for API
        const normalizedData = this.normalizeProductForAPI(productData);
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(normalizedData)
        });
    }

    async updateProduct(id, productData) {
        // Normalize product data for API
        const normalizedData = this.normalizeProductForAPI(productData);
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(normalizedData)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Data normalization methods
    normalizeProductForAPI(product) {
        return {
            id: parseInt(product.id),
            name: product.name || '',
            price: product.price || '',
            categories: Array.isArray(product.categories) ? product.categories :
                (product.categories ? product.categories.split(',').map(c => c.trim()) : []),
            images: Array.isArray(product.images) ? product.images :
                (product.images ? [product.images] : []),
            description: product.description || product.research_description || '',
            status: product.status || 'new',
            findings: product.findings || [],
            trendValidation: product.trendValidation || []
        };
    }

    normalizeProductFromAPI(product) {
        return {
            id: product.id,
            name: product.name || 'Untitled Product',
            price: product.price || 'N/A',
            categories: Array.isArray(product.categories) ? product.categories.join(', ') : (product.categories || ''),
            images: Array.isArray(product.images) && product.images.length ? product.images :
                (product.image ? [product.image] : []),
            description: product.research_description || product.description || '',
            status: product.status || 'new',
            findings: product.findings || [],
            trendValidation: product.trendValidation || [],
            scrapedAt: product.scrapedAt || new Date().toISOString()
        };
    }
}

// Initialize global API client
window.apiClient = new APIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
