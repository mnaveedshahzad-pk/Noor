import React, { useState } from 'react';
import { HeartState, JournalEntry } from '../types/islamic';
import { getTodayKey } from '../utils/storage';
import confetti from 'canvas-confetti';
import {
  PenLine,
  Sparkles,
  BookOpen,
  Calendar,
  Heart,
  Tag,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';

interface DailyJournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  todayKey: string;
}

const HEART_STATES: {
  id: HeartState;
  label: string;
  arabic: string;
  desc: string;
  colorClass: string;
}[] = [
  {
    id: 'sakinah',
    label: 'Sakinah',
    arabic: 'سكينة',
    desc: 'Tranquility, inner calm, contentment in Allah’s decree.',
    colorClass: 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  {
    id: 'shukr',
    label: 'Shukr',
    arabic: 'شكر',
    desc: 'Overwhelmed with gratitude for Allah’s countless blessings.',
    colorClass: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  },
  {
    id: 'tawakkul',
    label: 'Tawakkul',
    arabic: 'توكل',
    desc: 'Complete surrender and reliance upon Allah’s wise management.',
    colorClass: 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200',
  },
  {
    id: 'tawbah',
    label: 'Tawbah',
    arabic: 'توبة',
    desc: 'Tender heart returning to Allah with sincere repentance.',
    colorClass: 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200',
  },
  {
    id: 'rajaa',
    label: 'Rajaa',
    arabic: 'رجاء',
    desc: 'Vibrant hope in Allah’s vast mercy, forgiveness, and guidance.',
    colorClass: 'border-sky-500 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200',
  },
  {
    id: 'sabr',
    label: 'Sabr',
    arabic: 'صبر',
    desc: 'Patient perseverance and dignified restraint in tests.',
    colorClass: 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200',
  },
];

const PREDEFINED_TAGS = [
  'Gratitude',
  'Sakinah',
  'Patience',
  'FajrReflection',
  'Tawakkul',
  'Forgiveness',
  'QuranContemplation',
  'DuaAnswered',
  'FamilyBlessing',
  'OvercomingDistraction',
];

export const DailyJournal: React.FC<DailyJournalProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry,
  todayKey,
}) => {
  const existingTodayEntry = entries.find((e) => e.date === todayKey);

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [title, setTitle] = useState<string>(existingTodayEntry?.title || '');
  const [content, setContent] = useState<string>(existingTodayEntry?.content || '');
  const [heartState, setHeartState] = useState<HeartState>(existingTodayEntry?.heartState || 'sakinah');
  const [blessingGratitude, setBlessingGratitude] = useState<string>(
    existingTodayEntry?.blessingGratitude || ''
  );
  const [istighfarReflection, setIstighfarReflection] = useState<string>(
    existingTodayEntry?.istighfarReflection || ''
  );
  const [tomorrowIntention, setTomorrowIntention] = useState<string>(
    existingTodayEntry?.tomorrowIntention || ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingTodayEntry?.tags || ['Gratitude', 'Sakinah']
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('all');
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(!existingTodayEntry);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const entryToSave: JournalEntry = {
      id: existingTodayEntry && selectedDate === todayKey ? existingTodayEntry.id : `journal_${Date.now()}`,
      date: selectedDate,
      title: title.trim() || `Reflection for ${selectedDate}`,
      content: content.trim(),
      heartState,
      blessingGratitude: blessingGratitude.trim(),
      istighfarReflection: istighfarReflection.trim(),
      tomorrowIntention: tomorrowIntention.trim(),
      tags: selectedTags,
      createdAt: existingTodayEntry ? existingTodayEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveEntry(entryToSave);
    setIsEditing(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#047857', '#d97706', '#10b981'],
    });
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setSelectedDate(entry.date);
    setTitle(entry.title);
    setContent(entry.content);
    setHeartState(entry.heartState);
    setBlessingGratitude(entry.blessingGratitude || '');
    setIstighfarReflection(entry.istighfarReflection || '');
    setTomorrowIntention(entry.tomorrowIntention || '');
    setSelectedTags(entry.tags || []);
    setIsEditing(true);
    setViewingEntry(null);
  };

  const handleNewEntry = () => {
    setSelectedDate(todayKey);
    setTitle('');
    setContent('');
    setHeartState('sakinah');
    setBlessingGratitude('');
    setIstighfarReflection('');
    setTomorrowIntention('');
    setSelectedTags(['Gratitude']);
    setIsEditing(true);
    setViewingEntry(null);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesState = filterState === 'all' || entry.heartState === filterState;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Muhasabah Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <PenLine className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Daily Muhasabah & Spiritual Reflections</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic text-amber-700 dark:text-amber-400 font-normal">
              يَوْمِيَّاتُ المُحَاسَبَةِ وَالتَّدَبُّر
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Spiritual Reflection Journal
          </h1>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            "Hold yourselves to account before you are held to account, and weigh your deeds before they are weighed for you."
            (Umar ibn al-Khattab). Logging a daily reflection contributes <span className="font-semibold text-emerald-800 dark:text-emerald-300 font-mono">+1.2 pts</span> towards your 1-10 Daily Spiritual Grade.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleNewEntry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Reflection</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Journal Form & Past Reflections Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor / Today's Reflection View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isEditing ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {selectedDate === todayKey ? "Today's Spiritual Reflection" : `Reflection for ${selectedDate}`}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>+1.2 pts to Daily Grade</span>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5 text-xs">
                {/* 1. Heart State Selector */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Heart State & Spiritual Disposition (حالة القلب)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HEART_STATES.map((state) => {
                      const isSelected = heartState === state.id;
                      return (
                        <button
                          type="button"
                          key={state.id}
                          onClick={() => setHeartState(state.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? state.colorClass + ' ring-2 ring-emerald-600/30 font-semibold'
                              : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{state.label}</span>
                            <span className="font-arabic text-sm">{state.arabic}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                            {state.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Reflection Title */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Reflection Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Seeking Stillness at Dawn, Lessons in Patience..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* 3. Main Reflection Body */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Daily Contemplation & Soul Self-Accounting (المحاسبة والتدبر)
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Take a quiet moment: How was your prayer presence today? What moments brought you closer to Allah? What challenged your heart?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs leading-relaxed focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* 4. Three Sacred Guided Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
                  {/* Blessing */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                      🌿 Gratitude (شكر النعم)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="One blessing you thanked Allah for..."
                      value={blessingGratitude}
                      onChange={(e) => setBlessingGratitude(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[11px]"
                    />
                  </div>

                  {/* Istighfar */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                      💧 Istighfar (الاستغفار)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Shortcoming seeking forgiveness for..."
                      value={istighfarReflection}
                      onChange={(e) => setIstighfarReflection(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[11px]"
                    />
                  </div>

                  {/* Tomorrow Intention */}
                  <div>
                    <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-300 mb-1">
                      🌅 Tomorrow's Niyyah (تجديد النية)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="One conscious spiritual aim for tomorrow..."
                      value={tomorrowIntention}
                      onChange={(e) => setTomorrowIntention(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[11px]"
                    />
                  </div>
                </div>

                {/* 5. Tags */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Spiritual Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PREDEFINED_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            isSelected
                              ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-500">
                    Saved locally and synced to your secure cloud database
                  </span>

                  <div className="flex gap-2">
                    {existingTodayEntry && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs transition-all active:scale-95"
                    >
                      Save Reflection
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Reading Card for Current Reflection */
            <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span>{existingTodayEntry?.date || selectedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize font-semibold text-emerald-800 dark:text-emerald-400">
                      Heart in state of {existingTodayEntry?.heartState.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {existingTodayEntry?.title}
                  </h2>
                </div>

                <button
                  onClick={() => existingTodayEntry && handleStartEdit(existingTodayEntry)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Reflection</span>
                </button>
              </div>

              <div className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                {existingTodayEntry?.content}
              </div>

              {/* Guided notes preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                {existingTodayEntry?.blessingGratitude && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-500/10">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                      🌿 Gratitude:
                    </span>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                      {existingTodayEntry.blessingGratitude}
                    </p>
                  </div>
                )}

                {existingTodayEntry?.istighfarReflection && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-900/10 dark:border-amber-500/10">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                      💧 Istighfar:
                    </span>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                      {existingTodayEntry.istighfarReflection}
                    </p>
                  </div>
                )}

                {existingTodayEntry?.tomorrowIntention && (
                  <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-900/10 dark:border-teal-500/10">
                    <span className="font-bold text-teal-900 dark:text-teal-300 block mb-1">
                      🌅 Tomorrow's Niyyah:
                    </span>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                      {existingTodayEntry.tomorrowIntention}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {existingTodayEntry?.tags && existingTodayEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {existingTodayEntry.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Reflections History Ledger (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Reflections Archive</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {entries.length} reflections recorded
              </p>
            </div>
          </div>

          {/* Search & State Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search reflections & tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setFilterState('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  filterState === 'all'
                    ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                All States
              </button>
              {HEART_STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterState(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    filterState === s.id
                      ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {s.label} ({s.arabic})
                </button>
              ))}
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                No reflections found. Begin today's Muhasabah by recording your reflections.
              </p>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800 space-y-2 hover:border-emerald-600/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                        <span>{item.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold uppercase text-emerald-800 dark:text-emerald-400">
                          {item.heartState}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Edit entry"
                        className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(item.id)}
                        title="Delete entry"
                        className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800/80 text-stone-500"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
