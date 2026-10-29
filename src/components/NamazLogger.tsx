import React, { useState, useEffect } from 'react';
import {
  CityLocation,
  DailyPrayerRecord,
  PrayerName,
  PrayerStatus
} from '../types/islamic';
import {
  calculateDistanceToKaaba,
  calculatePrayerTimes,
  calculateQiblaBearing,
  parsePrayerTimeString,
  POPULAR_CITIES,
  PrayerTimesResult
} from '../utils/qiblaCalc';
import {
  Compass,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Navigation
} from 'lucide-react';

interface NamazLoggerProps {
  prayerRecord: DailyPrayerRecord;
  onUpdatePrayer: (name: PrayerName, status: PrayerStatus) => void;
  onToggleOptional: (field: 'tahajjud' | 'duha' | 'witr') => void;
  onUpdateRawatib: (count: number) => void;
  userLocation: CityLocation;
  onUpdateLocation: (loc: CityLocation) => void;
}

export const NamazLogger: React.FC<NamazLoggerProps> = ({
  prayerRecord,
  onUpdatePrayer,
  onToggleOptional,
  onUpdateRawatib,
  userLocation,
  onUpdateLocation,
}) => {
  const [now, setNow] = useState(new Date());
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isCalibratingManual, setIsCalibratingManual] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  // Keep live clock ticking for countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute prayer times for current location & date
  const prayerTimes: PrayerTimesResult = calculatePrayerTimes(
    userLocation.latitude,
    userLocation.longitude,
    now
  );

  // Compute Qibla angle and distance
  const qiblaBearing = calculateQiblaBearing(userLocation.latitude, userLocation.longitude);
  const distanceKm = calculateDistanceToKaaba(userLocation.latitude, userLocation.longitude);

  // Setup DeviceOrientation listener if on mobile
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS, alpha for Android
      let heading: number | null = null;
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null && !isCalibratingManual) {
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isCalibratingManual]);

  // Determine next upcoming prayer and countdown
  const prayerSequence: { name: PrayerName; timeStr: string }[] = [
    { name: 'Fajr', timeStr: prayerTimes.fajr },
    { name: 'Dhuhr', timeStr: prayerTimes.dhuhr },
    { name: 'Asr', timeStr: prayerTimes.asr },
    { name: 'Maghrib', timeStr: prayerTimes.maghrib },
    { name: 'Isha', timeStr: prayerTimes.isha },
  ];

  let nextPrayer = prayerSequence[0];
  let minDiffMs = Infinity;

  prayerSequence.forEach((p) => {
    const pDate = parsePrayerTimeString(p.timeStr, now);
    let diff = pDate.getTime() - now.getTime();
    if (diff > 0 && diff < minDiffMs) {
      minDiffMs = diff;
      nextPrayer = p;
    }
  });

  // If all prayers passed today, next is Fajr tomorrow
  if (minDiffMs === Infinity) {
    const tomorrowFajr = parsePrayerTimeString(prayerTimes.fajr, new Date(now.getTime() + 86400000));
    minDiffMs = tomorrowFajr.getTime() - now.getTime();
    nextPrayer = prayerSequence[0];
  }

  const hoursRemaining = Math.floor(minDiffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((minDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((minDiffMs % (1000 * 60)) / 1000);

  // Compass angle relative to device
  const relativeQiblaAngle = (qiblaBearing - deviceHeading + 360) % 360;
  const isAlignedWithQibla =
    relativeQiblaAngle >= 355 || relativeQiblaAngle <= 5 || Math.abs(relativeQiblaAngle - 360) <= 5;

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        onUpdateLocation({
          name: 'My Current Location',
          country: 'Local GPS',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      },
      (err) => {
        setGeoLocating(false);
        console.error(err);
      },
      { timeout: 10000 }
    );
  };

  const getStatusBadge = (status: PrayerStatus) => {
    switch (status) {
      case 'jamaah':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300';
      case 'on_time':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border-teal-300';
      case 'late':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300';
      case 'qada':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300';
      default:
        return 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border-stone-200';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Location & Upcoming Prayer Countdown */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Calculation Coordinates</span>
            <span aria-hidden="true">·</span>
            <span>{userLocation.country}</span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <select
              value={userLocation.name}
              onChange={(e) => {
                const found = POPULAR_CITIES.find((c) => c.name === e.target.value);
                if (found) onUpdateLocation(found);
              }}
              className="text-lg font-bold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}, {c.country}
                </option>
              ))}
              {userLocation.name === 'My Current Location' && (
                <option value="My Current Location">My Current Location (GPS)</option>
              )}
            </select>

            <button
              onClick={handleGeoLocation}
              disabled={geoLocating}
              className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 dark:text-emerald-400 dark:border-emerald-500 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors whitespace-nowrap"
            >
              {geoLocating ? 'Locating...' : 'Use My GPS'}
            </button>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Sunrise: {prayerTimes.sunrise} · Tahajjud End: {prayerTimes.tahajjudEnd} · Midnight: {prayerTimes.midnight}
          </p>
        </div>

        {/* Countdown Box */}
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-500/20 flex items-center gap-5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              Next Prayer: <span className="font-bold underline">{nextPrayer.name}</span> ({nextPrayer.timeStr})
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 dark:text-emerald-100 tabular-nums tracking-tight mt-0.5">
              {String(hoursRemaining).padStart(2, '0')}:{String(minutesRemaining).padStart(2, '0')}:
              {String(secondsRemaining).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">Time remaining until Adhan</div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Daily Prayer Logger & Qibla Finder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 5 Fardh Prayers & Sunnah Logger (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-500/10">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Five Obligatory Prayers (الفروض الخمسة)
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Click to toggle: Jama’ah (+highest reward) → On Time → Late → Qada → Unlogged
                </p>
              </div>
            </div>

            {/* Prayers List */}
            <div className="space-y-3">
              {prayerSequence.map((item) => {
                const status = prayerRecord.prayers[item.name];
                return (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-xl border border-stone-200/70 dark:border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-bold text-xs text-stone-700 dark:text-stone-300">
                        {item.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="font-arabic text-amber-700 dark:text-amber-400 text-xs font-normal">
                            {item.name === 'Fajr'
                              ? 'الفجر'
                              : item.name === 'Dhuhr'
                              ? 'الظهر'
                              : item.name === 'Asr'
                              ? 'العصر'
                              : item.name === 'Maghrib'
                              ? 'المغرب'
                              : 'العشاء'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                          Adhan: {item.timeStr}
                        </div>
                      </div>
                    </div>

                    {/* Segmented status buttons */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/70 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
                      {(['jamaah', 'on_time', 'late', 'qada', 'unlogged'] as PrayerStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => onUpdatePrayer(item.name, st)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                            status === st
                              ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-xs font-semibold'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                          }`}
                        >
                          {st === 'jamaah'
                            ? 'Jama’ah'
                            : st === 'on_time'
                            ? 'On Time'
                            : st === 'late'
                            ? 'Late'
                            : st === 'qada'
                            ? 'Qada'
                            : 'Skip'}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sunnah & Voluntary (Nawafil) Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Sunnah & Night Vigil (النوافل والسنن)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Voluntary prayers bring one closest to the love of Allah and repair imperfections in Fardh.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tahajjud */}
              <button
                onClick={() => onToggleOptional('tahajjud')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  prayerRecord.optionalPrayers.tahajjud
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Tahajjud (Qiyam)</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      prayerRecord.optionalPrayers.tahajjud ? 'text-emerald-700' : 'text-stone-300'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Pre-dawn prayer</div>
              </button>

              {/* Duha */}
              <button
                onClick={() => onToggleOptional('duha')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  prayerRecord.optionalPrayers.duha
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Salatul Duha</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      prayerRecord.optionalPrayers.duha ? 'text-emerald-700' : 'text-stone-300'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Forenoon prayer (360 charity)</div>
              </button>

              {/* Witr */}
              <button
                onClick={() => onToggleOptional('witr')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  prayerRecord.optionalPrayers.witr
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Salatul Witr</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      prayerRecord.optionalPrayers.witr ? 'text-emerald-700' : 'text-stone-300'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Closing odd rak’ahs</div>
              </button>
            </div>

            {/* 12 Sunan Rawatib Counter */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  12 Daily Sunan Rawatib
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  "Whoever prays twelve rak’ahs in a day and night, a house will be built for him in Paradise."
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onUpdateRawatib(Math.max(0, prayerRecord.optionalPrayers.rawatibCount - 2))}
                  className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors"
                >
                  -
                </button>
                <div className="w-14 text-center font-mono font-bold text-sm text-stone-900 dark:text-stone-100 tabular-nums">
                  {prayerRecord.optionalPrayers.rawatibCount} / 12
                </div>
                <button
                  onClick={() => onUpdateRawatib(Math.min(12, prayerRecord.optionalPrayers.rawatibCount + 2))}
                  className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center hover:bg-emerald-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Qibla Compass & Kaaba Direction (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-500/10">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Qibla Direction (قبلة الصلاة)
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 tabular-nums">
                {Math.round(qiblaBearing)}° Bearing
              </span>
            </div>

            {/* Kaaba Reference Visual Card */}
            <div className="relative rounded-xl overflow-hidden h-28 border border-stone-200 dark:border-stone-800">
              <img
                src="/src/assets/images/kaaba_mecca_reverence_1793264804217.jpg"
                alt="Holy Kaaba Mecca"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3">
                <div className="text-white text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>The Holy Kaaba, Masjid al-Haram</span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-mono tabular-nums">
                    {distanceKm.toLocaleString()} km from {userLocation.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Compass Dial */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-64 h-64 rounded-full border-4 border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-inner bg-gradient-to-b from-stone-50 to-stone-100 dark:from-[#0d1715] dark:to-[#08100e]">
                {/* Cardinal Points */}
                <div className="absolute top-2 text-xs font-bold text-rose-600">N</div>
                <div className="absolute bottom-2 text-xs font-bold text-stone-400">S</div>
                <div className="absolute right-2 text-xs font-bold text-stone-400">E</div>
                <div className="absolute left-2 text-xs font-bold text-stone-400">W</div>

                {/* Rotating Needle Container */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${relativeQiblaAngle}deg)` }}
                >
                  {/* Kaaba Indicator Arrow */}
                  <div className="w-1.5 h-24 bg-gradient-to-t from-transparent via-amber-400 to-emerald-600 rounded-full relative -top-8 shadow-md flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-700 border-2 border-white dark:border-slate-900 absolute -top-2 flex items-center justify-center text-[8px] text-white font-bold">
                      🕋
                    </div>
                  </div>
                </div>

                {/* Center Hub */}
                <div
                  className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center z-10 shadow-sm ${
                    isAlignedWithQibla
                      ? 'bg-emerald-600 border-white text-white animate-pulse'
                      : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <Navigation
                    className="w-4 h-4 transition-transform"
                    style={{ transform: `rotate(${relativeQiblaAngle}deg)` }}
                  />
                  <span className="text-[10px] font-mono font-bold tabular-nums">
                    {Math.round(relativeQiblaAngle)}°
                  </span>
                </div>
              </div>

              {/* Alignment Status Banner */}
              <div
                className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  isAlignedWithQibla
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                {isAlignedWithQibla
                  ? 'Target Aligned: Directly Facing the Holy Kaaba!'
                  : `Turn phone ${
                      relativeQiblaAngle > 180 ? 'Right' : 'Left'
                    } by ${Math.round(
                      relativeQiblaAngle > 180 ? 360 - relativeQiblaAngle : relativeQiblaAngle
                    )}° to align`}
              </div>
            </div>

            {/* Manual Heading Adjuster (for desktop or testing calibration) */}
            <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Simulate / Adjust Device Heading</span>
                <span className="font-mono tabular-nums">{deviceHeading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={deviceHeading}
                onChange={(e) => {
                  setIsCalibratingManual(true);
                  setDeviceHeading(parseInt(e.target.value, 10));
                }}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>0° (North)</span>
                <span>90° (East)</span>
                <span>180° (South)</span>
                <span>270° (West)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
