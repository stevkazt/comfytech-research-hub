const { ipcRenderer } = require('electron');
const { productsDb } = require('../../config/paths');
const fs = require('fs');
const path = require('path');

let allProducts = []; // Store all products for filtering

// Update image paths in renderProducts
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const { id, name, price, categories, image } = product;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';

        // Add status tag
        const statusTag = document.createElement('div');
        statusTag.className = 'status-tag';
        switch (product.status) {
            case 'Worth Selling':
                statusTag.className += ' worth-selling';
                statusTag.textContent = '✅ Worth Selling';
                break;
            case 'Skip':
                statusTag.className += ' skip';
                statusTag.textContent = '❌ Skip';
                break;
            case 'Not Sure':
                statusTag.className += ' not-sure';
                statusTag.textContent = '❓ Not Sure';
                break;
            default:
                statusTag.className += ' no-status';
                statusTag.textContent = '⚪ New';
        }
        card.appendChild(statusTag);

        const img = document.createElement('img');
        img.src = image || ''; // Use direct image URL from Dropi
        img.alt = name;
        img.onerror = () => {
            img.src = '../../../assets/icons/no-image.png'; // Fallback image
        };

        const idDiv = document.createElement('div');
        idDiv.className = 'product-id';
        idDiv.textContent = `ID: ${id}`;

        const title = document.createElement('div');
        title.className = 'name';
        title.textContent = name;

        const priceDiv = document.createElement('div');
        priceDiv.className = 'price';
        priceDiv.textContent = `Precio: ${price}`;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'categories';
        categoryDiv.textContent = `Categorías: ${categories}`;

        card.appendChild(img);
        card.appendChild(idDiv);
        card.appendChild(title);
        card.appendChild(priceDiv);
        card.appendChild(categoryDiv);

        card.addEventListener('click', () => {
            ipcRenderer.send('open-product-details', { id: product.id });
        });

        grid.appendChild(card);
    });
}

// Load products from database
function loadProducts() {
    try {
        if (fs.existsSync(productsDb)) {
            const products = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
            allProducts = products;
            renderProducts(products);

            // Update counter
            const counter = document.getElementById('productCount');
            if (counter) {
                counter.textContent = `${products.length} productos encontrados`;
            }
        } else {
            console.error('No se encontró la base de datos de productos');
            document.getElementById('productGrid').innerHTML = '<div class="error-message">No hay productos disponibles</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productGrid').innerHTML = '<div class="error-message">Error al cargar los productos</div>';
    }
}

// Initial load
loadProducts();

// Also listen for updates from main process
ipcRenderer.on('products-data', (event, products) => {
    allProducts = products;
    renderProducts(products);
});

// Add search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const searchType = document.getElementById('searchType').value;

    const filtered = allProducts.filter(product => {
        if (searchType === 'id') {
            return product.id.toString().includes(searchTerm);
        } else {
            return product.name.toLowerCase().includes(searchTerm);
        }
    });

    renderProducts(filtered);
});

// Add status filter functionality
document.getElementById('statusFilter')?.addEventListener('change', (e) => {
    const statusValue = e.target.value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchType = document.getElementById('searchType').value;

    let filtered = [...allProducts];

    // Apply status filter if not "all"
    if (statusValue !== 'all') {
        filtered = filtered.filter(product => {
            if (statusValue === '') {
                // For "New" products, check if status is empty, null, undefined, or doesn't exist
                return !product.status || product.status === '';
            }
            return product.status === statusValue;
        });
    }

    // Apply existing search filter
    filtered = filtered.filter(product => {
        if (searchType === 'id') {
            return product.id.toString().includes(searchTerm);
        } else {
            return product.name.toLowerCase().includes(searchTerm);
        }
    });

    renderProducts(filtered);
});

// Add sort functionality
document.getElementById('sortSelect').addEventListener('change', (e) => {
    const sortType = e.target.value;
    const sortedProducts = [...allProducts];

    switch (sortType) {
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            sortedProducts.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
            break;
        case 'date-newest':
            sortedProducts.sort((a, b) => {
                const dateA = a.scrapedAt ? new Date(a.scrapedAt) : new Date(0);
                const dateB = b.scrapedAt ? new Date(b.scrapedAt) : new Date(0);
                return dateB - dateA;
            });
            break;
        case 'date-oldest':
            sortedProducts.sort((a, b) => {
                const dateA = a.scrapedAt ? new Date(a.scrapedAt) : new Date(0);
                const dateB = b.scrapedAt ? new Date(b.scrapedAt) : new Date(0);
                return dateA - dateB;
            });
            break;
    }

    renderProducts(sortedProducts);
});

// Add refresh functionality
document.getElementById('refreshBtn')?.addEventListener('click', () => {
    loadProducts();
});