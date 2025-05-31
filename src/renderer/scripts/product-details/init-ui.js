const { renderFindingsList } = require('./findings-storage');
const { addTrendValidationForm, renderSavedTrendValidations } = require('./trend-validation');
const { ipcRenderer, shell } = require('electron');
const axios = require('axios');


function renderProduct(product) {
    console.log('🎨 [DEBUG] Rendering product:', product.name, 'ID:', product.id, 'Type:', typeof product.id);

    document.getElementById('title').textContent = product.name || 'Sin título';
    document.getElementById('price').textContent = product.price || 'N/A';

    const rawPrice = parseFloat(product.price?.toString().replace(/[^\d.]/g, ''));
    if (!isNaN(rawPrice)) {
        document.getElementById('price-high').textContent = 'COP $' + Math.round(rawPrice * 3).toLocaleString();
        document.getElementById('price-standard').textContent = 'COP $' + Math.round(rawPrice * 2.5).toLocaleString();
        document.getElementById('price-low').textContent = 'COP $' + Math.round(rawPrice * 2).toLocaleString();
    } else {
        document.getElementById('price-high').textContent = '';
        document.getElementById('price-standard').textContent = '';
        document.getElementById('price-low').textContent = '';
    }

    const slider = document.getElementById('image-slider');
    slider.innerHTML = '';
    const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
    images.forEach((src, index) => {
        if (src) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${product.name || 'Producto'} ${index + 1}`;
            slider.appendChild(img);
        }
    });

    // Set both window.productId and global productId variable
    window.productId = product.id;
    window.productData = product; // Store full product data for debugging
    
    // Store productId in localStorage for persistence between refreshes
    localStorage.setItem('currentProductId', product.id);
    console.log('💾 [DEBUG] Saved productId to localStorage:', product.id);

    console.log('🔗 [DEBUG] Set window.productId to:', window.productId, 'Type:', typeof window.productId);

    const idSpan = document.getElementById('product-id');
    const idLink = document.getElementById('product-id-link');
    idSpan.textContent = product.id || 'N/A';
    if (product.id && product.name) {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        idLink.href = `https://app.dropi.co/dashboard/product-details/${product.id}/${slug}`;
        idLink.setAttribute('data-id', product.id);
        idLink.onclick = (e) => {
            e.preventDefault();
            shell.openExternal(idLink.href);
        };
    }

    // Set the status selector to the saved value or "New"
    const statusSelect = document.getElementById('product-status');
    if (statusSelect) {
        statusSelect.value = product.status || ''; // Empty value represents "New" in our select
    }

    if (typeof renderFindingsList === 'function') {
        renderFindingsList(product.findings);
    }

    // Render existing trend validation data in the saved area
    if (typeof renderSavedTrendValidations === 'function') {
        if (product.trendValidation && product.trendValidation.length > 0) {
            renderSavedTrendValidations(product.trendValidation);
        }
    }

}

// Add a new function to initialize product on page load/refresh
function initializeProductOnLoad() {
    // Check if we have a productId stored in localStorage
    const storedProductId = localStorage.getItem('currentProductId');
    
    if (storedProductId) {
        console.log('🔄 [DEBUG] Found stored productId in localStorage:', storedProductId);
        
        // Set the window.productId to the stored value
        window.productId = storedProductId;
        
        // Fetch and render the product
        fetchAndRenderProduct(storedProductId);
    } else {
        console.log('⚠️ [DEBUG] No productId found in localStorage');
    }
}

// Create a new function to fetch and render product
async function fetchAndRenderProduct(productId) {
    try {
        console.log('🔍 [DEBUG] Fetching product with ID:', productId);
        
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;
        
        console.log('✅ [DEBUG] Product loaded successfully:', product.name);
        
        // Render the product
        renderProduct(product);
    } catch (error) {
        console.error('❌ [DEBUG] Error loading product:', error);
        alert('❌ Error loading product: ' + (error.response?.data?.message || error.message));
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and panels
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Add active class to selected tab and panel
    const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const activePanel = document.getElementById(`${tabName}-tab`);

    if (activeButton) activeButton.classList.add('active');
    if (activePanel) activePanel.classList.add('active');

    // Show/hide appropriate save buttons
    const saveFindingsBtn = document.getElementById('save-findings-btn');
    const saveTrendsBtn = document.getElementById('save-trends-btn');

    if (tabName === 'findings') {
        saveFindingsBtn.style.display = 'block';
        saveTrendsBtn.style.display = 'none';
    } else if (tabName === 'trends') {
        saveFindingsBtn.style.display = 'none';
        saveTrendsBtn.style.display = 'block';
    }
}

ipcRenderer.on('product-id', async (event, id) => {
    try {
        console.log('📥 [DEBUG] Received product ID:', id, 'Type:', typeof id);

        // Try both string and number versions for API call
        let productId = id;
        console.log('🔍 [DEBUG] Attempting to fetch product with ID:', productId);

        // Fetch the latest product data from the API
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        console.log('✅ [DEBUG] API response received:', response.data);

        const product = response.data;
        console.log('📋 [DEBUG] Product loaded successfully:', product.name, 'ID:', product.id);

        // Now render the product as before
        renderProduct(product);
    } catch (error) {
        console.error('❌ [DEBUG] Error loading product:', error);
        console.error('❌ [DEBUG] Failed ID:', id, 'Type:', typeof id);

        // Try alternative ID format if the first fails
        if (typeof id === 'string') {
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                console.log('🔄 [DEBUG] Retrying with numeric ID:', numericId);
                try {
                    const retryResponse = await axios.get(`http://localhost:3000/products/${numericId}`);
                    console.log('✅ [DEBUG] Retry successful:', retryResponse.data);
                    renderProduct(retryResponse.data);
                    return;
                } catch (retryError) {
                    console.error('❌ [DEBUG] Retry also failed:', retryError);
                }
            }
        } else if (typeof id === 'number') {
            const stringId = id.toString();
            console.log('🔄 [DEBUG] Retrying with string ID:', stringId);
            try {
                const retryResponse = await axios.get(`http://localhost:3000/products/${stringId}`);
                console.log('✅ [DEBUG] Retry successful:', retryResponse.data);
                renderProduct(retryResponse.data);
                return;
            } catch (retryError) {
                console.error('❌ [DEBUG] Retry also failed:', retryError);
            }
        }

        alert('❌ Error loading product: ' + (error.response?.data?.message || error.message));
    }
});

const { BrowserWindow } = require('@electron/remote');
window.onload = () => {
    const win = BrowserWindow.getFocusedWindow();
    win.maximize();
};

// Image Modal functionality
let currentImageIndex = 0;
let imageUrls = [];

function setupImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const imageCounter = document.getElementById('imageCounter');
    const imageSlider = document.getElementById('image-slider');

    // Event listener for image clicks
    imageSlider.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            openModal(e.target.src);
        }
    });

    // Close modal functionality
    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Navigation
    prevButton.addEventListener('click', showPreviousImage);
    nextButton.addEventListener('click', showNextImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        switch (e.key) {
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'Escape':
                modal.classList.remove('active');
                break;
        }
    });

    function openModal(imageSrc) {
        imageUrls = Array.from(imageSlider.querySelectorAll('img')).map(img => img.src);
        currentImageIndex = imageUrls.indexOf(imageSrc);
        updateModalImage();
        modal.classList.add('active');
    }

    function updateModalImage() {
        modalImage.src = imageUrls[currentImageIndex];
        imageCounter.textContent = `${currentImageIndex + 1} / ${imageUrls.length}`;

        // Update navigation buttons visibility
        prevButton.style.visibility = currentImageIndex > 0 ? 'visible' : 'hidden';
        nextButton.style.visibility = currentImageIndex < imageUrls.length - 1 ? 'visible' : 'hidden';
    }

    function showPreviousImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateModalImage();
        }
    }

    function showNextImage() {
        if (currentImageIndex < imageUrls.length - 1) {
            currentImageIndex++;
            updateModalImage();
        }
    }
}

function initUI() {
    // Set up click handlers for product ID links
    document.getElementById('product-id-link').addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.dataset.id;
        if (id) {
            shell.openExternal(`https://dropi.co/admin/product-edit/${id}`);
        }
    });

    // Set up image modal
    setupImageModal();

    // Initialize count badges for research tabs
    try {
        const { initializeCountBadges } = require('./modal-functions');
        initializeCountBadges();
    } catch (error) {
        console.log('Modal functions not yet available for count badges');
    }
    
    // Initialize product on page load/refresh
    initializeProductOnLoad();
}

module.exports = {
    initUI,
    renderProduct,
    switchTab,
    fetchAndRenderProduct
};
