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

        const generateBtn = document.getElementById('generatePromptBtn');
        if (generateBtn) {
            console.log('✅ Generate AI Analysis button found and setting up click handler');
            generateBtn.addEventListener('click', () => {
                console.log('🎯 Generate AI Analysis button clicked!');
                this.handleAIResearch();
            });
        } else {
            console.warn('⚠️ Generate AI Analysis button not found in DOM');
        }

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

            // Check for and load saved AI analysis
            this.loadSavedAIResponse();

        } catch (error) {
            console.error('❌ Error loading product:', error);
            this.showError('Failed to load product. Please try again.');
        }
    }

    loadSavedAIResponse() {
        // Check if there are any AI-generated findings and display the most recent one
        if (!this.currentProduct || !this.currentProduct.findings) {
            console.log('📋 No findings available to check for AI responses');
            return;
        }

        // Find AI-generated findings (look for the special flag)
        const aiFindings = this.currentProduct.findings.filter(finding =>
            finding.isAIGenerated === true || finding.store === 'AI Analysis'
        );

        if (aiFindings.length === 0) {
            console.log('📋 No saved AI analysis found');
            return;
        }

        // Get the most recent AI finding (highest timestamp)
        const mostRecentAI = aiFindings.reduce((latest, current) => {
            const currentTime = new Date(current.timestamp || 0).getTime();
            const latestTime = new Date(latest.timestamp || 0).getTime();
            return currentTime > latestTime ? current : latest;
        });

        console.log('🔍 Found saved AI analysis:', mostRecentAI.id);

        // Extract AI response data
        let aiResponseData = null;

        // Check if there's aiResponse metadata field
        if (mostRecentAI.aiResponse) {
            aiResponseData = mostRecentAI.aiResponse;
            console.log('✅ Loaded AI response from aiResponse field');
        } else if (mostRecentAI.notes) {
            // Try to parse the notes field as JSON (fallback method)
            try {
                aiResponseData = JSON.parse(mostRecentAI.notes);
                console.log('✅ Loaded AI response from notes field (parsed as JSON)');
            } catch (parseError) {
                // If it's not JSON, treat as string
                aiResponseData = mostRecentAI.notes;
                console.log('✅ Loaded AI response from notes field (as string)');
            }
        }

        if (aiResponseData) {
            console.log('🎯 Displaying saved AI analysis');

            // Update findings count with the stored count from when this analysis was generated
            if (mostRecentAI.findingsUsedCount !== undefined) {
                this.updateFindingsMetricForAIResponse(mostRecentAI.findingsUsedCount);
                console.log(`📊 Using stored findings count: ${mostRecentAI.findingsUsedCount} findings`);
            } else {
                // Fallback for older AI responses without stored count
                console.log('⚠️ No stored findings count, using current manual findings count as fallback');
                this.updateFindingsMetric();
            }

            this.displayAIResult(aiResponseData);
        } else {
            console.warn('⚠️ Found AI finding but could not extract response data');
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

        // Update findings metric for AI analysis section
        this.updateFindingsMetric();

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
        if (!product) return;

        // Count only manual findings (not AI-generated ones)
        const manualFindingsCount = (product.findings || []).filter(finding => !finding.isAIGenerated).length;
        const trendsCount = (product.trendValidation || []).length;

        // Update counters in UI
        const findingsCountEl = document.getElementById('findings-count');
        const trendsCountEl = document.getElementById('trends-count');

        if (findingsCountEl) findingsCountEl.textContent = manualFindingsCount;
        if (trendsCountEl) trendsCountEl.textContent = trendsCount;
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
        // Special handling for image reverse search
        if (platform === 'image') {
            return this.performReverseImageSearch();
        }

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

    async performReverseImageSearch() {
        // Check if there are images available
        if (!this.images || this.images.length === 0) {
            console.log('No images available for reverse search');
            if (window.dialogSystem) {
                await window.dialogSystem.warning('No images available for reverse search');
            } else if (window.notificationSystem) {
                window.notificationSystem.warning('No images available for reverse search');
            } else {
                alert('No images available for reverse search');
            }
            return;
        }

        // Get the currently displayed main image URL
        const currentImageUrl = this.images[this.currentImageIndex];
        console.log('Current image index:', this.currentImageIndex);
        console.log('Current image URL:', currentImageUrl);
        console.log('All images:', this.images);

        if (!currentImageUrl) {
            console.log('Current image URL not available');
            if (window.dialogSystem) {
                await window.dialogSystem.warning('Current image URL not available for search');
            } else if (window.notificationSystem) {
                window.notificationSystem.warning('Current image URL not available for search');
            } else {
                alert('Current image URL not available for search');
            }
            return;
        }

        // Encode the image URL for Google's reverse image search
        const encodedImageUrl = encodeURIComponent(currentImageUrl);

        // Try Google Lens first (newer, better interface)
        let reverseSearchUrl = `https://lens.google.com/uploadbyurl?url=${encodedImageUrl}`;

        // Fallback to traditional Google reverse image search if needed
        // Alternative: https://www.google.com/searchbyimage?image_url=${encodedImageUrl}

        console.log('Opening reverse image search for:', currentImageUrl);
        console.log('Search URL:', reverseSearchUrl);

        try {
            window.open(reverseSearchUrl, '_blank');
        } catch (error) {
            console.error('Error opening reverse image search:', error);
            // Try fallback URL
            const fallbackUrl = `https://www.google.com/searchbyimage?image_url=${encodedImageUrl}`;
            console.log('Trying fallback URL:', fallbackUrl);
            window.open(fallbackUrl, '_blank');
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

        // Filter out AI-generated findings from the Research Findings display
        const manualFindings = this.findings.filter(finding => !finding.isAIGenerated);

        if (!manualFindings || manualFindings.length === 0) {
            container.innerHTML = '<div class="empty-message">No findings yet. Add your first finding!</div>';
            return;
        }

        container.innerHTML = manualFindings.map(finding => `
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
            const prompt = this.generateAIResearchPrompt(this.currentProduct);

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

    generateAIResearchPrompt(product) {
        if (!product) {
            return "Error: No product data provided for analysis.";
        }

        const { name, price, categories, research_description, findings } = product;

        // Format price safely
        let formattedPrice = 'N/A';
        if (price !== null && price !== undefined) {
            try {
                const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price;
                if (!isNaN(numericPrice)) {
                    formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(numericPrice);
                } else {
                    formattedPrice = String(price);
                }
            } catch (error) {
                formattedPrice = String(price);
            }
        }

        const category = Array.isArray(categories) ? categories.join(', ') : (categories || 'N/A');

        // Analyze findings data quality - only count manual findings for analysis
        const manualFindings = Array.isArray(findings) ? findings.filter(f => !f.isAIGenerated) : [];
        const findingsCount = manualFindings.length;
        let findingsAnalysis = '';
        let dataQualityNote = '';

        if (findingsCount === 0) {
            findingsAnalysis = 'No se encontraron comparaciones de mercado.';
            dataQualityNote = '⚠️ DATOS INSUFICIENTES: Sin comparaciones de mercado. Análisis basado solo en información del proveedor.';
        } else {
            // Create detailed findings summary using only manual findings
            findingsAnalysis = manualFindings.map((f, i) => {
                const store = f.store || 'Tienda desconocida';
                const itemPrice = f.price || 'Sin precio';
                const sellerType = f.sellerType || 'N/A';
                const rating = f.rating || 'N/A';
                const reviewCount = f.review_count || '0';
                const shippingCost = f.shippingCost || 'N/A';
                const deliveryTime = f.deliveryTime || 'N/A';
                const match = f.match || 'N/A';

                return `${i + 1}. ${store}
- Precio: ${itemPrice}
- Coincidencia: ${match}
- Reseñas: ${rating} (${reviewCount})
- Envío: ${shippingCost} / Entrega: ${deliveryTime}
- Vendedor: ${sellerType}`;
            }).join('\n\n');

            // Data quality assessment
            if (findingsCount < 3) {
                dataQualityNote = `⚠️ DATOS LIMITADOS: Solo ${findingsCount} comparaciones encontradas. Se recomienda agregar más research findings para un análisis más preciso.`;
            } else if (findingsCount < 6) {
                dataQualityNote = `✅ DATOS BÁSICOS: ${findingsCount} comparaciones disponibles. Análisis confiable, pero se puede mejorar con más datos.`;
            } else {
                dataQualityNote = `🎯 DATOS COMPLETOS: ${findingsCount} comparaciones disponibles. Análisis basado en datos robustos.`;
            }
        }

        // Generate the enhanced AI prompt
        const promptText = `Eres un experto en análisis de productos para e-commerce y ventas online.

Actúas como asistente de investigación para una tienda online que busca productos con al menos **2× de margen de ganancia bruto** (precio de venta ≥ 2× precio del proveedor), aunque márgenes menores pueden considerarse si el producto tiene ventajas notables o alta viralidad.

Tu tarea es analizar el siguiente producto y compararlo con las referencias encontradas en marketplaces (MercadoLibre, Amazon, etc). Usa esta información para definir una estrategia de posicionamiento competitivo.

INFORMACIÓN DEL PRODUCTO:
- Nombre: ${name || 'Sin nombre'}
- Precio del proveedor: ${formattedPrice}
- Categoría: ${category}

Descripción del proveedor:
${research_description || '(sin descripción)'}

ANÁLISIS DE MERCADO:
${dataQualityNote}

Comparaciones encontradas (${findingsCount} findings):
${findingsAnalysis}

${findingsCount < 3 ? `
RECOMENDACIÓN PARA MEJORAR EL ANÁLISIS:
Para obtener un análisis más preciso, se recomienda:
- Buscar el producto en MercadoLibre, Amazon, Éxito, Falabella
- Agregar al menos 3-5 comparaciones de diferentes plataformas
- Incluir información de precios, reseñas, y tiempos de entrega
- Verificar la calidad de las imágenes y coincidencia del producto
` : ''}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional) con esta estructura exacta:

{
  "competition_level": "Alta/Media/Baja",
  "margin_estimate": "X.XX×",
  "meets_margin_target": true/false,
  "should_sell": true/false,
  "justification": "Justificación breve en español",
  "marketing_suggestions": [
    "Sugerencia 1",
    "Sugerencia 2", 
    "Sugerencia 3"
  ],
  "target_audience": [
    "Segmento 1",
    "Segmento 2",
    "Segmento 3"
  ],
  "data_confidence": "Alta/Media/Baja"
}

Reglas:
- competition_level: Solo "Alta", "Media" o "Baja"
- margin_estimate: Formato "X.XX×" (ej: "2.50×", "1.80×")
- meets_margin_target: true si margin_estimate ≥ 2.00×, false si < 2.00×
- should_sell: true/false basado en margen, competencia, viralidad Y calidad de datos
- justification: Máximo 150 caracteres, menciona la calidad de datos si es relevante
- marketing_suggestions: Exactamente 3 sugerencias, máximo 80 caracteres cada una
- target_audience: Exactamente 3 segmentos, máximo 60 caracteres cada uno
- data_confidence: "Alta" si ≥6 findings, "Media" si 3-5 findings, "Baja" si <3 findings

NOTA: Si los datos son insuficientes (<3 findings), indica en la justificación que se necesita más investigación de mercado.`;

        return String(promptText).trim();
    }


    async sendPromptToOpenAI(prompt) {
        // WARNING: This functionality should be delegated to the external API
        // for security reasons. API keys should not be exposed in frontend code.
        // TODO: Move this to the backend API at https://dropi-research-api.onrender.com

        const apiKey = window.environmentConfig?.getOpenAIKey();
        if (!apiKey) {
            throw new Error('OpenAI API key not configured. Use window.setOpenAIKey("your-key") in development.');
        }

        // Validate prompt is a string
        if (typeof prompt !== 'string') {
            console.error('❌ Prompt is not a string:', typeof prompt, prompt);
            throw new Error(`Invalid prompt type: expected string, got ${typeof prompt}`);
        }

        if (!prompt.trim()) {
            throw new Error('Prompt cannot be empty');
        }

        console.log('🤖 Sending prompt to OpenAI:', prompt.substring(0, 100) + '...');

        const requestBody = {
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0.4,
            max_tokens: 1000  // GPT-3.5 Turbo supports up to 4096 tokens
        };

        console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ OpenAI API Error:', errorData);
            throw new Error(`Failed to fetch from OpenAI: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        console.log('✅ OpenAI response received:', data);

        const rawContent = data.choices?.[0]?.message?.content || "(No response)";

        // Try to parse JSON response
        try {
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonContent = jsonMatch[0];
                const parsedData = JSON.parse(jsonContent);
                console.log('✅ Successfully parsed JSON response:', parsedData);
                return parsedData;
            } else {
                console.warn('⚠️ No JSON found in response, returning raw content');
                return rawContent;
            }
        } catch (parseError) {
            console.warn('⚠️ Failed to parse JSON response:', parseError);
            console.log('Raw response content:', rawContent);
            return rawContent;
        }
    }

    async handleAIResearch(product = null) {
        // Use provided product or current product
        const targetProduct = product || this.currentProduct;

        if (!targetProduct) {
            const errorMsg = 'No product available for AI analysis. Please load a product first.';
            console.error('❌', errorMsg);
            this.showAIError(errorMsg);
            return;
        }

        console.log('🚀 Starting AI research for product:', targetProduct.id, targetProduct.name);

        try {
            // Show loading state
            this.showAILoading();

            console.log('📝 Generating AI research prompt...');
            const prompt = this.generateAIResearchPrompt(targetProduct);

            if (!prompt || typeof prompt !== 'string') {
                throw new Error('Failed to generate AI research prompt');
            }

            console.log('📄 Prompt preview:', prompt.substring(0, 200) + '...');

            console.log('🚀 Sending to OpenAI...');
            const result = await this.sendPromptToOpenAI(prompt);

            // Update findings count with the exact number of manual findings used for this analysis
            const manualFindingsCount = (targetProduct.findings || []).filter(finding => !finding.isAIGenerated).length;
            this.updateFindingsMetricForAIResponse(manualFindingsCount);

            console.log('✅ AI analysis completed successfully');
            console.log('📖 Result type:', typeof result);

            if (typeof result === 'object') {
                console.log('📊 Structured JSON result:', result);

                // Validate the structure
                const isValid = this.validateAIStructure(result);
                if (!isValid) {
                    console.warn('⚠️ AI response structure validation failed, but proceeding with display');
                }
            } else {
                console.log('📖 String result length:', result?.length || 0);
            }

            // Hide loading and display result
            this.hideAILoading();
            this.displayAIResult(result);

            // Save AI response as a finding for permanent storage
            try {
                await this.saveAIResponseAsFinding(result);
            } catch (saveError) {
                console.warn('⚠️ Failed to save AI response as finding:', saveError);
                // Don't fail the entire process if saving fails
            }

        } catch (err) {
            console.error("❌ AI research failed:", err);
            console.error("❌ Error details:", {
                message: err.message,
                stack: err.stack,
                productData: targetProduct
            });

            // Hide loading and show error
            this.hideAILoading();
            this.showAIError(`Error en el análisis AI: ${err.message}`);

            // Use dialog system if available, otherwise fallback
            if (window.dialogSystem) {
                await window.dialogSystem.error(`AI analysis failed: ${err.message}`);
            } else {
                this.showError(`AI analysis failed: ${err.message}`);
            }
        }
    }

    validateAIStructure(data) {
        // Validate the required structure for AI response
        const requiredFields = [
            'competition_level',
            'margin_estimate',
            'meets_margin_target',
            'should_sell',
            'justification',
            'marketing_suggestions',
            'target_audience'
        ];

        const isValid = requiredFields.every(field => data.hasOwnProperty(field));

        if (!isValid) {
            console.warn('⚠️ AI response missing required fields:',
                requiredFields.filter(field => !data.hasOwnProperty(field)));
        }

        // Validate specific field types and constraints
        if (data.competition_level && !['Alta', 'Media', 'Baja'].includes(data.competition_level)) {
            console.warn('⚠️ Invalid competition_level value:', data.competition_level);
        }

        if (data.margin_estimate && !data.margin_estimate.includes('×')) {
            console.warn('⚠️ Invalid margin_estimate format:', data.margin_estimate);
        }

        if (typeof data.meets_margin_target !== 'boolean') {
            console.warn('⚠️ meets_margin_target should be boolean:', data.meets_margin_target);
        }

        if (typeof data.should_sell !== 'boolean') {
            console.warn('⚠️ should_sell should be boolean:', data.should_sell);
        }

        if (data.marketing_suggestions && !Array.isArray(data.marketing_suggestions)) {
            console.warn('⚠️ marketing_suggestions should be array:', data.marketing_suggestions);
        }

        if (data.target_audience && !Array.isArray(data.target_audience)) {
            console.warn('⚠️ target_audience should be array:', data.target_audience);
        }

        return isValid;
    }

    displayAIResult(result) {
        console.log('📊 Displaying AI result:', typeof result, result);

        // Hide loading and error states
        this.hideAILoading();
        this.hideAIError();

        // Handle different result types and populate the existing HTML structure
        if (result === null || result === undefined) {
            this.showAIError('No se recibió respuesta del análisis AI');
            return;
        }

        if (typeof result === 'object' && this.isStructuredAIResponse(result)) {
            this.populateStructuredResult(result);
        } else if (typeof result === 'object') {
            this.populateGenericJSONResult(result);
        } else {
            this.populateStringResult(result);
        }

        // Show the analysis container and hide placeholder
        this.showAIAnalysis();
    } populateStructuredResult(data) {
        // Populate the existing HTML structure with AI analysis data
        // Note: Findings count is updated separately when AI analysis is generated

        // Update recommendation badge
        const recommendationBadge = document.getElementById('recommendationBadge');
        if (recommendationBadge) {
            if (data.should_sell) {
                recommendationBadge.textContent = '✅ Recomendado';
                recommendationBadge.className = 'badge badge-success';
            } else {
                recommendationBadge.textContent = '❌ No recomendado';
                recommendationBadge.className = 'badge badge-danger';
            }
            recommendationBadge.style.display = 'inline-flex';
        }

        // Update competition level
        const competitionBadge = document.getElementById('competitionBadge');
        if (competitionBadge && data.competition_level) {
            competitionBadge.textContent = data.competition_level;
            const competitionClass = {
                'Alta': 'badge-danger',
                'Media': 'badge-warning',
                'Baja': 'badge-success'
            }[data.competition_level] || 'badge-secondary';
            competitionBadge.className = `badge ${competitionClass}`;
        }

        // Update margin analysis
        const marginValue = document.getElementById('marginValue');
        if (marginValue && data.margin_estimate) {
            marginValue.textContent = data.margin_estimate;
        }

        const marginTargetBadge = document.getElementById('marginTargetBadge');
        if (marginTargetBadge) {
            if (data.meets_margin_target === true) {
                marginTargetBadge.textContent = '✅ Cumple';
                marginTargetBadge.className = 'badge badge-success';
            } else if (data.meets_margin_target === false) {
                marginTargetBadge.textContent = '⚠️ Bajo';
                marginTargetBadge.className = 'badge badge-warning';
            }
            marginTargetBadge.style.display = 'inline-flex';
        }

        // Update justification
        const justificationText = document.getElementById('justificationText');
        if (justificationText) {
            justificationText.textContent = data.justification || 'No se proporcionó justificación';
        }

        // Update marketing suggestions
        const marketingSuggestions = document.getElementById('marketingSuggestions');
        if (marketingSuggestions && Array.isArray(data.marketing_suggestions)) {
            marketingSuggestions.innerHTML = '';
            if (data.marketing_suggestions.length > 0) {
                data.marketing_suggestions.slice(0, 3).forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion;
                    marketingSuggestions.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No hay sugerencias disponibles';
                marketingSuggestions.appendChild(li);
            }
        }

        // Update target audience
        const targetAudience = document.getElementById('targetAudience');
        if (targetAudience && Array.isArray(data.target_audience)) {
            targetAudience.innerHTML = '';
            if (data.target_audience.length > 0) {
                data.target_audience.slice(0, 4).forEach(audience => {
                    const span = document.createElement('span');
                    span.className = 'audience-tag-compact';
                    span.textContent = audience;
                    targetAudience.appendChild(span);
                });
            } else {
                const span = document.createElement('span');
                span.className = 'audience-tag-compact';
                span.textContent = 'No definido';
                targetAudience.appendChild(span);
            }
        }
    }

    updateFindingsMetric() {
        // Update the findings count and quality indicator - count only manual findings used for analysis
        const findingsCount = document.getElementById('findingsCount');
        const findingsQualityBadge = document.getElementById('findingsQualityBadge');

        // Count only manual findings (exclude AI-generated findings)
        const manualFindingsCount = (this.findings || []).filter(finding => !finding.isAIGenerated).length;

        if (findingsCount) {
            findingsCount.textContent = manualFindingsCount;
        }

        if (findingsQualityBadge) {
            let qualityText = '';
            let qualityClass = '';

            if (manualFindingsCount === 0) {
                qualityText = 'Sin datos';
                qualityClass = 'badge findings-poor';
            } else if (manualFindingsCount < 3) {
                qualityText = 'Pocos datos';
                qualityClass = 'badge findings-poor';
            } else if (manualFindingsCount < 6) {
                qualityText = 'Datos básicos';
                qualityClass = 'badge findings-good';
            } else {
                qualityText = 'Datos completos';
                qualityClass = 'badge findings-excellent';
            }

            findingsQualityBadge.textContent = qualityText;
            findingsQualityBadge.className = qualityClass;
            findingsQualityBadge.style.display = 'inline-flex';
        }
    }

    updateFindingsMetricForAIResponse(usedFindingsCount) {
        // Update the findings count and quality indicator with the exact count used for AI analysis
        const findingsCount = document.getElementById('findingsCount');
        const findingsQualityBadge = document.getElementById('findingsQualityBadge');

        if (findingsCount) {
            findingsCount.textContent = usedFindingsCount;
        }

        if (findingsQualityBadge) {
            let qualityText = '';
            let qualityClass = '';

            if (usedFindingsCount === 0) {
                qualityText = 'Sin datos';
                qualityClass = 'badge findings-poor';
            } else if (usedFindingsCount < 3) {
                qualityText = 'Pocos datos';
                qualityClass = 'badge findings-poor';
            } else if (usedFindingsCount < 6) {
                qualityText = 'Datos básicos';
                qualityClass = 'badge findings-good';
            } else {
                qualityText = 'Datos completos';
                qualityClass = 'badge findings-excellent';
            }

            findingsQualityBadge.textContent = qualityText;
            findingsQualityBadge.className = qualityClass;
            findingsQualityBadge.style.display = 'inline-flex';
        }
    }

    populateGenericJSONResult(data) {
        // For generic JSON, show it in the justification section
        const justificationText = document.getElementById('justificationText');
        if (justificationText) {
            justificationText.innerHTML = `<pre style="font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 12px; white-space: pre-wrap; margin: 0;">${this.highlightJSON(JSON.stringify(data, null, 2))}</pre>`;
        }

        // Update title to indicate JSON response
        const analysisTitle = document.getElementById('analysisTitle');
        if (analysisTitle) {
            analysisTitle.textContent = '📄 Respuesta JSON';
        }

        // Update recommendation badge
        const recommendationBadge = document.getElementById('recommendationBadge');
        if (recommendationBadge) {
            recommendationBadge.textContent = 'Datos estructurados';
            recommendationBadge.className = 'badge badge-secondary';
            recommendationBadge.style.display = 'inline-flex';
        }

        // Hide marketing and audience sections for generic JSON
        const marketingSuggestions = document.getElementById('marketingSuggestions');
        const targetAudience = document.getElementById('targetAudience');
        if (marketingSuggestions) marketingSuggestions.innerHTML = '<li>Ver datos en justificación</li>';
        if (targetAudience) targetAudience.innerHTML = '<span class="audience-tag-compact">Ver JSON completo</span>';
    }

    populateStringResult(result) {
        // For string results, show in justification section
        const justificationText = document.getElementById('justificationText');
        if (justificationText) {
            justificationText.textContent = result;
        }

        // Update title to indicate text response
        const analysisTitle = document.getElementById('analysisTitle');
        if (analysisTitle) {
            analysisTitle.textContent = '💬 Respuesta AI';
        }

        // Update recommendation badge
        const recommendationBadge = document.getElementById('recommendationBadge');
        if (recommendationBadge) {
            recommendationBadge.textContent = 'Texto plano';
            recommendationBadge.className = 'badge badge-secondary';
            recommendationBadge.style.display = 'inline-flex';
        }

        // Hide other sections for text response
        const marketingSuggestions = document.getElementById('marketingSuggestions');
        const targetAudience = document.getElementById('targetAudience');
        if (marketingSuggestions) marketingSuggestions.innerHTML = '<li>Ver respuesta completa arriba</li>';
        if (targetAudience) targetAudience.innerHTML = '<span class="audience-tag-compact">Texto simple</span>';
    }

    showAIAnalysis() {
        // Show the analysis container and hide placeholder
        const analysisContainer = document.getElementById('aiAnalysisContainer');
        const placeholder = document.getElementById('aiPlaceholder');

        if (analysisContainer) analysisContainer.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }

    showAILoading() {
        // Show loading state and hide others
        const loadingState = document.getElementById('aiLoadingState');
        const analysisContainer = document.getElementById('aiAnalysisContainer');
        const placeholder = document.getElementById('aiPlaceholder');
        const errorState = document.getElementById('aiErrorState');

        if (loadingState) loadingState.style.display = 'flex';
        if (analysisContainer) analysisContainer.style.display = 'none';
        if (placeholder) placeholder.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
    }

    hideAILoading() {
        // Hide loading state
        const loadingState = document.getElementById('aiLoadingState');
        if (loadingState) loadingState.style.display = 'none';
    }

    showAIError(errorMessage) {
        // Show error state and hide others
        const errorState = document.getElementById('aiErrorState');
        const errorMessageEl = document.getElementById('errorMessage');
        const analysisContainer = document.getElementById('aiAnalysisContainer');
        const placeholder = document.getElementById('aiPlaceholder');
        const loadingState = document.getElementById('aiLoadingState');

        if (errorState) errorState.style.display = 'block';
        if (errorMessageEl) errorMessageEl.textContent = errorMessage;
        if (analysisContainer) analysisContainer.style.display = 'none';
        if (placeholder) placeholder.style.display = 'none';
        if (loadingState) loadingState.style.display = 'none';
    }

    hideAIError() {
        // Hide error state
        const errorState = document.getElementById('aiErrorState');
        if (errorState) errorState.style.display = 'none';
    }

    isStructuredAIResponse(data) {
        // Check if the data has the expected AI analysis structure
        const requiredFields = ['competition_level', 'margin_estimate', 'should_sell'];
        return requiredFields.some(field => data.hasOwnProperty(field));
    }

    async saveAIResponseAsFinding(aiResult) {
        // Save AI analysis result as a special finding in the product JSON
        try {
            if (!this.currentProduct) {
                throw new Error('No product available to save AI response');
            }

            // Calculate how many manual findings were used for this analysis
            const manualFindingsUsed = (this.currentProduct.findings || []).filter(finding => !finding.isAIGenerated).length;

            // Create a special AI finding
            const aiFinding = {
                id: Date.now() + Math.random(), // Unique ID
                store: 'AI Analysis',
                price: 'N/A',
                match: 'AI Generated',
                stock: 'N/A',
                link: '',
                rating: 'N/A',
                review_count: 'N/A',
                variant: 'AI Analysis Result',
                origin: 'OpenAI GPT-4 Turbo',
                deliveryTime: 'N/A',
                shippingCost: 'N/A',
                sellerType: 'AI Assistant',
                listingType: 'AI Analysis',
                badges: 'AI Generated',
                imageQuality: 'N/A',
                imageMatch: 'N/A',
                notes: typeof aiResult === 'object' ? JSON.stringify(aiResult, null, 2) : aiResult,
                timestamp: new Date().toISOString(),
                isAIGenerated: true, // Special flag to identify AI findings
                aiResponse: aiResult, // Store the original AI response data for loading
                findingsUsedCount: manualFindingsUsed // Store the count of manual findings used for this analysis
            };

            // Add to findings array
            this.findings.push(aiFinding);
            this.currentProduct.findings = this.findings;

            // Save to storage
            await this.saveProductData();

            // Update UI
            this.updateResearchPreviews();
            this.updateFindingsMetric();

            console.log('✅ AI response saved as finding:', aiFinding.id);
            this.showSuccessMessage('AI analysis saved as research finding!');

            return aiFinding;

        } catch (error) {
            console.error('❌ Error saving AI response as finding:', error);
            this.showError('Failed to save AI analysis as finding');
            throw error;
        }
    }

    // Removed formatStructuredResult, formatAIAnalysisResult, formatGenericJSONResult, 
    // formatFallbackResult, formatMarketingSuggestions, formatTargetAudience methods
    // as they are replaced by direct DOM manipulation methods above

    highlightJSON(jsonString) {
        // Simple JSON syntax highlighting for better readability
        return jsonString
            .replace(/("[\w\s_-]+"):/g, '<span style="color: var(--color-primary); font-weight: 600;">$1</span>:')
            .replace(/: (".*?")/g, ': <span style="color: var(--color-success);">$1</span>')
            .replace(/: (true|false)/g, ': <span style="color: var(--color-warning);">$1</span>')
            .replace(/: (null)/g, ': <span style="color: var(--text-tertiary);">$1</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span style="color: var(--color-accent);">$1</span>');
    }

    escapeHtml(text) {
        // Escape HTML to prevent XSS attacks
        if (typeof text !== 'string') return String(text || '');

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAIResultModal(result) {
        const modal = document.createElement('div');
        modal.className = 'modal';

        let modalContent;
        let copyContent;

        if (typeof result === 'object') {
            // Structured JSON result
            modalContent = this.formatStructuredResult(result);
            copyContent = JSON.stringify(result, null, 2);
        } else {
            // String result (fallback)
            const escapedResult = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            modalContent = `<pre style="white-space: pre-wrap; font-family: inherit;">${escapedResult}</pre>`;
            copyContent = result;
        }

        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-header">
                    <h3>Análisis AI - Product Research</h3>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.modal').remove()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="ai-result-content">
                        ${modalContent}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="productDetails.copyAIResult(\`${copyContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">Copy to Clipboard</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');

        // Initialize lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async copyAIResult(result) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(result);
                this.showSuccessMessage('AI analysis copied to clipboard!');
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = result;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showSuccessMessage('AI analysis copied to clipboard!');
            }
        } catch (error) {
            console.error('Failed to copy AI result:', error);
            this.showError('Failed to copy to clipboard');
        }
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
        link.className = 'product-id-link'; link.title = 'Click to open product in Dropi dashboard';

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
                // Construct Dropi dashboard URL
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

        // Use the global notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.success(message);
        } else {
            // Fallback to console log if notification system isn't loaded
            console.log('SUCCESS:', message);
        }
    }

    showError(message) {
        console.error('❌', message);

        // Use the global notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.error(message);
        } else {
            // Fallback to console log if notification system isn't loaded
            console.error('ERROR:', message);
        }
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
