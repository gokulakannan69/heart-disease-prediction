
import { MedicalReport, Block, User, AuthState } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const SESSION_KEY = 'hg_session';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const databaseService = {
  getReports: async (): Promise<MedicalReport[]> => {
    return request<MedicalReport[]>('/reports');
  },

  saveReport: async (report: MedicalReport): Promise<void> => {
    await request('/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  },

  getBlockchain: async (): Promise<Block[]> => {
    return request<Block[]>('/blockchain');
  },

  saveBlock: async (block: Block): Promise<void> => {
    await request('/blockchain', {
      method: 'POST',
      body: JSON.stringify(block)
    });
  },

  getUsers: async (): Promise<User[]> => {
    return request<User[]>('/users');
  },

  saveUser: async (user: User): Promise<boolean> => {
    try {
      const result = await request<{ success: boolean }>('/users/register', {
        method: 'POST',
        body: JSON.stringify(user)
      });
      return result.success;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        return false;
      }
      throw error;
    }
  },

  loginUser: async (email: string, pass: string): Promise<{ success: boolean; user?: User }> => {
    try {
      return await request<{ success: boolean; user?: User }>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass })
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { success: false };
      }
      throw error;
    }
  },

  getSession: (): AuthState => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  },

  saveSession: (auth: AuthState): void => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  },

  clearSession: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  migrateFromLegacy: async (): Promise<void> => {
    // Local migration is no longer needed after MongoDB integration.
    return Promise.resolve();
  }
};
