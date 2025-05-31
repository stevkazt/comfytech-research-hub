const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
require('@electron/remote/main').initialize();

// Cross-platform path helpers
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const getResourcePath = (relativePath) => {
    if (isDev) {
        return path.join(__dirname, '..', '..', relativePath);
    } else {
        return path.join(process.resourcesPath, relativePath);
    }
};

const getDataPath = () => {
    if (isDev) {
        return path.join(__dirname, '..', '..', 'data');
    } else {
        // Use app data directory for production
        return path.join(app.getPath('userData'), 'data');
    }
};

// Ensure data directory exists
const dataPath = getDataPath();
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

function createMainWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    require('@electron/remote/main').enable(win.webContents);

    win.loadFile(path.join(__dirname, '../renderer/views/index.html'));
}

ipcMain.on('open-product-viewer', () => {
    createProductViewerWindow();
});

ipcMain.on('open-product-details', (event, product) => {
    console.log('🔍 [DEBUG] Opening product details for:', product);
    console.log('🔍 [DEBUG] Product ID type:', typeof product.id, 'Value:', product.id);

    const detailWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    require('@electron/remote/main').enable(detailWin.webContents);

    detailWin.maximize();
    detailWin.show();
    detailWin.loadFile(path.join(__dirname, '../renderer/views/product-details.html'));

    detailWin.webContents.once('did-finish-load', () => {
        console.log('📤 [DEBUG] Sending product ID to details window:', product.id);
        // Send only the product ID
        detailWin.webContents.send('product-id', product.id);
    });
});


// Removed update-product-details handler as it relied on scraping functionality

ipcMain.handle('update-product-status', async (event, id, status) => {
    try {
        // Get product from API
        const response = await axios.get(`http://localhost:3000/products/${id}`);
        const product = response.data;

        if (!product) {
            throw new Error('Product not found');
        }

        // Update the status
        product.status = status;

        // Save via API
        await axios.put(`http://localhost:3000/products/${id}`, product);
        return true;
    } catch (error) {
        console.error('Error updating product status:', error);
        throw new Error(`Failed to update product status: ${error.message}`);
    }
});

ipcMain.handle('update-product-details', async (event, id, updatedProduct) => {
    try {
        console.log('📝 [DEBUG] Updating product details for ID:', id);
        console.log('📝 [DEBUG] Updated product data:', updatedProduct);

        // Save via API
        const response = await axios.put(`http://localhost:3000/products/${id}`, updatedProduct);
        console.log('✅ [DEBUG] Product details updated successfully:', response.data);

        return response.data;
    } catch (error) {
        console.error('❌ [DEBUG] Error updating product details:', error);
        throw new Error(`Failed to update product details: ${error.message}`);
    }
});

ipcMain.handle('reload-product', async (event, id) => {
    try {
        const response = await axios.get(`http://localhost:3000/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error reloading product:', error);
        throw new Error(`Failed to reload product: ${error.message}`);
    }
});

ipcMain.handle('create-new-product', async (event, productData) => {
    try {
        console.log('📥 [DEBUG] Received product creation request:', productData);
        console.log('🔍 [DEBUG] Product ID type:', typeof productData.id, 'Value:', productData.id);

        // Check if product with this ID already exists
        if (productData.id) {
            try {
                const existingResponse = await axios.get(`http://localhost:3000/products/${productData.id}`);
                if (existingResponse.data) {
                    throw new Error(`Product with ID ${productData.id} already exists`);
                }
            } catch (error) {
                // If it's a 404, the product doesn't exist, which is what we want
                if (error.response && error.response.status !== 404) {
                    console.error('❌ [DEBUG] Error checking existing product:', error);
                    throw error;
                }
                console.log('✅ [DEBUG] Product ID is available (404 confirmed)');
            }
        }

        // Create a new product with basic structure
        const newProduct = {
            id: productData.id || undefined, // Let API generate if not provided
            name: productData.name || 'Nuevo Producto',
            price: productData.price || '',
            description_html: productData.description || '',
            image: productData.images && productData.images.length > 0 ? productData.images[0] : '',
            images: productData.images || [],
            categories: productData.categories || '',
            status: '',
            scrapedAt: new Date().toISOString(),
            ...productData
        };

        console.log('💾 [DEBUG] Sending product to API:', newProduct);

        // Save via API
        const response = await axios.post('http://localhost:3000/products', newProduct);
        console.log('✅ [DEBUG] API response:', response.data);

        return response.data;
    } catch (error) {
        console.error('❌ [DEBUG] Error creating product:', error);
        throw new Error(`Failed to create product: ${error.message}`);
    }
});

function createProductViewerWindow() {
    const win = new BrowserWindow({
        show: false,
        title: 'Gestor de Productos Dropi',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    require('@electron/remote/main').enable(win.webContents);

    win.maximize();
    win.show();

    // Products will be loaded via API calls in the renderer process
    win.loadFile(path.join(__dirname, '../renderer/views/product-viewer.html'));
}

app.whenReady().then(() => {
    // Launch product viewer as the main window instead of the dashboard
    createProductViewerWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});