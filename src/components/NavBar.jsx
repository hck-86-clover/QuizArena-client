import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import logo from '../assets/logo.svg';

export default function NavBar({ onNavigate, showQuit, onQuit }) {
  const { user, token, logout } = useAuth();
  const { mode, toggle } = useTheme();
  return (
    <nav className="w-full backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#1E2430]/80 bg-white/95 dark:bg-[#1E2430]/95 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between px-6 py-3 transition-colors">
      <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => onNavigate && onNavigate('home')}>
        <img src={logo} alt="logo" className="w-8 h-8 drop-shadow" />
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">QuizArena</span>
      </div>
      <div className="flex items-center gap-4">
        {showQuit && (
          <button
            onClick={onQuit}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            title="Quit game"
          >
            <span>Quit</span>
          </button>
        )}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 transition-colors shadow-sm"
        >
          {mode === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M8.05 8.05 6.636 6.636m10.728 0-1.414 1.414M8.05 15.95l-1.414 1.414M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"/></svg>
          )}
        </button>
        {token && user && <span className="text-sm font-medium text-gray-600 dark:text-white/80 hidden sm:inline">Hi {user.name}</span>}
        {token && (
          <button
            onClick={logout}
            className="btn-secondary px-4 py-2"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}