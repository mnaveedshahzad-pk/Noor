import React from 'react';
import {
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  JournalEntry,
  QuranSession,
  SpiritualBadge,
  SpiritualGradeBreakdown,
  SpiritualLevelInfo,
  TasbeehRecord
} from '../types/islamic';
import {
  Flame,
  Award,
  BookOpen,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Clock,
  Heart,
  Activity,
  PenLine
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area
} from 'recharts';

interface DashboardProps {
  currentGrade: SpiritualGradeBreakdown;
  streak: number;
  currentLevel: SpiritualLevelInfo;
  nextLevel: SpiritualLevelInfo | null;
  totalPoints: number;
  prayerRecordToday: DailyPrayerRecord;
  quranSessionsToday: QuranSession[];
  fastingToday?: FastingDay;
  tasbeehRecords: TasbeehRecord[];
  goodDeedsToday: GoodDeedLog[];
  badges: SpiritualBadge[];
  journalEntryToday?: JournalEntry;
  onNavigate: (tab: string) => void;
  onOpenQuickLog: () => void;
  monthlyHistory: { date: string; grade: number }[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentGrade,
  streak,
  currentLevel,
  nextLevel,
  totalPoints,
  prayerRecordToday,
  quranSessionsToday,
  fastingToday,
  tasbeehRecords,
  goodDeedsToday,
  badges,
  journalEntryToday,
  onNavigate,
  onOpenQuickLog,
  monthlyHistory,
}) => {
  // Prayers completed today count
  const prayers = prayerRecordToday.prayers;
  const completedPrayersCount = Object.values(prayers).filter(
    (s) => s === 'jamaah' || s === 'on_time' || s === 'late'
  ).length;

  const totalPagesToday = quranSessionsToday.reduce((sum, s) => sum + s.pagesRead, 0);
  const totalTasbeehCount = tasbeehRecords.reduce((sum, t) => sum + t.count, 0);
  const unlockedBadges = badges.filter((b) => b.unlockedAt !== null);

  // Level progress percentage
  const pointsForCurrent = currentLevel.minPoints;
  const pointsForNext = nextLevel ? nextLevel.minPoints : pointsForCurrent + 500;
  const levelProgress = Math.min(
    100,
    Math.max(0, Math.round(((totalPoints - pointsForCurrent) / (pointsForNext - pointsForCurrent)) * 100))
  );

  // Grade color helper
  const getGradeColor = (g: number) => {
    if (g >= 8.5) return 'text-emerald-700 dark:text-emerald-400 border-emerald-500';
    if (g >= 6.5) return 'text-teal-700 dark:text-teal-400 border-teal-500';
    if (g >= 5.0) return 'text-amber-700 dark:text-amber-400 border-amber-500';
    return 'text-rose-700 dark:text-rose-400 border-rose-500';
  };

  // Past 7 Days data specifically formatted for Recharts
  const past7DaysData = React.useMemo(() => {
    const last7 = monthlyHistory.slice(-7);
    return last7.map((item, idx) => {
      const d = new Date(item.date);
      const isToday = idx === last7.length - 1;
      const dayLabel = isToday
        ? 'Today'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      return {
        date: item.date,
        day: dayLabel,
        grade: Number(item.grade.toFixed(1)),
      };
    });
  }, [monthlyHistory]);

  const avg7DayGrade = React.useMemo(() => {
    if (past7DaysData.length === 0) return '0.0';
    const sum = past7DaysData.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / past7DaysData.length).toFixed(1);
  }, [past7DaysData]);

  const peak7DayGrade = React.useMemo(() => {
    if (past7DaysData.length === 0) return '0.0';
    return Math.max(...past7DaysData.map((d) => d.grade)).toFixed(1);
  }, [past7DaysData]);

  const gradeTrend = React.useMemo(() => {
    if (past7DaysData.length < 2) return 0;
    const diff = past7DaysData[past7DaysData.length - 1].grade - past7DaysData[0].grade;
    return Number(diff.toFixed(1));
  }, [past7DaysData]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Spiritual Spotlight */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-emerald-950/10 dark:border-emerald-500/10 bg-slate-900 min-h-[280px] flex items-end">
        <img
          src="/src/assets/images/hero_masjid_serene_1793264788349.jpg"
          alt="Serene Mosque at twilight"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl text-white space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
              <span className="font-arabic text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              <span aria-hidden="true">·</span>
              <span>Spiritual Sanctuary</span>
              <span aria-hidden="true">·</span>
              <span>Daily Muhasabah (Self-Reflection)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
              Nourish Your Soul with Consistent Devotion
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
              The beloved deeds to Allah are those that are most consistent, even if they are modest.
              (Sahih al-Bukhari)
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('namaz')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/90 hover:bg-white text-slate-900 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Log Today's Prayers
            </button>
            <button
              onClick={onOpenQuickLog}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Record Good Deed
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Spiritual Grade & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 1-10 Spiritual Grade Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-3 border-b border-stone-100 dark:border-emerald-500/10">
              <span className="font-medium">Spiritual Effort Grade</span>
              <span className="font-arabic text-amber-700 dark:text-amber-400 text-sm">
                {currentGrade.gradeArabic}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6">
              {/* Circular Big Grade Badge */}
              <div
                className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 bg-stone-50 dark:bg-emerald-950/20 ${getGradeColor(
                  currentGrade.overallGrade
                )}`}
              >
                <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight">
                  {currentGrade.overallGrade.toFixed(1)}
                </div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400">
                  out of 10
                </div>
              </div>

              <div>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {currentGrade.gradeTitle}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Calculated from your prayers punctuality, Quran reading, daily dhikr, fasting, and
                  sadaqah deeds.
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-emerald-500/10">
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Grade Score Composition
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Namaz (Obligatory & Sunnah)</span>
                  <span className="font-mono tabular-nums">{currentGrade.namazScore.toFixed(1)} / 4.0</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(currentGrade.namazScore / 4.0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Quran Recitation</span>
                  <span className="font-mono tabular-nums">{currentGrade.quranScore.toFixed(1)} / 2.0</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all"
                    style={{ width: `${(currentGrade.quranScore / 2.0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Dhikr & Morning/Evening Adhkar</span>
                  <span className="font-mono tabular-nums">{currentGrade.adhkarScore.toFixed(1)} / 1.5</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(currentGrade.adhkarScore / 1.5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Roza (Fasting & Restraint)</span>
                  <span className="font-mono tabular-nums">{currentGrade.fastingScore.toFixed(1)} / 1.0</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 dark:bg-sky-400 rounded-full transition-all"
                    style={{ width: `${(currentGrade.fastingScore / 1.0) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Charity & Voluntary Good Deeds</span>
                  <span className="font-mono tabular-nums">{currentGrade.deedsScore.toFixed(1)} / 1.3</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all"
                    style={{ width: `${(currentGrade.deedsScore / 1.3) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                  <span>Daily Journal (Muhasabah Reflection)</span>
                  <span className="font-mono tabular-nums font-bold text-violet-700 dark:text-violet-400">
                    {(currentGrade.journalScore || 0).toFixed(1)} / 1.2
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 dark:bg-violet-400 rounded-full transition-all"
                    style={{ width: `${((currentGrade.journalScore || 0) / 1.2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Spiritual Level & Streaks */}
        <div className="space-y-6">
          {/* Level Progress */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">Spiritual Level</div>
              <button
                onClick={() => onNavigate('levels')}
                className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All Levels</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                  Level {currentLevel.level}
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {currentLevel.titleEnglish}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {currentLevel.subtitle}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 font-arabic text-xl">
                {currentLevel.titleArabic}
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Progress to {nextLevel ? `Level ${nextLevel.level}` : 'Highest Level'}</span>
                <span className="font-mono tabular-nums font-semibold">
                  {totalPoints} / {nextLevel ? nextLevel.minPoints : totalPoints} pts
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  {streak} Days
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Active Streak</div>
              </div>
            </div>

            {/* Badges unlocked */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  {unlockedBadges.length} / {badges.length}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Badges Earned</div>
              </div>
            </div>
          </div>

          {/* Today's Practical Recommendations */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Recommended Spiritual Action</span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              {currentGrade.recommendations[0]}
            </p>
          </div>
        </div>

        {/* Right: Today's Pillars Quick Status */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400 pb-3 border-b border-stone-100 dark:border-emerald-500/10">
              Today's Observance Snapshot
            </div>

            <div className="divide-y divide-stone-100 dark:divide-emerald-500/10 mt-2">
              {/* Namaz Row */}
              <div
                onClick={() => onNavigate('namaz')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800">
                      Namaz Prayers
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {completedPrayersCount} of 5 Fardh recorded
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Quran Row */}
              <div
                onClick={() => onNavigate('quran')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-teal-800">
                      Quran Recitation
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {totalPagesToday} pages logged today
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Dhikr / Tasbeeh */}
              <div
                onClick={() => onNavigate('prayers')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700">
                      Dhikr & Tasbeeh
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {totalTasbeehCount} praises glorified
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Fasting (Roza) */}
              <div
                onClick={() => onNavigate('fasting_zakat')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-rose-700">
                      Roza (Fasting)
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {fastingToday?.isFasting ? 'Fasting today (Active)' : 'Not fasting today'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Daily Spiritual Journal / Muhasabah */}
              <div
                onClick={() => onNavigate('journal')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PenLine className="w-4 h-4 text-violet-700 dark:text-violet-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-violet-800 flex items-center gap-1.5">
                      <span>Daily Spiritual Journal</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                        +1.2 pts
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {journalEntryToday
                        ? `Reflection logged: State of ${journalEntryToday.heartState.toUpperCase()}`
                        : 'Record today’s Muhasabah reflection'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Qibla Finder shortcut */}
              <div
                onClick={() => onNavigate('namaz')}
                className="py-3 flex items-center justify-between cursor-pointer group hover:bg-stone-50 dark:hover:bg-emerald-950/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800">
                      Qibla Compass
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Align towards the Holy Kaaba
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <button
            onClick={onOpenQuickLog}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-800/30 hover:border-emerald-800 dark:border-emerald-500/30 dark:hover:border-emerald-500 text-emerald-900 dark:text-emerald-300 text-xs font-medium text-center transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
          >
            + Quick Log Any Deed / Dhikr
          </button>
        </div>
      </div>

      {/* 7-Day Spiritual Grade Consistency Trend (Recharts Line Graph) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                7-Day Spiritual Grade Consistency
              </h2>
              <span className="font-arabic text-xs text-amber-700 dark:text-amber-400 font-normal">
                الاتساق الروحي
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Visual trajectory of your daily spiritual effort (1.0 to 10.0 scale) across prayers, Quran, dhikr, fasting, and charity.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
            <div className="p-2.5 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                7-Day Average
              </div>
              <div className="text-base font-extrabold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums">
                {avg7DayGrade} <span className="text-[11px] font-normal text-stone-400">/ 10</span>
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                7-Day Peak
              </div>
              <div className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                {peak7DayGrade}
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                Weekly Trend
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-sm tabular-nums text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{gradeTrend >= 0 ? `+${gradeTrend}` : gradeTrend}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart Container */}
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={past7DaysData}
              margin={{ top: 12, right: 16, left: -20, bottom: 4 }}
            >
              <defs>
                <linearGradient id="spiritualGradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-emerald-950/40"
              />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                className="dark:text-stone-400"
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                className="font-mono tabular-nums"
              />

              {/* Benchmark Reference Line for Mumtaz / Excellence (8.5) */}
              <ReferenceLine
                y={8.5}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{
                  value: 'Mumtaz (8.5+)',
                  position: 'top',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const gradeVal = Number(payload[0].value);
                    let gradeLabel = 'Needs Renewal';
                    if (gradeVal >= 9.0) gradeLabel = 'Mumtaz (Exceptional / المحسن)';
                    else if (gradeVal >= 8.0) gradeLabel = 'Jayyid Jiddan (Very Good)';
                    else if (gradeVal >= 6.5) gradeLabel = 'Jayyid (Steadfast & Good)';
                    else if (gradeVal >= 5.0) gradeLabel = 'Maqbool (Acceptable)';

                    return (
                      <div className="bg-white dark:bg-[#0c1613] p-3 rounded-xl shadow-xl border border-stone-200 dark:border-emerald-500/20 text-xs space-y-1">
                        <div className="font-semibold text-stone-500 dark:text-stone-400">
                          {label}
                        </div>
                        <div className="text-base font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                          {gradeVal.toFixed(1)} <span className="text-xs font-normal text-stone-400">/ 10</span>
                        </div>
                        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          {gradeLabel}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="grade"
                stroke="#047857"
                strokeWidth={3}
                dot={{ r: 4, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                name="Spiritual Grade"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Guidance Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-emerald-500/10 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" />
              <span>Daily Grade Score</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-600 inline-block" />
              <span>Mumtaz Benchmark (8.5)</span>
            </span>
          </div>

          <div className="text-[11px] italic">
            "Steadfastness in deeds (Istiqamah) leads to spiritual elevation."
          </div>
        </div>
      </div>

      {/* Monthly Progress Calendar Heatmap & Trend */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Monthly Spiritual Consistency & Grades</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Visualizing daily spiritual grades (1.0 - 10.0) over the past two weeks.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>Score Scale:</span>
            <span className="w-3 h-3 rounded-xs bg-stone-200 dark:bg-stone-800" title="< 5.0" />
            <span className="w-3 h-3 rounded-xs bg-amber-400" title="5.0 - 7.0" />
            <span className="w-3 h-3 rounded-xs bg-teal-500" title="7.0 - 8.5" />
            <span className="w-3 h-3 rounded-xs bg-emerald-600" title="8.5 - 10.0" />
            <span className="text-[11px]">High</span>
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {monthlyHistory.map((dayItem) => {
            const dateObj = new Date(dayItem.date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();

            let bgClass = 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400';
            if (dayItem.grade >= 8.5) {
              bgClass = 'bg-emerald-600 text-white';
            } else if (dayItem.grade >= 7.0) {
              bgClass = 'bg-teal-600 text-white';
            } else if (dayItem.grade >= 5.0) {
              bgClass = 'bg-amber-500 text-slate-900 font-semibold';
            }

            return (
              <div
                key={dayItem.date}
                className="p-3 rounded-xl border border-stone-200/60 dark:border-emerald-500/10 flex flex-col items-center justify-between gap-2 text-center"
              >
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  {dayName} {dayNum}
                </div>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs tabular-nums ${bgClass}`}
                >
                  {dayItem.grade.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400">
                  {dayItem.grade >= 8.5 ? 'Mumtaz' : dayItem.grade >= 6.5 ? 'Jayyid' : 'Maqbool'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
