// Trend Validation Module
const axios = require('axios');

function getTrendValidationFormHTML() {
  return `
    <form class="trend-validation-form">
      <div class="form-group">
        <label class="field-label">Trend Source</label>
        <select name="trendSource" class="form-control">
          <option value="">Select source...</option>
          <option value="Google Trends">📈 Google Trends</option>
          <option value="Amazon Best Sellers">🏆 Amazon Best Sellers</option>
          <option value="TikTok">📱 TikTok</option>
          <option value="Instagram">📷 Instagram</option>
          <option value="YouTube">📺 YouTube</option>
          <option value="Pinterest">📌 Pinterest</option>
          <option value="Facebook">👥 Facebook</option>
          <option value="Reddit">💬 Reddit</option>
          <option value="Other">🔍 Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Trend Status</label>
        <select name="trendStatus" class="form-control">
          <option value="">Select status...</option>
          <option value="Rising">🚀 Rising</option>
          <option value="Stable">📊 Stable</option>
          <option value="Declining">📉 Declining</option>
          <option value="Seasonal">🌱 Seasonal</option>
          <option value="Unknown">❓ Unknown</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Search Volume</label>
        <select name="searchVolume" class="form-control">
          <option value="">Select volume...</option>
          <option value="High">🔥 High (10K+/month)</option>
          <option value="Medium">⚡ Medium (1K-10K/month)</option>
          <option value="Low">🔸 Low (<1K/month)</option>
          <option value="Unknown">❓ Unknown</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Competition Level</label>
        <select name="competition" class="form-control">
          <option value="">Select level...</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
          <option value="Unknown">❓ Unknown</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="field-label">Target Audience</label>
        <input type="text" name="targetAudience" class="form-control" placeholder="e.g. Young adults, Parents, Tech enthusiasts..." />
      </div>
      
      <div class="form-group">
        <label class="field-label">Keywords</label>
        <input type="text" name="keywords" class="form-control" placeholder="Related keywords, hashtags..." />
      </div>
      
      <div class="form-group">
        <label class="field-label">Research Link</label>
        <input type="text" name="researchLink" class="form-control" placeholder="https://..." />
      </div>
      
      <div class="form-group">
        <label class="field-label">Notes</label>
        <textarea name="trendNotes" class="form-control" rows="3" placeholder="Trend observations, insights, forecasts..."></textarea>
      </div>
    </form>
  `;
}

function addTrendValidationForm() {
  const container = document.getElementById('trend-validation-form-container');

  const wrapper = document.createElement('div');
  wrapper.className = 'trend-validation-entry';

  wrapper.innerHTML = getTrendValidationFormHTML();
  container.appendChild(wrapper);
}

async function saveTrendValidation() {
  const productId = window.productId;
  if (!productId) {
    alert('No product ID found');
    return;
  }

  const container = document.getElementById('trend-validation-form-container');
  const forms = container.querySelectorAll('.trend-validation-form');

  if (forms.length === 0) {
    alert('No trend validation data to save');
    return;
  }

  const trendData = [];

  forms.forEach(form => {
    const formData = new FormData(form);
    const editingId = form.getAttribute('data-editing-id');

    const data = {
      id: editingId || Date.now() + Math.random(),
      trendSource: formData.get('trendSource') || '',
      trendStatus: formData.get('trendStatus') || '',
      searchVolume: formData.get('searchVolume') || '',
      competition: formData.get('competition') || '',
      targetAudience: formData.get('targetAudience') || '',
      keywords: formData.get('keywords') || '',
      researchLink: formData.get('researchLink') || '',
      trendNotes: formData.get('trendNotes') || '',
      dateAdded: editingId ? undefined : new Date().toISOString(),
      isEditing: !!editingId
    };

    const hasData = Object.values(data).some(value =>
      value && value !== '' && value !== data.id && value !== data.dateAdded && value !== data.isEditing
    );

    if (hasData) {
      trendData.push(data);
    }
  });

  if (trendData.length === 0) {
    alert('Please fill in at least one field');
    return;
  }

  try {
    // First, get the current product data
    const response = await axios.get(`http://localhost:3000/products/${productId}`);
    const product = response.data;

    if (!product.trendValidation) {
      product.trendValidation = [];
    }

    // Process each trend data item (handle both new and edited entries)
    trendData.forEach(newTrend => {
      if (newTrend.isEditing) {
        // Update existing entry
        const existingIndex = product.trendValidation.findIndex(t => t.id.toString() === newTrend.id.toString());
        if (existingIndex !== -1) {
          // Preserve the original date
          newTrend.dateAdded = product.trendValidation[existingIndex].dateAdded;
          // Remove the isEditing flag before saving
          delete newTrend.isEditing;
          product.trendValidation[existingIndex] = newTrend;
        }
      } else {
        // Add new entry
        delete newTrend.isEditing;
        product.trendValidation.push(newTrend);
      }
    });

    // Update the product via API
    await axios.put(`http://localhost:3000/products/${productId}`, product);

    // Clear the form and refresh saved data display
    container.innerHTML = '';
    addTrendValidationForm();
    renderSavedTrendValidations(product.trendValidation);

  } catch (error) {
    console.error('Error saving trend validation:', error);
    alert('❌ Error saving trend validation data: ' + (error.response?.data?.message || error.message));
  }
}

// New function to render saved trend validations in the dedicated display area
function renderSavedTrendValidations(trendValidations) {
  if (!trendValidations || trendValidations.length === 0) {
    const container = document.getElementById('saved-trend-validations');
    if (container) {
      container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">No trend data saved yet.</p>';
    }
    // Update count badge
    const countBadge = document.getElementById('trends-count');
    if (countBadge) countBadge.textContent = '0';
    return;
  }

  const container = document.getElementById('saved-trend-validations');
  if (!container) return;

  container.innerHTML = ''; // Clear existing content

  trendValidations.forEach(trend => {
    const item = document.createElement('div');
    item.className = 'trend-validation-item';

    const dateStr = new Date(trend.dateAdded).toLocaleDateString();

    item.innerHTML = `
      <div class="trend-validation-header">
        ${trend.trendSource || 'Unknown Source'} - ${trend.trendStatus || 'Status Unknown'}
      </div>
      <div class="trend-validation-content">
        ${trend.searchVolume ? `📊 Volume: ${trend.searchVolume}<br>` : ''}
        ${trend.competition ? `🎯 Competition: ${trend.competition}<br>` : ''}
        ${trend.targetAudience ? `👥 Audience: ${trend.targetAudience}<br>` : ''}
        ${trend.keywords ? `🔑 Keywords: ${trend.keywords}<br>` : ''}
        ${trend.researchLink ? `<a href="${trend.researchLink}" target="_blank" class="trend-link">🔗 Research Link</a><br>` : ''}
        ${trend.trendNotes ? `📝 ${trend.trendNotes}` : ''}
      </div>
      <div class="trend-validation-meta">
        Added: ${dateStr}
        <div style="float: right;">
          <button class="edit-trend-btn" onclick="editTrendValidation('${trend.id}')" style="background: #e3f2fd; color: #1976d2; border: 1px solid #90caf9; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; margin-right: 4px;">Edit</button>
          <button class="delete-trend-btn" onclick="deleteTrendValidation('${trend.id}')" style="background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Delete</button>
        </div>
      </div>
    `;

    container.appendChild(item);
  });

  // Update count badge
  const countBadge = document.getElementById('trends-count');
  if (countBadge) {
    countBadge.textContent = trendValidations.length.toString();
  }
}

function renderTrendValidationList(trendValidations) {
  if (!trendValidations || trendValidations.length === 0) {
    return;
  }

  const container = document.getElementById('trend-validation-content');

  // Create saved items section
  const savedSection = document.createElement('div');
  savedSection.className = 'saved-trend-validations';
  savedSection.innerHTML = '<h4 style="margin: 0 0 12px 0; font-size: 14px; color: #1976d2;">Saved Trend Data</h4>';

  trendValidations.forEach(trend => {
    const item = document.createElement('div');
    item.className = 'trend-validation-item';

    const dateStr = new Date(trend.dateAdded).toLocaleDateString();

    item.innerHTML = `
      <div class="trend-validation-header">
        ${trend.trendSource || 'Unknown Source'} - ${trend.trendStatus || 'Status Unknown'}
      </div>
      <div class="trend-validation-content">
        ${trend.searchVolume ? `📊 Volume: ${trend.searchVolume}<br>` : ''}
        ${trend.competition ? `🎯 Competition: ${trend.competition}<br>` : ''}
        ${trend.targetAudience ? `👥 Audience: ${trend.targetAudience}<br>` : ''}
        ${trend.keywords ? `🔑 Keywords: ${trend.keywords}<br>` : ''}
        ${trend.researchLink ? `<a href="${trend.researchLink}" target="_blank" class="trend-link">🔗 Research Link</a><br>` : ''}
        ${trend.trendNotes ? `📝 ${trend.trendNotes}` : ''}
      </div>
      <div class="trend-validation-meta">
        Added: ${dateStr}
        <div style="float: right;">
          <button class="edit-trend-btn" onclick="editTrendValidation('${trend.id}')" style="background: #e3f2fd; color: #1976d2; border: 1px solid #90caf9; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer; margin-right: 4px;">Edit</button>
          <button class="delete-trend-btn" onclick="deleteTrendValidation('${trend.id}')" style="background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; padding: 2px 6px; border-radius: 3px; font-size: 11px; cursor: pointer;">Delete</button>
        </div>
      </div>
    `;

    savedSection.appendChild(item);
  });

  // Insert saved section at the top of the container
  container.insertBefore(savedSection, container.firstChild);
}

async function editTrendValidation(trendId) {
  const productId = window.productId;
  if (!productId) return;

  try {
    const response = await axios.get(`http://localhost:3000/products/${productId}`);
    const product = response.data;

    if (!product || !product.trendValidation) {
      alert('Product or trend validation data not found');
      return;
    }

    const trend = product.trendValidation.find(t => t.id.toString() === trendId.toString());
    if (!trend) {
      alert('Trend validation data not found');
      return;
    }

    // Import modal functions
    const { openTrendsModal } = require('./modal-functions');

    // Open the trends modal
    openTrendsModal();

    // Wait for modal to be fully rendered, then pre-populate with existing data
    setTimeout(() => {
      const modalContainer = document.getElementById('trends-modal-container');
      const wrapper = modalContainer.querySelector('.trend-validation-entry');

      if (!wrapper) {
        console.error('Modal wrapper not found');
        return;
      }

      const form = wrapper.querySelector('.trend-validation-form');
      if (!form) {
        console.error('Modal form not found');
        return;
      }

      // Store the trend ID for editing
      form.setAttribute('data-editing-id', trendId);

      // Populate the form with existing data
      form.querySelector('[name="trendSource"]').value = trend.trendSource || '';
      form.querySelector('[name="trendStatus"]').value = trend.trendStatus || '';
      form.querySelector('[name="searchVolume"]').value = trend.searchVolume || '';
      form.querySelector('[name="competition"]').value = trend.competition || '';
      form.querySelector('[name="targetAudience"]').value = trend.targetAudience || '';
      form.querySelector('[name="keywords"]').value = trend.keywords || '';
      form.querySelector('[name="researchLink"]').value = trend.researchLink || '';
      form.querySelector('[name="trendNotes"]').value = trend.trendNotes || '';

      // Update modal title to indicate editing
      const modalHeader = document.querySelector('#trendsModal .modal-header h3');
      if (modalHeader) {
        modalHeader.textContent = 'Edit Trend Analysis';
      }

      // Focus on first input
      const firstInput = form.querySelector('select, input');
      if (firstInput) firstInput.focus();

    }, 100);

  } catch (error) {
    console.error('Error editing trend validation:', error);
    alert('❌ Error loading trend validation data for editing: ' + (error.response?.data?.message || error.message));
  }
}

async function deleteTrendValidation(trendId) {
  if (!confirm('Are you sure you want to delete this trend validation data?')) {
    return;
  }

  const productId = window.productId;
  if (!productId) return;

  try {
    // Get current product data
    const response = await axios.get(`http://localhost:3000/products/${productId}`);
    const product = response.data;

    if (product && product.trendValidation) {
      product.trendValidation = product.trendValidation.filter(t => t.id.toString() !== trendId.toString());

      // Update the product via API
      await axios.put(`http://localhost:3000/products/${productId}`, product);

      // Refresh the saved trend validation display
      renderSavedTrendValidations(product.trendValidation);
    }
  } catch (error) {
    console.error('Error deleting trend validation:', error);
    alert('❌ Error deleting trend validation data: ' + (error.response?.data?.message || error.message));
  }
}

module.exports = {
  getTrendValidationFormHTML,
  addTrendValidationForm,
  saveTrendValidation,
  renderTrendValidationList,
  renderSavedTrendValidations,
  editTrendValidation,
  deleteTrendValidation
};
