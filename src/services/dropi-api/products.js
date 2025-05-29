const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sessionFile } = require('../../config/paths');

async function updateDropiDetails(id) {
    try {
        // Get product from API instead of local file
        const response = await axios.get(`http://localhost:3000/products/${id}`);
        const product = response.data;

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
        await page.waitForTimeout(1000);
        await page.reload();
        console.log(`🔁 Page reloaded to trigger product details request`);
        console.log(`🌐 Page loaded: ${productUrl}`);

        try {
            const response = await page.waitForResponse(res =>
                res.url().includes(`/api/products/productlist/v1/show/`) &&
                res.url().includes(`id=${id}`)
                , { timeout: 15000 });

            console.log(`✅ Intercepted response: ${response.url()}`);
            const json = await response.json();
            console.dir(json, { depth: null, colors: true });

            // Save temporary file for debugging
            const tempFile = `product-details-${id}.json`;
            fs.writeFileSync(tempFile, JSON.stringify(json, null, 2));
            console.log(`💾 Saved to ${tempFile}`);

            const productData = json.objects;
            console.log(`🛠️ Updating product entry with new description, attributes, and images`);

            // Update product data
            product.description_html = productData.description || '';
            product.attributes = productData.attributes || [];
            product.images = (productData.gallery || []).map(img =>
                `https://d39ru7awumhhs2.cloudfront.net/${img.urlS3}`
            );

            // Update via API instead of local file
            await axios.put(`http://localhost:3000/products/${id}`, product);
            console.log(`📝 Updated product ${id} in database via API`);

            // Clean up temporary file
            fs.unlinkSync(tempFile);
            console.log(`🗑️ Deleted temporary file: ${tempFile}`);
        } catch (err) {
            console.error(`❌ Timed out waiting for product details API response`, err);
        }

        console.log(`🧹 Closing browser`);
        await browser.close();
    } catch (error) {
        console.error(`❌ Error updating product details:`, error);
        throw error;
    }
}

module.exports = { updateDropiDetails };