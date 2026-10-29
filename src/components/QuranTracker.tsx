import React, { useState } from 'react';
import { QuranBookmark, QuranSession } from '../types/islamic';
import { POPULAR_SURAHS, SurahSummary } from '../data/prayersData';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Volume2,
  VolumeX,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';

interface QuranTrackerProps {
  sessions: QuranSession[];
  bookmark: QuranBookmark;
  onSaveBookmark: (bm: QuranBookmark) => void;
  onLogSession: (session: QuranSession) => void;
  dailyGoalPages: number;
}

export const QuranTracker: React.FC<QuranTrackerProps> = ({
  sessions,
  bookmark,
  onSaveBookmark,
  onLogSession,
  dailyGoalPages = 4,
}) => {
  const [selectedSurahIndex, setSelectedSurahIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New session form states
  const [formSurah, setFormSurah] = useState<number>(POPULAR_SURAHS[0].number);
  const [formFromAyah, setFormFromAyah] = useState<number>(1);
  const [formToAyah, setFormToAyah] = useState<number>(7);
  const [formPages, setFormPages] = useState<number>(2);
  const [formDuration, setFormDuration] = useState<number>(15);
  const [formNotes, setFormNotes] = useState<string>('');

  const currentSurah = POPULAR_SURAHS[selectedSurahIndex] || POPULAR_SURAHS[0];

  // Calculate today's pages read
  const todayStr = new Date().toISOString().split('T')[0];
  const pagesReadToday = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.pagesRead, 0);

  const totalPagesAllTime = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const goalProgress = Math.min(100, Math.round((pagesReadToday / dailyGoalPages) * 100));

  // 30 Juz completion estimation (604 pages total in standard Madinah Mushaf)
  const estimatedJuzCompleted = Math.min(30, Math.floor(totalPagesAllTime / 20));

  const filteredSurahs = POPULAR_SURAHS.filter(
    (s) =>
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameArabic.includes(searchQuery)
  );

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sObj = POPULAR_SURAHS.find((s) => s.number === formSurah) || POPULAR_SURAHS[0];
    const newSession: QuranSession = {
      id: `quran_${Date.now()}`,
      date: todayStr,
      surahNumber: sObj.number,
      surahName: sObj.nameEnglish,
      fromAyah: formFromAyah,
      toAyah: formToAyah,
      pagesRead: Number(formPages) || 1,
      durationMinutes: Number(formDuration) || 10,
      reflectionNotes: formNotes.trim(),
    };

    onLogSession(newSession);

    // Also update bookmark to the last read ayah
    onSaveBookmark({
      surahNumber: sObj.number,
      surahName: sObj.nameEnglish,
      ayahNumber: formToAyah,
      juzNumber: sObj.juz,
      pageNumber: Math.min(604, bookmark.pageNumber + Number(formPages)),
      updatedAt: new Date().toISOString(),
    });

    setShowLogModal(false);
    setFormNotes('');
  };

  const handleSetBookmarkHere = (ayahNum: number) => {
    onSaveBookmark({
      surahNumber: currentSurah.number,
      surahName: currentSurah.nameEnglish,
      ayahNumber: ayahNum,
      juzNumber: currentSurah.juz,
      pageNumber: bookmark.pageNumber,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Quran Hero & Daily Goal */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Rehal Visual Card (4 cols) */}
        <div className="md:col-span-4 relative rounded-xl overflow-hidden h-40 border border-stone-200 dark:border-stone-800">
          <img
            src="/src/assets/images/quran_rehal_parchment_1793264820359.jpg"
            alt="Holy Quran on Rehal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
            <div className="text-white">
              <span className="font-arabic text-xs text-amber-300">كَلَامُ اللَّهِ المَجِيد</span>
              <div className="text-xs font-bold">The Holy Quran</div>
            </div>
          </div>
        </div>

        {/* Center: Daily Progress & Reading Target (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Today's Recitation Target
            </span>
            <span className="font-mono tabular-nums font-bold">
              {pagesReadToday} / {dailyGoalPages} Pages
            </span>
          </div>

          <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            {pagesReadToday >= dailyGoalPages
              ? 'Masha’Allah! You have completed today’s Quran reading goal.'
              : `Read ${dailyGoalPages - pagesReadToday} more page(s) today to earn the full Quran score.`}
          </p>

          <div className="flex items-center gap-4 text-xs pt-1">
            <div className="text-stone-500 dark:text-stone-400">
              Total Recorded: <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{totalPagesAllTime} pages</span>
            </div>
            <div className="text-stone-500 dark:text-stone-400">
              Khatm Est.: <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{estimatedJuzCompleted} / 30 Juz</span>
            </div>
          </div>
        </div>

        {/* Right: Active Bookmark & CTA (3 cols) */}
        <div className="md:col-span-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Active Bookmark</span>
          </div>
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Surah {bookmark.surahName}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400">
            Ayah {bookmark.ayahNumber} · Juz {bookmark.juzNumber} · Page {bookmark.pageNumber}
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Reading Session</span>
          </button>
        </div>
      </div>

      {/* 2-Column Main View: Surah Selector & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Surah List (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Surah Index (فهرس السور)
            </h2>
            <span className="text-xs text-stone-500">{filteredSurahs.length} Surahs</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search Surah name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Surah List items */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredSurahs.map((surah) => {
              const isSelected = surah.number === currentSurah.number;
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    const idx = POPULAR_SURAHS.findIndex((s) => s.number === surah.number);
                    if (idx !== -1) setSelectedSurahIndex(idx);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs tabular-nums font-bold ${
                        isSelected
                          ? 'bg-emerald-700 text-amber-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {surah.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold">{surah.nameEnglish}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                        {surah.nameTranslation} · {surah.versesCount} Ayahs
                      </div>
                    </div>
                  </div>

                  <span className="font-arabic text-sm font-semibold">{surah.nameArabic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Surah Reader & Ayah display (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-6">
          {/* Reader Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-emerald-500/10">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>Surah {currentSurah.number}</span>
                <span aria-hidden="true">·</span>
                <span>{currentSurah.revelationType}</span>
                <span aria-hidden="true">·</span>
                <span>Juz {currentSurah.juz}</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                {currentSurah.nameEnglish} ({currentSurah.nameArabic})
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isPlayingAudio
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Mishary Al-Afasy (Simulated)' : 'Recite Audio'}</span>
              </button>
            </div>
          </div>

          {/* Bismillah Header (except for At-Tawbah) */}
          <div className="py-4 text-center">
            <span className="font-arabic text-2xl text-emerald-950 dark:text-emerald-100 tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>

          {/* Ayah Cards */}
          <div className="space-y-4">
            {currentSurah.sampleAyahs.map((ayah) => {
              const isCurrentBookmark =
                bookmark.surahNumber === currentSurah.number && bookmark.ayahNumber === ayah.number;

              return (
                <div
                  key={ayah.number}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentBookmark
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-stone-200/80 dark:border-stone-800 hover:border-emerald-700/30'
                  }`}
                >
                  {/* Top Bar for Ayah: Number & Bookmark Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
                    <span className="font-mono text-xs font-bold text-stone-500 tabular-nums">
                      Ayah {ayah.number}
                    </span>

                    <button
                      onClick={() => handleSetBookmarkHere(ayah.number)}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                        isCurrentBookmark
                          ? 'text-amber-800 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isCurrentBookmark ? 'Bookmarked' : 'Set Bookmark'}</span>
                    </button>
                  </div>

                  {/* Arabic Text */}
                  <div className="pt-3 pb-2 text-right">
                    <p className="font-arabic text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-loose">
                      {ayah.arabic}
                    </p>
                  </div>

                  {/* Transliteration */}
                  <p className="text-xs italic text-stone-500 dark:text-stone-400 mb-1">
                    {ayah.transliteration}
                  </p>

                  {/* English Translation */}
                  <p className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                    {ayah.english}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 30 Juz Completion Matrix Strip */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              30 Juz Khatm Roadmap (ختمة القرآن الكريم)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Keep reading consistently to turn every Juz emerald.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
            {estimatedJuzCompleted} / 30 Completed
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const isCompleted = juzNum <= estimatedJuzCompleted;
            const isCurrent = juzNum === bookmark.juzNumber;

            return (
              <div
                key={juzNum}
                className={`p-2 rounded-lg text-center border text-xs font-mono font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : isCurrent
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-300'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-400'
                }`}
                title={`Juz ${juzNum}`}
              >
                J{juzNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Reading Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101c19] border border-stone-200 dark:border-emerald-500/20 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Log Quran Reading Session
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Surah
                </label>
                <select
                  value={formSurah}
                  onChange={(e) => setFormSurah(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {POPULAR_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameEnglish} ({s.nameArabic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    From Ayah
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formFromAyah}
                    onChange={(e) => setFormFromAyah(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    To Ayah
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formToAyah}
                    onChange={(e) => setFormToAyah(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Pages Read
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formPages}
                    onChange={(e) => setFormPages(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Reflection / Tadabbur Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="What touched your heart from these verses?"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-semibold hover:bg-emerald-900"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
