// Modal Functions for Research Forms
const { getFindingFormHTML } = require('./findings-form');
const { getTrendValidationFormHTML } = require('./trend-validation');
const { saveFindings } = require('./findings-storage');
const { saveTrendValidation } = require('./trend-validation');

// Findings Modal Functions
function openFindingsModal() {
    const modal = document.getElementById('findingsModal');
    const container = document.getElementById('findings-modal-container');
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create a form wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'finding-entry modal-form-entry';
    wrapper.innerHTML = getFindingFormHTML();
    
    container.appendChild(wrapper);
    
    // Show modal
    modal.classList.add('active');
    
    // Focus on first input
    const firstInput = wrapper.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFindingsModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Handle click outside modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFindingsModal();
        }
    });
}

function closeFindingsModal() {
    const modal = document.getElementById('findingsModal');
    modal.classList.remove('active');
    
    // Reset modal title
    const modalHeader = document.querySelector('#findingsModal .modal-header h3');
    if (modalHeader) {
        modalHeader.textContent = 'Add Research Finding';
    }
    
    // Clear container
    const container = document.getElementById('findings-modal-container');
    container.innerHTML = '';
}

async function saveFindingsFromModal() {
    try {
        const productId = window.productId;
        if (!productId) {
            alert('❌ No product ID found');
            return;
        }
        
        // Get form data from modal
        const modalContainer = document.getElementById('findings-modal-container');
        const formWrapper = modalContainer.querySelector('.finding-entry');
        
        if (!formWrapper) {
            alert('❌ No form data found');
            return;
        }
        
        // Debug: Check if finding ID exists in modal
        console.log('🔍 [DEBUG] Modal form wrapper finding ID:', formWrapper.dataset.findingId);
        
        // Create temporary container that saveFindings expects
        const tempContainer = document.createElement('div');
        tempContainer.id = 'findings-container';
        tempContainer.style.display = 'none';
        const clonedWrapper = formWrapper.cloneNode(true);
        
        // Debug: Check if finding ID was preserved in clone
        console.log('🔍 [DEBUG] Cloned wrapper finding ID:', clonedWrapper.dataset.findingId);
        
        // Debug: Check select field values in the clone before saving
        const selectFields = ['match', 'stock', 'origin', 'sellerType', 'listingType', 'badges', 'imageQuality', 'imageMatch'];
        selectFields.forEach(fieldName => {
            const originalSelect = formWrapper.querySelector(`select[name="${fieldName}"]`);
            const clonedSelect = clonedWrapper.querySelector(`select[name="${fieldName}"]`);
            if (originalSelect && clonedSelect) {
                console.log(`🔍 [DEBUG] Select ${fieldName} - Original: "${originalSelect.value}", Cloned: "${clonedSelect.value}"`);
                // Ensure the cloned select has the same value as the original
                clonedSelect.value = originalSelect.value;
            }
        });
        
        tempContainer.appendChild(clonedWrapper);
        document.body.appendChild(tempContainer);
        
        try {
            // Save findings using the temporary container
            console.log('🔍 [DEBUG] About to call saveFindings with productId:', productId);
            await saveFindings(productId);
            
            console.log('✅ [DEBUG] saveFindings completed successfully');
            
            // Close modal
            closeFindingsModal();
            
            console.log('✅ Finding saved successfully from modal');
        } finally {
            // Clean up temporary container
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
        }
        
    } catch (error) {
        console.error('❌ Error saving finding from modal:', error);
        alert('❌ Error saving finding: ' + (error.response?.data?.message || error.message));
    }
}

// Trends Modal Functions
function openTrendsModal() {
    const modal = document.getElementById('trendsModal');
    const container = document.getElementById('trends-modal-container');
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create a form wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'trend-validation-entry modal-form-entry';
    wrapper.innerHTML = getTrendValidationFormHTML();
    
    container.appendChild(wrapper);
    
    // Show modal
    modal.classList.add('active');
    
    // Focus on first input
    const firstInput = wrapper.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeTrendsModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Handle click outside modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTrendsModal();
        }
    });
}

function closeTrendsModal() {
    const modal = document.getElementById('trendsModal');
    modal.classList.remove('active');
    
    // Reset modal title
    const modalHeader = document.querySelector('#trendsModal .modal-header h3');
    if (modalHeader) {
        modalHeader.textContent = 'Add Trend Analysis';
    }
    
    // Clear container
    const container = document.getElementById('trends-modal-container');
    container.innerHTML = '';
}

async function saveTrendsFromModal() {
    try {
        const productId = window.productId;
        if (!productId) {
            alert('❌ No product ID found');
            return;
        }
        
        // Get form data from modal
        const modalContainer = document.getElementById('trends-modal-container');
        const formWrapper = modalContainer.querySelector('.trend-validation-entry');
        
        if (!formWrapper) {
            alert('❌ No form data found');
            return;
        }
        
        // Create temporary container that saveTrendValidation expects
        const tempContainer = document.createElement('div');
        tempContainer.id = 'trend-validation-form-container';
        tempContainer.style.display = 'none';
        const clonedWrapper = formWrapper.cloneNode(true);
        
        // Debug: Check if trend ID was preserved in clone
        console.log('🔍 [DEBUG] Trends - Original wrapper trend ID:', formWrapper.dataset.editingId);
        console.log('🔍 [DEBUG] Trends - Cloned wrapper trend ID:', clonedWrapper.dataset.editingId);
        
        // CRITICAL FIX: Preserve select field values from original form to cloned form
        const trendSelectFields = ['trendSource', 'trendStatus', 'searchVolume', 'competition'];
        trendSelectFields.forEach(fieldName => {
            const originalSelect = formWrapper.querySelector(`select[name="${fieldName}"]`);
            const clonedSelect = clonedWrapper.querySelector(`select[name="${fieldName}"]`);
            if (originalSelect && clonedSelect) {
                console.log(`🔍 [DEBUG] Trend Select ${fieldName} - Original: "${originalSelect.value}", Cloned: "${clonedSelect.value}"`);
                // Ensure the cloned select has the same value as the original
                clonedSelect.value = originalSelect.value;
                console.log(`🔍 [DEBUG] Trend Select ${fieldName} - After fix: "${clonedSelect.value}"`);
            }
        });
        
        tempContainer.appendChild(clonedWrapper);
        document.body.appendChild(tempContainer);
        
        try {
            // Save trend validation using the temporary container
            await saveTrendValidation();
            
            // Close modal
            closeTrendsModal();
            
            console.log('✅ Trend data saved successfully from modal');
        } finally {
            // Clean up temporary container
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
        }
        
    } catch (error) {
        console.error('❌ Error saving trend data from modal:', error);
        alert('❌ Error saving trend data: ' + (error.response?.data?.message || error.message));
    }
}

module.exports = {
    openFindingsModal,
    closeFindingsModal,
    saveFindingsFromModal,
    openTrendsModal,
    closeTrendsModal,
    saveTrendsFromModal
};
