# 🧩 Dropi Product Research Desktop App

An Electron-based desktop application for manual product research and analysis. The app provides tools for detailed market research, findings management, and competitor analysis — all from an intuitive desktop interface.

---

## 📁 Project Structure

```
dropi-app/
├── src/
│   ├── main/                    # Main process files
│   │   └── index.js            # Application entry point
│   │
│   ├── renderer/               # Renderer process files
│   │   ├── views/             # HTML templates
│   │   │   ├── index.html        # Main dashboard
│   │   │   ├── product-viewer.html # Product browser
│   │   │   └── product-details.html # Product research interface
│   │   ├── scripts/           # Frontend JavaScript
│   │   │   ├── renderer.js       # Main dashboard logic
│   │   │   ├── product-viewer.js # Product browsing
│   │   │   └── product-details/  # Product research modules
│   │   │       ├── findings-form.js    # Research form management
│   │   │       ├── findings-storage.js # Data persistence
│   │   │       ├── search-buttons.js   # External search tools
│   │   │       └── product-actions.js  # Product operations
│   │   └── styles/            # CSS styling
│   │
│   ├── services/              # Business logic
│   │   ├── auth/             # Authentication
│   │   ├── dropi-api/        # Dropi platform integration
│   │   └── scraper/          # Data extraction
│   │       └── index.js         # Main scraping engine with API integration
│   │
│   └── config/               # Configuration
│       └── paths.js            # File paths and constants
│
├── data/                      # Data storage
│   ├── session.json            # Authentication session
│   └── logs/                   # Application logs
│
└── assets/                    # Static resources
    ├── icons/                  # Application icons
    └── images/                # UI images
```

## 📌 Key Components

### Main Process (`src/main/`)
- `index.js`: Application entry point and window management

### Renderer Process (`src/renderer/`)
- **Views**: Multi-window interface for different workflows
  - `index.html`: Main dashboard with scraping controls
  - `product-viewer.html`: Product browser with filtering and status management
  - `product-details.html`: Detailed product research interface
- **Scripts**: Specialized JavaScript modules
  - `renderer.js`: Dashboard functionality and scraping controls
  - `product-viewer.js`: Product browsing, filtering, and status management
  - `product-details/`: Product research workflow modules
- **Styles**: Modern CSS styling with findings form components

### Product Research System (`src/renderer/scripts/product-details/`)
- **Findings Management**: Comprehensive competitor analysis
  - Market research forms with 15+ data fields
  - Price tracking and competitive analysis
  - Store ratings, shipping costs, and delivery times
  - Image quality assessment and product matching
  - Notes and detailed observations
- **External Search Integration**: One-click searches across platforms
  - Google, MercadoLibre, Amazon search buttons
  - Image-based reverse search capabilities
- **Data Persistence**: API-based findings storage and management
  - Edit and delete findings via REST API
  - Product status tracking (Worth Selling, Skip, In Research)
  - Real-time data synchronization with backend database

### Services (`src/services/`)
- **Database (`database/`)**: Local data management utilities
- **Prompt Generation (`prompt-generation/`)**: AI prompt generation for product analysis
  - Automated prompt creation for market research
  - Product data formatting for AI assistants

### Configuration (`src/config/`)
- File path management and application constants

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/your-username/dropi-app.git
cd dropi-app
npm install
```

### 2. Start the Backend API

Make sure your local API server is running on http://localhost:3000 to store and manage product data.

### 3. Run the App

```bash
npm start
```

---

## 📌 Features

### Core Functionality
- 🖼️ **Product Browser** – Advanced product viewer with search, filter, and status management
- 📝 **Manual Product Entry** – Create and edit product information manually
- 💾 **API-Based Storage** – Direct product management with backend database
- 🔍 **Research Tools** – External search integration and analysis capabilities

### Research & Analysis Tools
- 📊 **Comprehensive Findings Management**
  - Detailed competitor analysis forms with 15+ data fields
  - Price tracking and market research capabilities
  - Store ratings, shipping costs, and delivery time analysis
  - Image quality assessment and product matching evaluation
  - Rich notes and observation tracking
- 🔍 **External Search Integration**
  - One-click Google, MercadoLibre, and Amazon searches
  - Image-based reverse search functionality
  - Direct marketplace links for competitor research
- 📋 **Product Status Management**
  - Categorize products as "Worth Selling", "Skip", or "In Research"
  - Visual status indicators and filtering options
  - Bulk status updates and management tools

### User Interface Features
- 🖼️ **Enhanced Image Viewer**
  - Modal image gallery with navigation controls
  - Keyboard shortcuts (arrow keys, escape)
  - High-resolution online image preview and interaction
- 📝 **Dynamic Forms**
  - Auto-save functionality for research findings
  - Edit and delete capabilities for existing entries
  - Form validation and error handling
- 🎨 **Modern UI Design**
  - Clean, intuitive interface with modern styling
  - Responsive layout and smooth animations
  - Consistent visual hierarchy and typography

### Data Management
- 🗄️ **API-Based Database Integration**
  - Real-time product submission to backend API
  - RESTful endpoints for CRUD operations
  - Automatic error handling and retry logic
- 📊 **Export & Analysis**
  - API-based data export functionality
  - Detailed logging and error tracking
  - Performance metrics and scraping statistics

---

## 🛠 Requirements

- Node.js (v18+ recommended)
- Electron
- Backend API server running on http://localhost:3000
- Tested on Windows and macOS

---

## 📝 Usage

This app focuses on manual product research and management. Key workflows include:

1. **Manual Product Entry**: Create new products directly through the interface
2. **Research & Analysis**: Use the comprehensive findings forms to track competitor data
3. **External Search**: Leverage integrated search buttons for market research
4. **Status Management**: Organize products with "Worth Selling", "Skip", or "In Research" statuses
5. **Export & Analysis**: Generate AI-ready prompts and export findings

---

## 📄 License

[MIT](LICENSE)