import React, { useState } from 'react';
import { GoodDeedLog } from '../types/islamic';
import { Heart, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LogDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDeed: (deed: GoodDeedLog) => void;
}

export const LogDeedModal: React.FC<LogDeedModalProps> = ({
  isOpen,
  onClose,
  onSaveDeed,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<GoodDeedLog['category']>('sadaqah');
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [points, setPoints] = useState<number>(15);

  const predefinedSuggestions: Record<GoodDeedLog['category'], string[]> = {
    sadaqah: [
      'Gave micro-charity to someone in need',
      'Fed a hungry stray animal or birds',
      'Bought a warm meal for a daily laborer',
    ],
    parents: [
      'Called parents with sincere gentleness and prayers',
      'Prepared food or helped with household chore for parents',
      'Asked for their forgiveness and pleasure',
    ],
    kindness: [
      'Smiled warmly to ease someone’s burden',
      'Spoke comforting words to a distressed friend',
      'Held the door or assisted an elderly stranger',
    ],
    knowledge: [
      'Read 1 Hadith with contemplation and shared with family',
      'Listened to a beneficial Islamic lecture or Tafseer',
      'Taught a child a short Surah or Dua',
    ],
    forgiveness: [
      'Forgave an argument or harsh word solely for Allah',
      'Refrained from responding to an insult with malice',
      'Made heartfelt Dua for someone who hurt me',
    ],
    community: [
      'Cleaned or arranged the prayer space at home/masjid',
      'Removed dangerous trash/glass from a public pathway',
      'Helped a neighbor carry heavy groceries',
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDeed: GoodDeedLog = {
      id: `deed_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      title: title.trim(),
      notes: notes.trim(),
      points: Number(points) || 15,
    };

    onSaveDeed(newDeed);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#047857', '#d97706'],
    });

    onClose();
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#101c19] border border-stone-200 dark:border-emerald-500/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Record a Good Deed (عمل صالح)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sadaqah', label: 'Charity (Sadaqah)' },
                { id: 'parents', label: 'Parents & Kin' },
                { id: 'kindness', label: 'Kindness & Sunnah' },
                { id: 'knowledge', label: 'Islamic Knowledge' },
                { id: 'forgiveness', label: 'Forgiveness / Sabr' },
                { id: 'community', label: 'Community Service' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as GoodDeedLog['category'])}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    category === c.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <label className="block font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {predefinedSuggestions[category].map((sug, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTitle(sug)}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Deed Title / Description
            </label>
            <input
              type="text"
              required
              placeholder="Describe your sincere deed..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Reflection / Intention (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Purify your intention solely for the pleasure of Allah..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{points} Spiritual Pts</span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900 shadow-sm transition-all"
              >
                Log Deed
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
