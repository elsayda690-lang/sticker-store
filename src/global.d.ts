/**
 * Global IPC type declaration for TypeScript
 */
import type { IPC } from 'main/preload';

declare global {
  var ipc: IPC;
  interface Window {
    ipc: IPC;
  }
}

export {};
