const path = require('path');
const fs = require('fs');
const { ipcRenderer, clipboard } = require('electron');
const { productsDb } = require('../../../config/paths');
const productToPrompt = require('../../../services/prompt-generation/autoPromptGenerator');

function updateDetails() {
    ipcRenderer.invoke('update-product-details', productId)
        .then(() => {
            // alert('✅ Product details updated successfully.');

            // Reload product data from the database
            const db = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
            const updatedProduct = db.find(p => p.id === productId);

            if (updatedProduct) {
                // Update the slider with new images
                const slider = document.getElementById('image-slider');
                slider.innerHTML = ''; // Clear existing images
                const images = Array.isArray(updatedProduct.images) && updatedProduct.images.length
                    ? updatedProduct.images
                    : [updatedProduct.image]; // Fallback to single image if no array
                images.forEach((src, index) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${updatedProduct.name || 'Producto'} ${index + 1}`;
                    slider.appendChild(img);
                });

                // Optionally update other product details in the UI
                document.getElementById('title').textContent = updatedProduct.name || 'Sin título';
                document.getElementById('price').textContent = updatedProduct.price || 'N/A';
            }
        })
        .catch(err => {
            alert('❌ Failed to update: ' + err.message);
        });
}

function updateProductStatus(status) {
    ipcRenderer.invoke('update-product-status', productId, status)
        .then(() => {
            // alert(`✅ Status updated to "${status}".`);
        })
        .catch(err => {
            alert('❌ Failed to update status: ' + err.message);
        });
}

function generateAndCopyPrompt() {
    try {
        console.log('🤖 Generating AI prompt...');
        
        // Validate that productId is available
        if (!window.productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }
        
        // Get current product data from the database
        const db = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
        const product = db.find(p => p.id === window.productId);
        
        if (!product) {
            alert('❌ Product not found in database');
            return;
        }
        
        console.log('📋 Found product:', product.name);
        
        // Generate the prompt using the autoPromptGenerator
        const prompt = productToPrompt(product);
        
        console.log('✅ Prompt generated, length:', prompt.length);
        
        // Copy to clipboard
        clipboard.writeText(prompt);
        
        console.log('📋 Prompt copied to clipboard');
        
        // Show success alert
        alert('✅ AI prompt generated and copied to clipboard!\n\nYou can now paste it into your AI assistant (ChatGPT, Claude, etc.).');
        
    } catch (error) {
        console.error('❌ Error generating prompt:', error);
        alert('❌ Error generating prompt: ' + error.message);
    }
}

module.exports = { updateDetails, updateProductStatus, generateAndCopyPrompt };