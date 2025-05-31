/**
 * Utility functions for handling product data persistence
 */

// Get current product ID from window object or localStorage
function getCurrentProductId() {
    return window.productId || localStorage.getItem('currentProductId');
}

// Store product ID in both window object and localStorage
function storeProductId(id) {
    if (id) {
        window.productId = id;
        localStorage.setItem('currentProductId', id);
        console.log('💾 [DEBUG] Stored productId:', id);
        return true;
    }
    return false;
}

// Clear stored product ID
function clearProductId() {
    window.productId = null;
    localStorage.removeItem('currentProductId');
    console.log('🗑️ [DEBUG] Cleared productId');
}

module.exports = {
    getCurrentProductId,
    storeProductId,
    clearProductId
};
