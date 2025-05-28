# Windows Build & Distribution Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- 8GB+ free disk space (for dependencies and build)

## Quick Build (Recommended)

### 🚀 Automated Build Script
```bash
# Make sure you're in the project directory
cd dropi-app

# Run the automated build script
./build-windows.sh
```

## Manual Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Windows
```bash
# Clean previous builds (optional)
rm -rf dist/

# Build Windows installer (NSIS) + portable
npm run build:win

# Alternative: Build all platforms
npm run build
```

### 3. Output Files
The built files will be in the `dist/` directory:
- **`Dropi Research App Setup 1.0.0.exe`** - Windows installer (recommended)
- **`Dropi Research App 1.0.0.exe`** - Portable version (no installation required)

## Distribution Options

### Option 1: Windows Installer (NSIS)
- **File**: `Dropi Research App Setup 1.0.0.exe`
- **Size**: ~150-200MB
- **Features**: 
  - Desktop shortcut creation
  - Start menu integration
  - Automatic updates support
  - Proper uninstaller

### Option 2: Portable Executable
- **File**: `Dropi Research App 1.0.0.exe`
- **Size**: ~200-250MB
- **Features**:
  - No installation required
  - Run from any folder
  - Portable across Windows machines

## Cross-Platform Building

### From macOS (current setup)
```bash
# Windows only
npm run build:win

# macOS only  
npm run build:mac

# Linux only
npm run build:linux

# All platforms
npm run build
```

### From Windows
```bash
# Windows only
npm run build:win

# All platforms (requires additional tools)
npm run build
```

## Troubleshooting

### Common Issues

#### 1. Build Fails with "node-gyp" Error
```bash
# Install Windows build tools
npm install --global windows-build-tools
```

#### 2. Icon Not Found Error
- Icons are located in `assets/icons/`
- Windows: `icon.ico`
- macOS: `icon.icns` 
- Linux: `icon.png`

#### 3. Large File Size
- Normal for Electron apps (includes Node.js runtime)
- Installer: ~150-200MB
- Portable: ~200-250MB

#### 4. Windows Defender Warning
- Normal for unsigned executables
- For distribution, consider code signing

### Build Requirements
- **Memory**: 4GB+ RAM recommended
- **Storage**: 2GB+ free space
- **Time**: 5-15 minutes depending on machine

## Code Signing (Optional)

For professional distribution, consider code signing:

1. **Purchase code signing certificate**
2. **Add to package.json**:
```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```

## Testing the Build

### On Windows:
1. Transfer the `.exe` file to Windows machine
2. Run the installer or portable executable
3. Test all core features:
   - Product scraping
   - Product viewer
   - Product details
   - Findings and trend validation
   - AI prompt generation

### Quick Test Checklist:
- [ ] App launches successfully
- [ ] Login functionality works
- [ ] Product scraping works
- [ ] Product viewer displays products
- [ ] Product details page loads
- [ ] AI prompt generation works
- [ ] Data persistence works

## File Structure After Build
```
dist/
├── Dropi Research App Setup 1.0.0.exe    # Windows Installer
├── Dropi Research App 1.0.0.exe          # Portable Version
├── win-unpacked/                          # Unpacked files (for debugging)
└── builder-debug.yml                      # Build debug info
```

## Performance Notes

- **First launch**: May take 10-30 seconds (normal)
- **Subsequent launches**: 3-5 seconds
- **Memory usage**: 150-300MB (typical for Electron apps)
- **Disk usage**: 300-400MB installed

## Troubleshooting

### Icon Issues
- Place proper icon files in `build/` directory
- icon.ico for Windows (256x256 recommended)
- Use icon generation tools if needed

### Path Issues
- All paths are now cross-platform compatible
- Data directory uses app user data folder in production

### Permissions
- On Windows, installer may require admin privileges
- Portable version doesn't require installation
