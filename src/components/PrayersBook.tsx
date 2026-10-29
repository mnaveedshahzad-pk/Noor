import React, { useState } from 'react';
import { DuaItem, TasbeehRecord } from '../types/islamic';
import { AUTHENTIC_DUAS } from '../data/prayersData';
import {
  BookOpen,
  Sparkles,
  Search,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  Heart
} from 'lucide-react';

interface PrayersBookProps {
  tasbeehRecords: TasbeehRecord[];
  onUpdateTasbeeh: (items: TasbeehRecord[]) => void;
}

export const PrayersBook: React.FC<PrayersBookProps> = ({
  tasbeehRecords,
  onUpdateTasbeeh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Tasbeeh state
  const [activeTasbeehIdx, setActiveTasbeehIdx] = useState<number>(0);
  const activeTasbeeh = tasbeehRecords[activeTasbeehIdx] || tasbeehRecords[0];

  const categories = [
    { id: 'all', label: 'All Supplications' },
    { id: 'morning_evening', label: 'Morning & Evening' },
    { id: 'daily_living', label: 'Daily Living & Sleep' },
    { id: 'salah', label: 'Salah & Post-Prayer' },
    { id: 'forgiveness', label: 'Forgiveness (Istighfar)' },
    { id: 'anxiety_protection', label: 'Anxiety & Relief' },
  ];

  const filteredDuas = AUTHENTIC_DUAS.filter((dua) => {
    const matchesCat = selectedCategory === 'all' || dua.category === selectedCategory;
    const matchesSearch =
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.arabic.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleBeadClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    const updated = [...tasbeehRecords];
    updated[activeTasbeehIdx] = {
      ...activeTasbeeh,
      count: activeTasbeeh.count + 1,
    };
    onUpdateTasbeeh(updated);
  };

  const handleResetTasbeeh = () => {
    const updated = [...tasbeehRecords];
    updated[activeTasbeehIdx] = {
      ...activeTasbeeh,
      count: 0,
    };
    onUpdateTasbeeh(updated);
  };

  const handleCopyDua = (dua: DuaItem) => {
    const textToCopy = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.english}"\n\n[${dua.reference}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tasbeehProgress = Math.min(
    100,
    Math.round((activeTasbeeh.count / Math.max(1, activeTasbeeh.target)) * 100)
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Prayers Book & Digital Tasbeeh Hero */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Misbaha visual card (4 cols) */}
        <div className="lg:col-span-4 relative rounded-xl overflow-hidden h-44 border border-stone-200 dark:border-stone-800">
          <img
            src="/src/assets/images/tasbih_dhikr_warmth_1793264835843.jpg"
            alt="Tasbih Prayer Beads with Oud incense"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
            <div className="text-white">
              <span className="font-arabic text-xs text-amber-300">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</span>
              <div className="text-xs font-bold">Unquestionably, by the remembrance of Allah hearts are assured.</div>
            </div>
          </div>
        </div>

        {/* Center & Right: Interactive Digital Tasbeeh Counter (8 cols) */}
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800">
          <div className="space-y-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Digital Tasbeeh</span>
            </div>

            {/* Phrase Selector dropdown */}
            <select
              value={activeTasbeehIdx}
              onChange={(e) => setActiveTasbeehIdx(Number(e.target.value))}
              className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              {tasbeehRecords.map((t, idx) => (
                <option key={t.id} value={idx}>
                  {t.arabic} — {t.phrase}
                </option>
              ))}
            </select>

            <div className="font-arabic text-2xl text-emerald-900 dark:text-emerald-300">
              {activeTasbeeh.arabic}
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>Target: {activeTasbeeh.target}</span>
              <button
                onClick={handleResetTasbeeh}
                className="flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Large Tap Button */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={handleBeadClick}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-lg flex flex-col items-center justify-center transition-transform active:scale-90 border-4 border-emerald-400/30"
              aria-label="Tap to count Dhikr"
            >
              <span className="text-3xl font-extrabold font-mono tabular-nums">
                {activeTasbeeh.count}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-200">Tap / Dhikr</span>
            </button>
            <div className="text-[11px] font-mono font-medium text-stone-500 tabular-nums">
              {tasbeehProgress}% completed
            </div>
          </div>
        </div>
      </div>

      {/* Prayers Book Section: Search & Category Filter */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
              <span>Hisn al-Muslim: Fortress of the Believer (حصن المسلم)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Authentic prophetic supplications with Arabic, transliteration, translation, and virtues.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search Duas & keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#101c19] text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Duas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDuas.map((dua) => (
            <div
              key={dua.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-700/40 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {dua.title}
                    </h3>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {dua.reference} · Repeat {dua.repeatTarget}x
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyDua(dua)}
                    title="Copy Dua"
                    className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {copiedId === dua.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Arabic Supplication */}
                <div className="py-4 text-right">
                  <p className="font-arabic text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-loose">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <p className="text-xs italic text-stone-500 dark:text-stone-400 mb-2">
                  {dua.transliteration}
                </p>

                {/* English Meaning */}
                <p className="text-xs text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                  "{dua.english}"
                </p>
              </div>

              {/* Benefit Footer */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{dua.benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
