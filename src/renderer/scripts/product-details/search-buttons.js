const { shell } = require('electron');

function getProductName() {
    const titleElement = document.getElementById('title');
    return titleElement ? titleElement.textContent.trim() : '';
}

function searchGoogle() {
    const productName = getProductName();
    if (productName) shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(productName)}`);
}

function searchML() {
    const productName = getProductName();
    if (productName) shell.openExternal(`https://listado.mercadolibre.com.co/${encodeURIComponent(productName)}`);
}

function searchAmazon() {
    const productName = getProductName();
    if (productName) shell.openExternal(`https://www.amazon.com/s?k=${encodeURIComponent(productName)}`);
}

function searchImage() {
    const firstImage = document.querySelector('#image-slider img');
    const imageUrl = firstImage?.src;
    if (imageUrl && imageUrl !== '#') {
        shell.openExternal(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`);
    } else {
        alert("⚠️ No image available for search.");
    }
}

// Trend Validation Search Functions
function searchGoogleTrends() {
    const productName = getProductName();
    if (productName) {
        shell.openExternal(`https://trends.google.com/trends/explore?q=${encodeURIComponent(productName)}`);
    }
}

function searchTikTokAds() {
    const productName = getProductName();
    if (productName) {
        // Open TikTok Ads Manager Creative Center to research trending content
        shell.openExternal(`https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?search_term=${encodeURIComponent(productName)}`);
    }
}

function searchFacebookAds() {
    const productName = getProductName();
    if (productName) {
        // Open Facebook Ad Library to research ads for similar products
        shell.openExternal(`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(productName)}`);
    }
}

function searchInstagram() {
    const productName = getProductName();
    if (productName) {
        // Search Instagram hashtags and content
        const hashtag = productName.replace(/\s+/g, '').toLowerCase();
        shell.openExternal(`https://www.instagram.com/explore/tags/${encodeURIComponent(hashtag)}/`);
    }
}

function searchYouTube() {
    const productName = getProductName();
    if (productName) {
        // Search YouTube for product reviews and content
        shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(productName)}+review`);
    }
}

module.exports = {
    searchGoogle,
    searchML,
    searchAmazon,
    searchImage,
    searchGoogleTrends,
    searchTikTokAds,
    searchFacebookAds,
    searchInstagram,
    searchYouTube
};