import { AppState } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { syncWidgets } from './syncWidgets';

let debounce: ReturnType<typeof setTimeout> | null = null;

function pushNow() {
  const s = useAppStore.getState();
  syncWidgets(s.behaviors, s.events, s.focusBehaviorId, s.settings.widgetSensitiveContentVisible);
}

function requestSync(delayMs = 800) {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    pushNow();
  }, delayMs);
}

/**
 * Wires the widget to the store, mirroring notifications/scheduler.ts:
 * behaviors, events, focus and the sensitive-content preference all push a
 * debounced update; returning to the foreground pushes one immediately so
 * a stale widget never lingers on screen after the app was used (Part 4
 * §"eski widget verisinin ekranda kalması").
 */
export function startWidgetSync(): () => void {
  let prev = pickInputs(useAppStore.getState());
  const unsub = useAppStore.subscribe((state) => {
    const next = pickInputs(state);
    if (next.some((v, i) => v !== prev[i])) {
      prev = next;
      requestSync();
    }
  });
  const app = AppState.addEventListener('change', (st) => {
    if (st === 'active') requestSync(200);
  });
  pushNow();
  return () => {
    unsub();
    app.remove();
  };
}

function pickInputs(s: ReturnType<typeof useAppStore.getState>) {
  return [s.behaviors, s.events, s.focusBehaviorId, s.settings.widgetSensitiveContentVisible] as const;
}
