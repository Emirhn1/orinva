import { ChipOption } from '@/content/chips';
import { ChipUsage } from '@/data/types';

/**
 * Time-of-day boosts (Plan §4.3 "bağlama duyarlı öneri"). Chip ids listed
 * for an hour window float to the front — but only ahead of chips the user
 * hasn't used more often, so learned preference always wins over heuristics.
 */
const CONTEXT_BOOSTS: { from: number; to: number; ids: string[] }[] = [
  { from: 22, to: 24, ids: ['tired', 'bed', 'sleepless', 'lonely'] },
  { from: 0, to: 6, ids: ['sleepless', 'bed', 'lonely'] },
  { from: 6, to: 10, ids: ['coffee', 'commute', 'habit'] },
  { from: 12, to: 14, ids: ['after_meal', 'work', 'coffee'] },
  { from: 19, to: 22, ids: ['after_meal', 'boredom', 'home', 'social'] },
];

function contextBoostIds(date: Date): Set<string> {
  const h = date.getHours();
  const ids = new Set<string>();
  for (const b of CONTEXT_BOOSTS) {
    if (h >= b.from && h < b.to) b.ids.forEach((id) => ids.add(id));
  }
  return ids;
}

/**
 * Orders a chip set: most-used first, then contextually boosted, then the
 * authored order. Stable for ties so the list doesn't jump around.
 */
export function orderChips(chips: ChipOption[], usage: ChipUsage, namespace: string, now: Date = new Date()): ChipOption[] {
  const boosted = contextBoostIds(now);
  return chips
    .map((chip, index) => ({
      chip,
      index,
      count: usage[`${namespace}:${chip.id}`] ?? 0,
      boost: boosted.has(chip.id) ? 1 : 0,
    }))
    .sort((a, b) => b.count - a.count || b.boost - a.boost || a.index - b.index)
    .map((x) => x.chip);
}

export function usageKey(namespace: string, id: string) {
  return `${namespace}:${id}`;
}
