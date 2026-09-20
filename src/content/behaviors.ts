import { BehaviorCategory, BehaviorColor, GoalMode } from '@/data/types';
import { IconName } from '@/icons';

export const BEHAVIOR_TEMPLATES: { id: BehaviorCategory; title: string; description: string; icon: IconName; nicknameHint: string }[] = [
  { id: 'nicotine', title: 'Sigara / Nikotin', description: 'Net olay, sık istek, somut ilerleme', icon: 'zap', nicknameHint: 'Örn. Sabah sigarası, Mola sigarası' },
  { id: 'social_media', title: 'Telefon / Sosyal medya', description: 'Otomatik pilotu kırmak', icon: 'grid', nicknameHint: 'Örn. Instagram akşam, Yatakta TikTok' },
  { id: 'sugar', title: 'Şeker / abur cubur', description: 'Yeme isteğini ve seçimlerini fark etmek', icon: 'heart', nicknameHint: 'Örn. Akşam tatlısı, Ofis atıştırması' },
  { id: 'alcohol', title: 'Alkol', description: 'İçme anlarını yargısız izlemek', icon: 'droplet', nicknameHint: 'Örn. Hafta sonu içkisi' },
  { id: 'gambling', title: 'Kumar / bahis', description: 'Oynama isteğiyle araya mesafe koymak', icon: 'dollar-sign', nicknameHint: 'Örn. Maç bahisleri' },
  { id: 'caffeine', title: 'Kafein', description: 'Kahve ve enerji içeceği düzenini izlemek', icon: 'coffee', nicknameHint: 'Örn. Öğleden sonra kahvesi' },
  { id: 'gaming', title: 'Oyun', description: 'Oyun süresini ve başlama anını fark etmek', icon: 'monitor', nicknameHint: 'Örn. Gece oyunları' },
  { id: 'custom', title: 'Kendi davranışım', description: 'Tekrar eden, senin tanımladığın bir davranış', icon: 'edit-3', nicknameHint: 'Örn. Gece eski fotoğraflara bakmak' },
];

export const GOAL_LABEL: Record<GoalMode, string> = { quit: 'Bırak', reduce: 'Azalt', delay: 'Geciktir', notice: 'Fark et' };

export function unitWordFor(category: BehaviorCategory | null): string {
  if (category === 'nicotine') return 'sigara';
  if (category === 'social_media' || category === 'gaming') return 'oturum';
  if (category === 'sugar') return 'atıştırma';
  if (category === 'alcohol' || category === 'caffeine') return 'içecek';
  return 'kez';
}

export interface BehaviorVerbs {
  urge: string;
  resist: string;
  did: string;
}

export function behaviorVerbsFor(category: BehaviorCategory | null): BehaviorVerbs {
  switch (category) {
    case 'social_media':
      return { urge: 'Elim gitti', resist: 'Direndim', did: 'Girdim' };
    case 'sugar':
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'Yedim' };
    case 'alcohol':
    case 'caffeine':
    case 'nicotine':
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'İçtim' };
    case 'gambling':
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'Oynadım' };
    case 'gaming':
      return { urge: 'Elim gitti', resist: 'Direndim', did: 'Oynadım' };
    default:
      return { urge: 'Canım çekti', resist: 'Direndim', did: 'Yaptım' };
  }
}

export function behaviorTypeLabel(category: BehaviorCategory): string {
  return BEHAVIOR_TEMPLATES.find((template) => template.id === category)?.title ?? 'Davranış';
}

export const BEHAVIOR_COLORS: BehaviorColor[] = ['indigo', 'navy', 'success', 'amber', 'violet', 'slateBlue', 'cyan', 'bronze'];

export function behaviorAppearanceFor(category: BehaviorCategory | null): { color: BehaviorColor; icon: IconName } {
  const template = BEHAVIOR_TEMPLATES.find((item) => item.id === category);
  const colorByCategory: Partial<Record<BehaviorCategory, BehaviorColor>> = {
    nicotine: 'amber', social_media: 'indigo', sugar: 'violet', alcohol: 'slateBlue',
    gambling: 'bronze', caffeine: 'navy', gaming: 'cyan', custom: 'success',
  };
  return { color: category ? colorByCategory[category] ?? 'indigo' : 'indigo', icon: template?.icon ?? 'edit-3' };
}
