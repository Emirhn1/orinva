/**
 * Günün sözü kütüphanesi (Plan §5.1).
 *
 * All built-in text is original editorial copy written for ORINVA — no
 * copyrighted lyrics or attributed quotations are bundled. The "lyrics"
 * category exists only as a user-added collection ("Kendi şarkı sözlerini
 * ekle"), which keeps the product clean for a commercial release.
 *
 * Tone rules (Plan §2): no blame, no "streak", no superlatives, adult voice.
 */

export type QuoteCategory = 'aphorism' | 'motivation' | 'calm' | 'science' | 'health' | 'own' | 'lyrics';

export interface Quote {
  id: string;
  category: QuoteCategory;
  text: string;
  author?: string;
  /** Only for `health`: minimum clean hours before this becomes relevant. */
  minCleanHours?: number;
  /** Only for `health`: which template it's about. */
  behaviorCategory?: 'nicotine' | 'social_media';
}

export const QUOTE_CATEGORY_LABEL: Record<QuoteCategory, string> = {
  aphorism: 'Özlü söz',
  motivation: 'Motivasyon',
  calm: 'Sakinleştirici',
  science: 'Bilimsel mikro bilgi',
  health: 'Sağlık kilometre taşları',
  own: 'Kendi yazdıklarım',
  lyrics: 'Kendi şarkı sözlerim',
};

export const QUOTE_CATEGORY_HINT: Record<QuoteCategory, string> = {
  aphorism: 'Kısa, sakin cümleler.',
  motivation: 'Bugün için tek bir hatırlatma.',
  calm: 'Nefes, duraklama, farkındalık.',
  science: 'İstekler nasıl çalışır — küçük bilgiler.',
  health: 'Temiz süreye göre vücudunda neler değişiyor.',
  own: 'Nedenlerin ve kendi notların — en güçlüsü.',
  lyrics: 'Sana iyi gelen dizeleri kendin ekle; telifli içerik dağıtmıyoruz.',
};

export const BUILTIN_QUOTES: Quote[] = [
  // --- Özlü söz / motivasyon / sakinleştirici / bilim ------------------------
  // Kullanıcının kendi listesiyle doldurulacak; şimdilik boş.

  // --- Sağlık kilometre taşları (nikotin) — temiz süreye bağlı --------------
  { id: 'h1', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 0.33, text: '20 dakika: nabız ve tansiyon normale dönmeye başlar.' },
  { id: 'h2', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 8, text: '8 saat: kandaki karbonmonoksit seviyesi düşer.' },
  { id: 'h3', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 24, text: '24 saat: kalp krizi riski azalmaya başlar.' },
  { id: 'h4', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 48, text: '48 saat: tat ve koku duyun geri dönmeye başlıyor.' },
  { id: 'h5', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 72, text: '3 gün: nikotin vücuttan büyük ölçüde atılmış olur. Nefes almak kolaylaşır.' },
  { id: 'h6', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 24 * 14, text: '2 hafta: dolaşım düzelir, yürümek daha kolay gelir.' },
  { id: 'h7', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 24 * 30, text: '1 ay: akciğer fonksiyonlarında iyileşme fark edilebilir.' },
  { id: 'h8', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 24 * 90, text: '3 ay: öksürük ve nefes darlığı belirgin şekilde azalır.' },
  { id: 'h9', category: 'health', behaviorCategory: 'nicotine', minCleanHours: 24 * 365, text: '1 yıl: kalp hastalığı riski, içmeye devam edene göre yarıya iner.' },
  // Telefon / sosyal medya karşılıkları
  { id: 'h10', category: 'health', behaviorCategory: 'social_media', minCleanHours: 24, text: '1 gün: dikkat süren toparlanmaya başlar; tek bir işe daha uzun kalabilirsin.' },
  { id: 'h11', category: 'health', behaviorCategory: 'social_media', minCleanHours: 72, text: '3 gün: gece ekrandan uzak kalınca uykuya dalma süresi kısalır.' },
  { id: 'h12', category: 'health', behaviorCategory: 'social_media', minCleanHours: 24 * 7, text: '1 hafta: can sıkıntısına tahammül artar; boş anlar daha az rahatsız eder.' },
  { id: 'h13', category: 'health', behaviorCategory: 'social_media', minCleanHours: 24 * 30, text: '1 ay: kıyaslama döngüsü zayıflar; kendi hızınla ilerlemek normalleşir.' },
];

export const HEALTH_TIMELINE = BUILTIN_QUOTES.filter((q) => q.category === 'health');

export function builtinQuote(id: string): Quote | undefined {
  return BUILTIN_QUOTES.find((q) => q.id === id);
}
