const { ipcRenderer, shell } = require('electron');
const axios = require('axios');
const { getFindingFormHTML } = require('./findings-form');

async function saveFindings(productId) {
    const container = document.getElementById('findings-container');
    const wrappers = container.querySelectorAll('.finding-entry');
    const findings = [];

    wrappers.forEach(wrapper => {
        // Debug: Log the finding ID being processed
        console.log('🔍 [DEBUG] Processing wrapper with finding ID:', wrapper.dataset.findingId);

        // Use optional chaining and fallback for all value accesses
        const price = wrapper.querySelector('input[name="price"]')?.value?.replace(/[^\d.]/g, '')?.trim() || '';
        const match = wrapper.querySelector('select[name="match"]')?.value || '';
        const store = wrapper.querySelector('input[name="store"]')?.value?.trim() || '';
        const stock = wrapper.querySelector('select[name="stock"]')?.value || '';
        const variant = wrapper.querySelector('input[name="variant"]')?.value?.trim() || '';
        const link = wrapper.querySelector('input[name="link"]')?.value?.trim() || '';
        const rating = wrapper.querySelector('input[name="rating"]')?.value?.trim() || '';
        const review_count = wrapper.querySelector('input[name="review_count"]')?.value?.trim() || '';
        const origin = wrapper.querySelector('select[name="origin"]')?.value || '';
        const deliveryTime = wrapper.querySelector('input[name="deliveryTime"]')?.value?.trim() || '';
        const shippingCost = wrapper.querySelector('input[name="shippingCost"]')?.value?.trim() || '';
        const sellerType = wrapper.querySelector('select[name="sellerType"]')?.value || '';
        const listingType = wrapper.querySelector('select[name="listingType"]')?.value || '';
        const badges = wrapper.querySelector('select[name="badges"]')?.value || '';
        const notes = wrapper.querySelector('textarea[name="notes"]')?.value?.trim() || '';
        const imageQuality = wrapper.querySelector('select[name="imageQuality"]')?.value || '';
        const imageMatch = wrapper.querySelector('select[name="imageMatch"]')?.value || '';

        // Debug: Log the extracted select values
        console.log('🔍 [DEBUG] Extracted select values:', {
            match,
            stock,
            origin,
            sellerType,
            listingType,
            badges,
            imageQuality,
            imageMatch
        });

        // format values and push to findings array
        const findingData = {
            id: wrapper.dataset.findingId || `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            price,
            match,
            store,
            stock,
            variant,
            link,
            rating,
            review_count,
            origin,
            deliveryTime,
            shippingCost,
            sellerType,
            listingType,
            badges,
            notes,
            imageQuality,
            imageMatch
        };

        // Debug: Log the complete finding data
        console.log('🔍 [DEBUG] Finding data created:', findingData);

        findings.push(findingData);
    });

    console.log("🧾 Saving entries:", findings);

    try {
        // Get current product data from API
        const response = await axios.get(`https://dropi-research-api.onrender.com/products/${productId}`);
        const product = response.data;        // CRITICAL FIX: Ensure findings is always an array
        if (!Array.isArray(product.findings)) {
            console.log('🔧 [DEBUG] Converting findings from object to array');

            // If it's an object with data, try to preserve it
            if (product.findings && typeof product.findings === 'object' && Object.keys(product.findings).length > 0) {
                // Convert object to array format if it has meaningful data
                product.findings = [product.findings];
            } else {
                // Initialize as empty array
                product.findings = [];
            }
        }

        // CRITICAL FIX: Ensure trendValidation is always an array
        if (!Array.isArray(product.trendValidation)) {
            console.log('🔧 [DEBUG] Converting trendValidation from object to array');

            // If it's an object with data, try to preserve it
            if (product.trendValidation && typeof product.trendValidation === 'object' && Object.keys(product.trendValidation).length > 0) {
                // Convert object to array format if it has meaningful data
                product.trendValidation = [product.trendValidation];
            } else {
                // Initialize as empty array
                product.trendValidation = [];
            }
        }

        // Remove old entries with the same IDs as the new findings
        findings.forEach(newFinding => {
            const index = product.findings.findIndex(f => f.id === newFinding.id);
            console.log(`🔍 [DEBUG] Looking for existing finding with ID: ${newFinding.id}, found at index: ${index}`);
            if (index !== -1) {
                console.log(`🔍 [DEBUG] Removing old finding at index ${index}:`, product.findings[index]);
                product.findings.splice(index, 1); // Remove the old entry
            }
        });

        // Add the new findings
        console.log('🔍 [DEBUG] Adding new findings:', findings);
        product.findings = [...product.findings, ...findings];

        // Update the product via API
        console.log('🔍 [DEBUG] About to update product via API with data:', product);
        await axios.put(`https://dropi-research-api.onrender.com/products/${productId}`, product);
        console.log('✅ [DEBUG] Product updated successfully via API');

        container.innerHTML = '';

        // Re-read and update UI from API
        console.log('🔍 [DEBUG] Re-fetching product data to refresh UI...');
        const updatedResponse = await axios.get(`https://dropi-research-api.onrender.com/products/${productId}`);
        const updatedProduct = updatedResponse.data;
        console.log('✅ [DEBUG] Refreshed product data:', updatedProduct);

        if (updatedProduct && updatedProduct.findings) {
            console.log('🔍 [DEBUG] About to render findings list with:', updatedProduct.findings);
            renderFindingsList(updatedProduct.findings);
            // Update images if they changed
            if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
                const slider = document.getElementById('image-slider');
                slider.innerHTML = '';
                updatedProduct.images.forEach((src, index) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${updatedProduct.name || 'Producto'} ${index + 1}`;
                    slider.appendChild(img);
                });
            }
        }
    } catch (error) {
        console.error('Error saving findings:', error);

        // Log detailed error information for debugging
        if (error.response) {
            console.error('🔍 [DEBUG] API Error Response Status:', error.response.status);
            console.error('🔍 [DEBUG] API Error Response Data:', error.response.data);
            console.error('🔍 [DEBUG] API Error Response Headers:', error.response.headers);

            // ENHANCED: Log the specific validation errors
            if (error.response.data && error.response.data.details) {
                console.error('🔍 [DEBUG] Validation Details:', error.response.data.details);
                error.response.data.details.forEach((detail, index) => {
                    console.error(`🔍 [DEBUG] Validation Error ${index + 1}:`, JSON.stringify(detail, null, 2));
                });
            }

            // ENHANCED: Log the request data that caused the error
            if (error.config && error.config.data) {
                console.error('🔍 [DEBUG] Request Data that caused error:', error.config.data);
            }
        }

        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        alert('❌ Error saving findings: ' + errorMessage);
    }
}


function renderFindingsList(findingsArr) {
    console.log('🔍 [DEBUG] renderFindingsList called with:', findingsArr);
    const findingsList = document.getElementById('findings-list');
    findingsList.innerHTML = '';

    // CRITICAL FIX: Handle both object and array inputs
    let findings = findingsArr;

    if (!Array.isArray(findingsArr)) {
        if (findingsArr && typeof findingsArr === 'object' && Object.keys(findingsArr).length > 0) {
            console.log('🔧 [DEBUG] Converting findings object to array for rendering');
            findings = [findingsArr];
        } else {
            console.log('🔍 [DEBUG] No findings array provided or empty');
            const countBadge = document.getElementById('findings-count');
            if (countBadge) countBadge.textContent = '0';
            return;
        }
    }

    if (!findings || findings.length === 0) {
        console.log('🔍 [DEBUG] No findings to render');
        const countBadge = document.getElementById('findings-count');
        if (countBadge) countBadge.textContent = '0';
        return;
    }

    console.log('🔍 [DEBUG] Rendering', findings.length, 'findings');
    findings.forEach(finding => {
        const div = document.createElement('div');
        div.className = 'finding-item';
        div.innerHTML = `
        <div class="finding-header">
          <div class="finding-title-row">
            <div class="finding-store-info">
              <span class="finding-price">$${finding.price}</span>
              ${finding.match ? `<span class="finding-match" data-match="${finding.match.toLowerCase()}">${finding.match}</span>` : ''}
            </div>
            <a href="#" class="finding-link" data-link="${finding.link}">
              ${finding.store ? `🏪 ${finding.store}` : 'Store: N/A'}
            </a>
          </div>
        </div>
        <div class="finding-content">
          ${finding.rating ? `⭐ Rating: ${finding.rating} ${finding.review_count ? `(${finding.review_count} reviews)` : ''}<br>` : ''}
          ${finding.stock ? `📦 Stock: ${finding.stock}<br>` : ''}
          ${finding.origin ? `🌍 Origin: ${finding.origin}<br>` : ''}
          ${finding.deliveryTime ? `🚚 Delivery: ${finding.deliveryTime}<br>` : ''}
          ${finding.shippingCost ? `💸 Shipping: ${finding.shippingCost}<br>` : ''}
          ${finding.variant ? `🔖 Variant: ${finding.variant}<br>` : ''}
          ${finding.sellerType ? `👤 Seller: ${finding.sellerType}<br>` : ''}
          ${finding.listingType ? `🏷️ Platform: ${finding.listingType}<br>` : ''}
          ${finding.badges ? `🏆 Badges: ${finding.badges}<br>` : ''}
          ${finding.imageMatch ? `📸 Image Match: ${finding.imageMatch}<br>` : ''}
          ${finding.imageQuality ? `🖼️ Image Quality: ${finding.imageQuality}<br>` : ''}
          ${finding.notes ? `📝 ${finding.notes}` : ''}
        </div>
        <div class="finding-meta">
          <div style="float: right;">
            <button class="edit-finding-btn" onclick="editFinding('${finding.id}')" style="background: #e3f2fd; color: #1976d2; border: 1px solid #90caf9; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; margin-right: 4px;">Edit</button>
            <button class="delete-finding-btn" onclick="deleteFinding('${finding.id}')" style="background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Delete</button>
          </div>
        </div>
      `;
        div.querySelector('a').addEventListener('click', e => {
            e.preventDefault();
            const link = e.target.getAttribute('data-link');
            if (link && link.trim() && link !== 'undefined' && link !== 'null') {
                shell.openExternal(link);
            } else {
                console.warn('No valid link found for this finding');
            }
        });

        findingsList.appendChild(div);
    });

    // Update count badge
    const countBadge = document.getElementById('findings-count');
    if (countBadge) {
        countBadge.textContent = findings.length.toString();
    }
}

// Global functions for edit and delete actions
window.editFinding = async function (findingId) {
    try {
        const response = await axios.get(`https://dropi-research-api.onrender.com/products/${window.productId}`);
        const product = response.data;

        if (!product || !product.findings) return;

        const finding = product.findings.find(f => f.id === findingId);
        if (!finding) return;

        // Import modal functions
        const { openFindingsModal } = require('./modal-functions');
        const { closeFindingsListModal } = require('./research-counters');

        // Close the findings list modal first
        closeFindingsListModal();

        // Open the findings modal
        openFindingsModal();

        // Wait for modal to be fully rendered, then pre-populate with existing data
        setTimeout(() => {
            const modalContainer = document.getElementById('findings-modal-container');
            const wrapper = modalContainer.querySelector('.finding-entry');

            if (!wrapper) {
                console.error('Modal wrapper not found');
                return;
            }

            // Store the finding ID for editing
            wrapper.dataset.findingId = finding.id;

            // Pre-fill input fields
            const preFillInputs = {
                price: finding.price,
                store: finding.store,
                variant: finding.variant,
                link: finding.link,
                rating: finding.rating,
                review_count: finding.review_count,
                deliveryTime: finding.deliveryTime,
                shippingCost: finding.shippingCost
            };

            Object.entries(preFillInputs).forEach(([name, value]) => {
                const input = wrapper.querySelector(`input[name="${name}"]`);
                if (input) input.value = value || '';
            });

            const notesTextarea = wrapper.querySelector('textarea[name="notes"]');
            if (notesTextarea) notesTextarea.value = finding.notes || '';

            const selectFields = {
                match: finding.match,
                stock: finding.stock,
                origin: finding.origin,
                sellerType: finding.sellerType,
                listingType: finding.listingType,
                badges: finding.badges,
                imageQuality: finding.imageQuality,
                imageMatch: finding.imageMatch
            };

            Object.entries(selectFields).forEach(([name, value]) => {
                const select = wrapper.querySelector(`select[name="${name}"]`);
                if (select) {
                    console.log(`🔍 [DEBUG] Setting select field ${name} to value: "${value}"`);
                    select.value = value || '';
                    // Verify the value was set
                    console.log(`🔍 [DEBUG] Select field ${name} now has value: "${select.value}"`);
                } else {
                    console.warn(`🔍 [DEBUG] Select field ${name} not found in wrapper`);
                }
            });

            // Update modal title to indicate editing
            const modalHeader = document.querySelector('#findingsModal .modal-header h3');
            if (modalHeader) {
                modalHeader.textContent = 'Edit Research Finding';
            }

            // Focus on first input
            const firstInput = wrapper.querySelector('input');
            if (firstInput) firstInput.focus();

        }, 100);

    } catch (error) {
        console.error('Error editing finding:', error);
        alert('❌ Error loading finding for editing: ' + (error.response?.data?.message || error.message));
    }
};

window.deleteFinding = async function (findingId) {
    if (!confirm('❌ Are you sure you want to delete this finding?')) return;

    console.log('🗑️ Attempting to delete finding with ID:', findingId);

    const productId = window.productId;
    console.log('📦 Product ID from window.productId:', productId);

    try {
        // Get current product data from API
        const response = await axios.get(`https://dropi-research-api.onrender.com/products/${productId}`);
        const product = response.data;

        if (!Array.isArray(product.findings)) {
            console.error('❌ Product has no findings array');
            alert('No findings found for this product');
            return;
        }

        console.log('📋 Current findings:', product.findings.map(f => ({ id: f.id, store: f.store })));

        const index = product.findings.findIndex(f => String(f.id) === String(findingId));
        console.log('🔍 Finding index:', index);

        if (index !== -1) {
            console.log('✅ Found finding at index:', index);
            product.findings.splice(index, 1);
            console.log('📋 Remaining findings:', product.findings.length);

            // Update the product via API
            await axios.put(`https://dropi-research-api.onrender.com/products/${productId}`, product);
            console.log('💾 Database updated successfully');

            // Update UI immediately with the modified data
            renderFindingsList(product.findings);
            console.log('🔄 UI updated');

        } else {
            console.error('❌ Finding not found with ID:', findingId);
            console.log('Available finding IDs:', product.findings.map(f => f.id));
            alert('Finding not found');
        }
    } catch (error) {
        console.error('❌ Error deleting finding:', error);
        alert('❌ Error deleting finding: ' + (error.response?.data?.message || error.message));
    }
};

module.exports = { saveFindings, renderFindingsList };