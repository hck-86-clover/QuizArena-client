import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import { getSocket, disconnect as disconnectSocket } from "./lib/socket";
import AuthForm from "./components/AuthForm";
import CreateGame from "./components/CreateGame";
import JoinGame from "./components/JoinGame";
import Lobby from "./components/Lobby";
import QuestionView from "./components/QuestionView";
import Reveal from "./components/Reveal";
import Results from "./components/Results";
import NavBar from "./components/NavBar";

function AppInner() {
  const { token, user } = useAuth();
  const [mode, setMode] = useState(token ? "home" : "auth");
  const [gameCode, setGameCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [revealData, setRevealData] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [aborted, setAborted] = useState(false);
  // cumulative leaderboard (persists across sessions)
  const [scoreboard, setScoreboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scoreboard') || '{}'); } catch { return {}; }
  });
  function isHost() {
    if (!user) return false;
    return createdBy && user.id === createdBy;
  }

  function leaveGame() {
    setGameCode("");
    setPlayers([]);
    setMode("home");
    setAborted(false);
  }

  // update cumulative scoreboard at game end
  const updateScoreboard = useCallback((finalPlayers) => {
    if (aborted) return; // do not persist if user quit early
    setScoreboard(prev => {
      const next = { ...prev };
      finalPlayers.forEach(p => {
        const key = p.name || p.username || p.id;
        next[key] = (next[key] || 0) + (p.score || 0);
      });
      localStorage.setItem('scoreboard', JSON.stringify(next));
      return next;
    });
  }, [aborted]);

  // Attach socket listeners for players when in lobby
  useEffect(() => {
    const s = getSocket();
    if (!s || aborted) return;
    const onPlayers = ({ players }) => setPlayers(players);
    const onQuestion = (q) => {
      setRevealData(null);
      setQuestion(q);
      setMode("question");
    };
    const onReveal = (payload) => {
      setRevealData({
        answers: (payload.perPlayer || []).map((a) => ({
          playerId: a.playerId,
          answerIndex: a.answerIndex,
          correct: a.isCorrect,
          deltaScore: a.deltaScore || 0,
          totalScore: players.find((p) => p.id === a.playerId)?.score || 0,
        })),
        correctIndex: payload.correctIndex,
        explanation: payload.explanation,
      });
      setMode("reveal");
    };
    const onScoreUpdate = ({ playerId, score }) => {
      setPlayers((ps) =>
        ps.map((p) => (p.id === playerId ? { ...p, score } : p))
      );
    };
    const onFinished = (payload) => {
      const finalPlayers = payload.leaderboard.map(l => ({ id: l.playerId, name: l.name, score: l.score }));
      setPlayers(finalPlayers);
      updateScoreboard(finalPlayers);
      setMode("results");
    };
    s.on("room:players", onPlayers);
    s.on("question:started", onQuestion);
    s.on("reveal:answers", onReveal);
    s.on("score:update", onScoreUpdate);
    s.on("quiz:finished", onFinished);
    return () => {
      s.off("room:players", onPlayers);
      s.off("question:started", onQuestion);
      s.off("reveal:answers", onReveal);
      s.off("score:update", onScoreUpdate);
      s.off("quiz:finished", onFinished);
    };
  }, [gameCode, token, players, updateScoreboard, aborted]);

  const toHome = () => setMode(token ? "home" : "auth");

  const render = () => {
    if (!token) return <AuthForm onSuccess={() => setMode("home")} />;
    if (mode === "home") {
      const sortedBoard = Object.entries(scoreboard)
        .map(([name, score]) => ({ name, score }))
        .sort((a,b)=> b.score - a.score)
        .slice(0, 10);
      return (
        <div className="max-w-3xl mx-auto mt-10 grid gap-6">
          <div className="text-center">
            <h1 className="heading-xl gradient-text font-extrabold mb-2">QuizArena</h1>
            <p className="subtle dark:text-white/60 text-sm">Fast-paced AI powered trivia battles. Create or join a room below.</p>
          </div>
          <div className="card">
            <h2 className="heading-lg mb-4">Quick Start</h2>
            <div className="flex flex-col gap-3">
              <button className="btn-primary w-full" onClick={() => setMode("create")}>Create Game</button>
              <button className="btn-secondary w-full" onClick={() => setMode("join")}>Join Game</button>
            </div>
          </div>
          {sortedBoard.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-3">Leaderboard</h3>
              <ul className="space-y-2">
                {sortedBoard.map((p,i)=>(
                  <li key={p.name} className={`leader-row ${i===0? 'leader-top':''} flex items-center gap-4`}> 
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-white text-primary':'bg-primary text-white'}`}>{i+1}</div>
                    <span className={`flex-1 font-medium ${i===0?'text-white':'text-text dark:text-white/90'}`}>{p.name}</span>
                    <span className={`font-semibold tabular-nums ${i===0?'text-white':'text-primary dark:text-white'}`}>{p.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    if (mode === "create")
      return (
        <CreateGame
          onCreated={(code, creatorId) => {
            setGameCode(code);
            setCreatedBy(creatorId);
            setMode("lobby");
          }}
        />
      );
    if (mode === "join")
      return (
        <JoinGame
          onJoined={(code, name, meta) => {
            setGameCode(code);
            setCreatedBy(meta?.createdBy || null);
            setMode("lobby");
          }}
        />
      );
    // Placeholder for lobby & game phases (will be implemented in later steps)
    if (mode === "lobby")
      return (
        <Lobby
          code={gameCode}
          players={players}
          isHost={isHost()}
          onStart={() => {}}
          onLeave={leaveGame}
        />
      );
    if (mode === "question" && question)
      return (
        <QuestionView
          code={gameCode}
          question={question}
          onAnswered={() => {}}
        />
      );
    if (mode === "reveal" && revealData && question)
      return (
        <Reveal
          question={{ ...question, correctIndex: revealData.correctIndex }}
          answers={revealData.answers}
          players={players}
          code={gameCode}
        />
      );
    if (mode === "results")
      return (
        <Results
          players={players}
          onPlayAgain={() => {
            const s = getSocket();
            if (isHost() && s && gameCode) {
              s.emit('host:restart', { code: gameCode });
              setMode('lobby');
            } else {
              // Non-host just goes back to lobby waiting state
              setMode('lobby');
            }
          }}
          onExit={() => {
            leaveGame();
            setMode("home");
          }}
        />
      );
    return <div />;
  };

  // Dynamic document title
  useEffect(()=>{
    let suffix = '';
    if (!token) suffix = 'Sign In';
    else if (mode === 'home') suffix = 'Home';
    else if (mode === 'create') suffix = 'Create Game';
    else if (mode === 'join') suffix = 'Join Game';
    else if (mode === 'lobby') suffix = `Lobby ${gameCode}`;
    else if (mode === 'question' && question) suffix = `Q${question.index+1}`;
    else if (mode === 'reveal') suffix = 'Reveal';
    else if (mode === 'results') suffix = 'Results';
    document.title = suffix ? `QuizArena • ${suffix}` : 'QuizArena';
  },[mode, token, question, gameCode]);

  return (
    <>
      <div className="bg-fun-layer">
        <div className="bg-fun-shape s1" />
        <div className="bg-fun-shape s2" />
        <div className="bg-fun-shape s3" />
      </div>
      <NavBar
        onNavigate={toHome}
        showQuit={!!gameCode && ['lobby','question','reveal','results'].includes(mode)}
        onQuit={() => {
          const s = getSocket();
            if (s && gameCode) {
              s.emit('player:leave', { code: gameCode });
            }
          if (mode !== 'results') setAborted(true);
          // disconnect socket so we stop receiving pushes for that game
          disconnectSocket();
          leaveGame();
        }}
      />
      {render()}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
