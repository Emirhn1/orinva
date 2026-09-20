/**
 * Chip vocabularies — the "no typing required" layer (Plan §4).
 * Every free-text field in the app is backed by one of these sets; the free
 * text input is always the last, optional escape hatch.
 *
 * ids are stable keys (used for usage counting + ordering); labels are what
 * the user sees. Keep ids ASCII so they survive JSON round-trips cleanly.
 */

export interface ChipOption {
  id: string;
  label: string;
}

/** "Bu değişim sana ne kazandırsın?" — multi, max 3. */
export const WHY_CHIPS: ChipOption[] = [
  { id: 'sleep', label: 'Daha iyi uyumak' },
  { id: 'breath', label: 'Nefesim rahatlasın' },
  { id: 'money', label: 'Para biriktirmek' },
  { id: 'self_respect', label: 'Kendime saygım artsın' },
  { id: 'health', label: 'Sağlık / kondisyon' },
  { id: 'smell', label: 'Kokmamak' },
  { id: 'time', label: 'Zamanımı geri almak' },
  { id: 'focus', label: 'Odaklanmak' },
  { id: 'family', label: 'Ailem için' },
  { id: 'control', label: 'Kontrolü ben alayım' },
  { id: 'skin', label: 'Cildim / dişlerim' },
  { id: 'sport', label: 'Spor performansı' },
];

/** "Zor an geldiğinde ilk ne denemek istersin?" — single, editable. */
export const PLAN_CHIPS: ChipOption[] = [
  { id: 'water', label: 'Bir bardak su içeceğim' },
  { id: 'timer2', label: '2 dakika sayacı başlatacağım' },
  { id: 'breathe', label: 'Derin nefes egzersizi' },
  { id: 'walk', label: '5 dakika yürüyeceğim' },
  { id: 'shower', label: 'Duş alacağım / yüzümü yıkayacağım' },
  { id: 'message', label: 'Birine mesaj atacağım' },
  { id: 'gum', label: 'Şekersiz sakız' },
  { id: 'hands', label: 'Elimi meşgul edeceğim' },
  { id: 'reason', label: 'Nedenimi okuyacağım' },
  { id: 'music', label: 'Müzik açacağım' },
  { id: 'pushups', label: '10 şınav / squat' },
];

/** Tetikleyici — multi. */
export const TRIGGER_CHIPS: ChipOption[] = [
  { id: 'stress', label: 'Stres' },
  { id: 'boredom', label: 'Can sıkıntısı' },
  { id: 'after_meal', label: 'Yemek sonrası' },
  { id: 'coffee', label: 'Kahve / çay' },
  { id: 'social', label: 'Sosyal ortam' },
  { id: 'lonely', label: 'Yalnızlık' },
  { id: 'tired', label: 'Yorgunluk' },
  { id: 'argument', label: 'Tartışma' },
  { id: 'alcohol', label: 'Alkol' },
  { id: 'phone_in_hand', label: 'Telefonu elime aldım' },
  { id: 'habit', label: 'Otomatik / alışkanlık' },
  { id: 'celebration', label: 'Kutlama' },
  { id: 'sleepless', label: 'Uykusuzluk' },
  { id: 'commute', label: 'Trafik / yolda' },
];

/** Nerede — single. */
export const LOCATION_CHIPS: ChipOption[] = [
  { id: 'home', label: 'Ev' },
  { id: 'work', label: 'İş / okul' },
  { id: 'car', label: 'Araba' },
  { id: 'outside', label: 'Dışarı' },
  { id: 'bed', label: 'Yatak' },
  { id: 'balcony', label: 'Balkon' },
  { id: 'bathroom', label: 'Tuvalet' },
];

/** Kiminle — single, optional. */
export const COMPANY_CHIPS: ChipOption[] = [
  { id: 'alone', label: 'Yalnız' },
  { id: 'friends', label: 'Arkadaşlarla' },
  { id: 'family', label: 'Ailemle' },
  { id: 'coworkers', label: 'İş arkadaşlarıyla' },
];

/** Günlük etiketleri — single. */
export const JOURNAL_TAG_CHIPS: ChipOption[] = [
  { id: 'free', label: 'Serbest' },
  { id: 'morning_intent', label: 'Sabah niyeti' },
  { id: 'evening_review', label: 'Akşam değerlendirmesi' },
  { id: 'slip_review', label: 'Nüksetme analizi' },
  { id: 'win', label: 'Küçük başarı' },
];

/** Check-in soruları ve her biri için hazır cevap çipleri. */
export interface CheckInPrompt {
  question: string;
  chips: ChipOption[];
}

export const CHECKIN_PROMPTS: CheckInPrompt[] = [
  {
    question: 'Bugün seni en çok ne zorladı?',
    chips: [
      { id: 'stress', label: 'Stres' },
      { id: 'boredom', label: 'Can sıkıntısı' },
      { id: 'tired', label: 'Yorgunluk' },
      { id: 'social', label: 'Sosyal ortam' },
      { id: 'urges', label: 'Dürtüler' },
      { id: 'nothing', label: 'Pek bir şey' },
    ],
  },
  {
    question: 'Bugün kendin için yaptığın küçük şey neydi?',
    chips: [
      { id: 'rest', label: 'Dinlendim' },
      { id: 'moved', label: 'Hareket ettim' },
      { id: 'ate_well', label: 'İyi beslendim' },
      { id: 'said_no', label: 'Hayır dedim' },
      { id: 'reached_out', label: 'Biriyle konuştum' },
      { id: 'logged', label: 'Kaydettim' },
    ],
  },
  {
    question: 'Şu an gereğinden fazla hangi düşünceyi taşıyorsun?',
    chips: [
      { id: 'guilt', label: 'Suçluluk' },
      { id: 'worry', label: 'Endişe' },
      { id: 'comparison', label: 'Kıyaslama' },
      { id: 'tomorrow', label: 'Yarın kaygısı' },
      { id: 'none', label: 'Hafifim' },
    ],
  },
  {
    question: 'Bugün hangi küçük başarıyı görmezden geldin?',
    chips: [
      { id: 'passed_urge', label: 'Bir dürtüyü geçirdim' },
      { id: 'less', label: 'Normalden az yaptım' },
      { id: 'delayed', label: 'Erteledim' },
      { id: 'no_judgement', label: 'Kaydettim, yargılamadım' },
      { id: 'noticed', label: 'Bugün fark ettim' },
      { id: 'tried_plan', label: 'Planımı denedim' },
    ],
  },
];

export const MOOD_CHIPS: ChipOption[] = [
  { id: 'very_tense', label: 'Çok gergin' },
  { id: 'tense', label: 'Gergin' },
  { id: 'neutral', label: 'Nötr' },
  { id: 'calm', label: 'Sakin' },
  { id: 'very_calm', label: 'Çok sakin' },
];
export const MOOD_UNSURE: ChipOption = { id: 'unsure', label: 'Emin değilim' };

export function chipLabel(set: ChipOption[], id: string | null | undefined): string | null {
  if (!id) return null;
  return set.find((c) => c.id === id)?.label ?? id;
}
