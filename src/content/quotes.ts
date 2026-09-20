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
  science: 'Dürtüler nasıl çalışır — küçük bilgiler.',
  health: 'Temiz süreye göre vücudunda neler değişiyor.',
  own: 'Nedenlerin ve kendi notların — en güçlüsü.',
  lyrics: 'Sana iyi gelen dizeleri kendin ekle; telifli içerik dağıtmıyoruz.',
};

export const BUILTIN_QUOTES: Quote[] = [
  // --- Özlü söz -----------------------------------------------------------
  { id: 'a1', category: 'aphorism', text: 'Bugün küçük bir karar yeter.' },
  { id: 'a2', category: 'aphorism', text: 'Dalga yükselir, zirve yapar, geçer. Sen kalırsın.' },
  { id: 'a3', category: 'aphorism', text: 'İstemek bir olaydır, yapmak bir seçim.' },
  { id: 'a4', category: 'aphorism', text: 'Her kayıt bir cümledir; yargı değil.' },
  { id: 'a5', category: 'aphorism', text: 'Mükemmel gün diye bir şey yok. Fark edilen an var.' },
  { id: 'a6', category: 'aphorism', text: 'Geri dönmek, bırakmanın bir parçasıdır.' },
  { id: 'a7', category: 'aphorism', text: 'Bir nefes, sonra karar.' },
  { id: 'a8', category: 'aphorism', text: 'Zor an, kısa an.' },
  { id: 'a9', category: 'aphorism', text: 'Neyi bıraktığından çok, neye yer açtığına bak.' },
  { id: 'a10', category: 'aphorism', text: 'Şimdi değil, demek de bir cevaptır.' },
  { id: 'a11', category: 'aphorism', text: 'Kendine karşı dürüst olmak, en sessiz güçtür.' },
  { id: 'a12', category: 'aphorism', text: 'Otomatik pilot kapanınca yol görünür.' },

  // --- Motivasyon ---------------------------------------------------------
  { id: 'm1', category: 'motivation', text: 'Bugünün hedefi mükemmel olmak değil; zor bir anda bir karar daha fazla fark etmek.' },
  { id: 'm2', category: 'motivation', text: 'Planın cebinde. Gerisini kendine kolay geçir.' },
  { id: 'm3', category: 'motivation', text: 'Dün nasıl geçtiyse geçti. Bugün yeni bir kayıt.' },
  { id: 'm4', category: 'motivation', text: 'Sadece bu akşamı geçir. Yarını yarın konuşuruz.' },
  { id: 'm5', category: 'motivation', text: 'Direnmek her seferinde biraz daha ucuzlar. Sen fark etmesen de.' },
  { id: 'm6', category: 'motivation', text: 'Bir dürtüyü geçirmek, görünmeyen bir kas çalıştırmaktır.' },
  { id: 'm7', category: 'motivation', text: 'Kaydettiğin her an, gelecekteki sana bir harita.' },
  { id: 'm8', category: 'motivation', text: 'Bugün kimseye kanıtlamak zorunda değilsin. Sadece kendine dürüst ol.' },
  { id: 'm9', category: 'motivation', text: 'Küçük ara, büyük fark.' },
  { id: 'm10', category: 'motivation', text: 'Zorlandığın gün, geri gittiğin gün değildir.' },

  // --- Sakinleştirici / farkındalık ---------------------------------------
  { id: 'c1', category: 'calm', text: 'Ayaklarını hisset. Nefesini say. Dört saniye al, dört saniye ver.' },
  { id: 'c2', category: 'calm', text: 'Düşünce bir buluttur. Gökyüzü sensin.' },
  { id: 'c3', category: 'calm', text: 'Şu an güvendesin. Bu his geçecek; sen kalacaksın.' },
  { id: 'c4', category: 'calm', text: 'Omuzlarını bırak. Çeneni gevşet. Bir kez daha nefes.' },
  { id: 'c5', category: 'calm', text: 'İstemek, yapmak zorunda olmak değildir. Sadece izle.' },
  { id: 'c6', category: 'calm', text: 'Etrafında beş şey say. Gördüğün, duyduğun, dokunduğun.' },
  { id: 'c7', category: 'calm', text: 'Hiçbir şey yapmadan geçen bir dakika da bir seçimdir.' },
  { id: 'c8', category: 'calm', text: 'Bu an, önceki anlardan farklı. Sen de farklısın.' },
  { id: 'c9', category: 'calm', text: 'Bedenin ne diyor? Sadece dinle, cevap verme.' },
  { id: 'c10', category: 'calm', text: 'Yavaşla. Aceleyi dürtü ister, sen değil.' },

  // --- Bilimsel mikro bilgi ------------------------------------------------
  { id: 's1', category: 'science', text: 'Dürtüler çoğunlukla 3–5 dakikada zirve yapar ve söner. Zirveyi bekleyebilirsin.' },
  { id: 's2', category: 'science', text: 'Alışkanlıklar ipucu → rutin → ödül döngüsüyle çalışır. İpucunu fark etmek döngüyü gevşetir.' },
  { id: 's3', category: 'science', text: '"Eğer X olursa, o zaman Y yapacağım" planları, niyetin gerçekleşme olasılığını belirgin biçimde artırır.' },
  { id: 's4', category: 'science', text: 'Beyin kaçınılan davranışa değil, yerine konan davranışa daha kolay bağlanır.' },
  { id: 's5', category: 'science', text: 'Uykusuzluk, dürtü kontrolünü zayıflatır. Zor gecelerde bu senin zayıflığın değil, biyoloji.' },
  { id: 's6', category: 'science', text: 'Stres, alışkanlık devrelerini öne çıkarır. Stresi fark etmek bile bir müdahaledir.' },
  { id: 's7', category: 'science', text: 'Değişim doğrusal ilerlemez. Birden çok deneme, sürecin normal parçasıdır.' },
  { id: 's8', category: 'science', text: 'Kayıt tutmak, davranışı görünür kılar; görünür olan davranış daha kolay değişir.' },
  { id: 's9', category: 'science', text: 'Küçük bir gecikme bile otomatik davranışı bilinçli bir karara çevirir.' },
  { id: 's10', category: 'science', text: 'Dikkat, kısa bir yürüyüş ya da su gibi basit ortam değişimleriyle bile yenilenir.' },

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
