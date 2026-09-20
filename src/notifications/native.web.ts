import { PlannedNotification } from './planner';

/**
 * Web stand-in for native.ts. expo-notifications has no web implementation
 * (and doesn't even bundle cleanly there), so the browser preview gets these
 * inert functions with the same signatures.
 */

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

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export interface ResponsePayload {
  action: 'open' | typeof ACTION_FAVORITE | typeof ACTION_HIDE;
  data: NotificationData;
}

export async function configureNotifications(): Promise<void> {}
export async function getPermissionState(): Promise<PermissionState> {
  return 'unsupported';
}
export async function requestPermission(): Promise<PermissionState> {
  return 'unsupported';
}
export async function replaceScheduled(_plan: PlannedNotification[]): Promise<number> {
  return 0;
}
export async function cancelAll(): Promise<void> {}
export async function sendTest(_body: string): Promise<boolean> {
  return false;
}
export function subscribeResponses(_handler: (p: ResponsePayload) => void): () => void {
  return () => {};
}
