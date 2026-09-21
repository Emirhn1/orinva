import { Behavior, UrgeEvent } from '@/data/types';
import { cleanDuration, computeEarnings } from '@/utils/journey';
import { formatMoney } from '@/utils/date';

/**
 * The compact snapshot handed to both the iOS home/lock-screen widget and
 * the Android app-widget. Pure and platform-agnostic on purpose — the
 * "what data" decision (this file) is kept separate from "how it's drawn"
 * (the native widget code) and "when it's pushed" (syncWidgets.ts), so each
 * piece can be tested and reasoned about on its own.
 */
export interface WidgetSnapshot {
  hasFocus: boolean;
  behaviorId: string | null;
  behaviorName: string | null;
  /** e.g. "3g 4sa" — always a duration, never a live ticking value (Part 4 §widget). */
  cleanLabel: string | null;
  savingsLabel: string | null;
  goalLabel: string | null;
  goalProgressPct: number | null;
  /** Local ISO timestamp of this snapshot — lets a widget tell fresh data from stale. */
  updatedAt: string;
}

export const EMPTY_WIDGET_SNAPSHOT: WidgetSnapshot = {
  hasFocus: false,
  behaviorId: null,
  behaviorName: null,
  cleanLabel: null,
  savingsLabel: null,
  goalLabel: null,
  goalProgressPct: null,
  updatedAt: new Date(0).toISOString(),
};

/** Same "most recently active, else first" rule the Today screen uses, so the widget never disagrees with the app. */
export function resolveWidgetFocus(behaviors: Behavior[], events: UrgeEvent[], preferredId: string | null): Behavior | null {
  const active = behaviors.filter((b) => !b.archived);
  if (!active.length) return null;
  const preferred = active.find((b) => b.id === preferredId);
  if (preferred) return preferred;
  const latest = events.find((e) => active.some((b) => b.id === e.behaviorId));
  return active.find((b) => b.id === latest?.behaviorId) ?? active[0];
}

/** Full, home-screen-appropriate snapshot: progress + estimated savings, exactly what Part 4 asks the widget to lead with. */
export function computeWidgetSnapshot(behaviors: Behavior[], events: UrgeEvent[], preferredId: string | null, now: Date = new Date()): WidgetSnapshot {
  const focus = resolveWidgetFocus(behaviors, events, preferredId);
  if (!focus) return { ...EMPTY_WIDGET_SNAPSHOT, updatedAt: now.toISOString() };

  const duration = cleanDuration(focus, now);
  const earnings = computeEarnings(focus, now, events);

  return {
    hasFocus: true,
    behaviorId: focus.id,
    behaviorName: focus.name,
    cleanLabel: `${duration.days}g ${duration.hours}sa`,
    savingsLabel: earnings.moneySaved !== null ? formatMoney(earnings.moneySaved, focus.costCurrency) : null,
    goalLabel: focus.savingsGoalLabel ?? null,
    goalProgressPct: earnings.goalProgress !== null ? Math.round(earnings.goalProgress * 100) : null,
    updatedAt: now.toISOString(),
  };
}

/**
 * The lock-screen-safe view of the same snapshot (Part 4 §privacy): behavior
 * name, slip info, quote text and sensitive progress stay out unless the
 * user opted in. When hidden, only a generic "tracked, tap to open" shape
 * survives — enough for the widget to render something, never the specifics.
 */
export interface LockScreenSnapshot {
  sensitiveVisible: boolean;
  hasFocus: boolean;
  behaviorName: string | null;
  cleanLabel: string | null;
  updatedAt: string;
}

export function computeLockScreenSnapshot(snapshot: WidgetSnapshot, sensitiveVisible: boolean): LockScreenSnapshot {
  if (!sensitiveVisible) {
    return { sensitiveVisible: false, hasFocus: snapshot.hasFocus, behaviorName: null, cleanLabel: null, updatedAt: snapshot.updatedAt };
  }
  return {
    sensitiveVisible: true,
    hasFocus: snapshot.hasFocus,
    behaviorName: snapshot.behaviorName,
    cleanLabel: snapshot.cleanLabel,
    updatedAt: snapshot.updatedAt,
  };
}
