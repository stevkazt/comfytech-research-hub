const { renderFindingsList } = require('./findings-storage');
const { addFinding } = require('./findings-form');
const { addTrendValidationForm, renderSavedTrendValidations } = require('./trend-validation');
const { ipcRenderer, shell } = require('electron');


function renderProduct(product) {
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

    window.productId = product.id;
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

    // Initialize trend validation in the new form container
    if (typeof addTrendValidationForm === 'function') {
        const trendFormContainer = document.getElementById('trend-validation-form-container');
        if (trendFormContainer) {
            trendFormContainer.innerHTML = ''; // Clear existing content
            addTrendValidationForm();
        }

        // Render existing trend validation data in the saved area
        if (product.trendValidation && product.trendValidation.length > 0) {
            renderSavedTrendValidations(product.trendValidation);
        }
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
    // Fetch the latest product data from the DB
    const product = await ipcRenderer.invoke('reload-product', id);
    // Now render the product as before
    renderProduct(product);
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

    // Initialize findings form
    addFinding();

    // Set up image modal
    setupImageModal();
}

module.exports = {
    initUI,
    renderProduct,
    switchTab
};
