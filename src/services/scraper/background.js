const { scrapeProducts } = require('./index.js');

scrapeProducts((msg) => {
    process.send?.(msg); // IPC message to Electron
}).then(() => process.exit(0)).catch(err => {
    process.send?.({ type: 'error', message: err.message });
    process.exit(1);
});