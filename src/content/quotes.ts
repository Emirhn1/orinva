export type QuoteCategory = 'aphorism' | 'motivation' | 'calm' | 'science' | 'health' | 'own' | 'lyrics';
export type QuoteContentType = 'quote' | 'lyric' | 'story' | 'health' | 'user';

export interface Quote {
  id: string;
  category: QuoteCategory;
  contentType?: QuoteContentType;
  title?: string;
  text: string;
  author?: string;
  sourceUrl?: string;
  notificationEligible?: boolean;
  minCleanHours?: number;
  behaviorCategory?: 'nicotine' | 'social_media';
}

export const QUOTE_CATEGORY_LABEL: Record<QuoteCategory, string> = {
  aphorism: 'Söz', motivation: 'Motivasyon', calm: 'Hikâye', science: 'Bilimsel mikro bilgi',
  health: 'Sağlık kilometre taşları', own: 'Kendi yazdıklarım', lyrics: 'Şarkı satırı',
};

export const QUOTE_CATEGORY_HINT: Record<QuoteCategory, string> = {
  aphorism: 'Hayat, yol ve insan üzerine seçkiler.', motivation: 'Bugün için kısa bir hatırlatma.',
  calm: 'Durup okumalık kısa hikâyeler.', science: 'İsteklerin nasıl çalıştığına dair küçük bilgiler.',
  health: 'Temiz süreye göre vücudunda neler değişiyor.', own: 'Nedenlerin ve kendi notların.',
  lyrics: 'Şarkılardan seçilmiş kısa satırlar.',
};

const SOURCES = {
  sems: 'https://tr.wikiquote.org/wiki/%C5%9Eems-i_Tebrizi',
  zarifoglu: 'https://www.milliyet.com.tr/galeri/cahit-zarifoglu-sozleri-cahit-zarifoglu-siirlerinden-alintilar-ve-en-guzel-sozler-6403890',
  neset: 'https://tr.wikiquote.org/wiki/Ne%C5%9Fet_Erta%C5%9F',
  yasar: 'https://www.cnnturk.com/yasam/yasar-kemal-sozleri-yasar-kemalin-kitaplarindan-en-anlamli-alintilar-yasar-kemalin-en-iyi-sozleri-1694660',
  nazim: 'https://tr.wikiquote.org/wiki/N%C3%A2z%C4%B1m_Hikmet',
  cemil: 'https://www.fikriyat.com/galeri/edebiyat/cemil-meric-alinti-ve-sozleri',
  baris: 'https://tr.wikiquote.org/wiki/Bar%C4%B1%C5%9F_Man%C3%A7o',
  teoman: 'https://tr.wikiquote.org/wiki/Teoman_(%C5%9Fark%C4%B1c%C4%B1)',
  duman: 'https://tr.wikiquote.org/wiki/Duman_(m%C3%BCzik_grubu)',
  sezen: 'https://tr.wikiquote.org/wiki/Sezen_Aksu',
  muslum: 'https://tr.wikiquote.org/wiki/M%C3%BCsl%C3%BCm_G%C3%BCrses',
  ahmet: 'https://genius.com/Ahmet-kaya-safak-turkusu-lyrics',
  emre: 'https://genius.com/Emre-aydn-belki-bir-gun-ozlersin-lyrics',
  sagopa: 'https://tr.wikiquote.org/wiki/Sagopa_Kajmer',
} as const;

const make = (id: number, contentType: 'quote' | 'lyric', text: string, author: string, sourceUrl: string): Quote => ({
  id: `v2-q${String(id).padStart(2, '0')}`,
  category: contentType === 'lyric' ? 'lyrics' : 'aphorism', contentType, text, author, sourceUrl, notificationEligible: true,
});
const q = (id: number, text: string, author: string, sourceUrl: string) => make(id, 'quote', text, author, sourceUrl);
const l = (id: number, text: string, author: string, sourceUrl: string) => make(id, 'lyric', text, author, sourceUrl);

export const EDITORIAL_QUOTES: Quote[] = [
  q(1, "Hakk'ın karşına çıkardığı değişimlere direnmek yerine teslim ol. Bırak hayat sana rağmen değil, seninle beraber aksın.", 'Şems-i Tebrizi', SOURCES.sems),
  q(2, 'Düzenim bozulur, hayatımın altı üstüne gelir diye endişe etme. Nereden biliyorsun hayatın altının üstünden daha iyi olmayacağını?', 'Şems-i Tebrizi', SOURCES.sems),
  q(3, 'Sabır nedir? Dikene bakıp gülü, geceye bakıp gündüzü tahayyül edebilmektir.', 'Şems-i Tebrizi', SOURCES.sems),
  q(4, 'Yolun ucunun nereye varacağını düşünmek beyhude bir çabadan ibarettir. Sen sadece atacağın ilk adımı düşünmekle yükümlüsün. Gerisi zaten kendiliğinden gelir.', 'Şems-i Tebrizi', SOURCES.sems),
  q(5, 'Allah âşıkları bilirler ki, gökteki ayın hilalden dolunaya varması için zaman gerekir.', 'Şems-i Tebrizi', SOURCES.sems),
  q(6, 'Sığ suları en hafif rüzgârlar bile coşturabiliyor. Derin denizleri ise ancak derin sevdalar.', 'Şems-i Tebrizi', SOURCES.sems),
  q(7, 'Anladım ki susan her şey derin ve heybetli.', 'Şems-i Tebrizi', SOURCES.sems),
  q(8, 'Esas kirlilik dışta değil içte, kisvede değil kalpte olur.', 'Şems-i Tebrizi', SOURCES.sems),
  q(9, 'Umudumuz, acımızdan daha büyük olmalı.', 'Cahit Zarifoğlu', SOURCES.zarifoglu),
  q(10, 'Allah, taşıyamayacağımız derdi ömrümüze, yaşayamayacağımız aşkı gönlümüze vermesin.', 'Cahit Zarifoğlu', SOURCES.zarifoglu),
  q(11, 'Kalbinizi yumuşatın, ama iradeniz sert olsun.', 'Cahit Zarifoğlu', SOURCES.zarifoglu),
  q(12, 'Bir gün ister istemez karşısında olacaksın kaçtıklarının.', 'Cahit Zarifoğlu', SOURCES.zarifoglu),
  q(13, 'İnsan kendi mutlu olma imkânını görebilmeli.', 'Cahit Zarifoğlu', SOURCES.zarifoglu),
  q(14, 'Süte su karıştı, söze yalan, mideye haram; işte orada bozuldu insan.', 'Neşet Ertaş', SOURCES.neset),
  q(15, 'Kendini bilen, bilmeyenin kusuruna bakmaz.', 'Neşet Ertaş', SOURCES.neset),
  q(16, 'Kendi kendisinden utanmayan, yeryüzünde hiç kimseden utanmaz.', 'Neşet Ertaş', SOURCES.neset),
  q(17, 'Can yakıp da kalp kırma ey insanoğlu. Senin de gül benzin solacak bir gün.', 'Neşet Ertaş', SOURCES.neset),
  q(18, 'İnsanoğlu, umutsuzluktan umut yaratandır.', 'Yaşar Kemal', SOURCES.yasar),
  q(19, 'İnsan, evrende gövdesi kadar değil, yüreği kadar yer kaplar.', 'Yaşar Kemal', SOURCES.yasar),
  q(20, 'Hangi günü gördük akşam olmamış. Hangi insanı gördük yaralanmamış.', 'Yaşar Kemal', SOURCES.yasar),
  q(21, 'İnsan bir kere birine geç kalır ve bir daha hiç kimse için acele etmez.', 'Yaşar Kemal', SOURCES.yasar),
  q(22, 'Konuşan insan öyle kolay kolay dertten ölmez. Bir insan konuşmayıp da içine gömüldü müydü sonu felakettir.', 'Yaşar Kemal', SOURCES.yasar),
  q(23, 'Susmayı da bilmelisin bazen, çok zor olsa bile.', 'Yaşar Kemal', SOURCES.yasar),
  q(24, 'Aşkı hep arayan bulmaz. Bazen de aşk arar seni.', 'Yaşar Kemal', SOURCES.yasar),
  q(25, 'Mesele esir düşmekte değil, teslim olmamakta bütün mesele.', 'Nâzım Hikmet', SOURCES.nazim),
  q(26, 'İnsanların kanatları yok, insanların kanatları yüreklerinde.', 'Nâzım Hikmet · Dört Güvercin', SOURCES.nazim),
  q(27, 'Sende ben imkânsızlığı seviyorum. Fakat asla ümitsizliği değil.', 'Nâzım Hikmet', SOURCES.nazim),
  q(28, 'Sen yanmasan, ben yanmasam, biz yanmasak nasıl çıkar karanlıklar aydınlığa?', 'Nâzım Hikmet · Hava Kurşun Gibi Ağır', SOURCES.nazim),
  q(29, 'İnsanlar sevilmek için yaratıldılar, eşyalar ise kullanılmak için. Dünyadaki kaosun nedeni; eşyaların sevilmeleri ve insanların kullanılmaları.', 'Cemil Meriç · Bu Ülke', SOURCES.cemil),
  q(30, 'Kitap bir limandı benim için.', 'Cemil Meriç · Bu Ülke', SOURCES.cemil),
  q(31, 'İnsanın öğrenmesi gereken ilk dil tatlı dildir.', 'Barış Manço', SOURCES.baris),
  q(32, 'Geçmişini bilmeyen bugününü anlayamaz ve yarınını kuramaz.', 'Barış Manço', SOURCES.baris),
  l(33, 'Bir ben var ki benim içimde, benden öte benden ziyade.', 'Barış Manço', SOURCES.baris),
  l(34, 'Topraktan geldi insan, yine toprağa dönecek; iki lokma ekmek için ömür boyu dövüşecek.', 'Barış Manço · Yol', SOURCES.baris),
  l(35, 'Unutma ki dünya fani, veren Allah alır canı.', 'Barış Manço · Can Bedenden Çıkmayınca', SOURCES.baris),
  l(36, 'Bazı yalanlar güzel, bazı gerçekler acıymış. Bazı ölümler uzun, bütün hayatlar kısaymış.', 'Teoman · Bazı Yalanlar', SOURCES.teoman),
  l(37, 'Nasıl oluyor, vakit bir türlü geçmezken yıllar, hayatlar geçiyor?', 'Teoman · Paramparça', SOURCES.teoman),
  l(38, 'Kayıp bir bavul gibiyim havaalanında, ya da boş bir yüzme havuzu sonbaharda.', 'Teoman · Paramparça', SOURCES.teoman),
  l(39, 'Hayat bir yarış dersin hep; bir meydan savaşı, bir kavga. Sakın yara alma.', 'Teoman · Sus Konuşma', SOURCES.teoman),
  l(40, 'Küçücüktüm, ufacıktım, bir dilenci kraldım; çok yürüdüm, çok acıktım.', 'Teoman · Sus Konuşma', SOURCES.teoman),
  l(41, 'Yaşam sevincin duruyor mu hâlâ içinde?', 'Teoman · Bir Damla Gözyaşı', SOURCES.teoman),
  l(42, 'Kimi yanında arıyorsan önce içinde bulacaksın.', 'Duman', SOURCES.duman),
  l(43, 'Ah, umurunda mı sandın bu dünya.', 'Duman · Ah', SOURCES.duman),
  l(44, 'Yakala saçından tut hayatı, çevir yüzüne, öp, öp.', 'Sezen Aksu', SOURCES.sezen),
  l(45, 'Ağlamak, şu gelip geçici dünyada her şeye rağmen var olmak demek.', 'Sezen Aksu', SOURCES.sezen),
  l(46, 'Bugün batarsa güneş, yarın yeniden doğar.', 'Müslüm Gürses', SOURCES.muslum),
  l(47, 'Yanılmak insanca, affetmek kutsalcadır.', 'Müslüm Gürses', SOURCES.muslum),
  l(48, 'Bekle beni anne, bir sabah çıkagelirim.', 'Ahmet Kaya · Şafak Türküsü', SOURCES.ahmet),
  l(49, 'Gecenin kıyısında durmuşum, kefenin cebi yok.', 'Ahmet Kaya · Şafak Türküsü', SOURCES.ahmet),
  l(50, 'Oysa türkü tadında yaşamak isterdim.', 'Ahmet Kaya · Şafak Türküsü', SOURCES.ahmet),
  l(51, 'Koşun çocuklar koşun, sabah üstüme üstüme geliyor.', 'Ahmet Kaya · Şafak Türküsü', SOURCES.ahmet),
  l(52, 'Bin bıçak var sırtımda, biniyle de adaşsın, her biri hayran sana.', 'Emre Aydın · Belki Bir Gün Özlersin', SOURCES.emre),
  l(53, 'Sabrın tadı acı da olsa tatlıdır ya meyvan.', 'Sagopa Kajmer · Kötü İnsanları Tanıma Senesi', SOURCES.sagopa),
  l(54, 'Yarın bir kapıdır ve sen uykudan o kapıdan geçmek için uyanırsın.', 'Sagopa Kajmer · Geçmişi Gölgeye Teslim Ettim', SOURCES.sagopa),
  l(55, 'Dayanacağın bir duvarın yoksa ör hadi.', 'Sagopa Kajmer · Bir Pesimistin Gözyaşları', SOURCES.sagopa),
  l(56, 'Darbeler yesen de yüreğine, affetmek en asil intikam.', 'Sagopa Kajmer · Karikatür Komedya', SOURCES.sagopa),
];

const story = (id: number, title: string, text: string, sourceUrl: string): Quote => ({ id: `v2-s${id}`, category: 'calm', contentType: 'story', title, text, sourceUrl, notificationEligible: false });
const STORY_SOURCE = 'https://www.hurriyet.com.tr/egitim/hikaye-ornekleri-hayata-dair-kisa-anlamli-yasanmis-ve-anonim-hikayeler-41623027';
export const STORIES: Quote[] = [
  story(57, 'Deniz yıldızı', 'Bir adam sabaha karşı sahilde yürürken karaya vurmuş binlerce deniz yıldızı görür. Küçük bir çocuk onları tek tek alıp denize bırakmaktadır. Adam, sahilin çok uzun, yıldızların çok fazla olduğunu, hepsini kurtaramayacağını söyler. Çocuk yerden bir deniz yıldızı daha alır, denize atar ve şöyle der: “Bu deniz yıldızı için fark etti.”\n\nDers: Yaptığın küçük bir iyilik, o iyiliğin dokunduğu kişi için küçük değildir.', STORY_SOURCE),
  story(58, 'Akrep', 'Bir adam suda boğulmaya çalışan bir akrebi kurtarmak için parmağını uzatır, akrep onu sokar. Adam yine uzatır, akrep yine sokar. Bunu gören biri, “Seni sokup duruyor, bırak artık” der. Adam cevap verir: “Sokmak onun doğasında, sevmek benim doğamda. Onun doğası yüzünden ben doğamdan vazgeçmem.”\n\nDers: İnsanların huyu, senin huyunu değiştirmek zorunda değil.', STORY_SOURCE),
  story(59, 'Mutlu adamın gömleği', 'Her şeye sahip ama mutsuz bir kral, bilgeye derdini anlatır. Bilge, “Mutlu bir adam bul, gömleğini giy” der. Adamları ülkeyi gezer; herkesin bir derdi, bir eksiği vardır. Sonunda eski bir kulübede, elindekine şükreden, kendini dünyanın en mutlu insanı sayan birini bulurlar. Ama adamın üzerinde gömlek yoktur.\n\nDers: Mutluluk dışarıda değil, elindekiyle kurduğun ilişkide.', STORY_SOURCE),
  story(60, 'Ağzına yılan kaçan adam', 'Bir emir, ağaç altında uyuyan bir adamın ağzına kara bir yılan girdiğini görür. Adamı uyandırıp kamçılar, koşturur, zorla çürük elmalar yedirir. Adam ona lanetler okur, “Bana neden zulmediyorsun?” diye bağırır. Sonunda adam kusar ve çürük elmalarla birlikte kara yılan da dışarı çıkar. O an anlar: Kendisine zulüm sandığı şey, kurtuluşuydu.\n\nDers: Seni yoran şeyin neyi kurtardığını çoğu zaman sonradan anlarsın.', 'https://www.islamveihsan.com/mevlana-hikayeleri.html'),
];

export const BUILTIN_QUOTES: Quote[] = [...EDITORIAL_QUOTES, ...STORIES];
export const HEALTH_TIMELINE: Quote[] = [
  { id: 'health-nicotine-20m', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 0.33, text: '20 dakika: nabız ve tansiyon normale dönmeye başlar.' },
  { id: 'health-nicotine-8h', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 8, text: '8 saat: kandaki karbonmonoksit seviyesi düşer.' },
  { id: 'health-nicotine-24h', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 24, text: '24 saat: kalp krizi riski azalmaya başlar.' },
  { id: 'health-nicotine-48h', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 48, text: '48 saat: tat ve koku duyun geri dönmeye başlar.' },
  { id: 'health-nicotine-72h', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 72, text: '3 gün: nikotin vücuttan büyük ölçüde atılır; nefes almak kolaylaşır.' },
  { id: 'health-nicotine-2w', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 336, text: '2 hafta: dolaşım düzelir, yürümek daha kolay gelir.' },
  { id: 'health-nicotine-1m', category: 'health', contentType: 'health', behaviorCategory: 'nicotine', minCleanHours: 720, text: '1 ay: akciğer fonksiyonlarında iyileşme fark edilebilir.' },
  { id: 'health-social-1d', category: 'health', contentType: 'health', behaviorCategory: 'social_media', minCleanHours: 24, text: '1 gün: dikkat süren toparlanmaya başlar.' },
  { id: 'health-social-3d', category: 'health', contentType: 'health', behaviorCategory: 'social_media', minCleanHours: 72, text: '3 gün: gece ekrandan uzak kalınca uykuya dalma süresi kısalır.' },
  { id: 'health-social-1w', category: 'health', contentType: 'health', behaviorCategory: 'social_media', minCleanHours: 168, text: '1 hafta: boş anlara tahammül artar.' },
];

export function builtinQuote(id: string): Quote | undefined {
  return BUILTIN_QUOTES.find((item) => item.id === id) ?? HEALTH_TIMELINE.find((item) => item.id === id);
}
