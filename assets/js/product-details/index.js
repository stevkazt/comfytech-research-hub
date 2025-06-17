/**
 * FILE: product-details/index.js (1355 lines)
 * PURPOSE: Main product research interface with comprehensive analysis tools
 * SECTIONS:
 * 1-100: Class initialization and product loading
 * 101-300: Research findings management
 * 301-500: Trend validation system
 * 501-700: Image gallery and media handling
 * 701-900: Export and reporting functionality
 * 901-1100: UI rendering and layout management
 * 1101-1355: Event handlers and interaction logic
 * KEY FUNCTIONS:
 * - loadProduct()
 * - addFinding()
 * - validateTrend()
 * - exportReport()
 * - renderProductDetails()
 * LAST UPDATED: 2025-06-16 — Reorganized for better usability and workflow efficiency
 */

class ProductDetails {
    constructor() {
        this.currentProduct = null;
        this.currentProductId = null;
        this.findings = [];
        this.trendValidations = [];
        this.currentImageIndex = 0;
        this.images = [];

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Product Details');

        // Get product ID from URL params or localStorage
        this.currentProductId = this.getProductIdFromURL() || localStorage.getItem('currentProductId');

        if (!this.currentProductId) {
            console.error('❌ No product ID found');
            this.showCreateDemoOption();
            return;
        }

        console.log(`📋 Loading product details for ID: ${this.currentProductId}`);

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        await this.loadProduct();
    }

    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : null;
    }

    showCreateDemoOption() {
        const container = document.querySelector('.content-section');
        if (container) {
            container.innerHTML = `
                <div class="demo-option">
                    <div class="demo-card">
                        <h2>No Product Selected</h2>
                        <p>No product ID was found. Would you like to create a demo product to explore the interface?</p>
                        <div class="demo-actions">
                            <button class="btn btn-primary" onclick="productDetails.createDemoProduct()">
                                <i data-lucide="plus"></i>
                                Create Demo Product
                            </button>
                            <button class="btn btn-secondary" onclick="window.location.href='product-viewer.html'">
                                <i data-lucide="arrow-left"></i>
                                Back to Products
                            </button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    }

    async createDemoProduct() {
        try {
            this.showLoadingState();

            const demoProduct = {
                id: Date.now(),
                name: "Demo Product - Wireless Headphones",
                price: "$49.99",
                status: "research",
                images: [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
                ],
                findings: [],
                trendValidation: []
            };

            // Store locally for demo purposes
            localStorage.setItem('currentProductId', demoProduct.id);
            localStorage.setItem(`product_${demoProduct.id}`, JSON.stringify(demoProduct));

            this.currentProduct = demoProduct;
            this.currentProductId = demoProduct.id;

            this.hideLoadingState();
            this.renderProduct();
            this.showSuccessMessage('Demo product created successfully!');

        } catch (error) {
            console.error('❌ Error creating demo product:', error);
            this.hideLoadingState();
            this.showError('Failed to create demo product');
        }
    }

    setupEventListeners() {
        // Back to products button
        document.getElementById('backToProductsBtn')?.addEventListener('click', () => {
            window.location.href = 'product-viewer.html';
        });

        // Product status change
        const statusSelect = document.getElementById('product-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.updateProductStatus(e.target.value);
            });
        }

        // Product action buttons
        this.setupProductActionButtons();

        // Research buttons
        this.setupResearchButtons();

        // External search buttons
        this.setupSearchButtons();

        // Image modal setup
        this.setupImageModal();
    }

    setupProductActionButtons() {
        document.getElementById('editProductBtn')?.addEventListener('click', () => {
            this.showEditProductModal();
        });

        document.getElementById('generatePromptBtn')?.addEventListener('click', () => {
            this.generateAIPrompt();
        });

        document.getElementById('deleteProductBtn')?.addEventListener('click', () => {
            this.deleteProduct();
        });
    }

    setupResearchButtons() {
        // Add Finding button
        document.getElementById('addFindingBtn')?.addEventListener('click', () => {
            this.showAddFindingModal();
        });

        // Add Trend button
        document.getElementById('addTrendBtn')?.addEventListener('click', () => {
            this.showAddTrendModal();
        });

        // View findings buttons
        document.getElementById('viewFindingsBtn')?.addEventListener('click', () => {
            this.showFindingsListModal();
        });

        document.getElementById('viewAllFindingsBtn')?.addEventListener('click', () => {
            this.showFindingsListModal();
        });

        // View trends buttons
        document.getElementById('viewTrendsBtn')?.addEventListener('click', () => {
            this.showTrendsListModal();
        });

        document.getElementById('viewAllTrendsBtn')?.addEventListener('click', () => {
            this.showTrendsListModal();
        });
    }

    setupSearchButtons() {
        // Market research buttons
        document.getElementById('searchGoogleBtn')?.addEventListener('click', () => {
            this.searchExternal('google');
        });

        document.getElementById('searchMLBtn')?.addEventListener('click', () => {
            this.searchExternal('mercadolibre');
        });

        document.getElementById('searchAmazonBtn')?.addEventListener('click', () => {
            this.searchExternal('amazon');
        });

        document.getElementById('searchImageBtn')?.addEventListener('click', () => {
            this.searchExternal('image');
        });

        // Trend research buttons
        document.getElementById('searchTrendsBtn')?.addEventListener('click', () => {
            this.searchExternal('trends');
        });

        document.getElementById('searchTikTokBtn')?.addEventListener('click', () => {
            this.searchExternal('tiktok');
        });

        document.getElementById('searchFacebookBtn')?.addEventListener('click', () => {
            this.searchExternal('facebook');
        });

        document.getElementById('searchInstagramBtn')?.addEventListener('click', () => {
            this.searchExternal('instagram');
        });

        document.getElementById('searchYouTubeBtn')?.addEventListener('click', () => {
            this.searchExternal('youtube');
        });
    }

    setupImageModal() {
        // Close modal button
        document.getElementById('closeImageModal')?.addEventListener('click', () => {
            this.closeImageModal();
        });

        // Navigation buttons
        document.getElementById('prevImageBtn')?.addEventListener('click', () => {
            this.showPreviousImage();
        });

        document.getElementById('nextImageBtn')?.addEventListener('click', () => {
            this.showNextImage();
        });

        // Close on backdrop click
        document.getElementById('imageModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                this.closeImageModal();
            }
        });
    }

    async loadProduct() {
        try {
            // Try to load from API first
            if (window.apiClient) {
                const product = await window.apiClient.getProduct(this.currentProductId);
                this.currentProduct = product;
            } else {
                // Fallback to localStorage for demo
                const stored = localStorage.getItem(`product_${this.currentProductId}`);
                if (stored) {
                    this.currentProduct = JSON.parse(stored);
                } else {
                    throw new Error('Product not found');
                }
            }

            this.renderProduct();
            this.updateResearchPreviews();

        } catch (error) {
            console.error('❌ Error loading product:', error);
            this.showError('Failed to load product. Please try again.');
        }
    }

    renderProduct() {
        const product = this.currentProduct;
        if (!product) return;

        // Update product header
        this.updateElement('product-title', product.name || 'Untitled Product');
        this.updateClickableProductId(product.id, product.name);
        this.updateElement('product-price', product.price || 'No price set');

        // Update price suggestions
        this.updatePriceSuggestions(product.price);

        // Update status selector
        const statusSelect = document.getElementById('product-status');
        if (statusSelect) {
            statusSelect.value = product.status || 'new';
        }

        // Update images
        this.renderImages(product.images || []);

        // Update research counters
        this.updateResearchCounters(product);

        // Store references
        this.findings = product.findings || [];
        this.trendValidations = product.trendValidation || [];
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updatePriceSuggestions(priceStr) {
        if (!priceStr) {
            this.updateElement('price-high', '-');
            this.updateElement('price-standard', '-');
            this.updateElement('price-low', '-');
            return;
        }

        const price = this.parsePrice(priceStr);
        if (isNaN(price)) {
            this.updateElement('price-high', '-');
            this.updateElement('price-standard', '-');
            this.updateElement('price-low', '-');
            return;
        }

        this.updateElement('price-high', `$${Math.round(price * 3).toLocaleString()}`);
        this.updateElement('price-standard', `$${Math.round(price * 2.5).toLocaleString()}`);
        this.updateElement('price-low', `$${Math.round(price * 2).toLocaleString()}`);
    }

    parsePrice(priceStr) {
        return parseFloat(priceStr.toString().replace(/[^\d.]/g, ''));
    }

    renderImages(images) {
        const mainImage = document.getElementById('main-image');
        const placeholder = document.getElementById('image-placeholder');
        const thumbnailsContainer = document.getElementById('image-thumbnails');

        if (!mainImage || !placeholder || !thumbnailsContainer) return;

        this.images = images || [];
        this.currentImageIndex = 0;

        if (this.images.length === 0) {
            // Show placeholder
            mainImage.style.display = 'none';
            placeholder.style.display = 'flex';
            thumbnailsContainer.innerHTML = '';
            return;
        }

        // Hide placeholder and show main image
        placeholder.style.display = 'none';
        mainImage.style.display = 'block';

        // Set first image as main
        this.setMainImage(0);

        // Create thumbnails (limit to 6)
        thumbnailsContainer.innerHTML = '';
        const maxThumbnails = 6;
        const thumbnailImages = this.images.slice(0, maxThumbnails);

        thumbnailImages.forEach((src, index) => {
            if (src) {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${src}" alt="Thumbnail ${index + 1}">`;
                thumbnail.addEventListener('click', () => this.setMainImage(index));
                thumbnailsContainer.appendChild(thumbnail);
            }
        });

        // Debug: Log how many thumbnails were created
        console.log(`Created ${thumbnailImages.length} thumbnails out of ${this.images.length} total images`);
    }

    setMainImage(index) {
        if (index < 0 || index >= this.images.length) return;

        const mainImage = document.getElementById('main-image');
        const thumbnails = document.querySelectorAll('.thumbnail-item');

        // Update main image
        mainImage.src = this.images[index];
        this.currentImageIndex = index;

        // Update active thumbnail (only if thumbnail exists in DOM)
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });

        // Set click handler for main image to open modal
        mainImage.onclick = () => this.openImageModal(index);
    }

    updateResearchCounters(product) {
        const findingsCount = (product.findings || []).length;
        const trendsCount = (product.trendValidation || []).length;

        this.updateElement('findings-count', findingsCount);
        this.updateElement('trends-count', trendsCount);
    }

    updateResearchPreviews() {
        this.updateFindingsPreview();
        this.updateTrendsPreview();
    }

    updateFindingsPreview() {
        const preview = document.getElementById('findings-preview');
        if (!preview) return;

        const latestFindings = this.findings.slice(-3).reverse();

        if (latestFindings.length === 0) {
            preview.innerHTML = '<div class="empty-preview">No findings yet</div>';
            return;
        }

        preview.innerHTML = latestFindings.map(finding => `
            <div class="preview-item">
                <strong>${finding.store || 'Unknown Store'}</strong> - ${finding.price || 'No price'}
                ${finding.match ? `<span class="match-badge ${finding.match.toLowerCase()}">${finding.match}</span>` : ''}
            </div>
        `).join('');
    }

    updateTrendsPreview() {
        const preview = document.getElementById('trends-preview');
        if (!preview) return;

        const latestTrends = this.trendValidations.slice(-3).reverse();

        if (latestTrends.length === 0) {
            preview.innerHTML = '<div class="empty-preview">No trends yet</div>';
            return;
        }

        preview.innerHTML = latestTrends.map(trend => `
            <div class="preview-item">
                <strong>${trend.platform || 'Unknown Source'}</strong> - ${trend.trend_score || 'Unknown Status'}
                ${trend.search_volume ? `<span class="volume-badge">${trend.search_volume}</span>` : ''}
            </div>
        `).join('');
    }

    async searchExternal(platform) {
        const productName = this.currentProduct?.name;
        if (!productName) {
            // Use dialog system instead of alert
            if (window.dialogSystem) {
                await window.dialogSystem.warning('Product name not available for search');
            } else if (window.notificationSystem) {
                window.notificationSystem.warning('Product name not available for search');
            } else {
                alert('Product name not available for search');
            }
            return;
        }

        const query = encodeURIComponent(productName);
        const urls = {
            google: `https://www.google.com/search?q=${query}`,
            mercadolibre: `https://listado.mercadolibre.com.co/${query}`,
            amazon: `https://www.amazon.com/s?k=${query}`,
            image: `https://www.google.com/search?tbm=isch&q=${query}`,
            trends: `https://trends.google.com/trends/explore?q=${query}`,
            tiktok: `https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?search_term=${query}`,
            facebook: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${query}`,
            instagram: `https://www.instagram.com/explore/tags/${query.replace(/\s+/g, '')}`,
            youtube: `https://www.youtube.com/results?search_query=${query}`
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    }

    // Modal methods
    showAddFindingModal() {
        const modal = document.getElementById('findingsModal');
        if (modal) {
            const form = document.getElementById('findingsForm');
            if (form) {
                form.reset();
                // Clear any editing state
                delete form.dataset.editingId;
            }

            // Update modal title for new finding
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = 'Add Research Finding';

            modal.classList.add('active');

            // Focus on first input
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    showAddTrendModal() {
        const modal = document.getElementById('trendModal');
        if (modal) {
            const form = document.getElementById('trendForm');
            if (form) {
                form.reset();
                // Clear any editing state
                delete form.dataset.editingId;
            }

            // Update modal title for new trend
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = 'Add Trend Analysis';

            modal.classList.add('active');

            // Focus on first input
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    showFindingsListModal() {
        const modal = document.getElementById('findingsListModal');
        if (modal) {
            const container = document.getElementById('findingsListContent');
            this.populateFindingsListContent(container);
            modal.classList.add('active');
        }
    }

    showTrendsListModal() {
        const modal = document.getElementById('trendsListModal');
        if (modal) {
            const container = document.getElementById('trendsListContent');
            this.populateTrendsListContent(container);
            modal.classList.add('active');
        }
    }

    closeFindingsModal() {
        const modal = document.getElementById('findingsModal');
        if (modal) {
            modal.classList.remove('active');

            // Clear form and reset title
            const form = document.getElementById('findingsForm');
            if (form) {
                form.reset();
                delete form.dataset.editingId;

                const modalTitle = modal.querySelector('.modal-title');
                if (modalTitle) modalTitle.textContent = 'Add Research Finding';
            }
        }
    }

    closeTrendModal() {
        const modal = document.getElementById('trendModal');
        if (modal) {
            modal.classList.remove('active');

            // Clear form and reset title
            const form = document.getElementById('trendForm');
            if (form) {
                form.reset();
                delete form.dataset.editingId;

                const modalTitle = modal.querySelector('.modal-title');
                if (modalTitle) modalTitle.textContent = 'Add Trend Analysis';
            }
        }
    }

    closeFindingsListModal() {
        const modal = document.getElementById('findingsListModal');
        if (modal) modal.classList.remove('active');
    }

    closeTrendsListModal() {
        const modal = document.getElementById('trendsListModal');
        if (modal) modal.classList.remove('active');
    }

    async saveFinding() {
        const form = document.getElementById('findingsForm');
        if (!form) return;

        const formData = new FormData(form);
        const editingId = form.dataset.editingId;

        const finding = {
            id: editingId || Date.now(),
            store: formData.get('store')?.trim(),
            price: formData.get('price')?.trim(),
            match: formData.get('match'),
            stock: formData.get('stock'),
            link: formData.get('link')?.trim(),
            rating: formData.get('rating')?.trim(),
            review_count: formData.get('review_count')?.trim(),
            variant: formData.get('variant')?.trim(),
            origin: formData.get('origin'),
            deliveryTime: formData.get('deliveryTime')?.trim(),
            shippingCost: formData.get('shippingCost')?.trim(),
            sellerType: formData.get('sellerType'),
            listingType: formData.get('listingType'),
            badges: formData.get('badges'),
            imageQuality: formData.get('imageQuality'),
            imageMatch: formData.get('imageMatch'),
            notes: formData.get('notes')?.trim(),
            timestamp: editingId ? undefined : new Date().toISOString()
        };

        // Remove empty fields to keep the data clean
        Object.keys(finding).forEach(key => {
            if (finding[key] === '' || finding[key] === null || finding[key] === undefined) {
                delete finding[key];
            }
        });

        try {
            if (editingId) {
                // Update existing finding
                const index = this.findings.findIndex(f => f.id == editingId);
                if (index !== -1) {
                    this.findings[index] = { ...this.findings[index], ...finding };
                }
            } else {
                // Add new finding
                this.findings.push(finding);
            }

            this.currentProduct.findings = this.findings;
            await this.saveProductData();

            this.closeFindingsModal();
            this.updateResearchPreviews();
            this.updateResearchCounters(this.currentProduct);

            const action = editingId ? 'updated' : 'saved';
            this.showSuccessMessage(`Finding ${action} successfully!`);

        } catch (error) {
            console.error('❌ Error saving finding:', error);
            this.showError(`Failed to ${editingId ? 'update' : 'save'} finding`);
        }
    }

    async saveTrend() {
        const form = document.getElementById('trendForm');
        if (!form) return;

        const formData = new FormData(form);
        const editingId = form.dataset.editingId;

        const trend = {
            id: editingId || Date.now(),
            platform: formData.get('platform'),
            trend_score: formData.get('trend_score'),
            search_volume: formData.get('search_volume'),
            competition: formData.get('competition'),
            target_audience: formData.get('target_audience'),
            keywords: formData.get('keywords'),
            research_link: formData.get('research_link'),
            notes: formData.get('notes'),
            timestamp: editingId ? undefined : new Date().toISOString()
        };

        try {
            if (editingId) {
                // Update existing trend
                const index = this.trendValidations.findIndex(t => t.id == editingId);
                if (index !== -1) {
                    this.trendValidations[index] = { ...this.trendValidations[index], ...trend };
                }
            } else {
                // Add new trend
                this.trendValidations.push(trend);
            }

            this.currentProduct.trendValidation = this.trendValidations;
            await this.saveProductData();

            this.closeTrendModal();
            this.updateResearchPreviews();
            this.updateResearchCounters(this.currentProduct);

            const action = editingId ? 'updated' : 'saved';
            this.showSuccessMessage(`Trend analysis ${action} successfully!`);

        } catch (error) {
            console.error('❌ Error saving trend:', error);
            this.showError(`Failed to ${editingId ? 'update' : 'save'} trend analysis`);
        }
    }

    // Helper function to format notes with "show more" functionality
    formatNotesWithShowMore(notes, itemId, itemType = 'finding') {
        if (!notes) return '';

        const trimmedNotes = notes.trim();
        const lines = trimmedNotes.split('\n');
        const firstLine = lines[0].trim();

        // If only one line or short content, show all
        if (lines.length <= 1 || trimmedNotes.length <= 80) {
            return `<div class="notes">📝 ${trimmedNotes}</div>`;
        }

        const remainingLines = lines.slice(1).join('\n').trim();
        const uniqueId = `${itemType}-${itemId}`;

        return `
            <div class="notes">
                📝 <span class="notes-preview">${firstLine}</span><span class="notes-full" id="notes-full-${uniqueId}" style="display: none;">
${remainingLines}</span>
                <button class="notes-toggle-btn" onclick="productDetails.toggleNotes('${uniqueId}')" id="toggle-btn-${uniqueId}">
                    <span class="show-more">... more</span>
                    <span class="show-less" style="display: none;">show less</span>
                </button>
            </div>
        `;
    }

    // Toggle notes visibility
    toggleNotes(uniqueId) {
        const fullNotes = document.getElementById(`notes-full-${uniqueId}`);
        const toggleBtn = document.getElementById(`toggle-btn-${uniqueId}`);

        if (!fullNotes || !toggleBtn) return;

        const showMore = toggleBtn.querySelector('.show-more');
        const showLess = toggleBtn.querySelector('.show-less');

        if (fullNotes.style.display === 'none') {
            // Show full notes
            fullNotes.style.display = 'inline';
            showMore.style.display = 'none';
            showLess.style.display = 'inline';
        } else {
            // Hide full notes
            fullNotes.style.display = 'none';
            showMore.style.display = 'inline';
            showLess.style.display = 'none';
        }
    }

    populateFindingsListContent(container) {
        if (!container) return;

        if (!this.findings || this.findings.length === 0) {
            container.innerHTML = '<div class="empty-message">No findings yet. Add your first finding!</div>';
            return;
        }

        container.innerHTML = this.findings.map(finding => `
            <div class="research-item">
                <div class="research-item-header">
                    <strong>${finding.store || 'Unknown Store'} - ${finding.price || 'No price'}</strong>
                    ${finding.match ? `<span class="match-badge ${finding.match.toLowerCase().replace(/\s+/g, '-')}">${finding.match}</span>` : ''}
                </div>
                <div class="research-item-content">
                    ${finding.rating ? `<div>⭐ Rating: ${finding.rating} ${finding.review_count ? `(${finding.review_count} reviews)` : ''}</div>` : ''}
                    ${finding.stock ? `<div>📦 Stock: ${finding.stock}</div>` : ''}
                    ${finding.variant ? `<div>🔖 Variant: ${finding.variant}</div>` : ''}
                    ${finding.origin ? `<div>🌍 Origin: ${finding.origin}</div>` : ''}
                    ${finding.deliveryTime ? `<div>🚚 Delivery: ${finding.deliveryTime}</div>` : ''}
                    ${finding.shippingCost ? `<div>💸 Shipping: ${finding.shippingCost}</div>` : ''}
                    ${finding.sellerType ? `<div>👤 Seller: ${finding.sellerType}</div>` : ''}
                    ${finding.listingType ? `<div>🏷️ Platform: ${finding.listingType}</div>` : ''}
                    ${finding.badges ? `<div>🏆 Badges: ${finding.badges}</div>` : ''}
                    ${finding.imageQuality ? `<div>🖼️ Image Quality: ${finding.imageQuality}</div>` : ''}
                    ${finding.imageMatch ? `<div>📸 Image Match: ${finding.imageMatch}</div>` : ''}
                    ${finding.notes ? this.formatNotesWithShowMore(finding.notes, finding.id, 'finding') : ''}
                </div>
                <div class="research-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="productDetails.editFinding('${finding.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="productDetails.deleteFinding('${finding.id}')">Delete</button>
                    ${finding.link ? `<a href="${finding.link}" target="_blank" class="btn btn-sm btn-link">View Source</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    populateTrendsListContent(container) {
        if (!container) return;

        if (!this.trendValidations || this.trendValidations.length === 0) {
            container.innerHTML = '<div class="empty-message">No trend analysis yet. Add your first trend!</div>';
            return;
        }

        container.innerHTML = this.trendValidations.map(trend => `
            <div class="research-item">
                <div class="research-item-header">
                    <strong>${trend.platform || 'Unknown Platform'} - ${trend.trend_score || 'N/A'}</strong>
                    ${trend.search_volume ? `<span class="volume-badge">${trend.search_volume}</span>` : ''}
                </div>
                <div class="research-item-content">
                    ${trend.competition ? `<div>Competition: ${trend.competition}</div>` : ''}
                    ${trend.target_audience ? `<div>Target: ${trend.target_audience}</div>` : ''}
                    ${trend.keywords ? `<div>Keywords: ${trend.keywords}</div>` : ''}
                    ${trend.notes ? this.formatNotesWithShowMore(trend.notes, trend.id, 'trend') : ''}
                </div>
                <div class="research-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="productDetails.editTrend('${trend.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="productDetails.deleteTrend('${trend.id}')">Delete</button>
                    ${trend.research_link ? `<a href="${trend.research_link}" target="_blank" class="btn btn-sm btn-link">View Source</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Image modal methods
    openImageModal(index = 0) {
        if (!this.images || this.images.length === 0) return;

        this.currentImageIndex = index;
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');

        if (modal && modalImg) {
            modalImg.src = this.images[index];
            modal.style.display = 'flex';
        }
    }

    closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.switchMainImage(this.currentImageIndex);
        }
    }

    showNextImage() {
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
            this.switchMainImage(this.currentImageIndex);
        }
    }

    switchMainImage(index) {
        const modalImg = document.getElementById('modalImage');
        if (modalImg && this.images[index]) {
            modalImg.src = this.images[index];
        }
    }

    // Product management methods
    showEditProductModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Edit Product</h3>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.modal').remove()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editProductForm">
                        <div class="form-group">
                            <label class="form-label">Product Name</label>
                            <input type="text" name="name" class="form-control" value="${this.currentProduct?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Price</label>
                            <input type="text" name="price" class="form-control" value="${this.currentProduct?.price || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="3" placeholder="Product description">${this.currentProduct?.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="productDetails.saveEditedProduct(this.closest('.modal'))">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        lucide.createIcons();
    }

    async saveEditedProduct(modal) {
        const form = modal.querySelector('#editProductForm');
        const formData = new FormData(form);

        try {
            this.currentProduct.name = formData.get('name');
            this.currentProduct.price = formData.get('price');
            this.currentProduct.description = formData.get('description');

            await this.saveProductData();
            this.renderProduct();
            modal.remove();
            this.showSuccessMessage('Product updated successfully!');

        } catch (error) {
            console.error('❌ Error updating product:', error);
            this.showError('Failed to update product');
        }
    }

    async updateProductStatus(status) {
        try {
            this.currentProduct.status = status;
            await this.saveProductData();
            console.log(`✅ Product status updated to: ${status}`);

        } catch (error) {
            console.error('❌ Error updating product status:', error);
            const statusSelect = document.getElementById('product-status');
            if (statusSelect) {
                statusSelect.value = this.currentProduct.status || 'new';
            }
        }
    }

    async deleteProduct() {
        let confirmed;
        if (window.dialogSystem) {
            confirmed = await window.dialogSystem.confirm('Are you sure you want to delete this product? This action cannot be undone.');
        } else {
            confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
        }

        if (!confirmed) {
            return;
        }

        try {
            if (window.apiClient) {
                await window.apiClient.deleteProduct(this.currentProductId);
            } else {
                localStorage.removeItem(`product_${this.currentProductId}`);
            }

            this.showSuccessMessage('Product deleted successfully!');
            setTimeout(() => {
                window.location.href = 'product-viewer.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Error deleting product:', error);
            this.showError('Failed to delete product');
        }
    }

    async generateAIPrompt() {
        try {
            const prompt = this.createResearchPrompt(this.currentProduct);

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(prompt);
                this.showSuccessMessage('AI research prompt copied to clipboard!');
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = prompt;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showSuccessMessage('AI research prompt copied to clipboard!');
            }

        } catch (error) {
            console.error('❌ Error generating AI prompt:', error);
            this.showError('Failed to generate AI prompt');
        }
    }

    createResearchPrompt(product) {
        const findings = product.findings || [];
        const trends = product.trendValidation || [];

        return `# Product Research Analysis

**Product:** ${product.name}
**Price:** ${product.price}
**Status:** ${product.status}

## Research Findings (${findings.length} total)
${findings.length > 0 ? findings.map(f => `- ${f.store}: ${f.price} (${f.match}) - ${f.notes || 'No notes'}`).join('\n') : 'No findings yet'}

## Trend Analysis (${trends.length} total)
${trends.length > 0 ? trends.map(t => `- ${t.platform}: ${t.trend_score} (${t.search_volume}) - ${t.notes || 'No notes'}`).join('\n') : 'No trends yet'}

## AI Analysis Request
Please analyze this product data and provide:
1. Market opportunity assessment
2. Competitive landscape analysis  
3. Pricing recommendations
4. Risk factors to consider
5. Next steps for research

Focus on actionable insights for dropshipping success.`;
    }

    // CRUD operations for findings and trends
    editFinding(findingId) {
        // First, close the findings list modal
        this.closeFindingsListModal();

        const finding = this.findings.find(f => f.id == findingId);
        if (!finding) return;

        const form = document.getElementById('findingsForm');
        if (form) {
            // Set form values
            form.querySelector('[name="store"]').value = finding.store || '';
            form.querySelector('[name="price"]').value = finding.price || '';
            form.querySelector('[name="match"]').value = finding.match || '';
            form.querySelector('[name="stock"]').value = finding.stock || '';
            form.querySelector('[name="link"]').value = finding.link || '';
            form.querySelector('[name="rating"]').value = finding.rating || '';
            form.querySelector('[name="review_count"]').value = finding.review_count || '';
            form.querySelector('[name="variant"]').value = finding.variant || '';
            form.querySelector('[name="origin"]').value = finding.origin || '';
            form.querySelector('[name="deliveryTime"]').value = finding.deliveryTime || '';
            form.querySelector('[name="shippingCost"]').value = finding.shippingCost || '';
            form.querySelector('[name="sellerType"]').value = finding.sellerType || '';
            form.querySelector('[name="listingType"]').value = finding.listingType || '';
            form.querySelector('[name="badges"]').value = finding.badges || '';
            form.querySelector('[name="imageQuality"]').value = finding.imageQuality || '';
            form.querySelector('[name="imageMatch"]').value = finding.imageMatch || '';
            form.querySelector('[name="notes"]').value = finding.notes || '';

            // Mark as editing
            form.dataset.editingId = findingId;
        }

        // Update modal title and show modal
        const modal = document.getElementById('findingsModal');
        if (modal) {
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Research Finding';

            modal.classList.add('active');

            // Focus on first input
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    editTrend(trendId) {
        // First, close the trends list modal
        this.closeTrendsListModal();

        const trend = this.trendValidations.find(t => t.id == trendId);
        if (!trend) return;

        const form = document.getElementById('trendForm');
        if (form) {
            // Set form values
            form.querySelector('[name="platform"]').value = trend.platform || '';
            form.querySelector('[name="trend_score"]').value = trend.trend_score || '';
            form.querySelector('[name="search_volume"]').value = trend.search_volume || '';
            form.querySelector('[name="competition"]').value = trend.competition || '';
            form.querySelector('[name="target_audience"]').value = trend.target_audience || '';
            form.querySelector('[name="keywords"]').value = trend.keywords || '';
            form.querySelector('[name="research_link"]').value = trend.research_link || '';
            form.querySelector('[name="notes"]').value = trend.notes || '';

            // Mark as editing
            form.dataset.editingId = trendId;
        }

        // Update modal title and show modal
        const modal = document.getElementById('trendModal');
        if (modal) {
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Trend Analysis';

            modal.classList.add('active');

            // Focus on first input
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    async deleteFinding(findingId) {
        let confirmed;
        if (window.dialogSystem) {
            confirmed = await window.dialogSystem.confirm('Are you sure you want to delete this finding?');
        } else {
            confirmed = confirm('Are you sure you want to delete this finding?');
        }

        if (!confirmed) return;

        try {
            this.findings = this.findings.filter(f => f.id != findingId);
            this.currentProduct.findings = this.findings;
            await this.saveProductData();

            this.updateResearchPreviews();
            this.updateResearchCounters(this.currentProduct);
            this.showSuccessMessage('Finding deleted successfully!');

            const modal = document.getElementById('findingsListModal');
            if (modal && modal.classList.contains('active')) {
                const container = document.getElementById('findingsListContent');
                this.populateFindingsListContent(container);
            }

        } catch (error) {
            console.error('❌ Error deleting finding:', error);
            this.showError('Failed to delete finding');
        }
    }

    async deleteTrend(trendId) {
        let confirmed;
        if (window.dialogSystem) {
            confirmed = await window.dialogSystem.confirm('Are you sure you want to delete this trend analysis?');
        } else {
            confirmed = confirm('Are you sure you want to delete this trend analysis?');
        }

        if (!confirmed) return;

        try {
            this.trendValidations = this.trendValidations.filter(t => t.id != trendId);
            this.currentProduct.trendValidation = this.trendValidations;
            await this.saveProductData();

            this.updateResearchPreviews();
            this.updateResearchCounters(this.currentProduct);
            this.showSuccessMessage('Trend analysis deleted successfully!');

            const modal = document.getElementById('trendsListModal');
            if (modal && modal.classList.contains('active')) {
                const container = document.getElementById('trendsListContent');
                this.populateTrendsListContent(container);
            }

        } catch (error) {
            console.error('❌ Error deleting trend:', error);
            this.showError('Failed to delete trend analysis');
        }
    }

    updateClickableProductId(productId, productName) {
        const productIdElement = document.getElementById('product-id');
        if (!productIdElement) return;

        if (!productId) {
            productIdElement.textContent = 'N/A';
            return;
        }

        // Clear existing content
        productIdElement.innerHTML = '';

        // Create clickable link
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = productId;
        link.className = 'product-id-link';
        link.title = 'Click to open product in Dropi dashboard';

        // Add click handler to open Dropi product page
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.openDropiProductPage(productId, productName);
        });

        productIdElement.appendChild(link);
    }

    async openDropiProductPage(productId, productName) {
        try {
            // Create URL-friendly slug from product name
            const slug = productName
                ? productName.toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-')     // Replace spaces with hyphens
                    .replace(/-+/g, '-')      // Replace multiple hyphens with single
                    .trim()
                : 'product';

            // Check if product has a source_url field (from API)
            let dropiUrl;
            if (this.currentProduct && this.currentProduct.source_url &&
                this.currentProduct.source_url.includes('dropi.co')) {
                // Use the source_url if it's a Dropi URL
                dropiUrl = this.currentProduct.source_url;
            } else {
                // Construct Dropi dashboard URL (updated pattern)
                dropiUrl = `https://app.dropi.co/dashboard/product-details/${productId}/${slug}`;
            }

            console.log(`🔗 Opening Dropi product page: ${dropiUrl}`);

            // Open external URL in new tab (web-compatible)
            window.open(dropiUrl, '_blank');

            // Show success notification
            if (window.notificationSystem) {
                window.notificationSystem.info(`Opening product ${productId} in Dropi dashboard`);
            }
        } catch (error) {
            console.error('❌ Error opening Dropi product page:', error);
            if (window.dialogSystem) {
                await window.dialogSystem.error('Failed to open Dropi product page');
            } else if (window.notificationSystem) {
                window.notificationSystem.error('Failed to open Dropi product page');
            } else {
                alert('Failed to open Dropi product page');
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            switch (e.key) {
                case 'Escape':
                    // Close any open modals
                    this.closeAllModals();
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showAddFindingModal();
                    }
                    break;
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showAddTrendModal();
                    }
                    break;
                case 'e':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showEditProductModal();
                    }
                    break;
                case 'g':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.generateAIPrompt();
                    }
                    break;
            }
        });
    }

    closeAllModals() {
        this.closeFindingsModal();
        this.closeTrendModal();
        this.closeFindingsListModal();
        this.closeTrendsListModal();
        this.closeImageModal();
    }

    // Utility methods
    async saveProductData() {
        if (window.apiClient) {
            await window.apiClient.updateProduct(this.currentProductId, this.currentProduct);
        } else {
            localStorage.setItem(`product_${this.currentProductId}`, JSON.stringify(this.currentProduct));
        }
    }

    showLoadingState() {
        const container = document.querySelector('.content-section');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        // Loading state will be replaced by renderProduct()
    }

    showSuccessMessage(message) {
        console.log('✅', message);

        // Remove any existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.innerHTML = `
            <i data-lucide="check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);

        lucide.createIcons();
    }

    showError(message) {
        console.error('❌', message);

        // Remove any existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <i data-lucide="alert-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Auto-remove after 6 seconds for errors
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 6000);

        lucide.createIcons();
    }
}

// Initialize when DOM is ready
let productDetails;

function initProductDetails() {
    console.log('🚀 Initializing Product Details');
    productDetails = new ProductDetails();
}

// Export for global access
window.initProductDetails = initProductDetails;
window.productDetails = productDetails;
