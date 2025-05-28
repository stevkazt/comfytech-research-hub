// scrape-products.js

// === Imports ===
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// === Config and Paths ===
const { sessionFile } = require('../../config/paths');
const DATA_DIR = path.join(__dirname, '../../../data');
const targetUrl = 'https://app.dropi.co/dashboard/search?categoryuser=2';
const errorLogPath = path.join(DATA_DIR, 'logs', 'scraping-errors.log');
const logsDir = path.join(DATA_DIR, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const errorLogStream = fs.createWriteStream(errorLogPath, { flags: 'a' });

// === Helpers ===
const sanitizeName = (name) => name.replace(/\s+/g, ' ').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
const getPath = (...args) => path.join(DATA_DIR, ...args);

const validProducts = [];

// === Scraper ===
async function scrapeProducts(onMessage) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    // Inspect all network responses for product metadata (potential IDs)
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/product') || url.includes('/search')) {
            try {
                const json = await response.json();
                const jsonLogPath = path.join(DATA_DIR, 'logs', 'last-dropi-api-response.json');
                fs.writeFileSync(jsonLogPath, JSON.stringify(json, null, 2));
                console.log(`🔍 API Response from: ${url}`);
                if (Array.isArray(json.objects)) {
                    json.objects.forEach((product) => {
                        validProducts.push({
                            id: product.id,
                            name: product.name,
                            price: product.sale_price,
                            categories: product.categories?.map(c => c.name).join(', ') || '',
                            image: product.gallery?.[0]?.urlS3
                                ? `https://d39ru7awumhhs2.cloudfront.net/${product.gallery[0].urlS3}`
                                : '',
                            scrapedAt: new Date().toISOString(),
                            status: '' // Initialize with empty status (New)
                        });
                    });
                } else {
                    console.dir(json, { depth: 4 });
                }
            } catch (err) {
                // not JSON
            }
        }
    });

    await page.goto(targetUrl);
    if (page.url().includes('/auth/login')) {
        onMessage?.({ type: 'error', message: 'invalid session' });
        await browser.close();
        return;
    }

    await page.waitForSelector('.grid-container');
    for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise(res => setTimeout(res, 500));
    }

    await new Promise(res => setTimeout(res, 5000)); // Allow more time for API responses
    console.log(`📊 Productos recolectados: ${validProducts.length}`);

    const cleanedProducts = validProducts.filter(p => {
        const isMeaningful = p.name && (p.price || p.image);
        const knownBadNames = ['PREMIUM', 'VERIFICADO'];
        return isMeaningful && !knownBadNames.includes(p.name.trim().toUpperCase());
    });

    if (cleanedProducts.length) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const folderPath = getPath(`products_${timestamp}`);
        fs.mkdirSync(folderPath);
        fs.writeFileSync(path.join(folderPath, 'products.json'), JSON.stringify(cleanedProducts, null, 2));
        onMessage?.({ type: 'info', message: `✅ ${cleanedProducts.length} productos guardados.` });
    } else {
        onMessage?.({ type: 'warning', message: '⚠️ No se encontraron productos válidos.' });
    }

    onMessage?.({ type: 'info', message: '✅ Scraping complete' });
    errorLogStream.end();
    await browser.close();
}

module.exports = { scrapeProducts };

if (require.main === module) {
    scrapeProducts((msg) => {
        const prefix = msg.type === 'error' ? '[ERROR]' :
            msg.type === 'warning' ? '[WARN]' :
                '[INFO]';
        console.log(`${prefix} ${msg.message}`);
    });
}