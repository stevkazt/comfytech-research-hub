const { ipcRenderer, clipboard } = require('electron');
const axios = require('axios');
const productToPrompt = require('../../../services/prompt-generation/autoPromptGenerator');

async function updateDetails() {
    try {
        await ipcRenderer.invoke('update-product-details', productId);

        // Reload product data from the API
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const updatedProduct = response.data;

        if (updatedProduct) {
            // Update the slider with new images
            const slider = document.getElementById('image-slider');
            slider.innerHTML = '';
            const images = Array.isArray(updatedProduct.images) && updatedProduct.images.length
                ? updatedProduct.images
                : [updatedProduct.image];
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
    } catch (error) {
        alert('❌ Failed to update: ' + (error.response?.data?.message || error.message));
    }
}

async function updateProductStatus(status) {
    try {
        // Get current product data first
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;

        // Update only the status field
        product.status = status;

        // Send the updated product back
        await axios.put(`http://localhost:3000/products/${productId}`, product);

    } catch (error) {
        alert('❌ Failed to update status: ' + (error.response?.data?.message || error.message));
    }
}

async function generateAndCopyPrompt() {
    try {
        console.log('🤖 Generating AI prompt...');

        // Validate that productId is available
        if (!window.productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }

        // Get current product data from the API
        const response = await axios.get(`http://localhost:3000/products/${window.productId}`);
        const product = response.data;

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
        alert('❌ Error generating prompt: ' + (error.response?.data?.message || error.message));
    }
}

module.exports = { updateDetails, updateProductStatus, generateAndCopyPrompt };