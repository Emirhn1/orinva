import { Platform } from 'react-native';
import { Behavior, UrgeEvent } from '@/data/types';
import { computeWidgetSnapshot, computeLockScreenSnapshot, WidgetSnapshot } from './widgetData';

/**
 * Pushes the latest snapshot to the native widget surface on each platform.
 * Every call is best-effort and silent: Expo Go, the web preview, a device
 * without the widget module, or a cold boot before the native side is ready
 * must never crash the app over a widget update. This is also why the data
 * computation (widgetData.ts) is kept separate and fully testable — this
 * file is the thin, hard-to-unit-test glue around it.
 */

/**
 * Only the one method this file actually calls — typed by hand instead of
 * importing expo-widgets' `Widget` type here, because `tsc` (unlike Metro)
 * doesn't resolve the `.ios.tsx` platform file for this module, so a typeof
 * import would silently type-check against the non-iOS `null` fallback.
 */
interface IosWidgetHandle {
  updateSnapshot(payload: WidgetPushPayload): void;
}

let iosWidgetModule: IosWidgetHandle | null | undefined;

function getIosWidget(): IosWidgetHandle | null {
  if (iosWidgetModule !== undefined) return iosWidgetModule;
  try {
    // Lazy + guarded: expo-widgets isn't present in Expo Go and only ships an iOS native side.
    iosWidgetModule = require('./native/OrinvaWidget').default as IosWidgetHandle | null;
  } catch {
    iosWidgetModule = null;
  }
  return iosWidgetModule ?? null;
}

/**
 * `home` keeps the full snapshot (progress + estimated savings — that's the
 * whole point of a home-screen widget) and `lock` is separately gated by the
 * user's privacy preference. They are never merged into one flat object —
 * doing that would let a hidden lock-screen field's `null` clobber the real
 * home-screen value, or leak the real value onto the lock screen.
 */
export interface WidgetPushPayload {
  home: WidgetSnapshot;
  lock: ReturnType<typeof computeLockScreenSnapshot>;
}

function pushIOS(payload: WidgetPushPayload) {
  if (Platform.OS !== 'ios') return;
  const widget = getIosWidget();
  if (!widget) return; // not a development build with expo-widgets compiled in — nothing to push to
  try {
    widget.updateSnapshot(payload);
  } catch {
    // Widget extension not installed/available yet — never let this affect the app.
  }
}

function pushAndroid(payload: WidgetPushPayload) {
  if (Platform.OS !== 'android') return;
  try {
    // orinva-widget/ — local Expo module, see modules/orinva-widget.
    require('orinva-widget').updateWidgetData(JSON.stringify(payload));
  } catch {
    // Custom dev client without the local module compiled in, or any native
    // failure — a widget push must never be allowed to affect the app.
  }
}

/** The one function the rest of the app calls — computes and fans the snapshot out to whichever platform is running. */
export function syncWidgets(behaviors: Behavior[], events: UrgeEvent[], preferredFocusId: string | null, sensitiveVisible: boolean, now: Date = new Date()) {
  const home = computeWidgetSnapshot(behaviors, events, preferredFocusId, now);
  const lock = computeLockScreenSnapshot(home, sensitiveVisible);
  const payload: WidgetPushPayload = { home, lock };
  pushIOS(payload);
  pushAndroid(payload);
  return payload;
}
