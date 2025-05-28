const axios = require('axios');
const fs = require('fs');
const { sessionFile } = require('../../config/paths');

async function checkSession() {
    try {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

        const localStorageToken = session.origins?.[0]?.localStorage?.find(e => e.name === 'DROPI_token');
        if (!localStorageToken) {
            console.error('❌ No DROPI_token found in localStorage');
            return false;
        }

        const bearerToken = localStorageToken.value.replace(/^"|"$/g, '');

        const response = await axios.get(
            'https://api.dropi.co/api/product/categoryuser/list',
            {
                headers: {
                    'X-Authorization': `Bearer ${bearerToken}`,
                    'Accept': 'application/json'
                },
                validateStatus: () => true // prevent axios from throwing on 401
            }
        );

        if (response.status === 401 || response.data?.message === 'Token is Expired') {
            console.log('❌ Token is expired or invalid');
            return false;
        }

        return true;
    } catch (err) {
        console.error('⚠️ Session check failed:', err.message);
        return false;
    }
}

module.exports = { checkSession };

checkSession().then(valid => {
    console.log(valid ? "✅ Session is valid" : "❌ Session is invalid");
});