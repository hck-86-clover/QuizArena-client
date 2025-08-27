import axios from 'axios';

// Base URL from env or fallback
const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const api = axios.create({
	baseURL: baseURL.replace(/\/$/, '') + '/api'
});

// Attach token if present
api.interceptors.request.use(cfg => {
	const token = localStorage.getItem('token');
	if (token) cfg.headers.Authorization = `Bearer ${token}`;
	return cfg;
});

// Basic error normalization
api.interceptors.response.use(
	res => res,
	err => {
		const msg = err?.response?.data?.error || err.message || 'Request error';
		return Promise.reject(new Error(msg));
	}
);

// Auth endpoints
export function register(data) {
	return api.post('/auth/register', data).then(r => r.data);
}
export function login(data) {
	return api.post('/auth/login', data).then(r => r.data);
}

// Game endpoints
export function createGame(data) {
	return api.post('/games', data).then(r => r.data); // { code, createdBy }
}
export function getGame(code) {
	return api.get(`/games/${code}`).then(r => r.data); // includes createdBy
}
export function startGame(code) {
	return api.post(`/games/${code}/start`).then(r => r.data);
}

export default api;
