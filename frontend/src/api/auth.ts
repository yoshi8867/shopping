import client from './client';
import type { AuthResponse, User } from '../types';

export const register = (data: { email: string; password: string; name: string }) =>
  client.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  client.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const getMe = () =>
  client.get<User>('/users/me').then((r) => r.data);

export const updateMe = (data: Partial<{ name: string; phone: string; address: string; password: string }>) =>
  client.patch<User>('/users/me', data).then((r) => r.data);
