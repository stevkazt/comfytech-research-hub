const { chromium } = require('playwright');
const fs = require('fs');

async function performLogin() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://app.dropi.co/auth/login');
        await page.waitForURL('https://app.dropi.co/dashboard/home', { timeout: 0 });
        await page.waitForLoadState('load');
        await context.storageState({ path: require('path').join(__dirname, '../../../data/session.json') });
        return true;
    } catch (error) {
        return false;
    } finally {
        await browser.close();
    }
}

module.exports = { performLogin };