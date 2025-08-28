import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';

export default function QuestionView({ code, question, onAnswered }) {
	const [secondsLeft, setSecondsLeft] = useState(question.timeLimitSec);
	const [locked, setLocked] = useState(false);
	const total = question.timeLimitSec;

	useEffect(() => {
		setSecondsLeft(question.timeLimitSec);
		setLocked(false);
		const interval = setInterval(() => {
			setSecondsLeft(s => {
				if (s <= 1) { clearInterval(interval); return 0; }
				return s - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [question.index, question.timeLimitSec]);

	const answer = idx => {
		if (locked) return;
		setLocked(true);
		getSocket()?.emit('player:answer', { code, index: question.index, answerIndex: idx });
		onAnswered && onAnswered(idx);
	};

	const pct = (secondsLeft / total) * 100;

	return (
		<div className="card max-w-3xl mx-auto mt-10">
			<div className="flex items-center justify-between mb-4">
				<h2 className="heading-lg dark:text-white">Question {question.index + 1}</h2>
				<div className="text-sm font-semibold text-gray-600 dark:text-white/70 tabular-nums">{secondsLeft}s</div>
			</div>
			<div className="timer-track mb-6">
				<div className="timer-fill" style={{ width: pct + '%' }} />
			</div>
			<p className="text-base leading-relaxed font-medium mb-6 dark:text-white">{question.text}</p>
			<div className="grid gap-4 md:grid-cols-2">
				{question.choices.map((c,i)=>(
					<button
						key={i}
						onClick={()=>answer(i)}
						disabled={locked || secondsLeft===0}
						className={`question-choice ${locked ? 'question-choice-disabled' : ''}`}
					>
						<span className="block text-xs uppercase tracking-wide text-gray-500 mb-1 font-semibold">{String.fromCharCode(65+i)}</span>
						<span>{c}</span>
					</button>
				))}
			</div>
			{locked && <div className="mt-6 subtle font-medium">Answer locked in.</div>}
		</div>
	);
}
