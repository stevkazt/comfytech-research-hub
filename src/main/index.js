const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const { updateDropiDetails } = require('../services/dropi-api/products');
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
        // Send only the product ID
        detailWin.webContents.send('product-id', product.id);
    });
});


ipcMain.handle('update-product-details', async (event, id) => {
    try {
        await updateDropiDetails(id);
        return true;
    } catch (err) {
        console.error('❌ Failed to update product details:', err);
        throw err;
    }
});

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

ipcMain.handle('reload-product', async (event, id) => {
    try {
        const response = await axios.get(`http://localhost:3000/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error reloading product:', error);
        throw new Error(`Failed to reload product: ${error.message}`);
    }
});

function createProductViewerWindow() {
    const win = new BrowserWindow({
        show: false,
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
    createMainWindow();
    // Uncomment the line below to open product viewer on launch instead
    // createProductViewerWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});