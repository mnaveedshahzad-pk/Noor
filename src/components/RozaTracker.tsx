import React, { useState, useEffect } from 'react';
import { FastingDay, FastingType } from '../types/islamic';
import { calculatePrayerTimes, parsePrayerTimeString } from '../utils/qiblaCalc';
import {
  UtensilsCrossed,
  Moon,
  Sun,
  Droplets,
  CheckCircle2,
  Calendar,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

interface RozaTrackerProps {
  fastingHistory: Record<string, FastingDay>;
  todayKey: string;
  onSaveDay: (day: FastingDay) => void;
  userLat: number;
  userLng: number;
}

export const RozaTracker: React.FC<RozaTrackerProps> = ({
  fastingHistory,
  todayKey,
  onSaveDay,
  userLat,
  userLng,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayRecord: FastingDay = fastingHistory[todayKey] || {
    date: todayKey,
    isFasting: false,
    type: 'voluntary',
    suhoorCompleted: false,
    iftarCompleted: false,
    waterGlasses: 0,
    notes: '',
  };

  const times = calculatePrayerTimes(userLat, userLng, now);
  const suhoorTimeDate = parsePrayerTimeString(times.fajr, now);
  const iftarTimeDate = parsePrayerTimeString(times.maghrib, now);

  // Countdown logic: if before Fajr -> countdown to Suhoor end; if between Fajr and Maghrib -> countdown to Iftar!
  const isBeforeSuhoor = now < suhoorTimeDate;
  const isFastingHours = now >= suhoorTimeDate && now < iftarTimeDate;

  let targetCountdownDate = suhoorTimeDate;
  let countdownLabel = 'Suhoor Ends (Imsak at Fajr)';
  if (isFastingHours) {
    targetCountdownDate = iftarTimeDate;
    countdownLabel = 'Time Until Blessed Iftar (Maghrib)';
  } else if (now >= iftarTimeDate) {
    // Tomorrow Suhoor
    targetCountdownDate = new Date(suhoorTimeDate.getTime() + 86400000);
    countdownLabel = 'Next Suhoor (Tomorrow Dawn)';
  }

  const diffMs = Math.max(0, targetCountdownDate.getTime() - now.getTime());
  const hRem = Math.floor(diffMs / (1000 * 60 * 60));
  const mRem = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const sRem = Math.floor((diffMs % (1000 * 60)) / 1000);

  const toggleIsFasting = () => {
    onSaveDay({
      ...todayRecord,
      isFasting: !todayRecord.isFasting,
    });
  };

  const updateType = (t: FastingType) => {
    onSaveDay({
      ...todayRecord,
      type: t,
    });
  };

  const toggleSuhoor = () => {
    onSaveDay({
      ...todayRecord,
      suhoorCompleted: !todayRecord.suhoorCompleted,
    });
  };

  const toggleIftar = () => {
    onSaveDay({
      ...todayRecord,
      iftarCompleted: !todayRecord.iftarCompleted,
    });
  };

  const incrementWater = (delta: number) => {
    const nextVal = Math.max(0, Math.min(15, todayRecord.waterGlasses + delta));
    onSaveDay({
      ...todayRecord,
      waterGlasses: nextVal,
    });
  };

  // Past completed fasts count
  const pastFasts = Object.values(fastingHistory).filter((f) => f.isFasting);

  return (
    <div className="space-y-6">
      {/* Top Hero Fasting Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <UtensilsCrossed className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Roza (Fasting) Devotion</span>
            <span aria-hidden="true">·</span>
            <span>Sunnah & Ramadan Tracker</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={toggleIsFasting}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 ${
                todayRecord.isFasting
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${todayRecord.isFasting ? 'text-amber-300' : 'text-stone-400'}`}
              />
              <span>{todayRecord.isFasting ? 'Fasting Today (Active)' : 'Mark as Fasting Today'}</span>
            </button>

            {todayRecord.isFasting && (
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 font-mono">
                +1.0 Pt to Daily Grade
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            "Fasting is a shield from the fire and a shield from committing sins." (Sunan an-Nasa'i)
          </p>
        </div>

        {/* Live Suhoor / Iftar Countdown */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 flex items-center gap-5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            {isFastingHours ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              {countdownLabel}
            </div>
            <div className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tabular-nums tracking-tight mt-0.5">
              {String(hRem).padStart(2, '0')}:{String(mRem).padStart(2, '0')}:
              {String(sRem).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Suhoor: {times.fajr} · Iftar: {times.maghrib}
            </div>
          </div>
        </div>
      </div>

      {/* Fasting Category Selector */}
      {todayRecord.isFasting && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Fasting Intention & Category (النية والنوع)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
            {[
              { id: 'ramadan', label: 'Ramadan' },
              { id: 'monday', label: 'Monday Sunnah' },
              { id: 'thursday', label: 'Thursday Sunnah' },
              { id: 'white_days', label: 'White Days (13-15)' },
              { id: 'shawwal', label: 'Shawwal 6' },
              { id: 'voluntary', label: 'Voluntary (Nafl)' },
              { id: 'qada', label: 'Qada (Make-up)' },
            ].map((cat) => {
              const isSelected = todayRecord.type === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateType(cat.id as FastingType)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-400'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Daily Fasting Checkpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={toggleSuhoor}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                todayRecord.suhoorCompleted
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Suhoor Eaten & Niyyah Formed
                </div>
                <div className="text-[11px] text-stone-500">Barakah is in the pre-dawn meal</div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 ${
                  todayRecord.suhoorCompleted ? 'text-emerald-700' : 'text-stone-300'
                }`}
              />
            </button>

            <button
              onClick={toggleIftar}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                todayRecord.iftarCompleted
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Iftar Broken with Dates & Water
                </div>
                <div className="text-[11px] text-stone-500">Recited Prophetic Iftar Dua</div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 ${
                  todayRecord.iftarCompleted ? 'text-emerald-700' : 'text-stone-300'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Hydration Tracker (Post-Iftar Water Intake) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Evening Hydration Tracker (ترطيب الجسم)
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 tabular-nums">
            {todayRecord.waterGlasses} / 8 Glasses (Target)
          </span>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          Optimal hydration between Maghrib and Fajr preserves physical vitality for night worship.
        </p>

        {/* Glasses visual icons */}
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((glassNum) => {
            const isFilled = glassNum <= todayRecord.waterGlasses;
            return (
              <button
                key={glassNum}
                onClick={() => onSaveDay({ ...todayRecord, waterGlasses: glassNum })}
                className={`w-9 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 hover:bg-stone-200'
                }`}
                title={`Glass ${glassNum}`}
              >
                <Droplets className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => incrementWater(-1)}
            className="px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300"
          >
            - Remove 1 Glass
          </button>
          <button
            onClick={() => incrementWater(1)}
            className="px-3 py-1 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800"
          >
            + Log 1 Glass (250ml)
          </button>
        </div>
      </div>

      {/* Past Completed Fasts Log */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Completed Fasts History
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-stone-500">
            {pastFasts.length} Fasts Recorded
          </span>
        </div>

        {pastFasts.length === 0 ? (
          <p className="text-xs text-stone-400 py-3">No fasts recorded yet. Toggle above to begin!</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {pastFasts.map((f) => (
              <div key={f.date} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{f.date}</span>
                  <span className="text-stone-400 ml-2">· {f.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                  <span>{f.waterGlasses} glasses water</span>
                  <span className="text-emerald-600 font-bold">✓</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
