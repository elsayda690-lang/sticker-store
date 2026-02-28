/**
 * Mock IPC for browser/web deployment environments.
 * Provides stub implementations of all IPC methods with console logging for debugging.
 */

import type { IPC } from 'main/preload';

type IPCRendererListener = (event: any, ...args: unknown[]) => void;

export const mockIpc: IPC = {
  desktop: false,

  reloadWindow() {
    console.log('[MockIPC] reloadWindow called');
    window.location.reload();
  },

  minimizeWindow() {
    console.log('[MockIPC] minimizeWindow called - not available in browser');
  },

  toggleMaximize() {
    console.log('[MockIPC] toggleMaximize called - not available in browser');
  },

  isMaximized() {
    console.log('[MockIPC] isMaximized called');
    return Promise.resolve(false);
  },

  isFullscreen() {
    console.log('[MockIPC] isFullscreen called');
    return Promise.resolve(false);
  },

  closeWindow() {
    console.log('[MockIPC] closeWindow called');
    window.close();
  },

  async getCreds() {
    console.log('[MockIPC] getCreds called');
    return { username: 'demo', password: 'demo' };
  },

  async getLanguageMap(code: string) {
    console.log('[MockIPC] getLanguageMap called with code:', code);
    return {
      languageMap: {},
      success: false,
      message: 'Language maps not available in browser',
    };
  },

  async getTemplates(posTemplateWidth?: number) {
    console.log('[MockIPC] getTemplates called');
    return [];
  },

  async initScheduler(time: string) {
    console.log('[MockIPC] initScheduler called with time:', time);
  },

  async selectFile(options: any) {
    console.log('[MockIPC] selectFile called with options:', options);
    return { filePaths: [], cancelled: true };
  },

  async getSaveFilePath(options: any) {
    console.log('[MockIPC] getSaveFilePath called with options:', options);
    return { filePath: '', cancelled: true };
  },

  async getOpenFilePath(options: any) {
    console.log('[MockIPC] getOpenFilePath called with options:', options);
    return { filePaths: [], cancelled: true };
  },

  async checkDbAccess(filePath: string) {
    console.log('[MockIPC] checkDbAccess called for:', filePath);
    return false;
  },

  async checkForUpdates() {
    console.log('[MockIPC] checkForUpdates called');
  },

  openLink(link: string) {
    console.log('[MockIPC] openLink called with:', link);
    window.open(link, '_blank');
  },

  async deleteFile(filePath: string) {
    console.log('[MockIPC] deleteFile called for:', filePath);
    return { success: false, error: 'File operations not available in browser' };
  },

  async saveData(data: string, savePath: string) {
    console.log('[MockIPC] saveData called for path:', savePath);
    // Browser fallback: trigger a download
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = savePath.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  showItemInFolder(filePath: string) {
    console.log('[MockIPC] showItemInFolder called for:', filePath);
  },

  async makePDF(html: string, savePath: string, width: number, height: number) {
    console.log('[MockIPC] makePDF called for path:', savePath);
    return false;
  },

  async printDocument(html: string, width: number, height: number) {
    console.log('[MockIPC] printDocument called');
    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    return false;
  },

  async getDbList() {
    console.log('[MockIPC] getDbList called');
    return [];
  },

  async getDbDefaultPath(companyName: string) {
    console.log('[MockIPC] getDbDefaultPath called for:', companyName);
    return '';
  },

  async getEnv() {
    console.log('[MockIPC] getEnv called');
    return {
      isDevelopment: process.env.NODE_ENV !== 'production',
      platform: 'web',
      version: '0.36.0',
    };
  },

  openExternalUrl(url: string) {
    console.log('[MockIPC] openExternalUrl called with:', url);
    window.open(url, '_blank');
  },

  async showError(title: string, content: string) {
    console.log('[MockIPC] showError called:', { title, content });
    alert(`${title}\n\n${content}`);
  },

  async sendError(body: string) {
    console.log('[MockIPC] sendError called with:', body);
  },

  async sendAPIRequest(endpoint: string, options: RequestInit | undefined) {
    console.log('[MockIPC] sendAPIRequest called for endpoint:', endpoint);
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('[MockIPC] API request failed:', err);
      return [];
    }
  },

  registerMainProcessErrorListener(listener: IPCRendererListener) {
    console.log('[MockIPC] registerMainProcessErrorListener - listener registered');
  },

  registerTriggerFrontendActionListener(listener: IPCRendererListener) {
    console.log('[MockIPC] registerTriggerFrontendActionListener - listener registered');
  },

  registerConsoleLogListener(listener: IPCRendererListener) {
    console.log('[MockIPC] registerConsoleLogListener - listener registered');
  },

  db: {
    async getSchema() {
      console.log('[MockIPC] db.getSchema called');
      return { success: false, error: 'Database not available in browser' };
    },

    async create(dbPath: string, countryCode?: string) {
      console.log('[MockIPC] db.create called:', { dbPath, countryCode });
      return { success: false, error: 'Database not available in browser' };
    },

    async connect(dbPath: string, countryCode?: string) {
      console.log('[MockIPC] db.connect called:', { dbPath, countryCode });
      return { success: false, error: 'Database not available in browser' };
    },

    async call(method: string, ...args: unknown[]) {
      console.log('[MockIPC] db.call:', { method, args });
      return { success: false, error: 'Database not available in browser' };
    },

    async bespoke(method: string, ...args: unknown[]) {
      console.log('[MockIPC] db.bespoke:', { method, args });
      return { success: false, error: 'Database not available in browser' };
    },
  },

  store: {
    get(key: string) {
      console.log('[MockIPC] store.get:', key);
      // Try localStorage as fallback
      try {
        const value = localStorage.getItem(`frappe-books:${key}`);
        return value ? JSON.parse(value) : undefined;
      } catch {
        return undefined;
      }
    },

    set(key: string, value: any) {
      console.log('[MockIPC] store.set:', { key, value });
      // Try localStorage as fallback
      try {
        localStorage.setItem(`frappe-books:${key}`, JSON.stringify(value));
      } catch {
        // Silently fail - storage quota exceeded or private mode
      }
    },

    delete(key: string) {
      console.log('[MockIPC] store.delete:', key);
      // Try localStorage as fallback
      try {
        localStorage.removeItem(`frappe-books:${key}`);
      } catch {
        // Silently fail
      }
    },
  },
};
