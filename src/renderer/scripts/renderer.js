const { ipcRenderer } = require('electron');

// Clear and append message to output
function updateOutput(message, color = null) {
    const output = document.getElementById('output');
    if (!output) return;
    const el = document.createElement('div');
    el.textContent = message;
    if (color) el.style.color = color;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
}

const openViewerBtn = document.getElementById('openViewerBtn');
if (openViewerBtn) {
    openViewerBtn.onclick = () => {
        ipcRenderer.send('open-product-viewer');
    };
}