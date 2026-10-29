export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type OptionalPrayerName = 'Tahajjud' | 'Duha' | 'Witr' | 'SunanRawatib';

export type PrayerStatus = 'jamaah' | 'on_time' | 'late' | 'qada' | 'missed' | 'unlogged';

export interface DailyPrayerRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, PrayerStatus>;
  optionalPrayers: {
    tahajjud: boolean;
    duha: boolean;
    witr: boolean;
    rawatibCount: number; // e.g. 12 sunnahs
  };
}

export interface QuranSession {
  id: string;
  date: string;
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  pagesRead: number;
  reflectionNotes?: string;
  durationMinutes: number;
}

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  juzNumber: number;
  pageNumber: number;
  updatedAt: string;
}

export type FastingType = 'ramadan' | 'monday' | 'thursday' | 'white_days' | 'shawwal' | 'voluntary' | 'qada';

export interface FastingDay {
  date: string;
  isFasting: boolean;
  type: FastingType;
  suhoorCompleted: boolean;
  iftarCompleted: boolean;
  waterGlasses: number;
  notes?: string;
}

export interface ZakatDisbursement {
  id: string;
  date: string;
  recipient: string;
  category: 'poor' | 'needy' | 'debtors' | 'fi_sabilillah' | 'wayfarer' | 'other';
  amount: number;
  notes: string;
}

export interface ZakatCalculation {
  cashInHand: number;
  cashInBank: number;
  goldWeightGrams: number;
  silverWeightGrams: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
  investmentShares: number;
  businessMerchandise: number;
  moneyOwedToYou: number;
  liabilitiesDue: number;
  useSilverNisab: boolean; // default true for greater benefit to poor
  lastCalculatedDate: string;
}

export interface DuaItem {
  id: string;
  category: 'morning_evening' | 'daily_living' | 'salah' | 'forgiveness' | 'anxiety_protection' | 'travel_nature';
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  reference: string;
  repeatTarget: number;
  benefit: string;
}

export interface TasbeehRecord {
  id: string;
  phrase: string;
  arabic: string;
  count: number;
  target: number;
}

export type SpiritualLevelTier = 1 | 2 | 3 | 4 | 5;

export interface SpiritualLevelInfo {
  level: SpiritualLevelTier;
  titleArabic: string;
  titleEnglish: string;
  subtitle: string;
  minPoints: number;
  requiredHabits: string[];
  deedsChallenge: string[];
}

export interface SpiritualGradeBreakdown {
  overallGrade: number; // 1.0 to 10.0
  gradeTitle: string;
  gradeArabic: string;
  namazScore: number; // out of 4.0
  quranScore: number; // out of 2.0
  adhkarScore: number; // out of 1.5
  fastingScore: number; // out of 1.0
  deedsScore: number; // out of 1.5
  insights: string[];
  recommendations: string[];
}

export interface SpiritualBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string | null;
  category: 'prayer' | 'quran' | 'dhikr' | 'fasting' | 'charity' | 'consistency';
}

export interface GoodDeedLog {
  id: string;
  date: string;
  category: 'sadaqah' | 'parents' | 'kindness' | 'knowledge' | 'forgiveness' | 'community';
  title: string;
  notes?: string;
  points: number;
}

export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
