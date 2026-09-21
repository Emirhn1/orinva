import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type * as NotificationsNS from 'expo-notifications';
import { PlannedNotification } from './planner';
import { NOTIFICATIONS_ENABLED } from './config';

/**
 * Thin wrapper over expo-notifications (iOS/Android). The web build gets
 * `native.web.ts` — same exports, all no-ops — so nothing else in the app
 * has to branch on platform. Expo Go cannot safely load this module on
 * Android, so it receives the same no-op behavior as the web preview.
 */
type N = typeof NotificationsNS;

// Do not statically import expo-notifications: recent Expo Go Android clients
// throw while evaluating the module. Development and production builds keep the
// full native implementation.
const isExpoGo = Constants.appOwnership === 'expo';
const Notifications: N | null = NOTIFICATIONS_ENABLED && !isExpoGo ? require('expo-notifications') : null;

function api(): N | null {
  return Notifications;
}

export const CHANNEL_ID = 'orinva-gentle';
export const QUOTE_CATEGORY = 'orinva-quote';
export const ACTION_FAVORITE = 'favorite';
export const ACTION_HIDE = 'hide';

export interface NotificationData {
  kind: string;
  route: string;
  quoteId?: string;
  behaviorId?: string;
  key: string;
}

let configured = false;

/** Handler + Android channel + iOS/Android action category. Safe to call repeatedly. */
export async function configureNotifications(): Promise<void> {
  const N = api();
  if (!N || configured) return;
  configured = true;

  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'ORINVA',
      description: 'Günün sözü, kilometre taşları ve nazik hatırlatmalar',
      importance: N.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 120],
      lightColor: '#4E5FB8',
      sound: null,
    }).catch(() => {});
  }

  await N.setNotificationCategoryAsync(QUOTE_CATEGORY, [
    { identifier: ACTION_FAVORITE, buttonTitle: 'Favorilere kaydet', options: { opensAppToForeground: true } },
    { identifier: ACTION_HIDE, buttonTitle: 'Bir daha gösterme', options: { opensAppToForeground: true } },
  ]).catch(() => {});
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPermissionState(): Promise<PermissionState> {
  const N = api();
  if (!N) return 'unsupported';
  try {
    const p = await N.getPermissionsAsync();
    if (p.granted || p.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) return 'granted';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function requestPermission(): Promise<PermissionState> {
  const N = api();
  if (!N) return 'unsupported';
  try {
    await configureNotifications();
    const p = await N.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: false } });
    if (p.granted) return 'granted';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function replaceScheduled(plan: PlannedNotification[]): Promise<number> {
  const N = api();
  if (!N) return 0;
  await N.cancelAllScheduledNotificationsAsync().catch(() => {});
  let count = 0;
  for (const p of plan) {
    const data: NotificationData = { kind: p.kind, route: p.route, quoteId: p.quoteId, behaviorId: p.behaviorId, key: p.key };
    try {
      await N.scheduleNotificationAsync({
        content: {
          title: p.title,
          body: p.body,
          data: data as unknown as Record<string, unknown>,
          categoryIdentifier: p.kind === 'quote' ? QUOTE_CATEGORY : undefined,
          sound: false,
        },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: p.at, channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined },
      });
      count += 1;
    } catch {
      // A single failed slot shouldn't abort the whole plan.
    }
  }
  return count;
}

export async function cancelAll(): Promise<void> {
  const N = api();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync().catch(() => {});
}

/** Fire a one-off local notification in ~2 seconds — used by the settings "test" button. */
export async function sendTest(body: string): Promise<boolean> {
  const N = api();
  if (!N) return false;
  try {
    await N.scheduleNotificationAsync({
      content: { title: 'ORINVA', body, sound: false, data: { kind: 'test', route: 'today', key: 'test' } },
      trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined },
    });
    return true;
  } catch {
    return false;
  }
}

export interface ResponsePayload {
  action: 'open' | typeof ACTION_FAVORITE | typeof ACTION_HIDE;
  data: NotificationData;
}

function toPayload(N: N, response: NotificationsNS.NotificationResponse): ResponsePayload | null {
  const data = response.notification.request.content.data as unknown as NotificationData | undefined;
  if (!data || !data.kind) return null;
  const id = response.actionIdentifier;
  const action = id === ACTION_FAVORITE ? ACTION_FAVORITE : id === ACTION_HIDE ? ACTION_HIDE : 'open';
  return { action, data };
}

/** Subscribes to taps/actions and also replays the response that launched the app (cold start). */
const handled = new Set<string>();

export function subscribeResponses(handler: (p: ResponsePayload) => void): () => void {
  const N = api();
  if (!N) return () => {};
  const dispatch = (r: NotificationsNS.NotificationResponse) => {
    // The same response can arrive via the listener and via getLastNotificationResponseAsync.
    const id = `${r.notification.request.identifier}:${r.actionIdentifier}`;
    if (handled.has(id)) return;
    handled.add(id);
    const p = toPayload(N, r);
    if (p) handler(p);
  };
  const sub = N.addNotificationResponseReceivedListener(dispatch);
  N.getLastNotificationResponseAsync()
    .then((r) => {
      if (r) dispatch(r);
    })
    .catch(() => {});
  return () => sub.remove();
}
