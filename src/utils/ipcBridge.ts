/**
 * IPC Bridge: Provides seamless access to IPC API in both Electron and browser environments.
 * - In Electron: Uses the real IPC from preload.ts (window.ipc)
 * - In Browser: Uses a mock IPC implementation for development/deployment
 */

import type { IPC } from 'main/preload';
import { mockIpc } from './mockIpc';

/**
 * Get the appropriate IPC implementation based on the environment.
 * Checks for window.ipc (Electron) or falls back to mock (browser).
 */
function getIpc(): IPC {
  // Check if we're running in Electron (window.ipc is exposed by preload.ts)
  if (typeof window !== 'undefined' && window.ipc && typeof window.ipc === 'object') {
    return window.ipc;
  }

  // Fallback to mock for browser/web deployment
  return mockIpc;
}

/**
 * Global IPC instance - use this throughout the app
 */
export const ipc = getIpc();

/**
 * Declare window.ipc globally so TypeScript knows about it
 */
declare global {
  interface Window {
    ipc?: IPC;
  }
}

export type { IPC };
