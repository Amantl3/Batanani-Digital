import api from './api';
import type { User, LoginCredentials, RegisterPayload } from '@/types';

export const login = (creds: LoginCredentials) => {
	console.log('[authService] login() called with email:', creds.email);
	return api
		.post<{ user: User; accessToken: string }>('/auth/login', creds)
		.then((r) => {
			console.log('[authService] login() response received');
			return r.data;
		});
};

export const register = (payload: RegisterPayload) =>
	api.post<{ user: User }>('/auth/register', payload).then((r) => r.data);

export const logout = () => api.post('/auth/logout').then((r) => r.data);

export const getMe = () => api.get<User>('/auth/me').then((r) => r.data);

export const refreshToken = () =>
	api.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data);

export const forgotPassword = (email: string) =>
	api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token: string, password: string) =>
	api.post('/auth/reset-password', { token, password }).then((r) => r.data);
