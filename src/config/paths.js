const path = require('path');
const { app } = require('electron');

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app || !app.isPackaged;

const getDataDir = () => {
    if (isDev) {
        // In development, use the project's data directory
        return path.join(__dirname, '..', '..', 'data');
    } else {
        // In production, use the app's user data directory
        return path.join(app.getPath('userData'), 'data');
    }
};

const DATA_DIR = getDataDir();

module.exports = {
    sessionFile: path.join(DATA_DIR, 'session.json'),
    dataDir: DATA_DIR,
    // Removed productsDb since we're using API calls only
    // Add other paths as needed
};
