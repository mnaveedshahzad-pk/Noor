import {
  CityLocation,
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  QuranBookmark,
  QuranSession,
  SpiritualBadge,
  TasbeehRecord,
  ZakatCalculation,
  ZakatDisbursement
} from '../types/islamic';
import { DEFAULT_TASBEEH_ITEMS, INITIAL_BADGES } from '../data/prayersData';
import { POPULAR_CITIES } from '../utils/qiblaCalc';

const STORAGE_KEYS = {
  PRAYERS_HISTORY: 'noor_prayers_history_v1',
  QURAN_SESSIONS: 'noor_quran_sessions_v1',
  QURAN_BOOKMARK: 'noor_quran_bookmark_v1',
  FASTING_HISTORY: 'noor_fasting_history_v1',
  ZAKAT_CALCULATION: 'noor_zakat_calc_v1',
  ZAKAT_DISBURSEMENTS: 'noor_zakat_disbursements_v1',
  TASBEEH_ITEMS: 'noor_tasbeeh_items_v1',
  BADGES: 'noor_badges_v1',
  GOOD_DEEDS: 'noor_good_deeds_v1',
  USER_LOCATION: 'noor_user_location_v1',
  THEME_MODE: 'noor_theme_mode_v1',
  CURRENT_STREAK: 'noor_current_streak_v1',
};

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate seeded historical data for realistic charts & calendar
function generateSeedPrayers(): Record<string, DailyPrayerRecord> {
  const records: Record<string, DailyPrayerRecord> = {};
  const today = getTodayKey();

  // Today
  records[today] = {
    date: today,
    prayers: {
      Fajr: 'jamaah',
      Dhuhr: 'on_time',
      Asr: 'on_time',
      Maghrib: 'unlogged',
      Isha: 'unlogged',
    },
    optionalPrayers: {
      tahajjud: true,
      duha: true,
      witr: false,
      rawatibCount: 8,
    },
  };

  // Past 14 days
  for (let i = 1; i <= 14; i++) {
    const dKey = getPastDateKey(i);
    records[dKey] = {
      date: dKey,
      prayers: {
        Fajr: i % 3 === 0 ? 'jamaah' : 'on_time',
        Dhuhr: 'on_time',
        Asr: i === 4 ? 'late' : 'on_time',
        Maghrib: 'jamaah',
        Isha: 'on_time',
      },
      optionalPrayers: {
        tahajjud: i % 2 === 0,
        duha: i % 3 !== 0,
        witr: true,
        rawatibCount: 10,
      },
    };
  }

  return records;
}

export function loadPrayerRecords(): Record<string, DailyPrayerRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRAYERS_HISTORY);
    if (raw) {
      const data = JSON.parse(raw);
      const today = getTodayKey();
      if (!data[today]) {
        data[today] = {
          date: today,
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
        };
        localStorage.setItem(STORAGE_KEYS.PRAYERS_HISTORY, JSON.stringify(data));
      }
      return data;
    }
  } catch (e) {
    console.error('Failed to load prayer records', e);
  }
  const seeded = generateSeedPrayers();
  localStorage.setItem(STORAGE_KEYS.PRAYERS_HISTORY, JSON.stringify(seeded));
  return seeded;
}

export function savePrayerRecord(record: DailyPrayerRecord): void {
  const records = loadPrayerRecords();
  records[record.date] = record;
  localStorage.setItem(STORAGE_KEYS.PRAYERS_HISTORY, JSON.stringify(records));
}

export function loadQuranSessions(): QuranSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QURAN_SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const seeded: QuranSession[] = [
    {
      id: 'session_1',
      date: getTodayKey(),
      surahNumber: 36,
      surahName: 'Ya-Sin',
      fromAyah: 1,
      toAyah: 28,
      pagesRead: 3,
      durationMinutes: 18,
      reflectionNotes: 'Contemplated the signs in nature and the revivification of barren earth.',
    },
    {
      id: 'session_2',
      date: getPastDateKey(1),
      surahNumber: 18,
      surahName: 'Al-Kahf',
      fromAyah: 1,
      toAyah: 45,
      pagesRead: 5,
      durationMinutes: 25,
      reflectionNotes: 'Recited for protection and light between Fridays.',
    },
    {
      id: 'session_3',
      date: getPastDateKey(2),
      surahNumber: 67,
      surahName: 'Al-Mulk',
      fromAyah: 1,
      toAyah: 30,
      pagesRead: 2,
      durationMinutes: 12,
      reflectionNotes: 'Recited before sleep for intercession.',
    },
  ];
  localStorage.setItem(STORAGE_KEYS.QURAN_SESSIONS, JSON.stringify(seeded));
  return seeded;
}

export function saveQuranSession(session: QuranSession): QuranSession[] {
  const sessions = loadQuranSessions();
  const updated = [session, ...sessions];
  localStorage.setItem(STORAGE_KEYS.QURAN_SESSIONS, JSON.stringify(updated));
  return updated;
}

export function loadQuranBookmark(): QuranBookmark {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QURAN_BOOKMARK);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const defaultBookmark: QuranBookmark = {
    surahNumber: 36,
    surahName: 'Ya-Sin',
    ayahNumber: 29,
    juzNumber: 22,
    pageNumber: 442,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.QURAN_BOOKMARK, JSON.stringify(defaultBookmark));
  return defaultBookmark;
}

export function saveQuranBookmark(bookmark: QuranBookmark): void {
  localStorage.setItem(STORAGE_KEYS.QURAN_BOOKMARK, JSON.stringify(bookmark));
}

export function loadFastingHistory(): Record<string, FastingDay> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FASTING_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const seeded: Record<string, FastingDay> = {
    [getPastDateKey(3)]: {
      date: getPastDateKey(3),
      isFasting: true,
      type: 'monday',
      suhoorCompleted: true,
      iftarCompleted: true,
      waterGlasses: 8,
      notes: 'Sunnah fasting on Monday, felt immense clarity.',
    },
    [getPastDateKey(7)]: {
      date: getPastDateKey(7),
      isFasting: true,
      type: 'thursday',
      suhoorCompleted: true,
      iftarCompleted: true,
      waterGlasses: 7,
      notes: 'Thursday fast, made special dua at Maghrib.',
    },
  };
  localStorage.setItem(STORAGE_KEYS.FASTING_HISTORY, JSON.stringify(seeded));
  return seeded;
}

export function saveFastingDay(day: FastingDay): void {
  const history = loadFastingHistory();
  history[day.date] = day;
  localStorage.setItem(STORAGE_KEYS.FASTING_HISTORY, JSON.stringify(history));
}

export function loadZakatCalculation(): ZakatCalculation {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ZAKAT_CALCULATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const defaultCalc: ZakatCalculation = {
    cashInHand: 1500,
    cashInBank: 8200,
    goldWeightGrams: 42,
    silverWeightGrams: 120,
    goldPricePerGram: 85, // Current approximate USD/gram
    silverPricePerGram: 1.05,
    investmentShares: 3400,
    businessMerchandise: 0,
    moneyOwedToYou: 800,
    liabilitiesDue: 950,
    useSilverNisab: true,
    lastCalculatedDate: getTodayKey(),
  };
  localStorage.setItem(STORAGE_KEYS.ZAKAT_CALCULATION, JSON.stringify(defaultCalc));
  return defaultCalc;
}

export function saveZakatCalculation(calc: ZakatCalculation): void {
  localStorage.setItem(STORAGE_KEYS.ZAKAT_CALCULATION, JSON.stringify(calc));
}

export function loadZakatDisbursements(): ZakatDisbursement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ZAKAT_DISBURSEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const seeded: ZakatDisbursement[] = [
    {
      id: 'zakat_1',
      date: '2026-09-12',
      recipient: 'Local Community Relief Food Bank',
      category: 'poor',
      amount: 450,
      notes: 'Discharged for urgent family food hampers.',
    },
    {
      id: 'zakat_2',
      date: '2026-06-20',
      recipient: 'Medical Aid for Displaced Orphaned Children',
      category: 'needy',
      amount: 600,
      notes: 'Emergency pediatric medicine fund.',
    },
  ];
  localStorage.setItem(STORAGE_KEYS.ZAKAT_DISBURSEMENTS, JSON.stringify(seeded));
  return seeded;
}

export function saveZakatDisbursement(item: ZakatDisbursement): ZakatDisbursement[] {
  const list = loadZakatDisbursements();
  const updated = [item, ...list];
  localStorage.setItem(STORAGE_KEYS.ZAKAT_DISBURSEMENTS, JSON.stringify(updated));
  return updated;
}

export function loadTasbeehItems(): TasbeehRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASBEEH_ITEMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.TASBEEH_ITEMS, JSON.stringify(DEFAULT_TASBEEH_ITEMS));
  return DEFAULT_TASBEEH_ITEMS;
}

export function saveTasbeehItems(items: TasbeehRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.TASBEEH_ITEMS, JSON.stringify(items));
}

export function loadBadges(): SpiritualBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(INITIAL_BADGES));
  return INITIAL_BADGES;
}

export function unlockBadge(badgeId: string): SpiritualBadge[] {
  const badges = loadBadges();
  const updated = badges.map((b) =>
    b.id === badgeId && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
  );
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updated));
  return updated;
}

export function loadGoodDeeds(): GoodDeedLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOOD_DEEDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const seeded: GoodDeedLog[] = [
    {
      id: 'deed_1',
      date: getTodayKey(),
      category: 'parents',
      title: 'Called parents with warm words and sent surprise gift',
      notes: 'Pleasing parents is of the greatest deeds pleasing to Allah.',
      points: 15,
    },
    {
      id: 'deed_2',
      date: getPastDateKey(1),
      category: 'sadaqah',
      title: 'Bought lunch for a thirsty construction worker',
      notes: 'Water and nourishment in hot midday.',
      points: 20,
    },
    {
      id: 'deed_3',
      date: getPastDateKey(2),
      category: 'community',
      title: 'Cleaned the prayer hall carpet and arranged Qurans',
      notes: 'Honoring the house of Allah.',
      points: 25,
    },
  ];
  localStorage.setItem(STORAGE_KEYS.GOOD_DEEDS, JSON.stringify(seeded));
  return seeded;
}

export function saveGoodDeed(deed: GoodDeedLog): GoodDeedLog[] {
  const deeds = loadGoodDeeds();
  const updated = [deed, ...deeds];
  localStorage.setItem(STORAGE_KEYS.GOOD_DEEDS, JSON.stringify(updated));
  return updated;
}

export function loadUserLocation(): CityLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return POPULAR_CITIES[0]; // Mecca default
}

export function saveUserLocation(loc: CityLocation): void {
  localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(loc));
}

export function loadStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STREAK);
    if (raw) return parseInt(raw, 10);
  } catch (e) {
    console.error(e);
  }
  return 8; // 8-day consistent streak default
}

export function saveStreak(streak: number): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, streak.toString());
}
