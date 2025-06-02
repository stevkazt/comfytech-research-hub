const { ipcRenderer } = require('electron');
const axios = require('axios');

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
            case 'worth':
                statusTag.className += ' worth-selling';
                statusTag.textContent = '✅ Worth Selling';
                break;
            case 'skip':
                statusTag.className += ' skip';
                statusTag.textContent = '❌ Skip';
                break;
            case 'research':
                statusTag.className += ' not-sure';
                statusTag.textContent = '❓ In Research';
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
            console.log('🔍 [DEBUG] Opening product details for ID:', product.id, 'Type:', typeof product.id);
            ipcRenderer.send('open-product-details', { id: product.id });
        });

        grid.appendChild(card);
    });
}

// Load products from API
async function loadProducts() {
    try {
        console.log('🔄 [DEBUG] Loading products from API...');
        const response = await axios.get('https://dropi-research-api.onrender.com/products?fields=id,name,price,categories,image,status');
        const products = response.data;
        console.log('✅ [DEBUG] Loaded', products.length, 'products');

        // Debug log first few product IDs and types
        if (products.length > 0) {
            console.log('🔍 [DEBUG] Sample product IDs and types:');
            products.slice(0, 3).forEach(p => {
                console.log(`  - ID: ${p.id} (type: ${typeof p.id})`);
            });
        }

        allProducts = products;
        renderProducts(products);

        // Update counter
        const counter = document.getElementById('productCount');
        if (counter) {
            counter.textContent = `${products.length} productos encontrados`;
        }
    } catch (error) {
        console.error('Error loading products from API:', error);
        document.getElementById('productGrid').innerHTML = '<div class="error-message">Error al cargar los productos desde la base de datos</div>';

        // Update counter for error state
        const counter = document.getElementById('productCount');
        if (counter) {
            counter.textContent = '0 productos encontrados';
        }
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

    console.log('🔍 [DEBUG] Searching:', searchTerm, 'Type:', searchType);

    const filtered = allProducts.filter(product => {
        if (searchType === 'id') {
            const productIdStr = product.id.toString().toLowerCase();
            const matches = productIdStr.includes(searchTerm);
            if (matches) {
                console.log('✅ [DEBUG] ID match found:', product.id, 'Type:', typeof product.id);
            }
            return matches;
        } else {
            return product.name.toLowerCase().includes(searchTerm);
        }
    });

    console.log('📋 [DEBUG] Filtered results:', filtered.length, 'products');
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
            if (statusValue === 'new') {
                // For "New" products, consider anything that's not one of the defined statuses
                return !product.status || (
                    product.status !== 'skip' &&
                    product.status !== 'research' &&
                    product.status !== 'worth'
                );
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

    // Update counter
    const counter = document.getElementById('productCount');
    if (counter) {
        counter.textContent = `${filtered.length} productos encontrados`;
    }
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

// Add refresh functionality with API call
document.getElementById('refreshBtn')?.addEventListener('click', () => {
    loadProducts();
});

// Function to show new product modal
function showNewProductModal() {
    return new Promise((resolve) => {
        // Create modal HTML
        const modalHTML = `
            <div id="newProductModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-width: 90vw; max-height: 90vh; overflow-y: auto;">
                    <h2 style="margin-top: 0; color: #333;">Agregar Nuevo Producto</h2>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">ID del Producto *</label>
                        <input type="text" id="productId" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Ejemplo: 12345" required>
                        <small style="color: #666;">Debe ser único. Si ya existe, se mostrará un error.</small>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre del Producto *</label>
                        <input type="text" id="productName" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Ingrese el nombre del producto" required>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Precio</label>
                        <input type="text" id="productPrice" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="$0.00">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Categorías</label>
                        <input type="text" id="productCategories" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Electrónicos, Hogar, etc.">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">URLs de Imágenes</label>
                        <div id="imageInputs">
                            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                                <input type="text" class="image-input" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="https://ejemplo.com/imagen1.jpg">
                                <button type="button" onclick="removeImageInput(this)" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
                            </div>
                        </div>
                        <button type="button" id="addImageBtn" style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px;">+ Agregar otra imagen</button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Descripción</label>
                        <textarea id="productDescription" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; height: 80px; resize: vertical;" placeholder="Descripción del producto"></textarea>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="cancelBtn" style="padding: 10px 20px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button id="saveBtn" style="padding: 10px 20px; border: none; background: #4caf50; color: white; border-radius: 4px; cursor: pointer;">Guardar</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('newProductModal');
        const idInput = document.getElementById('productId');
        const nameInput = document.getElementById('productName');
        const priceInput = document.getElementById('productPrice');
        const categoriesInput = document.getElementById('productCategories');
        const descriptionInput = document.getElementById('productDescription');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveBtn = document.getElementById('saveBtn');
        const addImageBtn = document.getElementById('addImageBtn');

        // Focus on ID input
        idInput.focus();

        // Add image button functionality
        addImageBtn.addEventListener('click', addImageInput);

        // Handle cancel
        const closeModal = () => {
            modal.remove();
            resolve(null);
        };

        cancelBtn.addEventListener('click', closeModal);

        // Handle click outside modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEscape);
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Helper function to collect image URLs
        const collectImageUrls = () => {
            const imageInputs = document.querySelectorAll('.image-input');
            const urls = [];
            imageInputs.forEach(input => {
                const url = input.value.trim();
                if (url) {
                    urls.push(url);
                }
            });
            return urls;
        };

        // Handle save
        saveBtn.addEventListener('click', () => {
            const id = idInput.value.trim();
            const name = nameInput.value.trim();

            if (!id) {
                alert('Por favor ingrese un ID para el producto');
                idInput.focus();
                return;
            }

            if (!name) {
                alert('Por favor ingrese un nombre para el producto');
                nameInput.focus();
                return;
            }

            // Validate ID is numeric
            const numericId = parseInt(id, 10);
            if (isNaN(numericId) || numericId.toString() !== id) {
                alert('El ID debe ser un número entero válido');
                idInput.focus();
                return;
            }

            console.log('💾 [DEBUG] Creating product with ID:', numericId, 'Type:', typeof numericId);

            const images = collectImageUrls();

            const productData = {
                id: numericId, // Ensure numeric ID
                name: name,
                price: priceInput.value.trim(),
                categories: categoriesInput.value.trim(),
                images: images,
                description: descriptionInput.value.trim()
            };

            console.log('📦 [DEBUG] Product data to create:', productData);

            document.removeEventListener('keydown', handleEscape);
            modal.remove();
            resolve(productData);
        });

        // Handle Enter key in text inputs (but not textarea)
        [idInput, nameInput, priceInput, categoriesInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveBtn.click();
                }
            });
        });
    });
}

// Add new product functionality
document.getElementById('addProductBtn').addEventListener('click', async () => {
    const productData = await showNewProductModal();
    if (productData) {
        try {
            console.log('🚀 [DEBUG] Invoking create-new-product with data:', productData);
            const result = await ipcRenderer.invoke('create-new-product', productData);
            console.log('✅ [DEBUG] Product created successfully:', result);

            // Show success message
            alert('Producto creado exitosamente');

            // Refresh the product list
            await loadProducts();
        } catch (error) {
            console.error('❌ [DEBUG] Error creating product:', error);
            alert('Error al crear el producto: ' + error.message);
        }
    }
});