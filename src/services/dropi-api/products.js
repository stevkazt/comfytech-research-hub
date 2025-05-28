const { chromium } = require('playwright');
const fs = require('fs');
const { sessionFile, productsDb } = require('../../config/paths');

const dbFile = productsDb;

async function updateDropiDetails(id) {
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    console.log(`📂 Loaded ${db.length} products from ${dbFile}`);

    const product = db.find(p => p.id === id);
    if (!product) {
        console.error(`❌ Product with id ${id} not found in database.`);
        return;
    }

    const { name } = product;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const productUrl = `https://app.dropi.co/dashboard/product-details/${id}/${slug}`;
    console.log(`🔗 Navigating to: ${productUrl}`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto(productUrl);
    await page.waitForTimeout(1000); // ⏳ Allow JS to initialize
    await page.reload();
    console.log(`🔁 Page reloaded to trigger product details request`);
    console.log(`🌐 Page loaded: ${productUrl}`);

    try {
        const response = await page.waitForResponse(res =>
            res.url().includes(`/api/products/productlist/v1/show/`) &&
            res.url().includes(`id=${id}`)
            , { timeout: 15000 }); // 15 seconds max

        console.log(`✅ Intercepted response: ${response.url()}`);
        const json = await response.json();
        console.dir(json, { depth: null, colors: true });
        fs.writeFileSync(`product-details-${id}.json`, JSON.stringify(json, null, 2));
        console.log(`💾 Saved to product-details-${id}.json`);

        const productData = json.objects;
        console.log(`🛠️ Updating product entry with new description, attributes, and images`);
        product.description_html = productData.description || '';
        product.attributes = productData.attributes || [];
        product.images = (productData.gallery || []).map(img =>
            `https://d39ru7awumhhs2.cloudfront.net/${img.urlS3}`
        );

        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
        console.log(`📝 Updated product ${id} in ${dbFile}`);
        fs.unlinkSync(`product-details-${id}.json`);
        console.log(`🗑️ Deleted temporary file: product-details-${id}.json`);
    } catch (err) {
        console.error(`❌ Timed out waiting for product details API response`, err);
    }

    console.log(`🧹 Closing browser`);
    await browser.close();
}

module.exports = { updateDropiDetails };