const { ipcRenderer } = require('electron');
const { checkSession } = require('../../services/dropi-api/session.js');
const { performLogin } = require('../../services/auth/login.js');
const { scrapeProducts } = require('../../services/scraper/index.js');

const loginBtn = document.getElementById('loginBtn');
const checkSessionBtn = document.getElementById('checkSessionBtn');
const scrapeBtn = document.getElementById('scrapeBtn');

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


checkSessionBtn.onclick = async () => {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';
    updateOutput("🔍 Validando sesión...");

    try {
        const sessionValid = await checkSession();
        console.log("🔍 Session validation result:", sessionValid);
        const msg = sessionValid
            ? "✅ Sesión válida."
            : "❌ Sesión no válida. Por favor, inicia sesión.";
        updateOutput(msg, sessionValid ? 'green' : 'red');
        loginBtn.disabled = sessionValid; // Disable login button if session is valid

    } catch (error) {
        updateOutput("❌ Error al validar la sesión.", 'red');
        console.error(error);
        loginBtn.disabled = false; // Enable login button on error
    }
};

loginBtn.onclick = async () => {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';
    const success = await performLogin();
    updateOutput(success ? "✅ Inicio de sesión exitoso." : "❌ Error al iniciar sesión.");
    // Disable loginBtn after a successful login
    loginBtn.disabled = success;
};

scrapeBtn.onclick = async () => {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';
    updateOutput("🚀 Iniciando la recolección de productos...");

    try {
        await scrapeProducts((msg) => {
            updateOutput(typeof msg === 'string' ? msg : msg.message || JSON.stringify(msg));
            if (typeof msg === 'object' && msg !== null) {
                if (msg.type === 'error') console.error(msg.message);
                else if (msg.type === 'warning') console.warn(msg.message);
                else console.log(msg.message);
            } else {
                console.log(msg);
            }
        });

        updateOutput("✅ Productos enviados a la base de datos correctamente.", 'green');
    } catch (error) {
        updateOutput("❌ La recolección terminó con errores: " + error.message, 'red');
        console.error('Scraping error:', error);
    }
};


const openViewerBtn = document.getElementById('openViewerBtn');
if (openViewerBtn) {
    openViewerBtn.onclick = () => {
        ipcRenderer.send('open-product-viewer');
    };
};