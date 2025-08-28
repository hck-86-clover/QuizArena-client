import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function AuthForm({ onSuccess }) {
	const { login, register, loading, error } = useAuth();
	const [mode, setMode] = useState('login');
	const [form, setForm] = useState({ email: '', name: '', password: '' });

	const switchMode = () => setMode(m => m === 'login' ? 'register' : 'login');
	const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async e => {
		e.preventDefault();
		const action = mode === 'login' ? login : register;
		const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
		const ok = await action(payload);
		if (ok && onSuccess) onSuccess();
	};

	return (
			<div className="card max-w-sm mx-auto mt-16 w-full">
				<div className="text-center mb-4 animate-[fadeIn_.6s_ease]">
					<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text select-none">QuizArena</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-white/70">Real-time AI powered quiz battles</p>
				</div>
				<h2 className="heading-lg text-center mb-6 dark:text-white">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<input className="input-base" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
					{mode === 'register' && (
						<input className="input-base" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
					)}
					<input className="input-base" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
					{error && <div className="text-secondary text-sm font-medium">{error}</div>}
					<button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
						{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
					</button>
				</form>
				<button onClick={switchMode} className="w-full mt-4 text-primary hover:text-secondary font-medium transition-all text-sm dark:text-primary dark:hover:text-secondary">
					{mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
				</button>
		</div>
	);
}
