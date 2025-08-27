import { io } from 'socket.io-client';

let socket = null;

export function connect(token) {
	if (socket) return socket;
	const base = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
	socket = io(base, {
		auth: token ? { token } : {},
		autoConnect: true
	});
	return socket;
}

export function getSocket() {
	return socket;
}

export function disconnect() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
