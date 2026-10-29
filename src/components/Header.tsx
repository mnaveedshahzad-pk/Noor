import React from 'react';
import { Moon, Sun, Flame, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  streak: number;
  onOpenQuickLog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  streak,
  onOpenQuickLog,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'namaz', label: 'Namaz & Qibla' },
    { id: 'quran', label: 'Daily Quran' },
    { id: 'journal', label: 'Daily Journal' },
    { id: 'fasting_zakat', label: 'Roza & Zakat' },
    { id: 'prayers', label: 'Prayers Book' },
    { id: 'levels', label: 'Spiritual Levels' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c1412]/90 backdrop-blur-md border-b border-emerald-950/10 dark:border-emerald-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-amber-300 font-serif font-bold shadow-sm transition-transform group-hover:scale-105">
              <span>ن</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                Noor <span className="font-arabic font-normal text-amber-700 dark:text-amber-400 text-sm ml-1">نُور</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-800/70 dark:text-emerald-400/80 -mt-0.5">
                Spiritual Companion
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak indicator */}
          <div
            title={`${streak} days consistent deeds streak`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold tabular-nums"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Quick Log CTA */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Deed</span>
          </button>

          {/* Google Sign-in / User Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                title={`Signed in as ${user.displayName || user.email}`}
                className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-medium text-emerald-900 dark:text-emerald-200"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'M')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden xl:inline max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Account'}
                </span>
              </div>
              <button
                onClick={signOutUser}
                title="Sign out of Firebase"
                className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:border-emerald-700 dark:hover:border-emerald-500 bg-white dark:bg-[#101c19] text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors whitespace-nowrap shadow-xs active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 gap-2 border-t border-emerald-950/5 dark:border-emerald-500/5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
