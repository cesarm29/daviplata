import { NativeModules } from 'react-native';

interface DevBridge {
  navigate: (screen: string, props?: Record<string, any>) => void;
  handleEvent: (event: string, data?: Record<string, any>) => void;
  api: {
    getBalance: (token: string) => Promise<any>;
    transfer: (token: string, data: any) => Promise<any>;
    getMovements: (token: string, page: number) => Promise<any>;
  };
}

declare const __DEV__: boolean | undefined;

const isMetro = typeof __DEV__ !== 'undefined' && __DEV__;

const NativeBridge = NativeModules.DaviplataModule;

function getDevBridge(): DevBridge | undefined {
  try {
    return (globalThis as any).__devBridge;
  } catch {
    return undefined;
  }
}

const DevBridge = {
  async getSession(): Promise<any> {
    return getDevBridge()?.navigate
      ? { sessionId: 'dev', userId: '', name: '', phone: '', expiresAt: Date.now() + 86400000 }
      : null;
  },
  async checkSecurity(): Promise<{ isRooted: boolean }> {
    return { isRooted: false };
  },
  sendEvent(eventName: string, data?: Record<string, any>) {
    getDevBridge()?.handleEvent(eventName, data);
  },
  async getBalance(token: string): Promise<{ balance: number; accountNumber: string }> {
    const api = getDevBridge()?.api;
    if (api) return api.getBalance(token);
    return { balance: 0, accountNumber: '' };
  },
  async performTransfer(data: any): Promise<any> {
    const api = getDevBridge()?.api;
    if (api) return api.transfer(data.token, data);
    return {};
  },
  async getMovements(token: string, page: number = 1): Promise<any> {
    const api = getDevBridge()?.api;
    if (api) return api.getMovements(token, page);
    return { transactions: [], total: 0, page: 1 };
  },
};

export const bridge = isMetro ? DevBridge : {
  async getSession(): Promise<any> {
    try { return await NativeBridge.getSession(); } catch { return null; }
  },
  async checkSecurity(): Promise<{ isRooted: boolean }> {
    try { return await NativeBridge.checkSecurity(); } catch { return { isRooted: false }; }
  },
  sendEvent(eventName: string, data?: Record<string, any>) {
    NativeBridge.sendEvent(eventName, data || {});
  },
  async getBalance(token: string): Promise<{ balance: number; accountNumber: string }> {
    return NativeBridge.getBalance(token);
  },
  async performTransfer(data: any): Promise<any> {
    return NativeBridge.performTransfer(data);
  },
  async getMovements(token: string, page: number = 1): Promise<any> {
    return NativeBridge.getMovements(token, page);
  },
};