import { CityLocation } from '../types/islamic';

export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export const POPULAR_CITIES: CityLocation[] = [
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { name: 'Jerusalem', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
];

/**
 * Calculates Great Circle bearing from user coordinates to Kaaba in Mecca
 */
export function calculateQiblaBearing(userLat: number, userLng: number): number {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_COORDS.latitude * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDS.longitude - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const initialBearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (initialBearing + 360) % 360;
}

/**
 * Calculates Great Circle distance to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_COORDS.latitude - userLat) * Math.PI) / 180;
  const dLng = ((KAABA_COORDS.longitude - userLng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((KAABA_COORDS.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
  tahajjudEnd: string;
}

/**
 * Reliable standard astronomical approximation for daily prayer times
 */
export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): PrayerTimesResult {
  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  // Approximate solar declination delta (degrees)
  const B = ((360 / 365) * (dayOfYear - 81) * Math.PI) / 180;
  const declination = 23.45 * Math.sin(B);
  const decRad = (declination * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  // Equation of time in minutes
  const EoT =
    9.87 * Math.sin(2 * B) -
    7.53 * Math.cos(B) -
    1.5 * Math.sin(B);

  // Timezone offset in hours
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;

  // Solar noon in local hours
  // solarNoon = 12 + timezoneOffset - (longitude / 15) - (EoT / 60)
  const solarNoon = 12 + (timezoneOffsetHours * 15 - longitude) / 15 - EoT / 60;

  // Hour angle calculation helper
  const calcHourAngle = (altitudeDeg: number): number => {
    const altRad = (altitudeDeg * Math.PI) / 180;
    const cosH =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosH > 1) return 0; // Polar day/night edge cases
    if (cosH < -1) return 180;
    return (Math.acos(cosH) * 180) / Math.PI;
  };

  // Fajr: Sun is ~18 deg below horizon (-18 deg)
  const fajrHA = calcHourAngle(-18);
  const fajrTime = solarNoon - fajrHA / 15;

  // Sunrise: Sun is ~0.833 deg below horizon
  const sunriseHA = calcHourAngle(-0.833);
  const sunriseTime = solarNoon - sunriseHA / 15;

  // Dhuhr: solar noon + 2-3 minutes safety
  const dhuhrTime = solarNoon + 3 / 60;

  // Asr (Shafi/standard: shadow length = object + noon shadow)
  // arccot(1 + tan|lat - dec|)
  const phiMinusDelta = Math.abs(latRad - decRad);
  const asrAltRad = Math.atan(1 / (1 + Math.tan(phiMinusDelta)));
  const asrAltDeg = (asrAltRad * 180) / Math.PI;
  const asrHA = calcHourAngle(asrAltDeg);
  const asrTime = solarNoon + asrHA / 15;

  // Maghrib: Sun sets ~0.833 deg below horizon
  const maghribTime = solarNoon + sunriseHA / 15;

  // Isha: Sun is ~18 deg below horizon
  const ishaTime = solarNoon + fajrHA / 15;

  const formatHours = (timeDecimal: number): string => {
    let normalized = timeDecimal % 24;
    if (normalized < 0) normalized += 24;
    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${paddedMinutes} ${period}`;
  };

  return {
    fajr: formatHours(fajrTime),
    sunrise: formatHours(sunriseTime),
    dhuhr: formatHours(dhuhrTime),
    asr: formatHours(asrTime),
    maghrib: formatHours(maghribTime),
    isha: formatHours(ishaTime),
    midnight: formatHours((maghribTime + (fajrTime < maghribTime ? fajrTime + 24 : fajrTime)) / 2),
    tahajjudEnd: formatHours(fajrTime - 0.25),
  };
}

/**
 * Parses time string (e.g. "5:12 AM" or "6:45 PM") into a Date on today
 */
export function parsePrayerTimeString(timeStr: string, baseDate: Date = new Date()): Date {
  const parts = timeStr.trim().split(' ');
  const [hStr, mStr] = parts[0].split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = parts[1]?.toUpperCase();

  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const target = new Date(baseDate);
  target.setHours(h, m, 0, 0);
  return target;
}
