/**
 * FILE: product-viewer.js (585 lines)
 * PURPOSE: Main product browsing interface with grid display, search, filtering, and navigation
 * SECTIONS:
 * 1-50: Class initialization and setup
 * 51-150: Product loading and API integration
 * 151-300: Search and filtering functionality
 * 301-450: Grid rendering and display
 * 451-585: Event handlers and UI interactions
 * KEY FUNCTIONS:
 * - loadProducts()
 * - applyFilters()
 * - renderProductGrid()
 * - setupEventListeners()
 * LAST UPDATED: 2025-06-16 — Enhanced with header integration and modular architecture
 */

class ProductViewer {
    constructor() {
        this.allProducts = [];
        this.filteredProducts = [];
        this.currentFilters = {
            search: '',
            searchType: 'name',
            status: 'all',
            sortBy: 'name-asc'
        };
        this.isLoading = false;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Enhanced Product Viewer');
        this.setupEventListeners();
        await this.loadProducts();
        this.setupHeaderIntegration();
    }

    /**
     * Setup integration with header component
     */
    setupHeaderIntegration() {
        // Wait for header component to be available
        if (window.headerComponent) {
            this.headerComponent = window.headerComponent;
            this.updateHeaderProductCount();
        } else {
            // Wait for header component to initialize
            setTimeout(() => this.setupHeaderIntegration(), 100);
        }
    }

    /**
     * Update product count in header
     */
    updateHeaderProductCount() {
        if (this.headerComponent) {
            this.headerComponent.setProductCount(this.allProducts.length);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchType = document.getElementById('searchType');
        const statusFilter = document.getElementById('statusFilter');
        const sortSelect = document.getElementById('sortSelect');
        const addProductBtn = document.getElementById('addProductBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const mobileFilterToggle = document.getElementById('mobileFilterToggle');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        if (searchType) {
            searchType.addEventListener('change', (e) => {
                this.currentFilters.searchType = e.target.value;
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showNewProductModal();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadProducts();
            });
        }

        // Mobile filter toggle functionality
        if (mobileFilterToggle) {
            mobileFilterToggle.addEventListener('click', () => {
                this.toggleMobileFilters();
            });
        }

        // Handle window resize to manage mobile filter visibility
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    /**
     * Load products from API
     */
    async loadProducts() {
        try {
            this.showLoadingState();
            console.log('🔄 Loading products from API...');

            const response = await axios.get('https://dropi-research-api.onrender.com/products?fields=id,name,price,categories,images,status');
            const products = response.data;

            console.log('✅ Loaded', products.length, 'products');

            this.allProducts = products;
            this.applyFilters();
            this.updateProductCount();
            this.updateHeaderProductCount();

        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.showErrorState('Failed to load products. Please check your connection and try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    applyFilters() {
        let filtered = [...this.allProducts];

        // Apply search filter
        if (this.currentFilters.search) {
            filtered = filtered.filter(product => {
                if (this.currentFilters.searchType === 'id') {
                    return product.id.toString().toLowerCase().includes(this.currentFilters.search);
                } else {
                    return product.name.toLowerCase().includes(this.currentFilters.search);
                }
            });
        }

        // Apply status filter
        if (this.currentFilters.status !== 'all') {
            filtered = filtered.filter(product => {
                if (this.currentFilters.status === 'new') {
                    return !product.status || product.status === 'new' ||
                        (product.status !== 'worth' && product.status !== 'skip' && product.status !== 'research');
                }
                return product.status === this.currentFilters.status;
            });
        }

        // Apply sorting
        filtered = this.sortProducts(filtered, this.currentFilters.sortBy);

        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductCount();
    }

    sortProducts(products, sortBy) {
        const sorted = [...products];

        switch (sortBy) {
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'price-asc':
                return sorted.sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
            case 'price-desc':
                return sorted.sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
            case 'date-newest':
                return sorted.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));
            case 'date-oldest':
                return sorted.sort((a, b) => new Date(a.scrapedAt) - new Date(b.scrapedAt));
            default:
                return sorted;
        }
    }

    parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (this.filteredProducts.length === 0) {
            this.showEmptyState();
            return;
        }

        grid.innerHTML = '';

        this.filteredProducts.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });

        // Re-initialize Lucide icons for any new icons added
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;

        // Status tag
        const statusTag = document.createElement('div');
        statusTag.className = `product-card-status status-tag ${this.getStatusClass(product.status)}`;
        statusTag.textContent = this.getStatusText(product.status);

        // Image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'product-card-image';

        if (product.images && product.images.length > 0) {
            const img = document.createElement('img');
            img.src = product.images[0];
            img.alt = product.name;

            img.onload = () => {
                imageContainer.classList.add('loaded');
            };

            img.onerror = () => {
                imageContainer.classList.add('loaded');
                imageContainer.innerHTML = '<i data-lucide="image-off" style="font-size: 2rem;"></i>';
                lucide.createIcons();
            };

            imageContainer.appendChild(img);
        } else {
            imageContainer.classList.add('loaded');
            imageContainer.innerHTML = '<i data-lucide="image-off" style="font-size: 2rem;"></i>';
        }

        // Content
        const content = document.createElement('div');
        content.className = 'product-card-content';

        content.innerHTML = `
            <div class="product-card-id">ID: ${product.id}</div>
            <h3 class="product-card-title">${product.name}</h3>
            <div class="product-card-price">${product.price}</div>
            <div class="product-card-categories">${product.categories || 'No categories'}</div>
            <div class="product-card-footer">
                <span class="product-card-date">${this.formatDate(product.scrapedAt)}</span>
            </div>
        `;

        // Add click handler
        card.addEventListener('click', () => {
            this.openProductDetails(product.id);
        });

        card.appendChild(statusTag);
        card.appendChild(imageContainer);
        card.appendChild(content);

        return card;
    }

    getStatusClass(status) {
        switch (status) {
            case 'worth': return 'status-worth-selling';
            case 'skip': return 'status-skip';
            case 'research': return 'status-research';
            default: return 'status-new';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'worth': return '✅ Worth Selling';
            case 'skip': return '❌ Skip';
            case 'research': return '❓ In Research';
            default: return '⚪ New';
        }
    }

    formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    }

    openProductDetails(productId) {
        console.log(`🔍 Opening product details for ID: ${productId}`);

        // Navigate to product details page - no localStorage needed
        window.location.href = `product-details.html?id=${productId}`;
    }

    showLoadingState() {
        const container = document.querySelector('.product-grid-container');
        const grid = document.getElementById('productGrid');

        if (grid) {
            grid.innerHTML = '';
        }

        if (container && !container.querySelector('.grid-loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'grid-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <span>Loading products...</span>
                </div>
            `;
            container.appendChild(overlay);
        }
    }

    hideLoadingState() {
        const overlay = document.querySelector('.grid-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showErrorState(message) {
        const grid = document.getElementById('productGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i data-lucide="alert-circle" style="margin-right: 0.5rem;"></i>
                    ${message}
                </div>
            `;
            lucide.createIcons();
        }
    }

    showEmptyState() {
        const grid = document.getElementById('productGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3 class="empty-state-title">No products found</h3>
                    <p class="empty-state-description">
                        ${this.currentFilters.search ? 'Try adjusting your search or filters.' : 'Get started by adding your first product.'}
                    </p>
                    <button class="btn btn-primary" onclick="productViewer.showNewProductModal()">
                        <i data-lucide="plus"></i>
                        Add Product
                    </button>
                </div>
            `;
            lucide.createIcons();
        }
    }

    /**
     * Update product count in header and local display
     */
    updateProductCount() {
        const counter = document.getElementById('productCount');
        if (counter) {
            const total = this.allProducts.length;
            const filtered = this.filteredProducts.length;

            if (filtered === total) {
                counter.textContent = `${total} products`;
            } else {
                counter.textContent = `${filtered} of ${total} products`;
            }
        }

        // Update header component
        this.updateHeaderProductCount();
    }

    /**
     * Show notification using the new notification system
     */
    async showNotification(message, type = 'info') {
        // Use the global notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type);
        } else {
            // Fallback to dialog system if notification system isn't loaded yet
            console.log(`${type.toUpperCase()}: ${message}`);
            if (window.dialogSystem) {
                await window.dialogSystem.alert(message);
            } else {
                alert(message);
            }
        }
    }

    async showNewProductModal() {
        // This will be implemented as a modal for adding new products
        console.log('🆕 Opening new product modal');

        // For now, redirect to a simple form (can be enhanced later)
        const productData = await this.createNewProductModal();

        if (productData) {
            try {
                console.log('📤 Creating new product:', productData);
                const newProduct = await window.apiClient.createProduct(productData);
                console.log('✅ Product created successfully:', newProduct);

                // Refresh the product list
                await this.loadProducts();

                this.showNotification('Product created successfully!', 'success');
            } catch (error) {
                console.error('❌ Failed to create product:', error);
                this.showNotification('Failed to create product: ' + error.message, 'error');
            }
        }
    }

    createNewProductModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Add New Product</h3>
                        <button class="modal-close-btn" type="button">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="newProductForm">
                            <div class="form-group">
                                <label class="form-label">Product ID *</label>
                                <input type="number" name="id" class="form-control" required placeholder="12345">
                                <small>Must be unique. If already exists, an error will be shown.</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Product Name *</label>
                                <input type="text" name="name" class="form-control" required placeholder="Enter product name">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Price</label>
                                <input type="text" name="price" class="form-control" placeholder="$29.99">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Categories</label>
                                <input type="text" name="categories" class="form-control" placeholder="Electronics, Home, etc.">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Image URLs</label>
                                <div id="imageInputs">
                                    <input type="url" name="images" class="form-control mb-1" placeholder="https://example.com/image1.jpg">
                                </div>
                                <button type="button" id="addImageBtn" class="btn btn-secondary btn-sm">+ Add Image</button>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea name="description" class="form-control" rows="3" placeholder="Product description" maxlength="1000"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveBtn">Create Product</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add image input functionality
            const addImageBtn = modal.querySelector('#addImageBtn');
            const imageInputs = modal.querySelector('#imageInputs');

            addImageBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'url';
                input.name = 'images';
                input.className = 'form-control mb-1';
                input.placeholder = 'https://example.com/image.jpg';
                imageInputs.appendChild(input);
            });

            // Handle form submission
            const form = modal.querySelector('#newProductForm');
            const saveBtn = modal.querySelector('#saveBtn');
            const cancelBtn = modal.querySelector('#cancelBtn');
            const closeBtn = modal.querySelector('.modal-close-btn');

            const closeModal = () => {
                modal.remove();
                resolve(null);
            };

            const saveProduct = async () => {
                const formData = new FormData(form);
                const imageUrls = Array.from(modal.querySelectorAll('input[name="images"]'))
                    .map(input => input.value.trim())
                    .filter(url => url.length > 0);

                const productData = {
                    id: parseInt(formData.get('id')),
                    name: formData.get('name').trim(),
                    price: formData.get('price').trim(),
                    categories: formData.get('categories').trim(),
                    images: imageUrls,
                    description: formData.get('description').trim()
                };

                if (!productData.id || !productData.name) {
                    // Use dialog system instead of alert
                    if (window.dialogSystem) {
                        await window.dialogSystem.warning('Please fill in required fields (ID and Name)');
                    } else if (window.notificationSystem) {
                        window.notificationSystem.warning('Please fill in required fields (ID and Name)');
                    } else {
                        alert('Please fill in required fields (ID and Name)');
                    }
                    return;
                }

                modal.remove();
                resolve(productData);
            };

            saveBtn.addEventListener('click', saveProduct);
            cancelBtn.addEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);

            // Close on click outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Close on escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    closeModal();
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Focus first input
            modal.querySelector('input[name="id"]').focus();
        });
    }

    /**
     * Toggle mobile filter visibility
     */
    toggleMobileFilters() {
        const filterSection = document.querySelector('.filter-section');
        const toggleBtn = document.getElementById('mobileFilterToggle');

        if (filterSection && toggleBtn) {
            const isVisible = filterSection.classList.contains('mobile-visible');

            if (isVisible) {
                filterSection.classList.remove('mobile-visible');
                toggleBtn.innerHTML = '<i data-lucide="filter" aria-hidden="true"></i><span>Filters</span>';
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                filterSection.classList.add('mobile-visible');
                toggleBtn.innerHTML = '<i data-lucide="x" aria-hidden="true"></i><span>Close</span>';
                toggleBtn.setAttribute('aria-expanded', 'true');
            }

            // Re-initialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }

    /**
     * Handle window resize to manage mobile filter state
     */
    handleWindowResize() {
        const filterSection = document.querySelector('.filter-section');
        const toggleBtn = document.getElementById('mobileFilterToggle');

        // Reset mobile filter state when window becomes larger than mobile breakpoint
        if (window.innerWidth > 480) {
            if (filterSection) {
                filterSection.classList.remove('mobile-visible');
            }
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-lucide="filter" aria-hidden="true"></i><span>Filters</span>';
                toggleBtn.setAttribute('aria-expanded', 'false');
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        }
    }
}

// Initialize when DOM is ready
let productViewer;

function initProductViewer() {
    console.log('🚀 Initializing Product Viewer');
    productViewer = new ProductViewer();
}

// Make functions globally available for header integration
window.showNewProductModal = () => {
    if (window.productViewer) {
        return window.productViewer.showNewProductModal();
    }
    return Promise.resolve(null);
};

window.loadProducts = () => {
    if (window.productViewer) {
        return window.productViewer.loadProducts();
    }
    return Promise.resolve();
};

// Export for global access
window.initProductViewer = initProductViewer;
window.productViewer = productViewer;
