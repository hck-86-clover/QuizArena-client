import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from './lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('token') || '');
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem('user');
		return raw ? JSON.parse(raw) : null;
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const persist = (tokenVal, userVal) => {
		if (tokenVal) localStorage.setItem('token', tokenVal); else localStorage.removeItem('token');
		if (userVal) localStorage.setItem('user', JSON.stringify(userVal)); else localStorage.removeItem('user');
	};

		const handleAuthResult = useCallback(({ token: t, user: u }) => {
			setToken(t); setUser(u); persist(t, u); setError('');
		}, []);

		const login = useCallback(async (credentials) => {
		setLoading(true); setError('');
		try {
			const data = await apiLogin(credentials);
			handleAuthResult(data);
			return true;
		} catch (e) {
			setError(e.message);
			return false;
		} finally { setLoading(false); }
			}, [handleAuthResult]);

		const register = useCallback(async (payload) => {
		setLoading(true); setError('');
		try {
			const data = await apiRegister(payload);
			handleAuthResult(data);
			return true;
		} catch (e) {
			setError(e.message);
			return false;
		} finally { setLoading(false); }
			}, [handleAuthResult]);

	const logout = () => {
		setToken(''); setUser(null); persist('', null);
	};

	const value = { token, user, loading, error, login, register, logout };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}

// Intentionally no default export to satisfy react-refresh rules
