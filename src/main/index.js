const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { updateDropiDetails } = require('../services/dropi-api/products');
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
    const dbPath = path.join(getDataPath(), 'products_db.json');
    let db = [];

    // Read the database
    if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }

    // Find the product by ID
    const product = db.find(p => p.id === id);
    if (product) {
        // Update the status
        product.status = status;

        // Save the updated database
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } else {
        throw new Error('Product not found');
    }
}
);

ipcMain.handle('reload-product', async (event, id) => {
    const dbPath = path.join(getDataPath(), 'products_db.json');
    if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const product = db.find(p => p.id === id);
        if (product) {
            return product;
        } else {
            throw new Error('Product not found');
        }
    } else {
        throw new Error('Database file not found');
    }
}
);

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

    // Always read the latest data from the DB when opening the viewer
    win.webContents.once('did-finish-load', () => {
        const dbPath = path.join(getDataPath(), 'products_db.json');
        if (fs.existsSync(dbPath)) {
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            win.webContents.send('products-data', data);
        } else {
            win.webContents.send('products-data', []);
        }
    });

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