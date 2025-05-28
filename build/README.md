# Build Configuration

This directory contains build resources for electron-builder.

## Icons Required:
- **icon.png** - 512x512 PNG for Linux
- **icon.ico** - Windows icon file 
- **icon.icns** - macOS icon file

## Generate Icons:
You can use online tools like:
- https://iconverticons.com/online/
- https://icoconvert.com/

Or use a tool like `electron-icon-builder`:
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon.png --output=./build
```
