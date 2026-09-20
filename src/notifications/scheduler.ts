import { AppState } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { allQuotes } from './quoteEngine';
import { planNotifications, PlannedNotification } from './planner';
import { configureNotifications, getPermissionState, replaceScheduled, cancelAll } from './native';
import { computeInsights, eventsInWindow } from '@/utils/journey';
import { resolveChipLabel } from '@/components/ui/ChipGroup';
import { TRIGGER_CHIPS, LOCATION_CHIPS } from '@/content/chips';

let running = false;
let queued = false;
let debounce: ReturnType<typeof setTimeout> | null = null;

/**
 * Re-plans the next 7 days and hands the plan to the OS. Called on boot, on
 * foreground, and (debounced) whenever the inputs change. Idempotent: the
 * whole scheduled set is replaced every time, so drift can't accumulate.
 */
export async function rescheduleNotifications(): Promise<void> {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  try {
    const s = useAppStore.getState();
    await configureNotifications();
    const permission = await getPermissionState();
    if (permission !== s.notificationPermission) s.setNotificationPermission(permission);

    if (!s.notificationPrefs.enabled || permission !== 'granted') {
      await cancelAll();
      if (s.notificationPlan.length) s.setNotificationPlan([]);
      return;
    }

    const now = new Date();

    // Slots from the previous plan whose time has passed were delivered — record the quotes as shown.
    for (const p of s.notificationPlan) {
      if (p.quoteId && p.at.getTime() <= now.getTime()) s.markQuoteShown(p.quoteId);
    }

    const state = useAppStore.getState();
    const insights = computeInsights(eventsInWindow(state.events, 30, now), {
      trigger: (id) => resolveChipLabel(TRIGGER_CHIPS, id) ?? id,
      location: (id) => resolveChipLabel(LOCATION_CHIPS, id) ?? id,
    });

    const plan: PlannedNotification[] = planNotifications({
      prefs: state.notificationPrefs,
      behaviors: state.behaviors,
      events: state.events,
      quotes: allQuotes(state.userQuotes, state.reasons),
      meta: state.quoteMeta,
      insights,
      now,
      previous: state.notificationPlan,
      lastInsightNotifiedAt: state.lastInsightNotifiedAt,
    });

    await replaceScheduled(plan);
    const insightAt = plan.some((p) => p.kind === 'insight') ? now.toISOString() : undefined;
    state.setNotificationPlan(plan, insightAt);
  } finally {
    running = false;
    if (queued) {
      queued = false;
      void rescheduleNotifications();
    }
  }
}

export function requestReschedule(delayMs = 1500) {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    void rescheduleNotifications();
  }, delayMs);
}

/**
 * Wires the scheduler to the store: any change in events, behaviors, reasons,
 * quotes, meta or prefs triggers a debounced re-plan; returning to the
 * foreground triggers an immediate one (so a day's plan is always fresh).
 */
export function startNotificationScheduler(): () => void {
  let prev = pickInputs(useAppStore.getState());
  const unsub = useAppStore.subscribe((state) => {
    const next = pickInputs(state);
    if (next.some((v, i) => v !== prev[i])) {
      prev = next;
      requestReschedule();
    }
  });
  const app = AppState.addEventListener('change', (st) => {
    if (st === 'active') requestReschedule(200);
  });
  void rescheduleNotifications();
  return () => {
    unsub();
    app.remove();
  };
}

function pickInputs(s: ReturnType<typeof useAppStore.getState>) {
  return [s.events, s.behaviors, s.reasons, s.userQuotes, s.notificationPrefs, s.quoteMeta.filter((m) => m.hiddenAt).length] as const;
}
