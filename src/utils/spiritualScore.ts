import {
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  JournalEntry,
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
  dailyQuranGoalPages: number = 4,
  journalEntryToday?: JournalEntry
): SpiritualGradeBreakdown {
  // 1. Namaz Observance (max 3.5)
  let namazScore = 0;
  const prayers = prayerRecord.prayers;
  const fardhList = [prayers.Fajr, prayers.Dhuhr, prayers.Asr, prayers.Maghrib, prayers.Isha];

  fardhList.forEach((status) => {
    if (status === 'jamaah') {
      namazScore += 0.45 + 0.15; // base + jama'ah bonus
    } else if (status === 'on_time') {
      namazScore += 0.45 + 0.08; // base + on time bonus
    } else if (status === 'late' || status === 'qada') {
      namazScore += 0.3; // fulfilled
    }
  });

  // Sunnah & Nawafil bonus
  if (prayerRecord.optionalPrayers.tahajjud) namazScore += 0.3;
  if (prayerRecord.optionalPrayers.duha) namazScore += 0.15;
  if (prayerRecord.optionalPrayers.witr) namazScore += 0.15;
  if (prayerRecord.optionalPrayers.rawatibCount >= 8) namazScore += 0.2;

  namazScore = Math.min(3.5, Math.round(namazScore * 10) / 10);

  // 2. Quran Engagement (max 1.8)
  let quranScore = 0;
  const totalPagesToday = quranSessionsToday.reduce((sum, s) => sum + s.pagesRead, 0);
  const pagesRatio = Math.min(1.0, totalPagesToday / Math.max(1, dailyQuranGoalPages));
  quranScore += pagesRatio * 1.3;

  const hasReflection = quranSessionsToday.some((s) => s.reflectionNotes && s.reflectionNotes.trim().length > 0);
  if (hasReflection) {
    quranScore += 0.5;
  }
  quranScore = Math.min(1.8, Math.round(quranScore * 10) / 10);

  // 3. Adhkar & Dhikr (max 1.2)
  let adhkarScore = 0;
  const totalTasbeehCount = tasbeehRecords.reduce((sum, t) => sum + t.count, 0);
  if (totalTasbeehCount >= 100) {
    adhkarScore += 0.7;
  } else if (totalTasbeehCount >= 33) {
    adhkarScore += 0.4;
  } else if (totalTasbeehCount > 0) {
    adhkarScore += 0.2;
  }

  // Morning / Evening completion check from tasbeeh
  const hasIstighfar = tasbeehRecords.find((t) => t.id === 'astaghfirullah')?.count || 0;
  if (hasIstighfar >= 70) {
    adhkarScore += 0.5;
  }
  adhkarScore = Math.min(1.2, Math.round(adhkarScore * 10) / 10);

  // 4. Fasting / Self-Discipline (max 1.0)
  let fastingScore = 0;
  if (fastingRecord && fastingRecord.isFasting) {
    fastingScore = 1.0;
  } else {
    // Mindfulness baseline if not fasting day
    fastingScore = 0.3;
  }

  // 5. Deeds & Charity (max 1.3)
  let deedsScore = 0;
  if (deedsToday.length > 0) {
    deedsScore = Math.min(1.3, deedsToday.length * 0.45);
  }
  deedsScore = Math.min(1.3, Math.round(deedsScore * 10) / 10);

  // 6. Daily Journal / Muhasabah Reflection (max 1.2)
  let journalScore = 0;
  if (journalEntryToday && journalEntryToday.content.trim().length > 0) {
    journalScore += 0.8;
    if (
      journalEntryToday.blessingGratitude.trim().length > 0 ||
      journalEntryToday.istighfarReflection.trim().length > 0 ||
      journalEntryToday.tomorrowIntention.trim().length > 0
    ) {
      journalScore += 0.4;
    }
  }
  journalScore = Math.min(1.2, Math.round(journalScore * 10) / 10);

  // Total Grade (Floor at 1.0, Ceil at 10.0)
  let overall = namazScore + quranScore + adhkarScore + fastingScore + deedsScore + journalScore;
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
  if (journalEntryToday && journalEntryToday.content.trim().length > 0) {
    insights.push(`Spiritual reflection (Muhasabah) recorded: Heart in state of ${journalEntryToday.heartState.toUpperCase()} (+1.2 to grade).`);
  }

  // Actionable recommendations
  if (prayers.Fajr === 'unlogged' || prayers.Fajr === 'missed') {
    recommendations.push('Establish early sleep tonight to safeguard tomorrow’s Fajr.');
  }
  if (totalPagesToday < dailyQuranGoalPages) {
    recommendations.push(`Recite ${dailyQuranGoalPages - totalPagesToday} more page(s) of Quran to hit your target.`);
  }
  if (!journalEntryToday || journalEntryToday.content.trim().length === 0) {
    recommendations.push('Log a brief spiritual reflection in your Daily Journal to elevate today’s grade (+1.2 pts).');
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
    journalScore,
    insights: insights.length > 0 ? insights : ['Begin today by logging your prayers, Quran reading, and daily journal reflection.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Masha’Allah! Continue your steadfastness and seek sincerity (Ikhlas).'],
  };
}
