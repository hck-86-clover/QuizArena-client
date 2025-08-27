import React, { useEffect, useState } from 'react';

export default function Results({ players, onPlayAgain, onExit }) {
  const sorted = [...players].sort((a,b)=>b.score-a.score);
  const topScore = sorted[0]?.score || 1;
  const [confetti, setConfetti] = useState([]);

  useEffect(()=>{
    // generate confetti pieces only once
    if (sorted.length) {
      const pieces = Array.from({ length: 60 }).map((_,i)=> ({
        id:i,
        left: Math.random()*100,
        delay: (Math.random()*2).toFixed(2),
        duration: (5+Math.random()*3).toFixed(2),
        color: ['#4ECDC4','#FF6B6B','#FFE66D','#ffffff','#1E2430'][Math.floor(Math.random()*5)]
      }));
      setConfetti(pieces);
    }
  },[sorted.length]);

  return (
    <div className="relative">
      {confetti.length>0 && (
        <div className="confetti-container">
          {confetti.map(p=> (
            <div key={p.id} className="confetti-piece" style={{ left:p.left+'%', animationDelay:p.delay+'s', animationDuration:p.duration+'s', ['--c']:p.color }} />
          ))}
        </div>
      )}
      <div className="card max-w-3xl mx-auto mt-12 relative z-10">
        <h2 className="heading-lg mb-2 dark:text-white flex items-center gap-3">
          Final Standings
          {sorted[0] && <span className="badge">Winner</span>}
        </h2>
        <p className="subtle mb-6 dark:text-white/60">Great game! See how everyone ranked.</p>
        <div className="flex flex-col gap-3">
          {sorted.map((p,i)=> {
            const ratio = (p.score / topScore) * 100;
            const medal = i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : null;
            return (
              <div key={p.id} className={`leader-row ${i===0 ? 'leader-top animate-winner' : ''} flex gap-4 items-center dark:border-gray-700 dark:bg-[#1E2430]`}> 
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${i===0?'bg-white text-primary':'bg-primary text-white'}`}>{i+1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`font-medium flex items-center gap-2 ${i===0?'text-white':'text-text dark:text-white'}`}>{medal && <span className="text-lg" aria-hidden>{medal}</span>}{p.name||p.username}</div>
                    <div className={`font-semibold tabular-nums ${i===0?'text-white':'text-primary dark:text-primary'}`}>{p.score}</div>
                  </div>
                  <div className={`h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                    <div className={`h-full ${i===0?'bg-white':'bg-primary'}`} style={{ width: ratio + '%' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-10">
          <button onClick={onPlayAgain} className="btn-primary">Play Again</button>
          <button onClick={onExit} className="btn-secondary">Exit</button>
        </div>
      </div>
    </div>
  );
}
