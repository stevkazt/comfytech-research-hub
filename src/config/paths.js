const path = require('path');
const fs = require('fs');

// Safe app import with fallback
let app;
try {
    app = require('electron').app;
} catch (e) {
    // Fallback for when electron is not available (e.g., in renderer with contextIsolation)
    app = null;
}

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app || !app.isPackaged;

const getDataDir = () => {
    if (isDev) {
        // In development, use the project's data directory
        return path.resolve(__dirname, '..', '..', 'data');
    } else {
        // In production, use the app's user data directory
        if (!app) {
            throw new Error('Electron app not available for userData path');
        }
        return path.join(app.getPath('userData'), 'data');
    }
};

const DATA_DIR = getDataDir();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create data directory:', error);
    }
}

module.exports = {
    sessionFile: path.join(DATA_DIR, 'session.json'),
    productsDb: path.join(DATA_DIR, 'products_db.json'),
    dataDir: DATA_DIR,
    // Add other paths as needed
};
