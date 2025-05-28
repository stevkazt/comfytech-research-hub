// merge-csvs.js

const fs = require('fs');
const path = require('path');

// === Config ===
const { productsDb } = require('../../config/paths');
const DATA_DIR = path.join(__dirname, '../../../data');

// === Main ===
(async () => {
    const allData = [];

    // Load existing master JSON if present
    let existingData = [];
    if (fs.existsSync(productsDb)) {
        existingData = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
        allData.push(...existingData);
    }

    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const folders = fs.readdirSync(DATA_DIR).filter(name => name.startsWith('products_'));

    for (const folder of folders) {
        const jsonPath = path.join(DATA_DIR, folder, 'products.json');
        if (!fs.existsSync(jsonPath)) continue;

        try {
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const newProducts = jsonData.filter(p => {
                const existingProduct = existingData.find(e => e.id === p.id);
                if (!existingProduct) {
                    // This is a completely new product
                    return true;
                }
                // Keep the existing product's data but update if needed
                if (existingProduct) {
                    // Preserve existing scrapedAt date and status
                    p.scrapedAt = existingProduct.scrapedAt;
                    p.status = existingProduct.status || '';
                }
                return false;
            });
            allData.push(...newProducts);

            const trash = await import('trash').then(m => m.default);
            await trash([path.join(DATA_DIR, folder)]);
            console.log(`🗂️ Folder "${folder}" processed and trashed.`);
        } catch (err) {
            console.error(`❌ Error processing ${folder}:`, err.message);
        }
    }

    if (allData.length) {
        // Ensure the parent directory exists
        const dbDir = path.dirname(productsDb);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        fs.writeFileSync(productsDb, JSON.stringify(allData, null, 2));
        console.log(`✅ Merged ${folders.length} JSONs into ${productsDb}`);
    } else {
        console.log('⚠️ No data found to merge.');
    }
})();