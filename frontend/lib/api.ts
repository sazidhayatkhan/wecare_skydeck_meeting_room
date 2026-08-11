import { Booking, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'roombook_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { ...options, headers }).then((r) => handle<T>(r));
}

export const api = {
  signup: (data: { companyName: string; email: string; pin: string }) =>
    request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; pin: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: User }>('/auth/me'),

  updateTheme: (theme: string) =>
    request<{ user: User }>('/auth/theme', {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    }),

  getAllBookings: (): Promise<Booking[]> => request('/bookings'),

  createBooking: (data: { startTime: string; endTime: string }): Promise<Booking> =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelBooking: (id: string): Promise<{ success: boolean }> =>
    request(`/bookings/${id}`, { method: 'DELETE' }),
};
