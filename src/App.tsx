/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CityLocation,
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  PrayerName,
  PrayerStatus,
  QuranBookmark,
  QuranSession,
  SpiritualBadge,
  SpiritualLevelInfo,
  TasbeehRecord,
  ZakatCalculation,
  ZakatDisbursement
} from './types/islamic';
import {
  getPastDateKey,
  getTodayKey,
  loadBadges,
  loadFastingHistory,
  loadGoodDeeds,
  loadPrayerRecords,
  loadQuranBookmark,
  loadQuranSessions,
  loadStreak,
  loadTasbeehItems,
  loadUserLocation,
  loadZakatCalculation,
  loadZakatDisbursements,
  saveFastingDay,
  saveGoodDeed,
  savePrayerRecord,
  saveQuranBookmark,
  saveQuranSession,
  saveStreak,
  saveTasbeehItems,
  saveUserLocation,
  saveZakatCalculation,
  saveZakatDisbursement,
  unlockBadge
} from './utils/storage';
import { calculateSpiritualGrade } from './utils/spiritualScore';
import { SPIRITUAL_LEVELS } from './data/prayersData';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NamazLogger } from './components/NamazLogger';
import { QuranTracker } from './components/QuranTracker';
import { RozaTracker } from './components/RozaTracker';
import { ZakaatCalculator } from './components/ZakaatCalculator';
import { PrayersBook } from './components/PrayersBook';
import { SpiritualLevels } from './components/SpiritualLevels';
import { LogDeedModal } from './components/LogDeedModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UtensilsCrossed, Coins, CloudCheck } from 'lucide-react';

function AppContent() {
  const {
    user,
    syncPrayerToCloud,
    syncQuranSessionToCloud,
    syncGoodDeedToCloud,
    syncFastingToCloud,
    syncProfileToCloud,
  } = useAuth();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('noor_theme_mode') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fastingZakatSubTab, setFastingZakatSubTab] = useState<'roza' | 'zakat'>('roza');
  const [isLogDeedOpen, setIsLogDeedOpen] = useState<boolean>(false);

  // Core Data States
  const [prayerRecords, setPrayerRecords] = useState<Record<string, DailyPrayerRecord>>(() =>
    loadPrayerRecords()
  );
  const [quranSessions, setQuranSessions] = useState<QuranSession[]>(() => loadQuranSessions());
  const [quranBookmark, setQuranBookmark] = useState<QuranBookmark>(() => loadQuranBookmark());
  const [fastingHistory, setFastingHistory] = useState<Record<string, FastingDay>>(() =>
    loadFastingHistory()
  );
  const [zakatCalc, setZakatCalc] = useState<ZakatCalculation>(() => loadZakatCalculation());
  const [zakatDisbursements, setZakatDisbursements] = useState<ZakatDisbursement[]>(() =>
    loadZakatDisbursements()
  );
  const [tasbeehRecords, setTasbeehRecords] = useState<TasbeehRecord[]>(() => loadTasbeehItems());
  const [badges, setBadges] = useState<SpiritualBadge[]>(() => loadBadges());
  const [goodDeeds, setGoodDeeds] = useState<GoodDeedLog[]>(() => loadGoodDeeds());
  const [userLocation, setUserLocation] = useState<CityLocation>(() => loadUserLocation());
  const [streak, setStreak] = useState<number>(() => loadStreak());

  const todayKey = getTodayKey();

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noor_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noor_theme_mode', 'light');
    }
  }, [isDark]);

  // Today's records
  const todayPrayers = useMemo(() => {
    return (
      prayerRecords[todayKey] || {
        date: todayKey,
        prayers: {
          Fajr: 'unlogged',
          Dhuhr: 'unlogged',
          Asr: 'unlogged',
          Maghrib: 'unlogged',
          Isha: 'unlogged',
        },
        optionalPrayers: {
          tahajjud: false,
          duha: false,
          witr: false,
          rawatibCount: 0,
        },
      }
    );
  }, [prayerRecords, todayKey]);

  const todayQuranSessions = useMemo(() => {
    return quranSessions.filter((s) => s.date === todayKey);
  }, [quranSessions, todayKey]);

  const todayFasting = fastingHistory[todayKey];

  const todayDeeds = useMemo(() => {
    return goodDeeds.filter((d) => d.date === todayKey);
  }, [goodDeeds, todayKey]);

  // Calculate Real-time Spiritual Grade for Today (1-10)
  const currentGrade = useMemo(() => {
    return calculateSpiritualGrade(
      todayPrayers,
      todayQuranSessions,
      tasbeehRecords,
      todayFasting,
      todayDeeds,
      4 // 4 pages daily goal
    );
  }, [todayPrayers, todayQuranSessions, tasbeehRecords, todayFasting, todayDeeds]);

  // Cumulative Points across all activities for Level Progression
  const totalPoints = useMemo(() => {
    let pts = 0;
    pts += Object.keys(prayerRecords).length * 25;
    pts += quranSessions.reduce((sum, s) => sum + s.pagesRead * 5, 0);
    pts += Math.floor(tasbeehRecords.reduce((sum, t) => sum + t.count, 0) / 5);
    pts += Object.values(fastingHistory).filter((f) => f.isFasting).length * 50;
    pts += goodDeeds.reduce((sum, d) => sum + d.points, 0);
    return pts;
  }, [prayerRecords, quranSessions, tasbeehRecords, fastingHistory, goodDeeds]);

  // Determine current spiritual level
  const currentLevelIndex = useMemo(() => {
    for (let i = SPIRITUAL_LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= SPIRITUAL_LEVELS[i].minPoints) {
        return i;
      }
    }
    return 0;
  }, [totalPoints]);

  const currentLevel: SpiritualLevelInfo = SPIRITUAL_LEVELS[currentLevelIndex];
  const nextLevel: SpiritualLevelInfo | null =
    currentLevelIndex < SPIRITUAL_LEVELS.length - 1 ? SPIRITUAL_LEVELS[currentLevelIndex + 1] : null;

  // Sync profile metrics to cloud on change if user logged in
  useEffect(() => {
    if (user) {
      syncProfileToCloud(streak, totalPoints, currentLevel.level);
    }
  }, [user, streak, totalPoints, currentLevel.level]);

  // Monthly grades history for heatmap and 7-day recharts graph
  const monthlyHistory = useMemo(() => {
    const list: { date: string; grade: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dKey = getPastDateKey(i);
      const pr = prayerRecords[dKey];
      if (pr) {
        const qSess = quranSessions.filter((s) => s.date === dKey);
        const fast = fastingHistory[dKey];
        const dLogs = goodDeeds.filter((d) => d.date === dKey);
        const brk = calculateSpiritualGrade(pr, qSess, tasbeehRecords, fast, dLogs);
        list.push({ date: dKey, grade: brk.overallGrade });
      } else {
        list.push({ date: dKey, grade: 6.0 });
      }
    }
    return list;
  }, [prayerRecords, quranSessions, fastingHistory, goodDeeds, tasbeehRecords]);

  // Handlers for Namaz Updates
  const handleUpdatePrayer = (name: PrayerName, status: PrayerStatus) => {
    const updated: DailyPrayerRecord = {
      ...todayPrayers,
      prayers: {
        ...todayPrayers.prayers,
        [name]: status,
      },
    };
    savePrayerRecord(updated);
    setPrayerRecords((prev) => ({ ...prev, [todayKey]: updated }));

    if (user) {
      syncPrayerToCloud(updated);
    }

    if (status === 'jamaah') {
      const updatedBadges = unlockBadge('jamaah_champion');
      setBadges(updatedBadges);
    }
  };

  const handleToggleOptionalPrayer = (field: 'tahajjud' | 'duha' | 'witr') => {
    const nextVal = !todayPrayers.optionalPrayers[field];
    const updated: DailyPrayerRecord = {
      ...todayPrayers,
      optionalPrayers: {
        ...todayPrayers.optionalPrayers,
        [field]: nextVal,
      },
    };
    savePrayerRecord(updated);
    setPrayerRecords((prev) => ({ ...prev, [todayKey]: updated }));

    if (user) {
      syncPrayerToCloud(updated);
    }

    if (field === 'tahajjud' && nextVal) {
      const updatedBadges = unlockBadge('tahajjud_seeker');
      setBadges(updatedBadges);
    }
  };

  const handleUpdateRawatib = (count: number) => {
    const updated: DailyPrayerRecord = {
      ...todayPrayers,
      optionalPrayers: {
        ...todayPrayers.optionalPrayers,
        rawatibCount: count,
      },
    };
    savePrayerRecord(updated);
    setPrayerRecords((prev) => ({ ...prev, [todayKey]: updated }));

    if (user) {
      syncPrayerToCloud(updated);
    }
  };

  // Handlers for Quran
  const handleLogQuranSession = (session: QuranSession) => {
    const updated = saveQuranSession(session);
    setQuranSessions(updated);

    if (user) {
      syncQuranSessionToCloud(session);
    }

    const totalPages = updated.reduce((s, item) => s + item.pagesRead, 0);
    if (totalPages >= 15) {
      const bList = unlockBadge('quran_reader');
      setBadges(bList);
    }
  };

  const handleSaveQuranBookmark = (bm: QuranBookmark) => {
    saveQuranBookmark(bm);
    setQuranBookmark(bm);
  };

  // Handlers for Roza
  const handleSaveFastingDay = (day: FastingDay) => {
    saveFastingDay(day);
    setFastingHistory((prev) => ({ ...prev, [day.date]: day }));

    if (user) {
      syncFastingToCloud(day);
    }

    if (day.isFasting) {
      const bList = unlockBadge('sunnah_fast');
      setBadges(bList);
    }
  };

  // Handlers for Zakat
  const handleSaveZakatCalc = (calc: ZakatCalculation) => {
    saveZakatCalculation(calc);
    setZakatCalc(calc);
  };

  const handleAddZakatDisbursement = (d: ZakatDisbursement) => {
    const updated = saveZakatDisbursement(d);
    setZakatDisbursements(updated);

    const bList = unlockBadge('zakat_purified');
    setBadges(bList);
  };

  // Handlers for Tasbeeh
  const handleUpdateTasbeeh = (items: TasbeehRecord[]) => {
    saveTasbeehItems(items);
    setTasbeehRecords(items);

    const totalCount = items.reduce((sum, t) => sum + t.count, 0);
    if (totalCount >= 1000) {
      const bList = unlockBadge('tasbeeh_1000');
      setBadges(bList);
    }
  };

  // Handlers for Good Deeds
  const handleSaveGoodDeed = (deed: GoodDeedLog) => {
    const updated = saveGoodDeed(deed);
    setGoodDeeds(updated);

    if (user) {
      syncGoodDeedToCloud(deed);
    }
  };

  const handleCompleteDeedChallenge = (challengeTitle: string, pts: number) => {
    const newDeed: GoodDeedLog = {
      id: `challenge_${Date.now()}`,
      date: todayKey,
      category: 'kindness',
      title: challengeTitle,
      notes: 'Completed from Level Deeds Challenge',
      points: pts,
    };
    handleSaveGoodDeed(newDeed);
  };

  const handleUpdateLocation = (loc: CityLocation) => {
    saveUserLocation(loc);
    setUserLocation(loc);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F8] dark:bg-[#0A100E] text-[#1E2922] dark:text-[#E8EFEA] flex flex-col font-sans transition-colors">
      {/* Top Header with Google Auth */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        streak={streak}
        onOpenQuickLog={() => setIsLogDeedOpen(true)}
      />

      {/* Cloud Sync Status Banner for Authenticated User */}
      {user && (
        <div className="bg-emerald-900/10 dark:bg-emerald-950/40 border-b border-emerald-900/10 dark:border-emerald-500/10 py-1.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            <span>Connected to Cloud Database · User records automatically synced to Firestore ({user.email})</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentGrade={currentGrade}
            streak={streak}
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            totalPoints={totalPoints}
            prayerRecordToday={todayPrayers}
            quranSessionsToday={todayQuranSessions}
            fastingToday={todayFasting}
            tasbeehRecords={tasbeehRecords}
            goodDeedsToday={todayDeeds}
            badges={badges}
            onNavigate={setActiveTab}
            onOpenQuickLog={() => setIsLogDeedOpen(true)}
            monthlyHistory={monthlyHistory}
          />
        )}

        {activeTab === 'namaz' && (
          <NamazLogger
            prayerRecord={todayPrayers}
            onUpdatePrayer={handleUpdatePrayer}
            onToggleOptional={handleToggleOptionalPrayer}
            onUpdateRawatib={handleUpdateRawatib}
            userLocation={userLocation}
            onUpdateLocation={handleUpdateLocation}
          />
        )}

        {activeTab === 'quran' && (
          <QuranTracker
            sessions={quranSessions}
            bookmark={quranBookmark}
            onSaveBookmark={handleSaveQuranBookmark}
            onLogSession={handleLogQuranSession}
            dailyGoalPages={4}
          />
        )}

        {activeTab === 'fasting_zakat' && (
          <div className="space-y-6 pb-16">
            {/* Sub navigation segmented control */}
            <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl w-fit">
              <button
                onClick={() => setFastingZakatSubTab('roza')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  fastingZakatSubTab === 'roza'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Roza (Fasting Tracker)</span>
              </button>
              <button
                onClick={() => setFastingZakatSubTab('zakat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  fastingZakatSubTab === 'zakat'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Zakaat Calculator & Ledger</span>
              </button>
            </div>

            {fastingZakatSubTab === 'roza' ? (
              <RozaTracker
                fastingHistory={fastingHistory}
                todayKey={todayKey}
                onSaveDay={handleSaveFastingDay}
                userLat={userLocation.latitude}
                userLng={userLocation.longitude}
              />
            ) : (
              <ZakaatCalculator
                calculation={zakatCalc}
                onSaveCalculation={handleSaveZakatCalc}
                disbursements={zakatDisbursements}
                onAddDisbursement={handleAddZakatDisbursement}
              />
            )}
          </div>
        )}

        {activeTab === 'prayers' && (
          <PrayersBook
            tasbeehRecords={tasbeehRecords}
            onUpdateTasbeeh={handleUpdateTasbeeh}
          />
        )}

        {activeTab === 'levels' && (
          <SpiritualLevels
            currentLevel={currentLevel}
            totalPoints={totalPoints}
            badges={badges}
            streak={streak}
            onCompleteDeedChallenge={handleCompleteDeedChallenge}
          />
        )}
      </main>

      {/* Quick Action Modal for Logging Good Deeds */}
      <LogDeedModal
        isOpen={isLogDeedOpen}
        onClose={() => setIsLogDeedOpen(false)}
        onSaveDeed={handleSaveGoodDeed}
      />

      {/* Serene Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-white/50 dark:bg-[#0c1412]/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-900 dark:text-emerald-300">Noor</span>
            <span aria-hidden="true">·</span>
            <span>Islamic Spiritual Companion</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic">رَبَّنَا تَقَبَّلْ مِنَّا</span>
          </div>

          <div className="text-[11px] font-mono">
            "The most beloved deed to Allah is the most regular and constant even if it were little."
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
