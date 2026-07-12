const DEFAULT_BASE_URL = 'https://daviplata-api.vercel.app/api';

interface FetchOptions {
  baseUrl?: string;
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {},
  init?: RequestInit
): Promise<T> {
  const url = `${options.baseUrl || DEFAULT_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...((init?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  async login(
    email: string,
    password: string,
    opts?: FetchOptions
  ): Promise<{ sessionId: string; token: string; user: any }> {
    return request('/auth/login', opts, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getBalance(token: string, opts?: FetchOptions): Promise<{ balance: number; accountNumber: string }> {
    return request('/accounts/balance', { ...opts, token });
  },

  async transfer(
    token: string,
    data: { destinationPhone: string; amount: number; description?: string },
    opts?: FetchOptions
  ): Promise<any> {
    return request('/transactions/transfer', { ...opts, token }, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMovements(
    token: string,
    page: number = 1,
    limit: number = 20,
    opts?: FetchOptions
  ): Promise<{ transactions: any[]; total: number; page: number }> {
    return request(`/transactions/movements?page=${page}&limit=${limit}`, { ...opts, token });
  },
};
