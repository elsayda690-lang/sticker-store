# IPC Bridge Implementation for Browser Deployment

## Overview

This solution provides seamless IPC (Inter-Process Communication) handling for Frappe Books in both Electron and browser environments.

## Problem Solved

When deploying to Netlify as a web app, the code was trying to use `window.ipc` which doesn't exist in a browser, causing:
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'get')
```

## Solution Architecture

### Components

1. **`src/utils/mockIpc.ts`** - Complete mock implementation of all IPC methods with browser-friendly fallbacks
2. **`src/utils/ipcBridge.ts`** - Smart bridge that detects the environment and provides the appropriate IPC
3. **`src/global.d.ts`** - TypeScript global declarations for the `ipc` object
4. **`src/renderer.ts`** - Updated to import the bridge at initialization
5. **`src/index.html`** - Minimal fallback to ensure window.ipc exists

### How It Works

```
Initialization Flow:
┌─────────────────────────────────────┐
│  src/index.html loads              │
│  (sets window.ipc = {})             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  src/renderer.ts imports ipcBridge  │
│  (executed first, before other code)│
└────────────┬────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│  ipcBridge.ts checks environment:          │
│  ✓ window.ipc exists? → Use real IPC       │
│  ✗ window.ipc missing? → Use mockIpc       │
└────────────┬───────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│  window.ipc is now available       │
│  Code can call ipc.getEnv(), etc.  │
└────────────────────────────────────┘
```

## Environment Detection

### In Electron
- `preload.ts` exposes the real IPC via `window.ipc`
- Bridge detects this and uses it directly
- No overhead, fully functional

### In Browser
- `window.ipc` is initially an empty object
- Bridge detects missing IPC and uses `mockIpc`
- All calls are logged to console for debugging
- Sensible defaults for browser features (downloads, window open, localStorage, etc.)

## Mock IPC Features

The mock implementation provides:

- **Console Logging**: All IPC calls logged with `[MockIPC]` prefix for debugging
- **Browser Fallbacks**:
  - Database operations: Return "not available" errors
  - File operations: Trigger browser downloads when possible
  - Links: Open in new tabs via `window.open()`
  - Configuration: Use localStorage as fallback
  - API requests: Use fetch API with error handling
  - Window controls: No-op with log message (not applicable in browser)
  - Listeners: Stub registration (not applicable in browser)

## Usage in Components

No changes needed! Code works the same in both environments:

```typescript
// This works identically in Electron and browser
const env = await ipc.getEnv();
await ipc.sendAPIRequest('/api/endpoint', {});
ipc.openExternalUrl('https://example.com');
```

## Debugging

When running in a browser, open the browser console and look for `[MockIPC]` log messages. This shows:
- Which IPC methods are being called
- What arguments they received
- Why they can't be fully implemented (e.g., "Database not available in browser")

Example output:
```
[MockIPC] getEnv called
[MockIPC] getLanguageMap called with code: en
[MockIPC] db.connect called: { dbPath: '...', countryCode: 'US' }
[MockIPC] db.connect: {"error":"Database not available in browser"}
```

## Building for Production

### For Electron (Desktop)
```bash
npm run build
```
Uses the real IPC via preload.ts - no changes needed.

### For Web (Netlify)
```bash
npm run build
```
Uses the mock IPC via bridge - fully functional for demonstration/read-only features.

## Limitations in Browser Mode

Some features aren't available in browser deployments:
- ❌ Local database operations (SQLite)
- ❌ File system access
- ❌ Window minimization/maximize
- ❌ Native file dialogs
- ✅ API requests (via fetch)
- ✅ Opening external links
- ✅ Basic configuration storage (localStorage)
- ✅ Display and navigation features

## Files Modified/Created

```
src/
├── utils/
│   ├── mockIpc.ts                 [NEW] Full mock implementation
│   └── ipcBridge.ts               [NEW] Environment detection bridge
├── global.d.ts                    [NEW] Global type declarations
├── renderer.ts                    [MODIFIED] Import ipcBridge first
└── index.html                     [MODIFIED] Minimal fallback
```

## TypeScript Support

Full type checking is maintained throughout. The `global.d.ts` ensures TypeScript knows about the global `ipc` variable, so you get proper autocomplete and error checking.

## Future Enhancements

To improve browser deployment further, consider:
1. Mock database with IndexedDB for local persistence
2. Service Worker for offline capability
3. WebSocket for real-time sync with actual backend
4. Progressive enhancement based on available APIs
