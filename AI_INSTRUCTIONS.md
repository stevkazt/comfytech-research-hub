# 🤖 AI INSTRUCTIONS — Comfytech Research Hub

AI assistant usage and codebase conventions for collaborating with Claude and similar models on this project.

---

## 🎯 Project Purpose

Comfytech Research Hub is a lightweight HTML/CSS/JS product research tool. All instructions here are designed to:
- Help Claude assist with code reliably
- Keep the project modular and maintainable
- Reduce context confusion in AI tasks

---

## 🗂️ Codebase Structure

```plaintext
root/
├── index.html
├── product-viewer.html
├── assets/
│   ├── css/
│   ├── js/
│   └── components/
├── services/
└── README.md
```

> ✅ All source files are documented inline and follow strict naming and organization conventions to support AI assistance.

---

## 🧠 Claude-Compatible Practices

### 1. Modular File Architecture
- Split logic by purpose: `components/`, `pages/`, `utils/`
- Each module should ideally be < 300 lines
- Use `main.css` only for imports and resets

### 2. File Naming Rules
- Always use **kebab-case**
  - ✅ `product-viewer.html`
  - ❌ `ProductViewer.js`

### 3. File Documentation
Every file over 100 lines must begin with a `FILE CONTENTS` section using this format:

```javascript
/**
 * FILE: product-viewer.js (216 lines)
 * PURPOSE: Load product data, render grid, handle interactions
 * SECTIONS:
 * 1-40: Initialization
 * 41-150: API integration
 * 151+: UI handlers
 * KEY FUNCTIONS:
 * - fetchProducts()
 * - renderGrid()
 * - attachEvents()
 * LAST UPDATED: 2025-06-16 — Added product sync cache
 */
```

Same structure applies to HTML and CSS using `<!-- -->` or `/* */` blocks.

---

## 🎨 CSS Architecture

✅ Modular CSS was implemented in June 2025  
All new styles must follow this folder structure:

```plaintext
assets/css/
├── main.css               # Only imports + reset
├── variables.css          # Design system tokens
├── base.css               # Typography, layout
├── components/
│   ├── buttons.css
│   ├── modals.css
│   └── cards.css
├── pages/
│   ├── product-viewer.css
│   └── dashboard.css
├── utils/
│   ├── notifications.css
│   └── utilities.css
```

> 📌 `main.css` must never hold page or component styles again.

---

## 🧩 HTML Modular Architecture

✅ Modular HTML Components implemented in June 2025  
All HTML files now follow a component-based architecture:

```plaintext
assets/components/
├── header.html                 # Navigation and branding
├── footer.html                 # Site footer
├── mobile-warning.html         # Large screen optimization warning
├── script-loader.html          # Common script imports
├── dashboard-welcome.html      # Dashboard welcome section
├── dashboard-stats.html        # Statistics cards
├── dashboard-features.html     # Feature overview cards
├── dashboard-getting-started.html # Getting started guide
├── product-controls.html       # Product search/filter controls
├── product-grid.html          # Product display grid
└── product-details-header.html # Product details header
```

### Component Loading System
- Use `ComponentLoader` class from `/assets/js/utils/component-loader.js`
- Loads HTML components dynamically into placeholder elements
- Handles icon initialization and common functionality
- Provides fallback UI for failed component loads

### HTML File Structure
All main HTML files now follow this pattern:
```html
<!-- FILE header with purpose and sections -->
<!DOCTYPE html>
<html>
<head><!-- Meta and CSS --></head>
<body>
    <!-- Component placeholders -->
    <div id="mobile-warning-placeholder"></div>  
    <div id="header-placeholder"></div>
    <main class="page-container">
        <div id="component-placeholder"></div>
    </main>
    <div id="footer-placeholder"></div>
    
    <!-- Scripts with component-loader -->
    <script src="assets/js/utils/component-loader.js"></script>
    <!-- Other scripts -->
    
    <script>
        // Initialize components and page functionality
    </script>
</body>
</html>
```

---

## 🔁 Development Flow

### Adding a Feature (AI Steps)
1. Create a new `.html`, `.css`, and `.js` file as needed
2. Use the path service (`window.pathService`) to manage routes
3. Add a `FILE CONTENTS` block to the top of each file
4. Use CSS variables from `variables.css`
5. Add only needed imports to HTML headers

---

## ⚙️ API Integration

- Use `window.apiClient` from `/assets/js/utils/api-client.js`
- All endpoints are configurable through environment settings
- Store cache in `localStorage` for session durability
- Implement loading/error UI feedback in all cases

---

## 📚 Claude Prompting Tips (For Devs)

- ✅ “Update only the modal layout styles in `modals.css`”
- ✅ “Review `product-viewer.js` to catch bugs and simplify loops”
- ✅ “Add mobile breakpoints in `dashboard.css`”
- ❌ “Fix everything” — too vague
- ❌ “Here’s all the code, what do you think?” — avoid dumping huge files

---

## ✅ Confirmed Claude-Optimized Features

- ✅ Modular CSS (June 2025)
- ✅ Component-based JS
- ✅ File summaries for all key modules
- ✅ Design system using consistent tokens
- ✅ Path service abstraction for asset linking
- ✅ Dialog system replacing `alert/confirm/prompt`

---

This file is the **source of truth for AI collaboration**. All developers should keep it updated when workflows or conventions change.
