import { useState } from 'react';
import { createGame } from '../lib/api';
import { getSocket, connect } from '../lib/socket';
import { useAuth } from '../AuthContext';

export default function CreateGame({ onCreated }) {
	const { token, user } = useAuth();
	const [theme, setTheme] = useState('random');
	const [difficulty, setDifficulty] = useState('easy');
	const [totalQuestions, setTotalQuestions] = useState(15);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const submit = async e => {
		e.preventDefault();
		setLoading(true); setError('');
		try {
			const { code, createdBy } = await createGame({ theme, difficulty, totalQuestions });
			if (!getSocket()) connect(token);
			// host joins room with their display name
			getSocket().emit('room:join', { code, name: user?.name || 'Host' });
			if (onCreated) onCreated(code, createdBy);
		} catch (e2) {
			setError(e2.message);
		} finally { setLoading(false); }
	};

		return (
			<div className="card max-w-md mx-auto mt-10 space-y-6">
				<h3 className="heading-lg text-text dark:text-white">Create Game</h3>
				<form onSubmit={submit} className="flex flex-col gap-5">
					<div>
						<label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300 uppercase tracking-wide">Theme</label>
						<input className="input-base" value={theme} onChange={e=>setTheme(e.target.value)} required />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300 uppercase tracking-wide">Difficulty</label>
							<select className="input-base" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
						</div>
						<div>
							<label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300 uppercase tracking-wide">Questions</label>
							<select className="input-base" value={totalQuestions} onChange={e=>setTotalQuestions(Number(e.target.value))}>
								<option value={10}>10</option>
								<option value={15}>15</option>
								<option value={20}>20</option>
							</select>
						</div>
					</div>
					{error && <div className="text-secondary text-sm font-medium">{error}</div>}
					<button disabled={loading} className="btn-primary self-start disabled:opacity-60">{loading ? 'Creating...' : 'Create Game'}</button>
				</form>
			</div>
		);
}
// ...removed inline style object (migrated to Tailwind)
