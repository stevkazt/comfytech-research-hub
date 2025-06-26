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
    constructor(baseURL = 'https://comfytech-research-api.onrender.com') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Client-App': 'comfytech-research-web',
            'X-Client-Version': '1.0.0'
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
            
            // Log request body for debugging
            if (config.body) {
                console.log('📤 Request Body:', JSON.parse(config.body));
            }
            
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                
                console.error(`❌ API Error ${response.status}:`, errorData);
                
                // Provide more specific error messages
                if (response.status === 400 && errorData.details) {
                    const validationErrors = errorData.details.map(d => `${d.field}: ${d.message}`).join(', ');
                    throw new Error(`Validation Error: ${validationErrors}`);
                } else if (response.status === 500) {
                    throw new Error(`Server Error: ${errorData.error || 'Internal server error'}`);
                } else {
                    throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
                }
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
        // Validate required fields before normalization
        if (!id || !productData) {
            throw new Error('Product ID and data are required');
        }

        if (!productData.name || productData.name.trim() === '') {
            throw new Error('Product name is required');
        }

        // Normalize product data for API
        const normalizedData = this.normalizeProductForAPI(productData);
        
        // Validate normalized data
        if (!normalizedData.description) {
            normalizedData.description = productData.name; // Use name as fallback description
        }

        console.log('🔧 Updating product with normalized data:', normalizedData);
        
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
        // Parse price to number, removing any currency symbols
        let price = 0;
        if (product.price) {
            if (typeof product.price === 'string') {
                // Remove currency symbols and parse to float
                const priceStr = product.price.replace(/[$,]/g, '');
                price = parseFloat(priceStr) || 0;
            } else if (typeof product.price === 'number') {
                price = product.price;
            }
        }

        // Ensure required fields are present
        const normalizedData = {
            id: parseInt(product.id),
            name: product.name || 'Untitled Product',
            price: price,
            description: product.description || product.research_description || '',
            categories: Array.isArray(product.categories) ? product.categories :
                (product.categories ? product.categories.split(',').map(c => c.trim()) : []),
            images: Array.isArray(product.images) ? product.images :
                (product.images ? [product.images] : []),
            status: product.status || 'unknown'
        };

        // Add optional fields if they exist
        if (product.brand) normalizedData.brand = product.brand;
        if (product.sku) normalizedData.sku = product.sku;
        if (product.stock !== undefined) normalizedData.stock = parseInt(product.stock) || 0;
        if (product.tags && Array.isArray(product.tags)) normalizedData.tags = product.tags;
        if (product.metadata) normalizedData.metadata = product.metadata;
        if (product.dimensions) normalizedData.dimensions = product.dimensions;

        // Store custom fields in metadata to preserve them (serialize complex objects as JSON strings)
        if (product.findings || product.trendValidation) {
            normalizedData.metadata = normalizedData.metadata || {};
            if (product.findings) {
                normalizedData.metadata.findings = JSON.stringify(product.findings);
            }
            if (product.trendValidation) {
                normalizedData.metadata.trendValidation = JSON.stringify(product.trendValidation);
            }
        }

        return normalizedData;
    }

    normalizeProductFromAPI(product) {
        // Extract custom fields from metadata and deserialize if they exist
        let findings = [];
        let trendValidation = [];
        
        if (product.metadata) {
            if (product.metadata.findings) {
                try {
                    findings = JSON.parse(product.metadata.findings);
                } catch (e) {
                    console.warn('Failed to parse findings from metadata:', e);
                    findings = [];
                }
            }
            if (product.metadata.trendValidation) {
                try {
                    trendValidation = JSON.parse(product.metadata.trendValidation);
                } catch (e) {
                    console.warn('Failed to parse trendValidation from metadata:', e);
                    trendValidation = [];
                }
            }
        }

        // Fallback to direct properties if they exist
        findings = findings.length ? findings : (product.findings || []);
        trendValidation = trendValidation.length ? trendValidation : (product.trendValidation || []);

        return {
            id: product.id,
            name: product.name || 'Untitled Product',
            price: product.price || 0,
            categories: Array.isArray(product.categories) ? product.categories.join(', ') : (product.categories || ''),
            images: Array.isArray(product.images) && product.images.length ? product.images :
                (product.image ? [product.image] : []),
            description: product.research_description || product.description || '',
            status: product.status || 'unknown',
            brand: product.brand || '',
            sku: product.sku || '',
            stock: product.stock || 0,
            tags: product.tags || [],
            metadata: product.metadata || {},
            dimensions: product.dimensions || {},
            findings: findings,
            trendValidation: trendValidation,
            scrapedAt: product.scrapedAt || product.created_at || new Date().toISOString()
        };
    }
}

// Initialize global API client
window.apiClient = new APIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
