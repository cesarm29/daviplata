import { NativeModules } from 'react-native';

const { DaviplataModule } = NativeModules;

export const bridge = {
  async getSession(): Promise<{
    sessionId: string;
    userId: string;
    name: string;
    phone: string;
    expiresAt: number;
  } | null> {
    try {
      return await DaviplataModule.getSession();
    } catch {
      return null;
    }
  },

  async checkSecurity(): Promise<{ isRooted: boolean }> {
    try {
      return await DaviplataModule.checkSecurity();
    } catch {
      return { isRooted: false };
    }
  },

  sendEvent(eventName: string, data?: Record<string, any>) {
    DaviplataModule.sendEvent(eventName, data || {});
  },

  async getBalance(token: string): Promise<{ balance: number; accountNumber: string }> {
    return DaviplataModule.getBalance(token);
  },

  async performTransfer(data: {
    token: string;
    destinationPhone: string;
    amount: number;
    description?: string;
  }): Promise<any> {
    return DaviplataModule.performTransfer(data);
  },

  async getMovements(token: string, page: number = 1): Promise<{
    transactions: any[];
    total: number;
    page: number;
  }> {
    return DaviplataModule.getMovements(token, page);
  },
};