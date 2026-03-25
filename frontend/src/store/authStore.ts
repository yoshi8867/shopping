import { create } from 'zustand';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    const { accessToken } = await authApi.login({ email, password });
    localStorage.setItem('token', accessToken);
    set({ token: accessToken });
    const user = await authApi.getMe();
    set({ user });
  },

  register: async (email, password, name) => {
    await authApi.register({ email, password, name });
    // 가입 후 자동 로그인
    const { accessToken } = await authApi.login({ email, password });
    localStorage.setItem('token', accessToken);
    set({ token: accessToken });
    const user = await authApi.getMe();
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authApi.getMe();
      set({ user });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },
}));
