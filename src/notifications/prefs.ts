import { QuoteCategory } from '@/content/quotes';

/** Plan §5.2 — every notification type shares one pipeline and one budget. */
export type NotificationKind =
  | 'quote'
  | 'milestone'
  | 'riskHour'
  | 'gentleReturn'
  | 'weekly'
  | 'postSlip'
  | 'earnings'
  | 'insight'
  | 'health';

export const KIND_LABEL: Record<NotificationKind, { title: string; hint: string }> = {
  quote: { title: 'Günün sözü', hint: 'Seçtiğin saatlerde kısa bir söz' },
  milestone: { title: 'Kilometre taşı', hint: '24 saat, 3 gün, 1 hafta…' },
  riskHour: { title: 'Riskli saat', hint: 'Öğrenilen zorlu saatten 20 dk önce destek' },
  gentleReturn: { title: 'Nazik geri dönüş', hint: '3 gün kayıt yoksa tek bir hatırlatma' },
  weekly: { title: 'Haftalık özet', hint: 'Pazar akşamı, bu haftanın kısa özeti' },
  postSlip: { title: 'Nüksetme sonrası', hint: '"Yaptım"dan 1 saat sonra tek cümle' },
  earnings: { title: 'Kazanç', hint: 'Haftada bir geri kazandıkların' },
  insight: { title: 'İçgörü', hint: 'Yeni bir örüntü bulununca' },
  health: { title: 'Sağlık', hint: 'Temiz süreye bağlı fizyolojik değişimler' },
};

export interface NotificationPrefs {
  enabled: boolean;
  kinds: Record<NotificationKind, boolean>;
  categories: Record<Exclude<QuoteCategory, 'lyrics'> | 'lyrics', boolean>;
  /** "HH:MM" local times for the quote of the day; max 5. */
  times: string[];
  /** Quiet window (local, may wrap midnight). */
  quietFrom: string;
  quietTo: string;
  /** Hard budget (Plan §5.2): max per day / min spacing in minutes. Not user-editable. */
  maxPerDay: number;
  minGapMinutes: number;
}

export const PRESET_TIMES = ['08:00', '13:00', '20:00', '23:00'];
export const MAX_TIMES = 5;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  kinds: {
    quote: true,
    milestone: true,
    riskHour: true,
    gentleReturn: true,
    weekly: true,
    postSlip: true,
    earnings: true,
    insight: true,
    health: true,
  },
  categories: {
    aphorism: true,
    motivation: true,
    calm: true,
    science: true,
    health: true,
    own: true,
    lyrics: true,
  },
  times: ['08:00', '20:00'],
  quietFrom: '00:00',
  quietTo: '07:30',
  maxPerDay: 4,
  minGapMinutes: 90,
};

export function parseHHMM(s: string): { h: number; m: number } {
  const [h, m] = s.split(':').map((x) => Number(x));
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

export function toHHMM(h: number, m = 0): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Is a local time inside the quiet window? Handles windows that wrap midnight. */
export function inQuietHours(date: Date, prefs: NotificationPrefs): boolean {
  const from = parseHHMM(prefs.quietFrom);
  const to = parseHHMM(prefs.quietTo);
  const t = date.getHours() * 60 + date.getMinutes();
  const a = from.h * 60 + from.m;
  const b = to.h * 60 + to.m;
  if (a === b) return false;
  return a < b ? t >= a && t < b : t >= a || t < b;
}

/** Merge stored prefs with defaults so new keys never come back undefined. */
export function normalizePrefs(raw: Partial<NotificationPrefs> | null | undefined): NotificationPrefs {
  const d = DEFAULT_NOTIFICATION_PREFS;
  return {
    ...d,
    ...(raw ?? {}),
    kinds: { ...d.kinds, ...(raw?.kinds ?? {}) },
    categories: { ...d.categories, ...(raw?.categories ?? {}) },
    times: (raw?.times ?? d.times).slice(0, MAX_TIMES),
    maxPerDay: d.maxPerDay,
    minGapMinutes: d.minGapMinutes,
  };
}
