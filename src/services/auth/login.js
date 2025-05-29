const { chromium } = require('playwright');
const axios = require('axios');

async function performLogin() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://app.dropi.co/auth/login');
        await page.waitForURL('https://app.dropi.co/dashboard/home', { timeout: 0 });
        await page.waitForLoadState('load');

        // Wait a bit for localStorage to be populated
        await page.waitForTimeout(2000);

        // Extract only the DROPI_token from localStorage
        const dropiToken = await page.evaluate(() => {
            const tokenValue = localStorage.getItem('DROPI_token');
            return tokenValue ? { name: 'DROPI_token', value: tokenValue } : null;
        });

        if (!dropiToken) {
            console.error('❌ DROPI_token not found in localStorage');
            return false;
        }

        console.log('🔑 DROPI_token extracted:', dropiToken.value.substring(0, 20) + '...');

        const sessionData = await context.storageState();
        console.log('📋 Session data captured');

        // Ensure origins structure exists and add only the DROPI_token
        if (!sessionData.origins || sessionData.origins.length === 0) {
            sessionData.origins = [{
                origin: 'https://app.dropi.co',
                localStorage: [dropiToken]
            }];
        } else {
            sessionData.origins[0].localStorage = [dropiToken];
        }

        console.log('📋 Saving minimal session data with DROPI_token only');

        // Save the session data with only essential token information
        await axios.post('http://localhost:3000/session', sessionData);
        return true;
    } catch (error) {
        return false;
    } finally {
        await browser.close();
    }
}

module.exports = { performLogin };