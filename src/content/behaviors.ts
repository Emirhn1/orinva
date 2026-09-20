import { BehaviorCategory, GoalMode } from '@/data/types';
import { IconName } from '@/icons';

export const BEHAVIOR_TEMPLATES: { id: BehaviorCategory; title: string; description: string; icon: IconName; nicknameHint: string }[] = [
  { id: 'nicotine', title: 'Sigara / Nikotin', description: 'Net olay, sık dürtü, somut ilerleme', icon: 'zap', nicknameHint: 'Örn. Sabah sigarası, Mola sigarası' },
  { id: 'social_media', title: 'Telefon / Sosyal medya', description: 'Otomatik pilotu kırmak', icon: 'grid', nicknameHint: 'Örn. Instagram akşam, Yatakta TikTok' },
  { id: 'custom', title: 'Kendi davranışım', description: 'Tekrar eden, senin tanımladığın bir davranış', icon: 'edit-3', nicknameHint: 'Örn. Gece eski fotoğraflara bakmak' },
];

export const GOAL_LABEL: Record<GoalMode, string> = { quit: 'Bırak', reduce: 'Azalt', delay: 'Geciktir', notice: 'Fark et' };

export function unitWordFor(category: BehaviorCategory | null): string {
  return category === 'nicotine' ? 'sigara' : category === 'social_media' ? 'oturum' : 'kez';
}
