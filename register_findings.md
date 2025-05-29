# Database Usage and Path Handling Analysis

## Database Access Locations

### Direct Database File Access (productsDb path)
- **File**: `/src/services/scraper/merge-new-products.js`
  - **Line**: `const { productsDb } = require('../../config/paths');`
  - **Usage**: Reading existing master JSON, writing merged products
  - **Operations**: Read, Write, Create directory if needed

- **File**: `/src/services/dropi-api/products.js`
  - **Line**: `const { sessionFile, productsDb } = require('../../config/paths');`
  - **Usage**: Reading products database, updating product details
  - **Operations**: Read, Write (updating product entries)

- **File**: `/src/services/auth/login.js`
  - **Line**: `const { sessionFile } = require('../../config/paths');`
  - **Usage**: Saving new session after login
  - **Operations**: Write (creating new session)

### Session File Access (sessionFile path)
- **File**: `/src/services/dropi-api/session.js`
  - **Line**: `const { sessionFile } = require('../../config/paths');`
  - **Usage**: Reading session data for authentication validation
  - **Operations**: Read only

- **File**: `/src/services/scraper/index.js`
  - **Line**: `const { sessionFile } = require('../../config/paths');`
  - **Usage**: Loading session for browser context
  - **Operations**: Read only

- **File**: `/src/services/dropi-api/products.js`
  - **Line**: `const { sessionFile, productsDb } = require('../../config/paths');`
  - **Usage**: Loading session for browser automation
  - **Operations**: Read only

- **File**: `/src/services/auth/login.js`
  - **Line**: `const { sessionFile } = require('../../config/paths');`
  - **Usage**: Saving new session after login
  - **Operations**: Write (creating new session)

### IPC-based Database Access (via main process)
- **File**: `/src/main/index.js`
  - **Lines**: Multiple handlers for database operations
  - **Usage**: Central database access point for renderer processes
  - **Operations**: Read, Write (status updates, product reloading)

## Non-Database Path Handling Usage

### Static Resource Paths
- **File**: `/src/main/index.js`
  - **Usage**: Loading HTML views, handling resource paths in dev vs production
  - **Paths**: Renderer HTML files, app resources

- **File**: `/src/renderer/scripts/renderer.js`
  - **Usage**: Spawning child processes, executing merge script
  - **Paths**: Background scraper script, merge script

### Temporary and Log Files
- **File**: `/src/services/scraper/index.js`
  - **Usage**: Creating logs directory, error logs, API response logs
  - **Paths**: Log files, temporary JSON responses

- **File**: `/src/services/dropi-api/products.js`
  - **Usage**: Creating temporary product details JSON files
  - **Paths**: Temporary files that get deleted after processing

### Data Directory Management
- **File**: `/src/services/scraper/merge-new-products.js`
  - **Usage**: Managing product folders, trash operations
  - **Paths**: Temporary product folders in data directory

## Cross-Platform Path Issues Status

### ✅ Resolved Issues
1. **Hardcoded session path in login.js**: Now uses centralized config paths
2. **Inconsistent path handling**: Most files now use proper path configuration

### ⚠️ Remaining Considerations
1. **Relative path complexity**: Multiple levels of `../` in require statements
2. **Path validation**: Could benefit from additional error handling for edge cases

### ✅ Good Practices Found
1. **Centralized path configuration**: `/src/config/paths.js` handles dev vs production
2. **Dynamic data directory**: Uses `app.getPath('userData')` in production
3. **Consistent database access**: Uses centralized path configuration
4. **Cross-platform compatibility**: Uses `path.join()` for all path operations

## Recommendations

1. **Consider path validation** for cross-platform compatibility in edge cases
2. **Add error handling** for path resolution failures
3. **Document path assumptions** in critical areas
4. **Monitor for any new hardcoded paths** in future development
