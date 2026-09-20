/** Local-calendar day key (yyyy-mm-dd) — uses the device timezone, not UTC. */
export function todayKey(date: Date = new Date()): string {
  return dayKey(date);
}

export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDayHeading(key: string): string {
  const today = todayKey();
  if (key === today) return 'Bugün';
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (key === dayKey(y)) return 'Dün';
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function timeOfDayGreeting(date: Date = new Date()): 'morning' | 'day' | 'evening' | 'night' {
  const h = date.getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 19) return 'day';
  return 'evening';
}

/**
 * H7 — the single duration formatter. Everything that shows a clean-time
 * duration goes through here so "0 gün temiz · 0 sa 22 dk" vs "0 gün 0 sa temiz"
 * can't drift apart again.
 *
 * `short`: "3 gün 4 sa" / "4 sa 12 dk" / "12 dk"
 * `long`:  "3 gün 4 sa temiz"
 */
export function formatDuration(totalMinutes: number, style: 'short' | 'long' = 'short'): string {
  const m = Math.max(0, Math.floor(totalMinutes));
  const days = Math.floor(m / 1440);
  const hours = Math.floor((m % 1440) / 60);
  const minutes = m % 60;

  let text: string;
  if (days > 0) text = hours > 0 ? `${days} gün ${hours} sa` : `${days} gün`;
  else if (hours > 0) text = minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
  else text = `${minutes} dk`;

  return style === 'long' ? `${text} temiz` : text;
}

export function formatCleanTime(cleanSinceAt: string, style: 'short' | 'long' = 'long', now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - new Date(cleanSinceAt).getTime());
  return formatDuration(ms / 60000, style);
}

/** Countdown-style: "18 sa 42 dk kaldı" / "12 dk kaldı" */
export function formatRemaining(totalMinutes: number): string {
  return `${formatDuration(totalMinutes, 'short')} kaldı`;
}

export function formatMinutesHuman(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h < 24) return rest ? `${h} sa ${rest} dk` : `${h} sa`;
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return hr ? `${d} gün ${hr} sa` : `${d} gün`;
}

export function formatMoney(amount: number, currency = '₺'): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('tr-TR')} ${currency}`;
}
