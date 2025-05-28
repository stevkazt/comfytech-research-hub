function getFindingFormHTML() {
  return `
    <form class="finding-form">
      <div class="form-group">
        <label class="field-label">Price</label>
        <input type="text" name="price" class="form-control" placeholder="e.g. $24.99" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Match Type</label>
        <select name="match" class="form-control">
          <option value="">Select...</option>
          <option value="exact">✅ Exact Match</option>
          <option value="similar">🔍 Similar</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Store Name</label>
        <input type="text" name="store" class="form-control" placeholder="e.g. Shop ABC" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Stock</label>
        <select name="stock" class="form-control">
          <option value="">Select...</option>
          <option value="In Stock">📦 In Stock</option>
          <option value="Out of Stock">❌ Out of Stock</option>
          <option value="Limited">⚠️ Limited</option>
          <option value="Custom">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Product Name Variant</label>
        <input type="text" name="variant" class="form-control" placeholder="Product variation name..." />
      </div>
      
      <div class="form-group">
        <label class="field-label">Store Link</label>
        <input type="text" name="link" class="form-control" placeholder="https://..." />
      </div>
      
      <div class="form-group">
        <label class="field-label">Rating (1-5)</label>
        <input type="text" name="rating" class="form-control" placeholder="e.g. 4.5" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Review Count</label>
        <input type="text" name="review_count" class="form-control" placeholder="e.g. 123 reviews" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Origin</label>
        <select name="origin" class="form-control">
          <option value="">Select...</option>
          <option value="China">🇨🇳 China</option>
          <option value="USA">🇺🇸 USA</option>
          <option value="Local">🏠 Local</option>
          <option value="Custom">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Delivery Time</label>
        <input type="text" name="deliveryTime" class="form-control" placeholder="e.g. 2-5 business days" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Shipping Cost</label>
        <input type="text" name="shippingCost" class="form-control" placeholder="e.g. $5.99" />
      </div>
      
      <div class="form-group">
        <label class="field-label">Seller Type</label>
        <select name="sellerType" class="form-control">
          <option value="">Select...</option>
          <option value="Official Store">🏪 Official Store</option>
          <option value="Third-party">👤 Third-party</option>
          <option value="Unknown">❓ Unknown</option>
          <option value="Custom">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Listing Type</label>
        <select name="listingType" class="form-control">
          <option value="">Select...</option>
          <option value="Amazon">📦 Amazon</option>
          <option value="Shopify">🛍️ Shopify</option>
          <option value="eBay">🔨 eBay</option>
          <option value="Mercado Libre">🛒 Mercado Libre</option>
          <option value="Exito">🏬 Éxito</option>
          <option value="Falabella">🏢 Falabella</option>
          <option value="Temu">🌟 Temu</option>
          <option value="TikTok">📱 TikTok</option>
          <option value="Facebook">👥 Facebook</option>
          <option value="Custom">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Badges</label>
        <select name="badges" class="form-control">
          <option value="">Select...</option>
          <option value="Bestseller">🏆 Bestseller</option>
          <option value="Free returns">↩️ Free returns</option>
          <option value="None">⭕ None</option>
          <option value="Custom">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Image Quality</label>
        <select name="imageQuality" class="form-control">
          <option value="">Select...</option>
          <option value="high">🖼️ High</option>
          <option value="low">📷 Low</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Image Match</label>
        <select name="imageMatch" class="form-control">
          <option value="">Select...</option>
          <option value="same">📸 Same</option>
          <option value="original">🆕 Original</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Notes</label>
        <textarea name="notes" class="form-control" rows="3" placeholder="Observations..."></textarea>
      </div>
    </form>
  `;
}

function addFinding() {
  const container = document.getElementById('findings-container');

  const wrapper = document.createElement('div');
  wrapper.className = 'finding-entry';

  wrapper.innerHTML = getFindingFormHTML();
  container.appendChild(wrapper);
}


module.exports = { getFindingFormHTML, addFinding };