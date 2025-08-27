import { useEffect } from 'react';
import { getSocket } from '../lib/socket';

export default function Lobby({ code, players, isHost, onStart, onLeave }) {
	const copyCode = () => navigator.clipboard.writeText(code).catch(()=>{});
	const start = () => { if (!isHost) return; getSocket()?.emit('host:start', { code }); onStart && onStart(); };

	useEffect(()=>{},[code]);

		return (
			<div className="card max-w-2xl mx-auto mt-10">
				<div className="flex items-center justify-between mb-6">
					<h2 className="heading-lg dark:text-white">Lobby</h2>
					<div
						onClick={copyCode}
						title="Click to copy room code"
						className="font-mono text-xl font-bold bg-primary/10 text-primary px-5 py-2 rounded-lg cursor-pointer select-none border border-primary/30 hover:bg-primary/20 transition-colors dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30"
					>{code}</div>
				</div>
				<div>
					<h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-white/70 uppercase tracking-wide">Players ({players.length})</h4>
					<ul className="space-y-2">
						{players.map((p,i)=> (
							<li key={p.id} className={`leader-row ${i===0 ? 'leader-top' : ''}`}> 
								<span className="font-medium">{p.name}</span>
								<span className="score-badge">{p.score}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="flex gap-4 mt-8">
					{isHost && <button onClick={start} className="btn-primary">Start Game</button>}
					{onLeave && <button onClick={onLeave} className="btn-secondary">Leave</button>}
				</div>
				{!isHost && <p className="mt-6 subtle dark:text-white/60">Waiting for host to start...</p>}
			</div>
		);
}
