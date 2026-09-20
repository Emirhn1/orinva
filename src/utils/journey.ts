import { UrgeEvent, Behavior } from '@/data/types';

export function cleanDuration(behavior: Behavior, now: Date = new Date()) {
  const since = new Date(behavior.cleanSinceAt);
  const ms = Math.max(0, now.getTime() - since.getTime());
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, totalHours: ms / 3_600_000 };
}

export interface JourneySummary {
  windowDays: number;
  contactDays: number; // gün: plan/olayla temas edilen
  hardDays: number; // gün: "acted" outcome olan
  urgesLogged: number;
  resistedOrDelayed: number;
  returnLatencyHours: number | null; // en son "acted" sonrası ilk yeniden temas süresi
}

export function computeJourneySummary(events: UrgeEvent[], windowDays = 30): JourneySummary {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const windowEvents = events.filter((e) => new Date(e.startedAt).getTime() >= cutoff);

  const dayKey = (iso: string) => iso.slice(0, 10);
  const contactDaySet = new Set(windowEvents.map((e) => dayKey(e.startedAt)));
  const hardDaySet = new Set(windowEvents.filter((e) => e.outcome === 'acted').map((e) => dayKey(e.startedAt)));

  const resistedOrDelayed = windowEvents.filter((e) => e.outcome === 'passed' || e.outcome === 'delayed').length;

  const sorted = [...windowEvents].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  let returnLatencyHours: number | null = null;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].outcome === 'acted') {
      const next = sorted[i + 1];
      if (next) {
        returnLatencyHours =
          (new Date(next.startedAt).getTime() - new Date(sorted[i].startedAt).getTime()) / 3_600_000;
      }
    }
  }

  return {
    windowDays,
    contactDays: contactDaySet.size,
    hardDays: hardDaySet.size,
    urgesLogged: windowEvents.length,
    resistedOrDelayed,
    returnLatencyHours,
  };
}

export function evidenceCaption(sampleSize: number, minSample = 8): string | null {
  if (sampleSize < minSample) return null;
  return `${sampleSize} kayıttan`;
}

const MILESTONE_LADDER: { label: string; hours: number }[] = [
  { label: '24 saat', hours: 24 },
  { label: '3 gün', hours: 72 },
  { label: '7 gün', hours: 24 * 7 },
  { label: '14 gün', hours: 24 * 14 },
  { label: '30 gün', hours: 24 * 30 },
  { label: '90 gün', hours: 24 * 90 },
];

export function nextMilestone(totalHours: number) {
  return MILESTONE_LADDER.find((m) => m.hours > totalHours) ?? null;
}

export function reachedMilestones(totalHours: number) {
  return MILESTONE_LADDER.filter((m) => m.hours <= totalHours);
}
