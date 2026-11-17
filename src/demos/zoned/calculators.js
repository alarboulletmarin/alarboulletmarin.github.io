// Pure functions copied from zoned/src/lib/racePerformance.ts (Péronnet–Thibault).
// The default endurance index 6.5 comes from ENDURANCE_INDEX.intermediate.
export function sustainableVmaFraction(minutes, e) {
  if (!Number.isFinite(minutes) || minutes <= 7) return 1;
  const pct = 100 - e * Math.log(minutes / 7);
  return Math.min(1, Math.max(0.4, pct / 100));
}

export function predictRaceMinutes(vmaKmh, distanceKm, e) {
  if (!(vmaKmh > 0) || !(distanceKm > 0)) return 0;
  let minutes = (distanceKm / (vmaKmh * 0.9)) * 60;
  for (let i = 0; i < 12; i++) {
    const f = sustainableVmaFraction(minutes, e);
    const next = (distanceKm / (vmaKmh * f)) * 60;
    if (Math.abs(next - minutes) < 0.01) return next;
    minutes = next;
  }
  return minutes;
}

export function vmaFromRaceTime(distanceKm, minutes, e) {
  if (!(distanceKm > 0) || !(minutes > 0)) return 0;
  const speedKmh = distanceKm / (minutes / 60);
  return speedKmh / sustainableVmaFraction(minutes, e);
}

export function formatRaceMinutes(totalMinutes) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Bounds and two-decimal pace rounding from zoned/src/lib/zones.ts.
export const BOUNDS = [[50, 60], [60, 75], [75, 85], [85, 92], [92, 100], [100, 120]];
function vmaToPace(vma, percentage) {
  const speedKmh = vma * (percentage / 100);
  if (speedKmh <= 0) return 15;
  return Math.round((60 / speedKmh) * 100) / 100;
}

export function calculatePaceZones(vma) {
  return BOUNDS.map(([minPct, maxPct], i) => ({
    zone: i + 1,
    paceMinPerKm: vmaToPace(vma, maxPct),
    paceMaxPerKm: vmaToPace(vma, minPct),
  }));
}

// Input limits and inferred-VMA rounding follow VmaCalculatorPage.tsx and zones.ts.
export function calculateReference({ mode, distance, time, speed }) {
  let vma;
  if (mode === 'race') {
    // h:mm:ss, or mm:ss for short races ("45:00").
    const parts = /^(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)$/.exec(time.trim());
    if (!parts) return { error: 'invalidTime' };
    const minutes = Number(parts[1] ?? 0) * 60 + Number(parts[2]) + Number(parts[3]) / 60;
    if (minutes <= 0) return { error: 'invalidTime' };
    vma = vmaFromRaceTime(distance, minutes, 6.5);
    if (!Number.isFinite(vma) || vma < 4 || vma > 35) return { error: 'invalidRace' };
    // VmaCalculatorPage.tsx rounds the inferred VMA before calculating zones.
    vma = Math.round(vma * 10) / 10;
  } else {
    if (!/^\d+(?:[.,]\d+)?$/.test(speed.trim())) return { error: 'invalidVma' };
    vma = Number(speed.replace(',', '.'));
    if (!speed.trim() || !Number.isFinite(vma) || vma < 8 || vma > 30) return { error: 'invalidVma' };
  }
  return {
    vma,
    zones: calculatePaceZones(vma),
    times: [5, 10, 21.1, 42.195].map((km) => formatRaceMinutes(predictRaceMinutes(vma, km, 6.5))),
  };
}
