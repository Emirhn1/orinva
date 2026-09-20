import { UrgeEvent, Behavior, EventOutcome } from '@/data/types';
import { dayKey } from '@/utils/date';

export function cleanDuration(behavior: Behavior, now: Date = new Date()) {
  const since = new Date(behavior.cleanSinceAt);
  const ms = Math.max(0, now.getTime() - since.getTime());
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, totalMinutes, totalHours: ms / 3_600_000 };
}

// ---------------------------------------------------------------------------
// Window helpers
// ---------------------------------------------------------------------------

export type RangeDays = 7 | 30 | 90 | 0; // 0 = all

export function eventsInWindow(events: UrgeEvent[], windowDays: RangeDays, now: Date = new Date()): UrgeEvent[] {
  if (windowDays === 0) return events;
  const cutoff = now.getTime() - windowDays * 86_400_000;
  return events.filter((e) => new Date(e.startedAt).getTime() >= cutoff);
}

/** The window immediately before `windowDays` — for "bu ay geçen aya göre" comparisons. */
export function eventsInPreviousWindow(events: UrgeEvent[], windowDays: RangeDays, now: Date = new Date()): UrgeEvent[] {
  if (windowDays === 0) return [];
  const end = now.getTime() - windowDays * 86_400_000;
  const start = end - windowDays * 86_400_000;
  return events.filter((e) => {
    const t = new Date(e.startedAt).getTime();
    return t >= start && t < end;
  });
}

// ---------------------------------------------------------------------------
// Summary (Relapse recovery + Journey hero)
// ---------------------------------------------------------------------------

export interface JourneySummary {
  windowDays: number;
  contactDays: number; // days with at least one record
  hardDays: number; // days with an "acted" outcome
  urgesLogged: number;
  resistedOrDelayed: number;
  acted: number;
  open: number;
  returnLatencyHours: number | null; // time from the last "acted" to the next record
}

export function computeJourneySummary(events: UrgeEvent[], windowDays = 30): JourneySummary {
  const windowEvents = eventsInWindow(events, windowDays as RangeDays);

  const contactDaySet = new Set(windowEvents.map((e) => dayKey(e.startedAt)));
  const hardDaySet = new Set(windowEvents.filter((e) => e.outcome === 'acted').map((e) => dayKey(e.startedAt)));

  const resistedOrDelayed = windowEvents.filter((e) => e.outcome === 'resisted' || e.outcome === 'delayed').length;
  const acted = windowEvents.filter((e) => e.outcome === 'acted').length;
  const open = windowEvents.filter((e) => e.outcome === null).length;

  const sorted = [...windowEvents].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  let returnLatencyHours: number | null = null;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].outcome === 'acted') {
      const next = sorted[i + 1];
      if (next) {
        returnLatencyHours = (new Date(next.startedAt).getTime() - new Date(sorted[i].startedAt).getTime()) / 3_600_000;
      }
    }
  }

  return {
    windowDays,
    contactDays: contactDaySet.size,
    hardDays: hardDaySet.size,
    urgesLogged: windowEvents.length,
    resistedOrDelayed,
    acted,
    open,
    returnLatencyHours,
  };
}

export function evidenceCaption(sampleSize: number, minSample = 8): string | null {
  if (sampleSize < minSample) return null;
  return `${sampleSize} kayıttan`;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const MILESTONE_LADDER: { label: string; hours: number }[] = [
  { label: '24 saat', hours: 24 },
  { label: '3 gün', hours: 72 },
  { label: '7 gün', hours: 24 * 7 },
  { label: '14 gün', hours: 24 * 14 },
  { label: '30 gün', hours: 24 * 30 },
  { label: '90 gün', hours: 24 * 90 },
  { label: '180 gün', hours: 24 * 180 },
  { label: '1 yıl', hours: 24 * 365 },
];

export function nextMilestone(totalHours: number) {
  return MILESTONE_LADDER.find((m) => m.hours > totalHours) ?? null;
}

export function previousMilestone(totalHours: number) {
  const reached = MILESTONE_LADDER.filter((m) => m.hours <= totalHours);
  return reached[reached.length - 1] ?? null;
}

export function reachedMilestones(totalHours: number) {
  return MILESTONE_LADDER.filter((m) => m.hours <= totalHours);
}

/** Progress of the current milestone segment (previous → next), 0..1 — so the ring never sits at 0 for a day. */
export function milestoneProgress(totalHours: number): { progress: number; next: { label: string; hours: number } | null; remainingMinutes: number } {
  const next = nextMilestone(totalHours);
  if (!next) return { progress: 1, next: null, remainingMinutes: 0 };
  const prev = previousMilestone(totalHours);
  const from = prev?.hours ?? 0;
  const span = next.hours - from;
  const progress = span > 0 ? Math.max(0, Math.min(1, (totalHours - from) / span)) : 1;
  return { progress, next, remainingMinutes: Math.max(0, (next.hours - totalHours) * 60) };
}

// ---------------------------------------------------------------------------
// Resist rate
// ---------------------------------------------------------------------------

export interface ResistRate {
  closed: number; // events with a decided outcome (excluding unsure)
  resisted: number; // resisted + delayed
  acted: number;
  rate: number | null; // 0..1, null when no closed events
}

export function computeResistRate(events: UrgeEvent[]): ResistRate {
  const decided = events.filter((e) => e.outcome === 'resisted' || e.outcome === 'delayed' || e.outcome === 'acted');
  const resisted = decided.filter((e) => e.outcome !== 'acted').length;
  const acted = decided.length - resisted;
  return { closed: decided.length, resisted, acted, rate: decided.length ? resisted / decided.length : null };
}

// ---------------------------------------------------------------------------
// Daily / weekly series for the trend chart
// ---------------------------------------------------------------------------

export interface SeriesPoint {
  key: string; // yyyy-mm-dd (day) or the first day of the bucket
  label: string; // axis label
  total: number;
  resisted: number;
  acted: number;
}

const DAY_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

/**
 * Buckets events for the chart: 7d → per day, 30d → per day (labels only on
 * Mondays), 90d/all → per week.
 */
export function computeTrendSeries(events: UrgeEvent[], windowDays: RangeDays, now: Date = new Date()): SeriesPoint[] {
  const bucketDays = windowDays === 7 || windowDays === 30 ? 1 : 7;
  const spanDays = windowDays === 0 ? Math.max(28, spanOfEvents(events, now)) : windowDays;
  const bucketCount = Math.ceil(spanDays / bucketDays);

  const points: SeriesPoint[] = [];
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  for (let i = bucketCount - 1; i >= 0; i--) {
    const bucketStart = new Date(startOfToday);
    bucketStart.setDate(bucketStart.getDate() - i * bucketDays - (bucketDays - 1));
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketEnd.getDate() + bucketDays);

    const inBucket = events.filter((e) => {
      const t = new Date(e.startedAt).getTime();
      return t >= bucketStart.getTime() && t < bucketEnd.getTime();
    });

    let label = '';
    if (bucketDays === 1) {
      label = windowDays === 7 ? DAY_SHORT[bucketStart.getDay()] : bucketStart.getDay() === 1 ? `${bucketStart.getDate()}` : '';
    } else {
      label = `${bucketStart.getDate()}/${bucketStart.getMonth() + 1}`;
    }

    points.push({
      key: dayKey(bucketStart),
      label,
      total: inBucket.length,
      resisted: inBucket.filter((e) => e.outcome === 'resisted' || e.outcome === 'delayed').length,
      acted: inBucket.filter((e) => e.outcome === 'acted').length,
    });
  }
  return points;
}

function spanOfEvents(events: UrgeEvent[], now: Date): number {
  if (!events.length) return 28;
  const oldest = Math.min(...events.map((e) => new Date(e.startedAt).getTime()));
  return Math.ceil((now.getTime() - oldest) / 86_400_000) + 1;
}

// ---------------------------------------------------------------------------
// Time-of-week heatmap (7 days × 6 blocks of 4 hours)
// ---------------------------------------------------------------------------

export const HEAT_BLOCKS = [
  { id: 0, label: 'Gece', from: 0, to: 4 },
  { id: 1, label: 'Sabah', from: 4, to: 8 },
  { id: 2, label: 'Öğle', from: 8, to: 12 },
  { id: 3, label: 'İkindi', from: 12, to: 16 },
  { id: 4, label: 'Akşam', from: 16, to: 20 },
  { id: 5, label: 'Geç', from: 20, to: 24 },
];

/** Monday-first weekday labels. */
export const HEAT_DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export interface HeatCell {
  day: number; // 0 = Monday
  block: number;
  count: number;
  acted: number;
}

export function computeHeatmap(events: UrgeEvent[]): { cells: HeatCell[]; max: number; peak: HeatCell | null } {
  const cells: HeatCell[] = [];
  for (let d = 0; d < 7; d++) for (let b = 0; b < 6; b++) cells.push({ day: d, block: b, count: 0, acted: 0 });

  for (const e of events) {
    const date = new Date(e.startedAt);
    const day = (date.getDay() + 6) % 7; // Monday-first
    const block = Math.floor(date.getHours() / 4);
    const cell = cells[day * 6 + block];
    cell.count += 1;
    if (e.outcome === 'acted') cell.acted += 1;
  }

  let max = 0;
  let peak: HeatCell | null = null;
  for (const c of cells) {
    if (c.count > max) {
      max = c.count;
      peak = c;
    }
  }
  return { cells, max, peak };
}

export function describeHeatCell(cell: HeatCell): string {
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const block = HEAT_BLOCKS[cell.block];
  return `${dayNames[cell.day]} ${block.label.toLowerCase()} (${block.from}:00–${block.to}:00)`;
}

// ---------------------------------------------------------------------------
// Distributions
// ---------------------------------------------------------------------------

export interface DistributionRow {
  id: string;
  count: number;
  share: number; // 0..1 of events that had the field set
  resistRate: number | null;
}

export function computeTriggerDistribution(events: UrgeEvent[], limit = 5): { rows: DistributionRow[]; sample: number } {
  const counts = new Map<string, { count: number; resisted: number; decided: number }>();
  let sample = 0;
  for (const e of events) {
    if (!e.triggers.length) continue;
    sample += 1;
    for (const t of e.triggers) {
      const c = counts.get(t) ?? { count: 0, resisted: 0, decided: 0 };
      c.count += 1;
      if (e.outcome === 'resisted' || e.outcome === 'delayed' || e.outcome === 'acted') {
        c.decided += 1;
        if (e.outcome !== 'acted') c.resisted += 1;
      }
      counts.set(t, c);
    }
  }
  const rows = Array.from(counts.entries())
    .map(([id, c]) => ({ id, count: c.count, share: sample ? c.count / sample : 0, resistRate: c.decided ? c.resisted / c.decided : null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { rows, sample };
}

export function computeSingleFieldDistribution(events: UrgeEvent[], field: 'location' | 'company' | 'mood', limit = 5): { rows: DistributionRow[]; sample: number } {
  const counts = new Map<string, { count: number; resisted: number; decided: number }>();
  let sample = 0;
  for (const e of events) {
    const v = e[field];
    if (!v) continue;
    sample += 1;
    const c = counts.get(v) ?? { count: 0, resisted: 0, decided: 0 };
    c.count += 1;
    if (e.outcome === 'resisted' || e.outcome === 'delayed' || e.outcome === 'acted') {
      c.decided += 1;
      if (e.outcome !== 'acted') c.resisted += 1;
    }
    counts.set(v, c);
  }
  const rows = Array.from(counts.entries())
    .map(([id, c]) => ({ id, count: c.count, share: sample ? c.count / sample : 0, resistRate: c.decided ? c.resisted / c.decided : null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { rows, sample };
}

// ---------------------------------------------------------------------------
// Mood ↔ outcome correlation
// ---------------------------------------------------------------------------

export interface MoodOutcome {
  tenseRate: number | null; // resist rate when tense
  calmRate: number | null; // resist rate when calm
  tenseSample: number;
  calmSample: number;
}

const TENSE = new Set(['very_tense', 'tense', 'Çok gergin', 'Gergin']);
const CALM = new Set(['calm', 'very_calm', 'Sakin', 'Çok sakin']);

export function computeMoodOutcome(events: UrgeEvent[]): MoodOutcome {
  const bucket = (pred: (m: string) => boolean) => {
    const decided = events.filter((e) => e.mood && pred(e.mood) && (e.outcome === 'resisted' || e.outcome === 'delayed' || e.outcome === 'acted'));
    const resisted = decided.filter((e) => e.outcome !== 'acted').length;
    return { rate: decided.length ? resisted / decided.length : null, sample: decided.length };
  };
  const t = bucket((m) => TENSE.has(m));
  const c = bucket((m) => CALM.has(m));
  return { tenseRate: t.rate, calmRate: c.rate, tenseSample: t.sample, calmSample: c.sample };
}

// ---------------------------------------------------------------------------
// Intensity trend (is it getting easier?)
// ---------------------------------------------------------------------------

export interface IntensityTrend {
  earlyAvg: number | null;
  lateAvg: number | null;
  sample: number;
  afterAvgDrop: number | null; // avg (intensity - intensityAfter) where both exist
  afterSample: number;
}

export function computeIntensityTrend(events: UrgeEvent[]): IntensityTrend {
  const withIntensity = events
    .filter((e) => typeof e.intensity === 'number')
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  const half = Math.floor(withIntensity.length / 2);
  const avg = (xs: UrgeEvent[]) => (xs.length ? xs.reduce((s, e) => s + (e.intensity ?? 0), 0) / xs.length : null);

  const withAfter = events.filter((e) => typeof e.intensity === 'number' && typeof e.intensityAfter === 'number');
  const afterAvgDrop = withAfter.length
    ? withAfter.reduce((s, e) => s + ((e.intensity ?? 0) - (e.intensityAfter ?? 0)), 0) / withAfter.length
    : null;

  return {
    earlyAvg: half >= 2 ? avg(withIntensity.slice(0, half)) : null,
    lateAvg: half >= 2 ? avg(withIntensity.slice(half)) : null,
    sample: withIntensity.length,
    afterAvgDrop,
    afterSample: withAfter.length,
  };
}

// ---------------------------------------------------------------------------
// Delay timer stats (F4)
// ---------------------------------------------------------------------------

export function computeDelayStats(events: UrgeEvent[]) {
  const delayed = events.filter((e) => (e.delaySeconds ?? 0) > 0);
  const neverReturned = delayed.filter((e) => e.outcome === 'resisted' || e.outcome === 'delayed').length;
  return { delayed: delayed.length, neverReturned };
}

// ---------------------------------------------------------------------------
// Earnings counter (F3)
// ---------------------------------------------------------------------------

export interface Earnings {
  unitsAvoided: number | null;
  moneySaved: number | null;
  minutesRecovered: number | null;
  goalProgress: number | null; // 0..1 when a savings goal is set
}

/**
 * Yapılmayan adet = uygulamadan önceki günlük ortalamaya göre beklenen toplam
 * eksi aynı süredeki gerçek "yaptım" kayıtları. Azaltma modunda da sıfırlanmaz.
 */
export function computeEarnings(behavior: Behavior, now: Date = new Date(), events: UrgeEvent[] = []): Earnings {
  const baseline = behavior.baselinePerDay;
  if (!baseline || baseline <= 0) return { unitsAvoided: null, moneySaved: null, minutesRecovered: null, goalProgress: null };
  const startedAt = new Date(behavior.createdAt).getTime();
  const days = Math.max(0, now.getTime() - startedAt) / 86_400_000;
  const acted = events.filter((event) => event.behaviorId === behavior.id && event.outcome === 'acted' && new Date(event.startedAt).getTime() >= startedAt && new Date(event.startedAt).getTime() <= now.getTime()).length;
  const units = Math.max(0, baseline * days - acted);
  const money = behavior.costPerUnit ? units * behavior.costPerUnit : null;
  const minutes = behavior.minutesPerUnit ? units * behavior.minutesPerUnit : null;
  const goalProgress =
    money !== null && behavior.savingsGoalAmount && behavior.savingsGoalAmount > 0
      ? Math.min(1, money / behavior.savingsGoalAmount)
      : null;
  return { unitsAvoided: units, moneySaved: money, minutesRecovered: minutes, goalProgress };
}

// ---------------------------------------------------------------------------
// Calendar (DESIGN.md §23 — max 3 discrete states per cell)
// ---------------------------------------------------------------------------

export type CalendarState = 'none' | 'aligned' | 'hard';

export function computeCalendarStates(events: UrgeEvent[]): Record<string, CalendarState> {
  const map: Record<string, CalendarState> = {};
  for (const e of events) {
    const k = dayKey(e.startedAt);
    if (e.outcome === 'acted') map[k] = 'hard';
    else if (map[k] !== 'hard') map[k] = 'aligned';
  }
  return map;
}

// ---------------------------------------------------------------------------
// Period comparison
// ---------------------------------------------------------------------------

export function comparePeriods(current: UrgeEvent[], previous: UrgeEvent[]): { deltaPct: number | null; direction: 'down' | 'up' | 'flat' } {
  if (!previous.length) return { deltaPct: null, direction: 'flat' };
  const delta = (current.length - previous.length) / previous.length;
  return { deltaPct: Math.round(delta * 100), direction: delta < -0.05 ? 'down' : delta > 0.05 ? 'up' : 'flat' };
}

// ---------------------------------------------------------------------------
// Rule-based insights (F6 — no AI, no cloud)
// ---------------------------------------------------------------------------

export interface Insight {
  id: string;
  text: string;
  tone: 'neutral' | 'success' | 'amber';
}

export function computeInsights(events: UrgeEvent[], labels: { trigger: (id: string) => string; location: (id: string) => string }): Insight[] {
  const out: Insight[] = [];
  if (events.length < 15 || new Set(events.map((event) => dayKey(event.startedAt))).size < 3) return out;

  const heat = computeHeatmap(events);
  if (heat.peak && heat.peak.count >= 3 && heat.max >= Math.max(3, events.length * 0.2)) {
    out.push({ id: 'peak', text: `${describeHeatCell(heat.peak)} en zorlu zamanın gibi görünüyor.`, tone: 'neutral' });
  }

  const triggers = computeTriggerDistribution(events, 1);
  if (triggers.rows[0] && triggers.sample >= 5 && triggers.rows[0].share >= 0.3) {
    const t = triggers.rows[0];
    out.push({ id: 'trigger', text: `En büyük tetikleyicin: ${labels.trigger(t.id)} (%${Math.round(t.share * 100)}).`, tone: 'neutral' });
  }

  const mood = computeMoodOutcome(events);
  if (mood.tenseRate !== null && mood.calmRate !== null && mood.tenseSample >= 4 && mood.calmSample >= 4 && mood.calmRate - mood.tenseRate >= 0.2) {
    out.push({
      id: 'mood',
      text: `Gerginken direnme oranın %${Math.round(mood.tenseRate * 100)}, sakinken %${Math.round(mood.calmRate * 100)}.`,
      tone: 'neutral',
    });
  }

  const intensity = computeIntensityTrend(events);
  if (intensity.earlyAvg !== null && intensity.lateAvg !== null && intensity.sample >= 8 && intensity.earlyAvg - intensity.lateAvg >= 0.5) {
    out.push({ id: 'intensity', text: 'İsteklerinin şiddeti zamanla azalıyor. Bu, değişimi gösteren güçlü bir işaret.', tone: 'success' });
  }
  if (intensity.afterAvgDrop !== null && intensity.afterSample >= 3 && intensity.afterAvgDrop >= 1) {
    out.push({
      id: 'wave',
      text: `Dalgayı beklediğinde istek ortalama ${intensity.afterAvgDrop.toFixed(1)} puan düşüyor.`,
      tone: 'success',
    });
  }

  const loc = computeSingleFieldDistribution(events, 'location', 1);
  if (loc.rows[0] && loc.sample >= 5 && loc.rows[0].share >= 0.5) {
    out.push({ id: 'location', text: `Kayıtlarının %${Math.round(loc.rows[0].share * 100)}'i ${labels.location(loc.rows[0].id)} kaynaklı.`, tone: 'neutral' });
  }

  const delay = computeDelayStats(events);
  if (delay.delayed >= 3) {
    out.push({ id: 'delay', text: `${delay.delayed} kez erteledin, ${delay.neverReturned}'inde hiç geri dönmedin.`, tone: 'success' });
  }

  return out;
}

export function outcomeLabel(outcome: EventOutcome): string {
  switch (outcome) {
    case 'resisted':
      return 'Direndim';
    case 'delayed':
      return 'Erteledim';
    case 'acted':
      return 'Yaptım';
    case 'unsure':
      return 'Emin değilim';
    default:
      return 'Sonucu ekle';
  }
}

// ---------------------------------------------------------------------------
// "Kaç tane?" — acted counts (sigara içtim / telefonu açtım) per day
// ---------------------------------------------------------------------------

export function actedOn(events: UrgeEvent[], behaviorId: string, key: string): number {
  return events.filter((e) => e.behaviorId === behaviorId && e.outcome === 'acted' && dayKey(e.startedAt) === key).length;
}

export interface ActedStats {
  today: number;
  week: number; // last 7 days incl. today
  avgPerDay: number | null; // over the last 7 days, null when no history yet
  daysTracked: number;
  lastAt: string | null;
}

export function computeActedStats(events: UrgeEvent[], behavior: Behavior, now: Date = new Date()): ActedStats {
  const mine = events.filter((e) => e.behaviorId === behavior.id && e.outcome === 'acted');
  const todayK = dayKey(now);
  const weekCut = now.getTime() - 7 * 86_400_000;
  const week = mine.filter((e) => new Date(e.startedAt).getTime() >= weekCut).length;
  const daysTracked = Math.max(1, Math.min(7, Math.ceil((now.getTime() - new Date(behavior.createdAt).getTime()) / 86_400_000)));
  return {
    today: mine.filter((e) => dayKey(e.startedAt) === todayK).length,
    week,
    avgPerDay: mine.length ? week / daysTracked : null,
    daysTracked,
    lastAt: mine[0]?.startedAt ?? null,
  };
}

/** Per-day acted counts for the last N days (oldest → newest). */
export function actedSeries(events: UrgeEvent[], behaviorId: string, days: number, now: Date = new Date()): { key: string; label: string; count: number }[] {
  const out: { key: string; label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ key, label: DAY_SHORT[d.getDay()], count: actedOn(events, behaviorId, key) });
  }
  return out;
}

/**
 * The relapse-recovery flow is for a real slip: "bırak" mode and at least a
 * day clean. Counting a cigarette in "azalt" / "fark et" / "geciktir" mode
 * — or a second one an hour after the first — is just data and gets a quiet
 * one-tap log with undo instead of three screens.
 */
export function shouldRunRecovery(behavior: Behavior, now: Date = new Date()): boolean {
  if (behavior.goalMode !== 'quit') return false;
  return cleanDuration(behavior, now).totalHours >= 24;
}
