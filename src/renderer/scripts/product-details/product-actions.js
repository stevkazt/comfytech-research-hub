const { clipboard } = require('electron');
const axios = require('axios');
const productToPrompt = require('../../../services/prompt-generation/autoPromptGenerator');

// Removed updateDetails function as it relied on scraping functionality

async function updateProductStatus(status) {
    try {
        // Get productId from window object or localStorage fallback
        const productId = window.productId || localStorage.getItem('currentProductId');

        if (!productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }

        console.log('🔄 [DEBUG] Updating status for product ID:', productId, 'Type:', typeof productId, 'Status:', status);

        // Get current product data first
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;
        console.log('📋 [DEBUG] Current product data:', product);

        // Update only the status field
        product.status = status;

        console.log('💾 [DEBUG] Updating product with status:', status);
        // Send the updated product back
        await axios.put(`http://localhost:3000/products/${productId}`, product);
        console.log('✅ [DEBUG] Status updated successfully');

    } catch (error) {
        console.error('❌ [DEBUG] Failed to update status:', error);
        alert('❌ Failed to update status: ' + (error.response?.data?.message || error.message));
    }
}

async function generateAndCopyPrompt() {
    try {
        // Get productId from window object or localStorage fallback
        const productId = window.productId || localStorage.getItem('currentProductId');

        console.log('🤖 [DEBUG] Generating AI prompt for product ID:', productId);

        // Validate that productId is available
        if (!productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }

        console.log('📡 [DEBUG] Fetching product data from API...');
        // Get current product data from the API
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;

        console.log('📋 [DEBUG] Found product:', product.name, 'ID:', product.id);

        // Generate the prompt using the autoPromptGenerator
        const prompt = productToPrompt(product);

        console.log('✅ [DEBUG] Prompt generated, length:', prompt.length);

        // Copy to clipboard
        clipboard.writeText(prompt);

        console.log('📋 [DEBUG] Prompt copied to clipboard');

        // Show success alert
        alert('✅ AI prompt generated and copied to clipboard!\n\nYou can now paste it into your AI assistant (ChatGPT, Claude, etc.).');

    } catch (error) {
        console.error('❌ Error generating prompt:', error);
        alert('❌ Error generating prompt: ' + (error.response?.data?.message || error.message));
    }
}

// Function to show edit product modal
async function showEditProductModal() {
    try {
        // Get productId from window object or localStorage fallback
        const productId = window.productId || localStorage.getItem('currentProductId');

        console.log('✏️ [DEBUG] Opening edit modal for product ID:', productId);

        if (!productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }

        // Get current product data
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;

        console.log('📋 [DEBUG] Current product data:', product);

        return new Promise((resolve) => {
            // Create modal HTML with current product data
            const modalHTML = `
                <div id="editProductModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-width: 90vw; max-height: 90vh; overflow-y: auto;">
                        <h2 style="margin-top: 0; color: #333;">Edit Product</h2>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Product Name *</label>
                            <input type="text" id="editProductName" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${product.name || ''}" required>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Price</label>
                            <input type="text" id="editProductPrice" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${product.price || ''}" placeholder="$0.00">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Categories</label>
                            <input type="text" id="editProductCategories" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${product.categories || ''}" placeholder="Electronics, Home, etc.">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Image URLs</label>
                            <div id="editImageInputs">
                                ${(product.images && product.images.length ? product.images : [product.image || '']).map((img, index) => `
                                    <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                                        <input type="text" class="edit-image-input" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${img || ''}" placeholder="https://example.com/image.jpg">
                                        <button type="button" onclick="removeEditImageInput(this)" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" id="addEditImageBtn" style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px;">+ Add Image</button>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description</label>
                            <textarea id="editProductDescription" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; height: 80px; resize: vertical;" placeholder="Product description">${product.description_html || product.description || ''}</textarea>
                        </div>
                        
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button id="editCancelBtn" style="padding: 10px 20px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                            <button id="editSaveBtn" style="padding: 10px 20px; border: none; background: #4caf50; color: white; border-radius: 4px; cursor: pointer;">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const modal = document.getElementById('editProductModal');
            const nameInput = document.getElementById('editProductName');
            const priceInput = document.getElementById('editProductPrice');
            const categoriesInput = document.getElementById('editProductCategories');
            const descriptionInput = document.getElementById('editProductDescription');
            const cancelBtn = document.getElementById('editCancelBtn');
            const saveBtn = document.getElementById('editSaveBtn');
            const addImageBtn = document.getElementById('addEditImageBtn');

            // Focus on name input
            nameInput.focus();

            // Add image button functionality
            addImageBtn.addEventListener('click', () => {
                const imageInputs = document.getElementById('editImageInputs');
                const newInputDiv = document.createElement('div');
                newInputDiv.style.cssText = 'display: flex; gap: 5px; margin-bottom: 5px;';
                newInputDiv.innerHTML = `
                    <input type="text" class="edit-image-input" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="https://example.com/image.jpg">
                    <button type="button" onclick="removeEditImageInput(this)" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
                `;
                imageInputs.appendChild(newInputDiv);
            });

            // Helper function to remove image input
            window.removeEditImageInput = (button) => {
                const container = button.parentNode;
                const imageInputs = document.getElementById('editImageInputs');
                if (imageInputs.children.length > 1) {
                    container.remove();
                } else {
                    alert('Must keep at least one image field');
                }
            };

            // Handle cancel
            const closeModal = () => {
                modal.remove();
                delete window.removeEditImageInput;
                resolve(null);
            };

            cancelBtn.addEventListener('click', closeModal);

            // Handle click outside modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    closeModal();
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Handle save
            saveBtn.addEventListener('click', async () => {
                const name = nameInput.value.trim();

                if (!name) {
                    alert('Please enter a product name');
                    nameInput.focus();
                    return;
                }

                // Collect image URLs
                const imageInputs = document.querySelectorAll('.edit-image-input');
                const images = Array.from(imageInputs)
                    .map(input => input.value.trim())
                    .filter(url => url.length > 0);

                const updatedProduct = {
                    ...product, // Keep existing data
                    name: name,
                    price: priceInput.value.trim(),
                    categories: categoriesInput.value.trim(),
                    images: images,
                    image: images.length > 0 ? images[0] : product.image, // Set main image to first image
                    description_html: descriptionInput.value.trim(),
                    description: descriptionInput.value.trim()
                };

                console.log('💾 [DEBUG] Updating product with data:', updatedProduct);

                try {
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Saving...';

                    // Use IPC handler for updating product
                    const { ipcRenderer } = require('electron');
                    const updateResponse = await ipcRenderer.invoke('update-product-details', window.productId, updatedProduct);
                    console.log('✅ [DEBUG] Product updated successfully:', updateResponse);

                    document.removeEventListener('keydown', handleEscape);
                    modal.remove();
                    delete window.removeEditImageInput;
                    resolve(updateResponse);

                    // Refresh the product display by re-fetching from API and re-rendering
                    console.log('🔄 [DEBUG] Refreshing product display...');
                    try {
                        const refreshResponse = await axios.get(`http://localhost:3000/products/${window.productId}`);
                        const updatedProductData = refreshResponse.data;
                        console.log('📋 [DEBUG] Refreshed product data:', updatedProductData);

                        // Import and call the renderProduct function from init-ui.js to properly refresh all elements
                        const { renderProduct } = require('./init-ui');
                        renderProduct(updatedProductData);

                        console.log('✅ [DEBUG] Product display refreshed successfully using renderProduct');
                    } catch (refreshError) {
                        console.error('❌ [DEBUG] Error refreshing product display:', refreshError);
                    }
                } catch (error) {
                    console.error('❌ [DEBUG] Error updating product:', error);
                    alert('❌ Error updating product: ' + error.message);
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Changes';
                }
            });
        });
    } catch (error) {
        console.error('❌ [DEBUG] Error opening edit modal:', error);
        alert('❌ Error loading product data: ' + (error.response?.data?.message || error.message));
    }
}

async function deleteProduct() {
    try {
        // Get productId from window object or localStorage fallback
        const productId = window.productId || localStorage.getItem('currentProductId');

        if (!productId) {
            alert('❌ No product ID found. Please refresh the page.');
            return;
        }

        // Show confirmation dialog with product name
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = response.data;
        const productName = product.name || 'this product';

        const isConfirmed = confirm(`❗️ WARNING: Are you sure you want to permanently delete "${productName}"?\n\nThis action cannot be undone.`);

        if (!isConfirmed) {
            return; // User cancelled
        }

        console.log('🗑️ [DEBUG] Deleting product ID:', productId);

        // Delete the product via API
        await axios.delete(`http://localhost:3000/products/${productId}`);

        // Show success notification
        alert(`✅ Product "${productName}" has been deleted successfully.`);

        // Close the window or navigate back
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('close-product-details');

    } catch (error) {
        console.error('❌ [DEBUG] Error deleting product:', error);
        alert('❌ Error deleting product: ' + (error.response?.data?.message || error.message));
    }
}

module.exports = { updateProductStatus, generateAndCopyPrompt, showEditProductModal, deleteProduct };