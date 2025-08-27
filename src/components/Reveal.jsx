import React, { useEffect, useState, useRef } from 'react';
import { getSocket } from '../lib/socket';

export default function Reveal({ question, answers, players, code }) {
  const correctLetter = question?.correctIndex != null ? String.fromCharCode(65 + question.correctIndex) : null;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);

  useEffect(()=>{
    const s = getSocket();
    if (!s) return;
    const onMsg = msg => {
      if (msg && msg.text) setMessages(m => [...m, msg]);
    };
    s.on('chat:message', onMsg);
    return () => { s.off('chat:message', onMsg); };
  },[code]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  },[messages]);

  const send = e => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const s = getSocket();
    if (s && code) s.emit('chat:message', { code, text });
    setDraft('');
  };
  return (
  <div className="card max-w-5xl mx-auto mt-10 grid gap-8">
  <h2 className="heading-lg mb-4 dark:text-white">Answer Reveal</h2>
  <p className="text-base font-medium mb-6 dark:text-white">{question?.text}</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-5">
        {question?.choices?.map((c,i)=>(
          <div key={i} className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-start gap-2 ${i===question.correctIndex? 'bg-accent/30 border-accent':'bg-white dark:bg-[#1E2430] border-gray-200 dark:border-gray-700'}`}>
            <span className="font-semibold text-gray-500 dark:text-white/70">{String.fromCharCode(65+i)}.</span>
            <span>{c}</span>
          </div>
        ))}
      </div>
      {question?.explanation && (
        <div className="info-box mb-5">💡 <span>{question.explanation}</span></div>
      )}
  <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-white/70 uppercase tracking-wide">Player Answers</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
  <table className="min-w-[520px] w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="table-cell font-medium">Player</th>
              <th className="table-cell font-medium">Answer</th>
              <th className="table-cell font-medium">Result</th>
              <th className="table-cell font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {answers.map(a=>{
              const player = players.find(p=>p.id===a.playerId) || {}; 
              const letter = a.answerIndex!=null?String.fromCharCode(65+a.answerIndex):'-';
              return (
                <tr key={a.playerId} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="table-cell font-medium dark:text-white">{player.name||player.username||a.playerId}</td>
                  <td className="table-cell dark:text-white/80">{letter}</td>
                  <td className={`table-cell font-medium ${a.correct? 'text-green-600 dark:text-green-400':'text-secondary'}`}>{a.correct? 'Correct':'Wrong'}</td>
                  <td className="table-cell font-semibold text-primary dark:text-primary">{a.totalScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-white/80">Correct Answer: <span className="font-semibold text-primary">{correctLetter}</span></span>
            <span className="text-xs subtle">Next question in a few seconds...</span>
          </div>
        </div>
        <div className="md:col-span-1 flex flex-col">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/60 mb-2">Chat</h5>
          <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-[#1E2430]/70 backdrop-blur max-h-64 h-64 overflow-y-auto p-2 text-xs gap-1">
            {messages.map(m => (
              <div key={m.id} className="flex gap-1">
                <span className="font-semibold text-primary dark:text-primary truncate max-w-[80px]">{m.name}:</span>
                <span className="flex-1 break-words text-gray-700 dark:text-white/80">{m.text}</span>
              </div>
            ))}
            <div ref={endRef} />
            {messages.length===0 && <div className="text-gray-400 dark:text-white/40 italic">No messages yet</div>}
          </div>
          <form onSubmit={send} className="mt-2 flex gap-2">
            <input
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              maxLength={300}
              placeholder="Say something"
              className="input-base py-2 text-xs"
            />
            <button className="btn-primary text-xs px-3 py-2" type="submit" disabled={!draft.trim()}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
