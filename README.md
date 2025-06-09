# 🧩 Dropi Product Research Desktop App

A comprehensive Electron-based desktop application for advanced product research and market analysis. This app provides sophisticated tools for detailed competitor research, findings management, trend validation, and AI-powered market insights — all from an intuitive, modern desktop interface with full API integration.

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
- **Advanced Findings Management**: Comprehensive competitor analysis system
  - Market research forms with 15+ specialized data fields
  - Price tracking, variant analysis, and competitive intelligence
  - Store ratings, shipping costs, and delivery time assessment
  - Image quality evaluation and product matching analysis
  - Rich notes system and detailed market observations
  - Real-time edit and delete capabilities with API synchronization
- **Trend Validation System**: Market trend analysis and validation tools
  - Google Trends integration and search volume analysis
  - Social media trend tracking (TikTok, Instagram, YouTube)
  - Competition assessment and market opportunity scoring
  - Trend source validation and status management
- **External Search Integration**: One-click research across multiple platforms
  - Google, MercadoLibre, Amazon search automation
  - Image-based reverse search capabilities
  - Social media research tools (TikTok Ads, Facebook Ads, Instagram)
  - Google Trends and YouTube search integration
- **Modal-Based Interface**: Streamlined research workflow
  - Pop-up modals for findings and trend validation entry
  - Form state preservation and data validation
  - Keyboard shortcuts and accessibility features
- **Data Persistence & API Integration**: Full backend synchronization
  - RESTful API integration with comprehensive error handling
  - Real-time data validation and schema compliance
  - Product status tracking (Worth Selling, Skip, In Research)
  - Automatic data backup and recovery systems

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

This app integrates with the **Dropi Research API** for data persistence and management:

```bash
# The app connects to the production API at:
# https://dropi-research-api.onrender.com

# No local API setup required - the app uses the cloud-based backend
# All product data, findings, and trend validations are stored remotely
```

### 3. Run the App

```bash
npm start
```

---

## 📌 Features

### Core Functionality
- 🖼️ **Advanced Product Browser** – Sophisticated product viewer with advanced search, filtering, and status management
- 📝 **Intelligent Product Management** – Create, edit, and manage products with comprehensive validation
- 💾 **Cloud-Based Storage** – Full integration with Dropi Research API for reliable data persistence
- 🔍 **Multi-Platform Research Tools** – Extensive external search integration and market analysis capabilities
- 🤖 **AI Integration** – Generate optimized prompts for AI-powered market analysis

### Research & Analysis Tools
- 📊 **Advanced Findings Management**
  - Comprehensive competitor analysis forms with 15+ specialized data fields
  - Price tracking, variant analysis, and competitive intelligence gathering
  - Store ratings, shipping costs, and delivery time comprehensive analysis
  - Image quality assessment and product matching evaluation systems
  - Rich notes system with detailed observation tracking and categorization
  - Real-time edit, delete, and update capabilities with instant API synchronization
- 🔍 **Multi-Platform Search Integration**
  - One-click Google, MercadoLibre, and Amazon marketplace searches
  - Advanced image-based reverse search functionality across platforms
  - Social media research automation (TikTok Ads, Facebook Ads, Instagram)
  - Google Trends integration and YouTube search capabilities
  - Direct marketplace links for comprehensive competitor research
- 📈 **Trend Validation System**
  - Google Trends integration with search volume analysis
  - Social media trend tracking and validation across platforms
  - Competition assessment and market opportunity scoring
  - Trend source validation and comprehensive status management
- 📋 **Advanced Product Status Management**
  - Intelligent categorization: "Worth Selling", "Skip", or "In Research"
  - Visual status indicators with advanced filtering and sorting options
  - Bulk status updates and comprehensive management tools
  - Status-based workflow automation and notifications

### User Interface Features
- 🖼️ **Enhanced Image Management System**
  - Advanced modal image gallery with intuitive navigation controls
  - Comprehensive keyboard shortcuts (arrow keys, escape, etc.)
  - High-resolution image preview with zoom and interaction capabilities
  - Multi-image support with carousel functionality
- 📝 **Intelligent Dynamic Forms**
  - Advanced auto-save functionality for all research findings
  - Comprehensive edit and delete capabilities for existing entries
  - Real-time form validation with detailed error handling and user feedback
  - Modal-based interface for streamlined data entry workflows
- 🎨 **Modern, Responsive UI Design**
  - Clean, intuitive interface with contemporary styling and animations
  - Fully responsive layout optimized for various screen sizes
  - Consistent visual hierarchy with professional typography
  - Accessibility features and keyboard navigation support

### Data Management & Integration
- 🗄️ **Advanced API Integration**
  - Real-time product synchronization with cloud-based backend API
  - Comprehensive RESTful endpoints for all CRUD operations
  - Advanced error handling with automatic retry logic and user notifications
  - Schema validation ensuring data integrity and consistency
- 📊 **Export & AI Integration**
  - AI-optimized prompt generation for market research automation
  - Comprehensive data export functionality with multiple format support
  - Detailed logging and performance tracking with error analytics
  - Advanced scraping statistics and research workflow metrics
- 🔒 **Data Validation & Security**
  - Comprehensive schema validation for all data operations
  - Real-time data integrity checks and automatic error correction
  - Secure API communication with proper authentication handling
  - Automatic backup and data recovery systems

---

## 🛠 Requirements

- Node.js (v18+ recommended)
- Electron (automatically installed via npm)
- Internet connection for API communication
- Tested on Windows 11, macOS (Intel & Apple Silicon), and Linux

## 🌐 API Integration

This application integrates seamlessly with the **Dropi Research API** hosted at `https://dropi-research-api.onrender.com`. All product data, research findings, and trend validations are stored in a cloud-based database with real-time synchronization.

### API Features:
- **Product Management**: Full CRUD operations for product data
- **Findings Storage**: Comprehensive competitor research data persistence
- **Trend Validation**: Market trend analysis and validation data storage
- **Schema Validation**: Automatic data validation and error handling
- **Real-time Sync**: Instant data synchronization across all app instances

---

## 📝 Usage

This comprehensive app focuses on advanced product research and market analysis. Key workflows include:

### 1. **Product Management**
- Create new products with comprehensive data validation
- Edit existing products with real-time API synchronization
- Manage product status and workflow stages
- Advanced search and filtering capabilities

### 2. **Research & Competitor Analysis**
- Use comprehensive findings forms to track detailed competitor data
- Perform trend validation analysis with social media integration
- Leverage multi-platform search integration for market research
- Generate AI-optimized prompts for automated analysis

### 3. **External Research Integration**
- One-click searches across Google, MercadoLibre, Amazon
- Social media research via TikTok Ads, Facebook Ads, Instagram
- Google Trends analysis and YouTube content research
- Image-based reverse search functionality

### 4. **Data Analysis & Export**
- Advanced product status management and workflow organization
- AI prompt generation for automated market analysis
- Comprehensive data export and reporting capabilities
- Real-time data synchronization and backup

### 5. **Advanced Features**
- Modal-based interface for streamlined data entry
- Keyboard shortcuts and accessibility features
- Multi-image management with gallery functionality
- Real-time validation and error handling

---

## 🚀 Recent Updates & Improvements

### Latest Version Features (December 2024)

#### ✅ **Complete Schema Validation System**
- **Fixed Critical 400 Bad Request Errors**: Resolved all schema validation issues that were preventing successful product creation and updates
- **Comprehensive Data Type Conversion**: Implemented automatic price conversion (string to number), categories transformation to arrays, and proper field name mapping
- **Enhanced Error Handling**: Added detailed validation error reporting with JSON formatting for precise debugging and troubleshooting
- **Real-time Data Integrity**: Automated data validation checks with immediate error correction and user feedback

#### 🔧 **Enhanced API Integration**
- **Modern Image Field Support**: Completely migrated from deprecated `image` field to new `images` array structure across all components
- **Schema Compliance**: Updated all API calls to match the latest backend schema requirements with proper field names and data types
- **Description Length Validation**: Added backend validation to handle descriptions longer than 1000 characters gracefully
- **Consistent Data Structure**: Standardized all product operations to use unified schema validation patterns

#### 📊 **Advanced Findings & Trend Management**
- **Array Conversion Logic**: Implemented robust object-to-array transformation for both findings and trend validation data
- **Enhanced Modal Functionality**: Fixed form state preservation, select field value retention, and finding ID management in cloned elements
- **Real-time Synchronization**: All research findings and trend validations now sync instantly with the cloud API
- **Improved Data Persistence**: Enhanced storage reliability with automatic retry logic and error recovery

#### 🎨 **User Interface & Experience Improvements**
- **Product Viewer Enhancements**: Updated image rendering logic to use the new images array with fallback handling
- **Modal Interface Fixes**: Added missing function definitions (addImageInput, removeImageInput) and proper cleanup logic
- **Character Counter Removal**: Removed non-functional character counter that was causing UI confusion
- **Enhanced Form Validation**: Improved real-time validation feedback with clear error messages

#### 🔒 **Data Integrity & Cleanup**
- **Deprecated Field Removal**: Created comprehensive cleanup script to remove old `image` fields from all products in database
- **Field Name Standardization**: Implemented proper mapping between frontend (`dropi_description`) and backend field names
- **Enhanced Error Logging**: Added detailed JSON-formatted error logs for better debugging and monitoring
- **Memory Leak Prevention**: Added proper function cleanup in modals to prevent memory leaks and improve performance

#### 🐛 **Critical Bug Fixes**
- **ReferenceError Resolution**: Fixed all undefined variable references in error handling blocks
- **Form Cloning Issues**: Resolved select field value preservation problems during form cloning operations
- **Function Definition Fixes**: Added missing function definitions that were causing runtime errors
- **API Call Standardization**: Updated all product creation and update operations to use consistent schema validation

#### 📈 **Performance & Reliability**
- **Optimized API Calls**: Reduced redundant API requests and improved response handling
- **Enhanced Error Recovery**: Added automatic retry logic for failed API operations
- **Improved Loading States**: Better user feedback during data operations and API calls
- **Code Quality Improvements**: Refactored code for better maintainability and reduced technical debt

#### 🛠 **Development & Maintenance**
- **Comprehensive Testing**: All schema validation fixes have been thoroughly tested with both product creation and updates
- **Database Cleanup Tools**: Created automated scripts for database maintenance and deprecated field removal
- **Documentation Updates**: Updated all technical documentation to reflect current API schema and field structures
- **Version Control**: Maintained detailed commit history with comprehensive change descriptions

---

## 📄 License

[MIT](LICENSE)