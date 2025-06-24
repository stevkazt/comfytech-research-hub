# 🔍 Product Research Hub

A lightweight, modular web application for advanced product research and market analysis tailored for e-commerce professionals and online businesses.

## 🎯 Project Overview

Product Research Hub is a comprehensive tool that enables users to:
- **Browse and manage products** with advanced filtering and search capabilities
- **Conduct detailed market research** with integrated external platform searches
- **Track findings and trends** from multiple marketplaces and social platforms
- **Generate AI-powered insights** for informed business decisions
- **Export comprehensive reports** for business analysis

## 🚀 Features

### 📊 Dashboard
- **Real-time statistics** of your product research pipeline
- **Quick navigation** to key features and recent products
- **Progress tracking** with visual indicators

### 🛍️ Product Management
- **Grid-based product browser** with responsive design
- **Advanced filtering** by status, price, category, and custom criteria
- **Multi-sort options** (name, price, date, status)
- **Quick product creation** with image support
- **Status tracking** (New, Research, Worth Selling, Skip)

### 🔬 Research Tools
- **Market research integration** with Google, Amazon, MercadoLibre
- **Trend analysis tools** with TikTok, Facebook, Instagram, YouTube integration
- **Reverse image search** capability
- **Finding management** with detailed competitor analysis
- **Trend validation** with search volume and scoring

### 📈 Analysis Features
- **Research findings tracker** with comprehensive data fields
- **Trend validation system** with platform-specific metrics
- **AI prompt generation** for market analysis
- **Export functionality** for reports and data sharing

## 🏗️ Architecture

### Modular Design
The application follows a **component-based architecture** for maintainability and scalability:

```
research-hub/
├── 📄 Core Pages
│   ├── index.html              # Dashboard
│   ├── product-viewer.html     # Product browser
│   └── product-details.html    # Research interface
├── 🎨 Assets
│   ├── css/
│   │   ├── main-modular.css    # Main stylesheet
│   │   ├── components/         # UI component styles
│   │   ├── pages/              # Page-specific styles
│   │   └── utils/              # Utility styles
│   ├── js/
│   │   ├── product-viewer.js   # Product grid management
│   │   ├── header.js           # Navigation component
│   │   ├── notifications.js    # Toast notifications
│   │   ├── product-details/    # Research tools
│   │   └── utils/              # Shared utilities
│   └── components/             # HTML components
├── 🔧 Services
│   └── path-service.js         # Path resolution
└── 🧪 Test Files
    ├── dialog-validation.js    # Dialog system tests
    └── *-test.html            # Component tests
```

### Key Components

#### Frontend Layer
- **Modern vanilla JavaScript** with ES6+ features
- **Modular CSS architecture** with component isolation
- **Responsive design** with mobile-first approach
- **Progressive enhancement** for accessibility

#### Data Layer
- **RESTful API integration** with configurable backend endpoints
- **Local storage fallback** for offline functionality
- **Data normalization** for consistent formatting
- **Error handling** with user-friendly messages

#### UI/UX Layer
- **Component-based HTML** for reusability
- **Custom modal system** replacing browser dialogs
- **Toast notifications** for user feedback
- **Keyboard shortcuts** for power users

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Icons**: Lucide React icons
- **HTTP Client**: Axios
- **API**: RESTful backend service
- **Storage**: LocalStorage + Remote API
- **Build**: No build process (vanilla web app)

## 📋 Prerequisites

- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+)
- Internet connection for API functionality
- Local web server for development (optional)

## 🚦 Getting Started

### Quick Start
1. **Clone or download** the repository
2. **Open `index.html`** in your web browser
3. **Start exploring** products and research tools

### Development Setup
```bash
# Serve locally (recommended for development)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Then visit http://localhost:8000
```

### Configuration
The app connects to your configured research API by default. To use a different backend:

1. Update the `baseURL` in `assets/js/utils/api-client.js`
2. Ensure your API follows the same endpoint structure

## 🎮 Usage Guide

### Dashboard Navigation
- **Dashboard** (`/`) - Overview and statistics
- **Products** (`/product-viewer.html`) - Browse and manage products
- **Research** (`/product-details.html?id=123`) - Deep analysis tools

### Keyboard Shortcuts
- `Alt/Cmd + R` - Refresh data
- `Alt/Cmd + 1` - Go to Dashboard
- `Alt/Cmd + 2` - Go to Products
- `Ctrl/Cmd + F` - Add new finding (on product details)
- `Ctrl/Cmd + T` - Add trend validation
- `Ctrl/Cmd + E` - Edit product
- `Escape` - Close modals/dropdowns

### Product Research Workflow
1. **Browse products** in the product viewer
2. **Click on a product** to open detailed research
3. **Add findings** from competitor research
4. **Validate trends** across social platforms
5. **Generate AI prompts** for further analysis
6. **Update product status** based on research

## 🔌 API Integration

### Endpoints Used
```javascript
GET    /products              # List all products
GET    /products/:id          # Get product details
POST   /products              # Create new product
PUT    /products/:id          # Update product
DELETE /products/:id          # Delete product
```

### Data Schema
```javascript
// Product Object
{
  id: number,
  name: string,
  price: string,
  status: 'new' | 'research' | 'worth' | 'skip',
  categories: string[],
  images: string[],
  findings: Finding[],
  trendValidation: Trend[]
}
```

## 🧪 Testing

### Component Testing
```bash
# Open any *-test.html file in browser
open dialog-validation.html
open product-controls-debug.html
```

### Manual Testing Checklist
- [ ] Dashboard loads and displays stats
- [ ] Product grid renders with filters
- [ ] Product details page functions
- [ ] Modal dialogs work correctly
- [ ] External search links open
- [ ] Data persists correctly
- [ ] Mobile responsiveness

## 🎨 Customization

### Styling
- Edit `assets/css/variables.css` for color scheme
- Modify component styles in `assets/css/components/`
- Page-specific styles in `assets/css/pages/`

### Features
- Add new research platforms in `product-details/index.js`
- Extend product schema in `api-client.js`
- Create new dashboard widgets in `assets/components/`

## 📈 Performance

### Optimization Features
- **Lazy component loading** for faster initial load
- **Image optimization** with responsive sizing
- **Minimal dependencies** (only Axios and Lucide)
- **Efficient DOM manipulation** with vanilla JS
- **Local storage caching** for offline access

### Best Practices
- **Modular architecture** prevents code bloat
- **Progressive enhancement** ensures basic functionality
- **Error boundaries** handle API failures gracefully
- **Accessibility** features for keyboard navigation

## 🛡️ Security Considerations

- **API calls** use HTTPS endpoints
- **Input validation** on forms and searches
- **XSS prevention** with proper DOM manipulation
- **No sensitive data** stored in localStorage
- **CORS handling** for external platform integration

## 🤝 Contributing

### Code Style
- Use **kebab-case** for file names
- Follow **modular architecture** patterns
- Include **file documentation** headers
- Write **accessible HTML** markup
- Use **semantic CSS** class names

### File Organization
- Components in `assets/components/`
- Utilities in `assets/js/utils/`
- Page scripts in root `assets/js/`
- Styles follow CSS component methodology

## 📚 Documentation

- **AI_INSTRUCTIONS.md** - AI assistant guidelines
- **Inline documentation** in all major files
- **Component comments** explain functionality
- **CSS documentation** describes architecture

## 🔧 Troubleshooting

### Common Issues

**Products not loading**
- Check internet connection
- Verify API endpoint is accessible
- Check browser console for errors

**Modal dialogs not working**
- Ensure dialog-system.js is loaded
- Check for JavaScript errors
- Verify DOM elements exist

**Mobile layout issues**
- Clear browser cache
- Check viewport meta tag
- Test responsive breakpoints

## 📄 License

This is an open-source product research platform. See project documentation for usage guidelines.

## 🔄 Version History

- **v2.0** (2025-06-16) - Modular architecture, enhanced UI
- **v1.x** - Initial release with basic functionality

---

*Built with ❤️ for the e-commerce community*
