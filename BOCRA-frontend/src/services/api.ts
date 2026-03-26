/// <reference types="vite/client" />
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

const BASE_URL =
	import.meta.env.VITE_API_BASE_URL ??
	'https://batanani-digital-production.up.railway.app/api';

export const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: false, // TEMPORARILY false to debug CORS - backend needs to fix CORS headers
	timeout: 15_000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// ── Auto-refresh token on 401 ─────────────────────────────────────────────────
let isRefreshing = false;
let queue: { resolve: () => void; reject: (e: unknown) => void }[] = [];

function drain(error: unknown, success: boolean) {
	queue.forEach((p) => (success ? p.resolve() : p.reject(error)));
	queue = [];
}

api.interceptors.response.use(
	(res) => res,
	async (err: AxiosError) => {
		const orig = err.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		console.error('[API] Response error:', {
			status: err.response?.status,
			url: err.config?.url,
			data: err.response?.data,
		});

		if (err.response?.status === 401 && !orig._retry) {
			console.log('[API] 401 Unauthorized - attempting token refresh');
			if (isRefreshing) {
				return new Promise<void>((resolve, reject) =>
					queue.push({ resolve, reject }),
				).then(() => api(orig));
			}
			orig._retry = true;
			isRefreshing = true;
			try {
				// Backend sets a fresh access_token cookie automatically
				await api.post('/auth/refresh');
				drain(null, true);
				return api(orig);
			} catch (refreshErr) {
				drain(refreshErr, false);
				window.location.href = '/login';
				return Promise.reject(refreshErr);
			} finally {
				isRefreshing = false;
			}
		}

		const apiError: ApiError = {
			type: 'about:blank',
			title: 'An error occurred',
			status: err.response?.status ?? 0,
			detail: 'Something went wrong. Please try again.',
			instance: orig?.url ?? '',
			...(err.response?.data as Partial<ApiError>),
		};
		return Promise.reject(apiError);
	},
);

export default api;
