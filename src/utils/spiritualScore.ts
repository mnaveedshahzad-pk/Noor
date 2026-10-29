import {
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  QuranSession,
  SpiritualGradeBreakdown,
  TasbeehRecord
} from '../types/islamic';

export function calculateSpiritualGrade(
  prayerRecord: DailyPrayerRecord,
  quranSessionsToday: QuranSession[],
  tasbeehRecords: TasbeehRecord[],
  fastingRecord?: FastingDay,
  deedsToday: GoodDeedLog[] = [],
  dailyQuranGoalPages: number = 4
): SpiritualGradeBreakdown {
  // 1. Namaz Observance (max 4.0)
  let namazScore = 0;
  const prayers = prayerRecord.prayers;
  const fardhList = [prayers.Fajr, prayers.Dhuhr, prayers.Asr, prayers.Maghrib, prayers.Isha];

  fardhList.forEach((status) => {
    if (status === 'jamaah') {
      namazScore += 0.5 + 0.15; // base + jama'ah bonus
    } else if (status === 'on_time') {
      namazScore += 0.5 + 0.08; // base + on time bonus
    } else if (status === 'late' || status === 'qada') {
      namazScore += 0.35; // fulfilled
    }
  });

  // Sunnah & Nawafil bonus
  if (prayerRecord.optionalPrayers.tahajjud) namazScore += 0.35;
  if (prayerRecord.optionalPrayers.duha) namazScore += 0.15;
  if (prayerRecord.optionalPrayers.witr) namazScore += 0.2;
  if (prayerRecord.optionalPrayers.rawatibCount >= 8) namazScore += 0.2;

  namazScore = Math.min(4.0, Math.round(namazScore * 10) / 10);

  // 2. Quran Engagement (max 2.0)
  let quranScore = 0;
  const totalPagesToday = quranSessionsToday.reduce((sum, s) => sum + s.pagesRead, 0);
  const pagesRatio = Math.min(1.0, totalPagesToday / Math.max(1, dailyQuranGoalPages));
  quranScore += pagesRatio * 1.5;

  const hasReflection = quranSessionsToday.some((s) => s.reflectionNotes && s.reflectionNotes.trim().length > 0);
  if (hasReflection) {
    quranScore += 0.5;
  }
  quranScore = Math.min(2.0, Math.round(quranScore * 10) / 10);

  // 3. Adhkar & Dhikr (max 1.5)
  let adhkarScore = 0;
  const totalTasbeehCount = tasbeehRecords.reduce((sum, t) => sum + t.count, 0);
  if (totalTasbeehCount >= 100) {
    adhkarScore += 0.9;
  } else if (totalTasbeehCount >= 33) {
    adhkarScore += 0.5;
  } else if (totalTasbeehCount > 0) {
    adhkarScore += 0.25;
  }

  // Morning / Evening completion check from tasbeeh
  const hasIstighfar = tasbeehRecords.find((t) => t.id === 'astaghfirullah')?.count || 0;
  if (hasIstighfar >= 70) {
    adhkarScore += 0.6;
  }
  adhkarScore = Math.min(1.5, Math.round(adhkarScore * 10) / 10);

  // 4. Fasting / Self-Discipline (max 1.0)
  let fastingScore = 0;
  if (fastingRecord && fastingRecord.isFasting) {
    fastingScore = 1.0;
  } else {
    // Mindfulness baseline if not fasting day
    fastingScore = 0.3;
  }

  // 5. Deeds & Charity (max 1.5)
  let deedsScore = 0;
  if (deedsToday.length > 0) {
    deedsScore = Math.min(1.5, deedsToday.length * 0.5);
  }
  deedsScore = Math.min(1.5, Math.round(deedsScore * 10) / 10);

  // Total Grade (Floor at 1.0, Ceil at 10.0)
  let overall = namazScore + quranScore + adhkarScore + fastingScore + deedsScore;
  overall = Math.max(1.0, Math.min(10.0, Math.round(overall * 10) / 10));

  let gradeTitle = 'Needs Renewal';
  let gradeArabic = 'يحتاج إلى تجديد';
  if (overall >= 9.0) {
    gradeTitle = 'Mumtaz (Exceptional)';
    gradeArabic = 'المحسن المتسابق';
  } else if (overall >= 8.0) {
    gradeTitle = 'Jayyid Jiddan (Very Good)';
    gradeArabic = 'السابق بالخيرات';
  } else if (overall >= 6.5) {
    gradeTitle = 'Jayyid (Steadfast & Good)';
    gradeArabic = 'المقتصد الصالح';
  } else if (overall >= 5.0) {
    gradeTitle = 'Maqbool (Acceptable)';
    gradeArabic = 'الساعي المجتهد';
  }

  const insights: string[] = [];
  const recommendations: string[] = [];

  // Tailored insights
  const prayedFajr = prayers.Fajr === 'jamaah' || prayers.Fajr === 'on_time';
  if (prayedFajr) {
    insights.push('Fajr completed in good time; your day carries divine protection.');
  }
  if (totalPagesToday >= dailyQuranGoalPages) {
    insights.push(`Daily Quran quota fulfilled (${totalPagesToday} pages read today).`);
  }
  if (prayerRecord.optionalPrayers.tahajjud) {
    insights.push('Night prayer (Tahajjud) witnessed by the angels at dawn.');
  }
  if (fastingRecord?.isFasting) {
    insights.push(`Fasting observed today (${fastingRecord.type.toUpperCase()}); prayers at Iftar are answered.`);
  }

  // Actionable recommendations
  if (prayers.Fajr === 'unlogged' || prayers.Fajr === 'missed') {
    recommendations.push('Establish early sleep tonight to safeguard tomorrow’s Fajr.');
  }
  if (totalPagesToday < dailyQuranGoalPages) {
    recommendations.push(`Recite ${dailyQuranGoalPages - totalPagesToday} more page(s) of Quran to hit your target.`);
  }
  if (!prayerRecord.optionalPrayers.witr) {
    recommendations.push('Offer at least 1 or 3 rak’ahs of Salatul Witr before sleeping.');
  }
  if (totalTasbeehCount < 100) {
    recommendations.push('Recite 33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar.');
  }
  if (deedsToday.length === 0) {
    recommendations.push('Perform one small act of kindness: call a relative or give micro-charity.');
  }

  return {
    overallGrade: overall,
    gradeTitle,
    gradeArabic,
    namazScore,
    quranScore,
    adhkarScore,
    fastingScore,
    deedsScore,
    insights: insights.length > 0 ? insights : ['Begin today by logging your prayers and Quran reading.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Masha’Allah! Continue your steadfastness and seek sincerity (Ikhlas).'],
  };
}
