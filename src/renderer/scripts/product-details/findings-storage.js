const path = require('path');
const fs = require('fs');
const { ipcRenderer, shell } = require('electron');
const { productsDb } = require('../../../config/paths');
const { getFindingFormHTML, setupTagToggles, addFinding } = require('./findings-form');

function saveFindings(productId) {
    const container = document.getElementById('findings-container');
    const wrappers = container.querySelectorAll('.finding-entry');
    const findings = [];

    wrappers.forEach(wrapper => {
        const inputs = wrapper.querySelectorAll('input, textarea');
        const selects = wrapper.querySelectorAll('select');

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

        // format values and push to findings array
        findings.push({
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
        });
    });

    // Removed check for findings.length === 0

    console.log("🧾 Saving entries:", findings);

    let db = [];
    if (fs.existsSync(productsDb)) {
        db = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
    }

    console.log('🔎 Looking for productId:', productId);
    console.log('🗃️ DB Contents:', db.map(p => p.id));
    const product = db.find(p => String(p.id) === String(productId));
    if (product) {
        if (!Array.isArray(product.findings)) {
            product.findings = [];
        }

        // Remove old entries with the same IDs as the new findings
        findings.forEach(newFinding => {
            const index = product.findings.findIndex(f => f.id === newFinding.id);
            if (index !== -1) {
                product.findings.splice(index, 1); // Remove the old entry
            }
        });

        // Add the new findings
        product.findings = [...product.findings, ...findings];
        fs.writeFileSync(productsDb, JSON.stringify(db, null, 2), 'utf8');
        // alert('✅ Findings saved.');
        container.innerHTML = '';
        addFinding();

        // Re-read and update UI from DB
        const updatedDb = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
        const updatedProduct = updatedDb.find(p => p.id === productId);
        if (updatedProduct && updatedProduct.findings) {
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
    } else {
        alert('⚠️ Product not found.');
    }
}


function renderFindingsList(findingsArr) {
    const findingsList = document.getElementById('findings-list');
    findingsList.innerHTML = '';
    if (!findingsArr || !Array.isArray(findingsArr)) return;
    findingsArr.forEach(finding => {
        const li = document.createElement('li');
        li.innerHTML = `
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
        li.querySelector('a').addEventListener('click', e => {
            e.preventDefault();
            const link = e.target.getAttribute('data-link');
            if (link && link.trim() && link !== 'undefined' && link !== 'null') {
                shell.openExternal(link);
            } else {
                console.warn('No valid link found for this finding');
            }
        });

        findingsList.appendChild(li);
    });
}

// Global functions for edit and delete actions
window.editFinding = function (findingId) {
    const db = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
    const productId = window.productId;
    const product = db.find(p => String(p.id) === String(productId));

    if (!product || !product.findings) return;

    const finding = product.findings.find(f => f.id === findingId);
    if (!finding) return;

    const container = document.getElementById('findings-container');
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.dataset.findingId = finding.id;
    wrapper.innerHTML = getFindingFormHTML();
    wrapper.className = 'finding-entry';

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
        if (select) select.value = value || '';
    });

    container.appendChild(wrapper);
};

window.deleteFinding = function (findingId) {
    if (!confirm('❌ Are you sure you want to delete this finding?')) return;

    console.log('🗑️ Attempting to delete finding with ID:', findingId);

    const productId = window.productId;
    console.log('📦 Product ID from window.productId:', productId);

    const db = JSON.parse(fs.readFileSync(productsDb, 'utf8'));
    const product = db.find(p => String(p.id) === String(productId));

    if (!product) {
        console.error('❌ Product not found with ID:', productId);
        alert('Product not found');
        return;
    }

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

        try {
            fs.writeFileSync(productsDb, JSON.stringify(db, null, 2), 'utf8');
            console.log('💾 Database updated successfully');

            // Update UI immediately with the modified data
            renderFindingsList(product.findings);
            console.log('🔄 UI updated');

        } catch (error) {
            console.error('❌ Error saving to database:', error);
            alert('Error deleting finding: ' + error.message);
        }
    } else {
        console.error('❌ Finding not found with ID:', findingId);
        console.log('Available finding IDs:', product.findings.map(f => f.id));
        alert('Finding not found');
    }
};


module.exports = { saveFindings, renderFindingsList };