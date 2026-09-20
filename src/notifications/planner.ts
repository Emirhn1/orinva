import { Behavior, UrgeEvent, QuoteMeta } from '@/data/types';
import { Quote, HEALTH_TIMELINE } from '@/content/quotes';
import { NotificationKind, NotificationPrefs, inQuietHours, parseHHMM } from './prefs';
import { pickQuote } from './quoteEngine';
import { MILESTONE_LADDER, computeHeatmap, HEAT_BLOCKS, eventsInWindow, computeResistRate, computeEarnings, Insight } from '@/utils/journey';
import { dayKey } from '@/utils/date';

export const HORIZON_DAYS = 7;

/** Lower = wins the budget. */
const PRIORITY: Record<NotificationKind, number> = {
  postSlip: 1,
  milestone: 2,
  health: 3,
  riskHour: 4,
  // Once-a-week items beat the (daily) quote when they collide on a slot.
  weekly: 5,
  earnings: 6,
  insight: 7,
  quote: 8,
  gentleReturn: 9,
};

export type NotificationRoute = 'today' | 'journey' | 'craving-help' | 'quote' | 'journal';

export interface PlannedNotification {
  /** Stable key for a slot: `${kind}@${iso minute}` — lets us reuse quote assignments across re-plans. */
  key: string;
  kind: NotificationKind;
  at: Date;
  title: string;
  body: string;
  route: NotificationRoute;
  quoteId?: string;
  behaviorId?: string;
}

export interface PlanInput {
  prefs: NotificationPrefs;
  behaviors: Behavior[];
  events: UrgeEvent[];
  quotes: Quote[];
  meta: QuoteMeta[];
  insights: Insight[];
  now: Date;
  /** Previous plan — reused so a re-plan doesn't reshuffle already-chosen quotes. */
  previous: PlannedNotification[];
  lastInsightNotifiedAt: string | null;
}

const TITLE = 'ORINVA';

function at(base: Date, dayOffset: number, hhmm: string): Date {
  const { h, m } = parseHHMM(hhmm);
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

function slotKey(kind: NotificationKind, date: Date, extra = ''): string {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return `${kind}@${d.toISOString()}${extra ? `#${extra}` : ''}`;
}

/**
 * Builds every candidate for the next 7 days, then applies the budget:
 * max N per local day, ≥ gap minutes apart, nothing in quiet hours (quotes
 * are dropped, everything else is pushed to the end of the quiet window).
 *
 * Privacy (Plan §1.6): no behavior name or amount ever appears in a body.
 */
export function planNotifications(input: PlanInput): PlannedNotification[] {
  const { prefs, behaviors, events, now } = input;
  if (!prefs.enabled) return [];

  const active = behaviors.filter((b) => !b.archived);
  const horizonEnd = new Date(now.getTime() + HORIZON_DAYS * 86_400_000);
  const inHorizon = (d: Date) => d.getTime() > now.getTime() + 60_000 && d.getTime() <= horizonEnd.getTime();
  const candidates: PlannedNotification[] = [];

  // --- Günün sözü ----------------------------------------------------------
  if (prefs.kinds.quote) {
    for (let day = 0; day < HORIZON_DAYS; day++) {
      for (const t of prefs.times) {
        const when = at(now, day, t);
        if (!inHorizon(when)) continue;
        candidates.push({ key: slotKey('quote', when), kind: 'quote', at: when, title: TITLE, body: '', route: 'quote' });
      }
    }
  }

  // --- Kilometre taşı ------------------------------------------------------
  if (prefs.kinds.milestone) {
    for (const b of active) {
      const since = new Date(b.cleanSinceAt).getTime();
      for (const step of MILESTONE_LADDER) {
        const when = new Date(since + step.hours * 3_600_000);
        if (!inHorizon(when)) continue;
        candidates.push({
          key: slotKey('milestone', when, b.id),
          kind: 'milestone',
          at: when,
          title: TITLE,
          body: `${step.label}. Bu küçük değil.`,
          route: 'today',
          behaviorId: b.id,
        });
      }
    }
  }

  // --- Sağlık zaman çizelgesi ----------------------------------------------
  if (prefs.kinds.health) {
    for (const b of active) {
      const since = new Date(b.cleanSinceAt).getTime();
      for (const h of HEALTH_TIMELINE) {
        if (h.behaviorCategory !== b.category || !h.minCleanHours) continue;
        const when = new Date(since + h.minCleanHours * 3_600_000);
        if (!inHorizon(when)) continue;
        candidates.push({ key: slotKey('health', when, b.id), kind: 'health', at: when, title: TITLE, body: h.text, route: 'today', behaviorId: b.id, quoteId: h.id });
      }
    }
  }

  // --- Riskli saat (öğrenilen) ---------------------------------------------
  if (prefs.kinds.riskHour) {
    const recent = eventsInWindow(events, 90, now);
    const heat = computeHeatmap(recent);
    if (recent.length >= 5 && heat.peak && heat.peak.count >= 3) {
      const block = HEAT_BLOCKS[heat.peak.block];
      for (let day = 0; day < HORIZON_DAYS; day++) {
        const d = new Date(now);
        d.setDate(d.getDate() + day);
        if ((d.getDay() + 6) % 7 !== heat.peak.day) continue;
        const when = new Date(d);
        when.setHours(block.from, 0, 0, 0);
        when.setMinutes(when.getMinutes() - 20);
        if (!inHorizon(when)) continue;
        candidates.push({ key: slotKey('riskHour', when), kind: 'riskHour', at: when, title: TITLE, body: 'Genelde bu saatte zorlanıyorsun. Planın hazır.', route: 'craving-help' });
      }
    }
  }

  // --- Nazik geri dönüş ----------------------------------------------------
  if (prefs.kinds.gentleReturn) {
    const lastTouch = events[0]?.startedAt ?? active.map((b) => b.createdAt).sort().pop();
    if (lastTouch) {
      const when = new Date(lastTouch);
      when.setDate(when.getDate() + 3);
      when.setHours(19, 0, 0, 0);
      if (inHorizon(when)) {
        candidates.push({ key: slotKey('gentleReturn', when), kind: 'gentleReturn', at: when, title: TITLE, body: 'Buradayız. Bir şey kaydetmek zorunda değilsin.', route: 'today' });
      }
    }
  }

  // --- Haftalık özet (Pazar 20:00) ----------------------------------------
  if (prefs.kinds.weekly && active.length) {
    for (let day = 0; day < HORIZON_DAYS; day++) {
      const when = at(now, day, '20:00');
      if (when.getDay() !== 0 || !inHorizon(when)) continue;
      const week = eventsInWindow(events, 7, now);
      const rate = computeResistRate(week);
      const body = week.length ? `Bu hafta ${week.length} dürtü, ${rate.resisted}'inde direndin.` : 'Bu hafta sessiz geçti. Alan hâlâ hazır.';
      candidates.push({ key: slotKey('weekly', when), kind: 'weekly', at: when, title: TITLE, body, route: 'journey' });
    }
  }

  // --- Nüksetme sonrası (+1 saat) ------------------------------------------
  if (prefs.kinds.postSlip) {
    const lastActed = events.find((e) => e.outcome === 'acted');
    if (lastActed) {
      const when = new Date(new Date(lastActed.startedAt).getTime() + 3_600_000);
      if (inHorizon(when)) {
        candidates.push({ key: slotKey('postSlip', when), kind: 'postSlip', at: when, title: TITLE, body: 'Kaydettin. Bu başarısızlık değil, veri.', route: 'today' });
      }
    }
  }

  // --- Kazanç (Cumartesi 10:00) --------------------------------------------
  if (prefs.kinds.earnings) {
    const withBaseline = active.filter((b) => b.baselinePerDay);
    if (withBaseline.length) {
      for (let day = 0; day < HORIZON_DAYS; day++) {
        const when = at(now, day, '10:00');
        if (when.getDay() !== 6 || !inHorizon(when)) continue;
        let minutes = 0;
        let money = 0;
        for (const b of withBaseline) {
          const e = computeEarnings(b, when);
          minutes += Math.min(e.minutesRecovered ?? 0, 7 * (b.baselinePerDay ?? 0) * (b.minutesPerUnit ?? 0));
          money += Math.min(e.moneySaved ?? 0, 7 * (b.baselinePerDay ?? 0) * (b.costPerUnit ?? 0));
        }
        const parts: string[] = [];
        if (minutes > 0) parts.push(`${Math.round(minutes / 60)} sa geri kazandın`);
        if (money > 0) parts.push(`${Math.round(money)} ₺ biriktirdin`);
        if (!parts.length) continue;
        candidates.push({ key: slotKey('earnings', when), kind: 'earnings', at: when, title: TITLE, body: `Bu hafta ${parts.join(', ')}.`, route: 'journey' });
      }
    }
  }

  // --- İçgörü (en fazla haftada bir) ---------------------------------------
  if (prefs.kinds.insight && input.insights.length) {
    const lastAt = input.lastInsightNotifiedAt ? new Date(input.lastInsightNotifiedAt).getTime() : 0;
    if (now.getTime() - lastAt > 7 * 86_400_000) {
      const when = at(now, 1, '12:00');
      if (inHorizon(when)) {
        candidates.push({ key: slotKey('insight', when), kind: 'insight', at: when, title: TITLE, body: input.insights[0].text, route: 'journey' });
      }
    }
  }

  return applyBudget(candidates, input);
}

function applyBudget(candidates: PlannedNotification[], input: PlanInput): PlannedNotification[] {
  const { prefs, now } = input;
  const gapMs = prefs.minGapMinutes * 60_000;

  // Quiet hours: drop quotes, shift everything else to the end of the window.
  const adjusted: PlannedNotification[] = [];
  for (const c of candidates) {
    if (!inQuietHours(c.at, prefs)) {
      adjusted.push(c);
      continue;
    }
    if (c.kind === 'quote') continue;
    const { h, m } = parseHHMM(prefs.quietTo);
    const shifted = new Date(c.at);
    shifted.setHours(h, m, 0, 0);
    if (shifted.getTime() < c.at.getTime()) shifted.setDate(shifted.getDate() + 1);
    adjusted.push({ ...c, at: shifted });
  }

  const byDay = new Map<string, PlannedNotification[]>();
  for (const c of adjusted) {
    const k = dayKey(c.at);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(c);
  }

  const accepted: PlannedNotification[] = [];
  for (const list of byDay.values()) {
    list.sort((a, b) => PRIORITY[a.kind] - PRIORITY[b.kind] || a.at.getTime() - b.at.getTime());
    const chosen: PlannedNotification[] = [];
    for (const c of list) {
      if (chosen.length >= prefs.maxPerDay) break;
      const tooClose = chosen.some((x) => Math.abs(x.at.getTime() - c.at.getTime()) < gapMs);
      if (tooClose) continue;
      chosen.push(c);
    }
    accepted.push(...chosen);
  }

  accepted.sort((a, b) => a.at.getTime() - b.at.getTime());
  return assignQuotes(accepted, input);
}

/** Fills quote slots, reusing previous assignments for identical slots so re-plans are stable. */
function assignQuotes(planned: PlannedNotification[], input: PlanInput): PlannedNotification[] {
  const exclude = new Set<string>();
  const prevByKey = new Map(input.previous.map((p) => [p.key, p]));
  const out: PlannedNotification[] = [];
  // Health milestones have their own kind/timing — keep quote slots editorial.
  const prefs = { ...input.prefs, categories: { ...input.prefs.categories, health: false } };

  for (const p of planned) {
    if (p.kind !== 'quote') {
      out.push(p);
      continue;
    }
    const prev = prevByKey.get(p.key);
    const prevQuote = prev?.quoteId ? input.quotes.find((q) => q.id === prev.quoteId) : undefined;
    const prevOk = prevQuote && prefs.categories[prevQuote.category] && !input.meta.find((m) => m.quoteId === prevQuote.id)?.hiddenAt && !exclude.has(prevQuote.id);
    const quote = prevOk ? prevQuote : pickQuote(input.quotes, { prefs, meta: input.meta, behaviors: input.behaviors, now: input.now, exclude }, p.at.getDate() + p.at.getHours());
    if (!quote) continue;
    exclude.add(quote.id);
    out.push({ ...p, quoteId: quote.id, body: quote.author ? `${quote.text} — ${quote.author}` : quote.text });
  }
  return out;
}
