import { BUILTIN_QUOTES, Quote, QuoteCategory } from '@/content/quotes';
import { UserQuote, QuoteMeta, Reason, Behavior } from '@/data/types';
import { NotificationPrefs } from './prefs';
import { cleanDuration } from '@/utils/journey';

const NO_REPEAT_DAYS = 30;

/** Built-in library + user quotes + the user's own reasons (as "own" quotes). */
export function allQuotes(userQuotes: UserQuote[], reasons: Reason[]): Quote[] {
  const own: Quote[] = reasons
    .filter((r) => r.type === 'reason')
    .map((r) => ({ id: `r-${r.id}`, category: 'own' as const, text: r.text }));
  const user: Quote[] = userQuotes.map((q) => ({ id: q.id, category: q.category, text: q.text, author: q.author ?? undefined }));
  return [...BUILTIN_QUOTES, ...own, ...user];
}

export function findQuote(id: string, userQuotes: UserQuote[], reasons: Reason[]): Quote | undefined {
  return allQuotes(userQuotes, reasons).find((q) => q.id === id);
}

interface PickContext {
  prefs: NotificationPrefs;
  meta: QuoteMeta[];
  behaviors: Behavior[];
  now: Date;
  /** Ids already planned for upcoming slots — never plan the same text twice in a week. */
  exclude?: Set<string>;
  /** Restrict to a category (e.g. a health milestone push). */
  category?: QuoteCategory;
}

function metaFor(meta: QuoteMeta[], id: string): QuoteMeta | undefined {
  return meta.find((m) => m.quoteId === id);
}

function healthRelevant(q: Quote, behaviors: Behavior[], now: Date): boolean {
  if (q.category !== 'health') return true;
  const active = behaviors.filter((b) => !b.archived && b.category === q.behaviorCategory);
  if (!active.length) return false;
  const maxClean = Math.max(...active.map((b) => cleanDuration(b, now).totalHours));
  return (q.minCleanHours ?? 0) <= maxClean;
}

/**
 * Candidates: enabled category, not hidden, not shown in the last 30 days,
 * health items only once their clean-time threshold is reached.
 */
export function eligibleQuotes(quotes: Quote[], ctx: PickContext): Quote[] {
  const cutoff = ctx.now.getTime() - NO_REPEAT_DAYS * 86_400_000;
  return quotes.filter((q) => {
    if (ctx.category && q.category !== ctx.category) return false;
    if (!ctx.prefs.categories[q.category]) return false;
    if (ctx.exclude?.has(q.id)) return false;
    const m = metaFor(ctx.meta, q.id);
    if (m?.hiddenAt) return false;
    if (m?.lastShownAt && new Date(m.lastShownAt).getTime() > cutoff) return false;
    return healthRelevant(q, ctx.behaviors, ctx.now);
  });
}

/**
 * Picks one quote. Own words are the strongest content (Plan §5.1), so they
 * get double weight; otherwise least-shown first, with a per-day seed so the
 * order rotates instead of always starting from the same item.
 */
export function pickQuote(quotes: Quote[], ctx: PickContext, seed = dayOfYear(ctx.now)): Quote | null {
  const pool = eligibleQuotes(quotes, ctx);
  if (!pool.length) {
    // Everything was shown recently — fall back to the least recently shown, ignoring the 30-day rule.
    const fallback = quotes.filter((q) => ctx.prefs.categories[q.category] && !metaFor(ctx.meta, q.id)?.hiddenAt && !ctx.exclude?.has(q.id) && healthRelevant(q, ctx.behaviors, ctx.now) && (!ctx.category || q.category === ctx.category));
    if (!fallback.length) return null;
    fallback.sort((a, b) => (metaFor(ctx.meta, a.id)?.lastShownAt ?? '').localeCompare(metaFor(ctx.meta, b.id)?.lastShownAt ?? ''));
    return fallback[0];
  }
  const weighted = pool.flatMap((q) => (q.category === 'own' ? [q, q] : [q]));
  weighted.sort((a, b) => (metaFor(ctx.meta, a.id)?.shownCount ?? 0) - (metaFor(ctx.meta, b.id)?.shownCount ?? 0));
  const minCount = metaFor(ctx.meta, weighted[0].id)?.shownCount ?? 0;
  const tier = weighted.filter((q) => (metaFor(ctx.meta, q.id)?.shownCount ?? 0) === minCount);
  return tier[seed % tier.length];
}

export function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
}

export function markShown(meta: QuoteMeta[], id: string, at: Date): QuoteMeta {
  const existing = metaFor(meta, id);
  return {
    quoteId: id,
    isFavorite: existing?.isFavorite ?? false,
    lastShownAt: at.toISOString(),
    shownCount: (existing?.shownCount ?? 0) + 1,
    hiddenAt: existing?.hiddenAt ?? null,
  };
}
