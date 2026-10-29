import React, { useState } from 'react';
import { SpiritualBadge, SpiritualLevelInfo } from '../types/islamic';
import { SPIRITUAL_LEVELS } from '../data/prayersData';
import confetti from 'canvas-confetti';
import {
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Bookmark,
  Coins,
  UtensilsCrossed,
  Building,
  BookOpen
} from 'lucide-react';

interface SpiritualLevelsProps {
  currentLevel: SpiritualLevelInfo;
  totalPoints: number;
  badges: SpiritualBadge[];
  streak: number;
  onCompleteDeedChallenge: (deedTitle: string, points: number) => void;
}

export const SpiritualLevels: React.FC<SpiritualLevelsProps> = ({
  currentLevel,
  totalPoints,
  badges,
  streak,
  onCompleteDeedChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'badges'>('levels');
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#047857', '#d97706', '#10b981', '#f59e0b'],
    });
  };

  const handleChallengeClick = (challenge: string, pts: number) => {
    if (completedChallenges[challenge]) return;
    setCompletedChallenges((prev) => ({ ...prev, [challenge]: true }));
    onCompleteDeedChallenge(challenge, pts);
    handleTriggerCelebration();
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'Building':
        return <Building className="w-5 h-5 text-emerald-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-teal-600" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5 text-rose-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-sky-500" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-yellow-600" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-500" />;
      default:
        return <Award className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Status Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Spiritual Progression & Badges</span>
            <span aria-hidden="true">·</span>
            <span>From Foundation to Ihsan</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Current Tier: Level {currentLevel.level} — {currentLevel.titleEnglish}
          </h1>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Total Spiritual Points Accumulated: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">{totalPoints} pts</span>
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'levels'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Spiritual Levels (1 to 5)
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Earned Badges ({badges.filter((b) => b.unlockedAt).length}/{badges.length})
          </button>
        </div>
      </div>

      {/* View 1: Levels Progression */}
      {activeTab === 'levels' && (
        <div className="space-y-6">
          {SPIRITUAL_LEVELS.map((lvl) => {
            const isUnlocked = totalPoints >= lvl.minPoints;
            const isCurrent = currentLevel.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-6 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-white dark:bg-[#101c19] ring-2 ring-emerald-600/20 shadow-md'
                    : isUnlocked
                    ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#101c19]'
                    : 'border-stone-200/60 dark:border-stone-800/60 bg-stone-50/70 dark:bg-stone-900/30 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-800 text-amber-300 shadow-sm'
                          : isUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isUnlocked ? lvl.level : <Lock className="w-5 h-5 text-stone-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          Level {lvl.level}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {lvl.titleEnglish}
                      </h2>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="font-arabic text-xl font-bold text-amber-800 dark:text-amber-400">
                      {lvl.titleArabic}
                    </span>
                    <span className="text-xs font-mono text-stone-500 tabular-nums">
                      Requires {lvl.minPoints} pts
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 my-4 leading-relaxed">
                  {lvl.subtitle}
                </p>

                {/* 2-Column Split: Habits & Challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Habits */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Prescribed Daily Habits
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                      {lvl.requiredHabits.map((habit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Actionable Deed Challenges (+25 pts)
                    </div>
                    <div className="space-y-2">
                      {lvl.deedsChallenge.map((challenge, idx) => {
                        const isDone = completedChallenges[challenge];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleChallengeClick(challenge, 25)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                              isDone
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                                : 'border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span>{challenge}</span>
                            <span className="shrink-0 text-[11px] font-mono font-bold">
                              {isDone ? 'Completed ✓' : '+25 pts'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Badges Showcase */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {badges.map((badge) => {
              const isUnlocked = badge.unlockedAt !== null;

              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isUnlocked
                      ? 'border-emerald-600/60 bg-white dark:bg-[#101c19] shadow-xs'
                      : 'border-stone-200/60 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/30 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isUnlocked ? (
                        getBadgeIcon(badge.iconName)
                      ) : (
                        <Lock className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {badge.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] font-mono text-stone-400">
                    {isUnlocked ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Earned: {new Date(badge.unlockedAt!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
