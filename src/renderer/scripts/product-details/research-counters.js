// Research counter functionality

// Findings counter functionality
function updateFindingsCount() {
    const count = document.querySelectorAll('#findings-list .finding-item').length;
    document.getElementById('findings-count').textContent = count;
}

function openFindingsListModal() {
    // Clone the findings list content to modal
    const findingsList = document.getElementById('findings-list');
    const findingsContainer = document.getElementById('findings-list-container');
    findingsContainer.innerHTML = '';

    if (findingsList.children.length > 0) {
        findingsContainer.innerHTML = findingsList.innerHTML;
    } else {
        findingsContainer.innerHTML = '<div class="empty-state">No research findings added yet.</div>';
    }

    // Show the modal
    document.getElementById('findingsListModal').classList.add('active');
}

function closeFindingsListModal() {
    document.getElementById('findingsListModal').classList.remove('active');
}

// Trends counter functionality
function updateTrendsCount() {
    const count = document.querySelectorAll('#saved-trend-validations .trend-validation-item').length;
    document.getElementById('trends-count').textContent = count;
}

function openTrendsListModal() {
    // Clone the trends list content to modal
    const trendsList = document.getElementById('saved-trend-validations');
    const trendsContainer = document.getElementById('trends-list-container');
    trendsContainer.innerHTML = '';

    if (trendsList.children.length > 0) {
        trendsContainer.innerHTML = trendsList.innerHTML;
    } else {
        trendsContainer.innerHTML = '<div class="empty-state">No trend analysis added yet.</div>';
    }

    // Show the modal
    document.getElementById('trendsListModal').classList.add('active');
}

function closeTrendsListModal() {
    document.getElementById('trendsListModal').classList.remove('active');
}

// Update the counts when data is added or removed
function initCounters() {
    // Initial counts
    updateFindingsCount();
    updateTrendsCount();

    // Set up observers to update counts when content changes
    const findingsObserver = new MutationObserver(updateFindingsCount);
    findingsObserver.observe(document.getElementById('findings-list'), { childList: true });

    const trendsObserver = new MutationObserver(updateTrendsCount);
    trendsObserver.observe(document.getElementById('saved-trend-validations'), { childList: true });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCounters);

// Export functions for use in main script
module.exports = {
    updateFindingsCount,
    openFindingsListModal,
    closeFindingsListModal,
    updateTrendsCount,
    openTrendsListModal,
    closeTrendsListModal
};
