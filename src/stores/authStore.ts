import { create } from 'zustand';

import { apiRequest, setUnauthorizedHandler } from '@/api/lumora/client';
import { HttpError } from '@/api/httpError';
import { tokenStorage } from '@/storage/tokenStorage';
import type { LoginResponse, User } from '@/types/api';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  busy: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
  forgetSession: () => Promise<void>;
  logout: () => Promise<void>;
}

async function clearSession() {
  await tokenStorage.clear();
  useAuthStore.setState({ token: null, user: null });
}

async function fetchUser(token: string) {
  try {
    return await apiRequest<User>('/user', { token });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      await clearSession();
    }
    throw error;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,
  busy: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const token = await tokenStorage.get();

    if (!token) {
      set({ hydrated: true });
      return;
    }

    try {
      const user = await fetchUser(token);
      set({ token, user, hydrated: true });
    } catch {
      set({ token: null, user: null, hydrated: true });
    }
  },

  login: async (email, password, remember = true) => {
    set({ busy: true });
    try {
      const response = await apiRequest<LoginResponse>('/login', {
        method: 'POST',
        body: { email, password, remember },
      });
      await tokenStorage.set(response.access_token);
      const user = await fetchUser(response.access_token);
      set({ token: response.access_token, user });
    } finally {
      set({ busy: false });
    }
  },

  register: async (name, email, password, passwordConfirmation) => {
    set({ busy: true });
    try {
      await apiRequest<void>('/register', {
        method: 'POST',
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      await get().login(email, password, true);
    } finally {
      set({ busy: false });
    }
  },

  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    const user = await fetchUser(token);
    set({ user });
  },

  forgetSession: clearSession,

  logout: async () => {
    const token = get().token;
    try {
      if (token) {
        await apiRequest<void>('/logout', { method: 'POST', token });
      }
    } finally {
      await clearSession();
    }
  },
}));

setUnauthorizedHandler(clearSession);
