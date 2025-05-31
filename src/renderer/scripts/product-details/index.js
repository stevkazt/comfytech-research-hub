const { initUI, switchTab } = require('./init-ui.js');

const productActions = require('./product-actions.js');
const findingsForm = require('./findings-form.js');
const findingsStorage = require('./findings-storage.js');
const searchButtons = require('./search-buttons.js');
const trendValidation = require('./trend-validation.js');

module.exports = {
    ...productActions,
    ...findingsForm,
    ...findingsStorage,
    ...searchButtons,
    ...trendValidation,
    initUI,
    switchTab
};

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

window.saveFindings = () => findingsStorage.saveFindings(window.productId);
window.addFinding = findingsForm.addFinding;
window.searchGoogle = searchButtons.searchGoogle;
window.searchML = searchButtons.searchML;
window.searchAmazon = searchButtons.searchAmazon;
window.searchImage = searchButtons.searchImage;
window.updateProductStatus = productActions.updateProductStatus;
window.generateAndCopyPrompt = productActions.generateAndCopyPrompt;
window.showEditProductModal = productActions.showEditProductModal;
window.saveTrendValidation = trendValidation.saveTrendValidation;
window.editTrendValidation = trendValidation.editTrendValidation;
window.deleteTrendValidation = trendValidation.deleteTrendValidation;
window.switchTab = switchTab;

// Trend validation search functions
window.searchGoogleTrends = searchButtons.searchGoogleTrends;
window.searchTikTokAds = searchButtons.searchTikTokAds;
window.searchFacebookAds = searchButtons.searchFacebookAds;
window.searchInstagram = searchButtons.searchInstagram;
window.searchYouTube = searchButtons.searchYouTube;