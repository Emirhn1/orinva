import { db } from '@/data/db';
import { AppSettings, DEFAULT_SETTINGS } from '@/data/types';

export const settingsRepo = {
  load(): AppSettings {
    const rows = db.getAllSync('SELECT key, value FROM kv_settings;') as { key: string; value: string }[];
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      themePreference: (map.get('themePreference') as AppSettings['themePreference']) ?? DEFAULT_SETTINGS.themePreference,
      notificationsEnabled: map.get('notificationsEnabled') === '1',
      appLockEnabled: map.get('appLockEnabled') === '1',
      streakRingEnabled: map.get('streakRingEnabled') !== '0',
      onboardingCompleted: map.get('onboardingCompleted') === '1',
    };
  },

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    const raw = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    db.runSync('INSERT OR REPLACE INTO kv_settings (key, value) VALUES (?, ?);', [key, raw]);
  },
};
