const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
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
        const response = await axios.get(`https://dropi-research-api.onrender.com/products/${id}`);
        const product = response.data;

        if (!product) {
            throw new Error('Product not found');
        }

        // Update the status
        product.status = status;

        // Save via API
        await axios.put(`https://dropi-research-api.onrender.com/products/${id}`, product);
        return true;
    } catch (error) {
        console.error('Error updating product status:', error);
        throw new Error(`Failed to update product status: ${error.message}`);
    }
});

ipcMain.handle('update-product-details', async (event, id, updatedProduct) => {
    try {
        console.log('📝 [DEBUG] Updating product details for ID:', id);
        console.log('📝 [DEBUG] Raw updated product data:', updatedProduct);

        // Validate description length (API limit: 1000 characters)
        const description = updatedProduct.description || updatedProduct.description_html || '';
        const validDescription = description.length <= 1000 ? description : '';
        
        if (description.length > 1000) {
            console.log(`⚠️ [WARNING] Description too long (${description.length} characters), skipping description field. Maximum allowed is 1000 characters.`);
        }

        // Transform data to match API schema (same as product creation)
        const transformedProduct = {
            ...updatedProduct, // Keep existing data first
            price: updatedProduct.price ? parseFloat(updatedProduct.price.toString().replace(/[^\d.]/g, '')) || updatedProduct.price : updatedProduct.price,
            dropi_description: validDescription,
            categories: updatedProduct.categories ? 
                (typeof updatedProduct.categories === 'string' ? 
                    updatedProduct.categories.split(',').map(c => c.trim()).filter(c => c.length > 0) : 
                    updatedProduct.categories) : 
                (updatedProduct.categories || [])
        };

        // Remove deprecated fields
        delete transformedProduct.description_html;
        delete transformedProduct.description;
        delete transformedProduct.image; // Remove deprecated image field

        console.log('💾 [DEBUG] Transformed product data for API:', transformedProduct);

        // Save via API
        const response = await axios.put(`https://dropi-research-api.onrender.com/products/${id}`, transformedProduct);
        console.log('✅ [DEBUG] Product details updated successfully:', response.data);

        return response.data;
    } catch (error) {
        console.error('❌ [DEBUG] Error updating product details:', error);
        
        // Enhanced error logging for validation issues
        if (error.response?.status === 400 && error.response?.data) {
            console.error('❌ [DEBUG] Update Validation Error Details:');
            console.error('❌ [DEBUG] Error:', error.response.data.error);
            console.error('❌ [DEBUG] Message:', error.response.data.message);
            console.error('❌ [DEBUG] Validation Details:', JSON.stringify(error.response.data.details, null, 2));
        }
        
        throw new Error(`Failed to update product details: ${error.message}`);
    }
});

ipcMain.handle('reload-product', async (event, id) => {
    try {
        const response = await axios.get(`https://dropi-research-api.onrender.com/products/${id}`);
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
                const existingResponse = await axios.get(`https://dropi-research-api.onrender.com/products/${productData.id}`);
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

        // Validate description length (API limit: 1000 characters)
        const description = productData.description || '';
        const validDescription = description.length <= 1000 ? description : '';
        
        if (description.length > 1000) {
            console.log(`⚠️ [WARNING] Description too long (${description.length} characters), skipping description field. Maximum allowed is 1000 characters.`);
        }

        // Create a new product with basic structure that matches API schema
        const newProduct = {
            id: productData.id || undefined, // Let API generate if not provided
            name: productData.name || 'Nuevo Producto',
            price: productData.price ? parseFloat(productData.price.toString().replace(/[^\d.]/g, '')) || 0 : 0,
            dropi_description: validDescription,
            images: productData.images || [],
            categories: productData.categories ? 
                (typeof productData.categories === 'string' ? 
                    productData.categories.split(',').map(c => c.trim()).filter(c => c.length > 0) : 
                    productData.categories) : 
                [],
            status: 'research', // Default status
            scrapedAt: new Date().toISOString()
        };

        console.log('💾 [DEBUG] Sending product to API:', newProduct);

        // Save via API
        const response = await axios.post('https://dropi-research-api.onrender.com/products', newProduct);
        console.log('✅ [DEBUG] API response:', response.data);

        return response.data;
    } catch (error) {
        console.error('❌ [DEBUG] Error creating product:', error);
        
        // Enhanced error logging for validation issues
        if (error.response?.status === 400 && error.response?.data) {
            console.error('❌ [DEBUG] Validation Error Details:');
            console.error('❌ [DEBUG] Error:', error.response.data.error);
            console.error('❌ [DEBUG] Message:', error.response.data.message);
            console.error('❌ [DEBUG] Validation Details:', JSON.stringify(error.response.data.details, null, 2));
        }
        
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