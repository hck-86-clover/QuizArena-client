import { useState } from 'react';
import { getGame } from '../lib/api';
import { connect, getSocket } from '../lib/socket';
import { useAuth } from '../AuthContext';

export default function JoinGame({ onJoined }) {
	const { token } = useAuth();
	const [code, setCode] = useState('');
	const [name, setName] = useState(localStorage.getItem('displayName') || '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const submit = async e => {
		e.preventDefault();
		setLoading(true); setError('');
		try {
			// Fetch metadata (includes createdBy)
			const meta = await getGame(code);
			if (!getSocket()) connect(token);
			localStorage.setItem('displayName', name);
			getSocket().emit('room:join', { code, name });
			if (onJoined) onJoined(code, name, meta);
		} catch (e2) {
			setError(e2.message);
		} finally { setLoading(false); }
	};

		return (
			<div className="card max-w-md mx-auto mt-10 space-y-6">
				<h3 className="heading-lg text-text dark:text-white">Join Game</h3>
				<form onSubmit={submit} className="flex flex-col gap-5">
					<div>
						<label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300 uppercase tracking-wide">Code</label>
						<input className="input-base tracking-widest text-center" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} required placeholder="ABC123" />
					</div>
					<div>
						<label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300 uppercase tracking-wide">Name</label>
						<input className="input-base" value={name} onChange={e=>setName(e.target.value)} required />
					</div>
					{error && <div className="text-secondary text-sm font-medium">{error}</div>}
					<button disabled={loading} className="btn-primary self-start disabled:opacity-60">{loading ? 'Joining...' : 'Join Game'}</button>
				</form>
			</div>
		);
}
// ...removed inline style object (migrated to Tailwind)
