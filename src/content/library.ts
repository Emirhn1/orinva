import { BehaviorCategory } from '@/data/types';

export interface ContentItem {
  id: string;
  kind: 'practical' | 'reflection' | 'expert';
  timeOfDay?: 'morning' | 'evening' | 'any';
  category?: BehaviorCategory | 'general';
  text: string;
}

/**
 * MVP editorial library — human-written, static, bundled with the app.
 * No AI generation here (product policy). Rotated deterministically by day-of-year
 * so content doesn't repeat back-to-back without needing a server.
 */
export const CONTENT_LIBRARY: ContentItem[] = [
  { id: 'm1', kind: 'practical', timeOfDay: 'morning', category: 'general', text: 'Bugünün hedefi mükemmel olmak değil; zor bir anda bir karar daha fazla fark etmek.' },
  { id: 'm2', kind: 'practical', timeOfDay: 'morning', category: 'general', text: 'Bugün için tek bir küçük planın var. Onu görünür tut, gerisini kendine kolay geçir.' },
  { id: 'm3', kind: 'practical', timeOfDay: 'morning', category: 'nicotine', text: 'İlk zor an genelde beklediğin zaman gelmez. Planın cebinde olsun, o yeter.' },
  { id: 'm4', kind: 'practical', timeOfDay: 'morning', category: 'social_media', text: 'Telefona ilk uzandığın an, bugünün en ucuz karar anı. Bir nefes, sonra karar.' },
  { id: 'e1', kind: 'reflection', timeOfDay: 'evening', category: 'general', text: 'Bazı günler ilerlemek, daha hızlı gitmek değildir; kendini daha doğru duymaktır.' },
  { id: 'e2', kind: 'reflection', timeOfDay: 'evening', category: 'general', text: 'Bugün fark ettiğin ama küçük bulduğun bir anı var mı? Genelde en değerlisi odur.' },
  { id: 'e3', kind: 'reflection', timeOfDay: 'evening', category: 'general', text: 'Yarın için büyük bir söz vermene gerek yok. Tek bir karar yeter.' },
  { id: 'x1', kind: 'expert', category: 'nicotine', text: 'Tekrarlayan destek ve zaman içinde birden çok deneme, bırakma sürecinde normaldir — tek bir an tüm süreci tanımlamaz.' },
  { id: 'x2', kind: 'expert', category: 'general', text: 'Değişim doğrusal ilerlemez. Zorlandığın bir gün, geri gittiğin anlamına gelmez.' },
  { id: 'x3', kind: 'expert', category: 'social_media', text: 'Otomatik pilotu kırmak genelde tam yasaktan değil, karar anına küçük, niyetli bir duraklama koymaktan geçer.' },
];

export function dailyContentFor(category: BehaviorCategory | 'general', timeOfDay: 'morning' | 'evening'): ContentItem {
  const pool = CONTENT_LIBRARY.filter(
    (c) => c.timeOfDay === timeOfDay && (c.category === category || c.category === 'general')
  );
  const source = pool.length > 0 ? pool : CONTENT_LIBRARY.filter((c) => c.timeOfDay === timeOfDay);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return source[dayOfYear % source.length];
}

export const DAILY_QUESTIONS = [
  'Bugün seni en çok ne zorladı?',
  'Bugün kendin için yaptığın küçük şey neydi?',
  'Şu an gereğinden fazla hangi düşünceyi taşıyorsun?',
  'Bugün hangi küçük başarıyı görmezden geldin?',
];

export function questionForDate(date: Date = new Date()): string {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
}

export interface MicroPlanOption {
  id: string;
  label: string;
  description: string;
  icon: 'clock' | 'wind' | 'droplet' | 'feather' | 'message-circle' | 'edit-3';
}

export const MICRO_PLAN_OPTIONS: MicroPlanOption[] = [
  { id: 'delay', label: '10 dakika ertele', description: 'Şimdi karar verme; 10 dakika sonra tekrar sor.', icon: 'clock' },
  { id: 'breathe', label: 'Nefes al', description: '4 yavaş nefes, sakin bir tempoda.', icon: 'wind' },
  { id: 'water', label: 'Su iç / yürü', description: 'Ortamını kısa süreliğine değiştir.', icon: 'droplet' },
  { id: 'reason', label: 'Nedenimi gör', description: 'Kendi yazdığın nedeni oku.', icon: 'feather' },
  { id: 'write', label: 'Kısaca yaz', description: 'Şu an ne olduğunu bir cümleyle not et.', icon: 'edit-3' },
  { id: 'reach', label: 'Birine ulaş', description: 'Güvendiğin biriyle konuş ya da mesaj at.', icon: 'message-circle' },
];

/** Every `UrgeEvent.helpedByPlan` value that can be recorded, human-labeled — used to explain "which tool helped" stats. */
export const PLAN_LABELS: Record<string, string> = {
  wave: 'Dalgayı izle',
  delay: 'Ertele',
  own: 'Kendi planım',
  ...Object.fromEntries(MICRO_PLAN_OPTIONS.map((o) => [o.id, o.label])),
};

export function planLabel(id: string): string {
  return PLAN_LABELS[id] ?? id;
}

export const HEALTH_TIMELINE_NICOTINE = [
  { hours: 0.33, label: '20 dakika', text: 'Nabız ve tansiyon normale dönmeye başlar.' },
  { hours: 8, label: '8 saat', text: 'Kandaki karbonmonoksit seviyesi düşer.' },
  { hours: 24, label: '24 saat', text: 'Kalp krizi riski azalmaya başlar.' },
  { hours: 72, label: '3 gün', text: 'Nikotin vücuttan büyük ölçüde atılmış olur.' },
  { hours: 24 * 30, label: '1 ay', text: 'Akciğer fonksiyonlarında iyileşme fark edilebilir.' },
];
