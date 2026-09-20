# ORINVA — Uygulama Mimarisi (APP_STRUCTURE.md)

Bu dosya, [DESIGN.md](DESIGN.md)'deki görsel sistem ve `derin-durtu-davranis-farkindaligi-mobil-urun-arastirmasi.md` araştırmasındaki ürün kararları temel alınarak hazırlanmıştır. Ekranları, navigasyonu ve akışları tanımlayan mimari kaynaktır. Henüz kod/komponent üretilmemiştir.

## 0. Mimari ilkeler (neden bu yapı)

1. **4 ana tab, ne fazla ne az.** Bugün · Yolculuk · Günlük · Sen. Her özellik isteği önce "hangi tab'ın altına mantıklı şekilde gruplanır?" sorusundan geçer; yeni tab açmak son çare.
2. **Zor an desteği bir tab değil, global bir refleks.** Persistent bir shortcut olarak tab navigator seviyesinde yaşar; 4 ana tab'ın hepsinden tek dokunuşla erişilir.
3. **AI hiçbir yerde ayrı bir "chat" tab'ı değildir.** Journey, Journal ve Craving-Help içine gömülü, bağlamsal kartlar/aksiyonlar olarak yaşar (§25 DESIGN.md AI Coach UI, §30 AI Insight Cards).
4. **Relapse ayrı bir "başarısız oldun" ekranı değildir.** Quick Log'un bir sonucu ve Craving-Help'in olası bir çıkışıdır; aynı akışın devamı olan bir "recovery" adımına açılır.
5. **Streak/clean-time bağımsız bir ekran değildir.** Today hero'su ve Behavior Detail içinde yaşayan bir bileşendir — Journey'nin gerçek hero'su 30 günlük "Journey" görünümüdür.
6. **Achievements ayrı bir rozet rafı değildir.** Milestones ile birleştirilmiştir (bkz. DESIGN.md §26 ve Do/Don't — gamification çocuklaştırılmamalı).
7. **Hesap/Authentication opsiyoneldir ve zorunlu değildir.** Uygulama hesapsız, tamamen cihazda çalışır; Authentication yalnızca kullanıcı isteyerek "sync"i açtığında devreye giren ayrı bir opsiyonel akıştır.

---

## 1. Navigasyon mimarisi

### 1.1 Kök yapı (Expo Router route groups)

```
app/
  (onboarding)/          — ilk kurulum akışı, stack, header yok
  (auth)/                — opsiyonel hesap/sync akışı, stack
  (tabs)/                — ana uygulama, bottom tab navigator
    (today)/              — Bugün stack'i
    (journey)/             — Yolculuk stack'i
    (journal)/            — Günlük stack'i
    (you)/                 — Sen stack'i
  (modals)/               — tam ekran / modal sunulan route'lar (tab'ların üzerine biner)
  (sheets)/               — bottom-sheet olarak sunulan route'lar
  applock/                — kilit ekranı, tüm app'in önünde gate
```

`(tabs)` her zaman `applock` gate'inden geçtikten sonra render olur. `(onboarding)` yalnızca `firstLaunch === true` iken kök olur; tamamlanınca bir daha görünmez.

### 1.2 Bottom Tab Navigator (4 tab)

| Tab | İkon durumu | Kök ekran | İçerik |
|---|---|---|---|
| **Bugün** | ev/güneş çizgi ikon | Today / Home | Günün durumu, aktif plan, quick log, check-in |
| **Yolculuk** | dalga/yol çizgi ikon | Journey Overview | Streak, 30 günlük journey, davranışlar, istatistik, milestone, takvim |
| **Günlük** | defter çizgi ikon | Journal List | Journal, mood, akşam reflection, içerik kütüphanesi girişi |
| **Sen** | kullanıcı çizgi ikon | Profile / Settings root | Profil, ayarlar, gizlilik, abonelik |

Tab bar spesifikasyonu DESIGN.md §15'e birebir uyar (64px + safe area, aktif durumda dolu ikon + indigo, pill/bubble arka plan yok).

### 1.3 Global persistent shortcut — Zor An (Emergency)

- Tab navigator seviyesinde, tab bar'ın hemen üstünde yüzen bir **FAB** olarak render edilir (DESIGN.md §31 craving-help CTA, 60px).
- Bugün, Yolculuk, Günlük tab'larında her zaman görünür. **Sen** tab'ında (ayarlar bağlamı) gizlenir — o an aktif bir craving akışı değil, hesap/gizlilik yönetimi bağlamıdır.
- Craving-Help akışının kendi içinde, Relapse akışının kendi içinde ve Onboarding sırasında FAB gizlenir (döngüsel çağrıyı önlemek ve o akışın kendi odağını korumak için).
- Aynı hedefe alternatif kısa yollar: Today ekranındaki birincil buton, bildirim aksiyonu ("Az önceki anı kapatmak ister misin?"), widget/lock-screen deep link, app-icon long-press. Hepsi aynı route'a (`(modals)/craving-help`) çıkar — tek bir gerçek ekran, çok giriş kapısı.
- **Adım sayısı:** Uygulama herhangi bir noktasındayken → 1 dokunuş (FAB) → Craving-Help akışı açılır. Kilit ekranındayken (uygulama kapalı) → widget/lock-screen kısayolu → doğrudan aynı akış, app lock'u bypass etmez ama PIN/biyometri ekranı da aynı hedefe yönlendirir (bkz. §3.9).

### 1.4 Modal route'lar (`(modals)/…`, tam ekran veya kart-modal sunum)

`craving-help`, `relapse-recovery`, `behavior-builder`, `paywall`, `milestone-celebration`, `search`, `weekly-review`, `onboarding-mini-demo` (onboarding içinde ama aynı component'i tekrar kullanır).

### 1.5 Bottom-sheet route'lar (`(sheets)/…`)

`daily-checkin`, `quick-log`, `journal-ai-summarize`, `behavior-quick-switch`, `notification-settings-quick`, `insight-detail`.

### 1.6 Deep link / bildirim / widget giriş noktaları

| Deep link | Hedef | Kaynak |
|---|---|---|
| `orinva://craving-help` | Craving-Help modal | Widget, lock-screen complication, app-icon long-press, bildirim aksiyonu |
| `orinva://quicklog?behaviorId=` | Quick Log sheet (davranış önceden seçili) | Widget "Dürtü kaydet", bildirim |
| `orinva://journal/new` | Journal Composer | App-icon long-press "Kısa not" |
| `orinva://weekly-review` | Weekly Review modal | Haftalık bildirim (opt-in) |
| `orinva://plan/{behaviorId}` | Behavior Detail → Plan bölümü açık | Plan hatırlatma bildirimi |
| `orinva://checkin/{eventId}` | Açık kalmış dürtü olayının nazik kapanışı (sheet) | Ertesi gün nazik follow-up bildirimi |

Hiçbir deep link, bildirim önizlemesinde davranış adını/miktarı ifşa etmez (DESIGN.md §31, gizlilik ilkesi — bkz. araştırma "Notifications" bölümü).

---

## 2. Ekran kataloğu — okuma rehberi

Her ekran aşağıdaki 14 başlıkla tanımlanır: **Amaç · Ana işler · Primary CTA · Secondary actions · Ana component'ler · Gösterilecek veri · Empty state · Loading state · Error state · Offline davranışı · Giriş yolları · Çıkış/hedef yolları · İlgili modal/sheet · DESIGN.md kuralları.**

Bazı araştırma/istek listesindeki maddeler (ör. Clean-time, Daily motivation, Mood tracking, Achievements) bağımsız bir route değil, bir ana ekranın **içine gömülü bileşen**dir — bu, "navigasyon kalabalık olmasın" ilkesinin doğrudan sonucudur. Bunlar §4'te ayrı bir eşleme tablosunda gösterilir.

---

## 3. Ekran ve akış tanımları

### A. Onboarding & Kurulum

#### 3.1 Onboarding Flow — `Flow` · `(onboarding)/`
- **Amaç:** 90 saniyeden kısa sürede güven vermek ve ilk gerçek değeri (bir Quick Log deneyimi) yaşatmak.
- **Ana işler:** Güven sözünü okuma → 1 ana odak davranış seçme → hedef modu seçme (bırak/azalt/geciktir/fark et) → tek neden/tek plan girme → canlı mini-demo (gerçek "Dürtü geldi" testi) → ana ekrana geçiş.
- **Primary CTA:** "Devam et" (her adımda), son adımda "Başlayalım".
- **Secondary actions:** "Geri" (ghost, her zaman), adım atlama yok (her adım tek karar, atlanamaz ama süre kısa).
- **Ana component'ler:** Segmented progress line (4px), Headline/Display soru, tekli seçim kartları, Behavior Builder'ın sadeleştirilmiş embed hali.
- **Gösterilecek veri:** Yok (henüz kullanıcı verisi yok); mini-demo adımında anlık oluşturulan test olayı.
- **Empty state:** N/A (akışın kendisi ilk state).
- **Loading state:** Yok — tamamen local, anlık geçişler.
- **Error state:** Yok; tüm adımlar client-side validasyon (boş bırakılamaz alanlar için inline uyarı).
- **Offline davranışı:** Tamamen offline çalışır (local-first ilkesi gereği zaten varsayılan).
- **Giriş yolları:** Yalnızca `firstLaunch === true` durumunda uygulama kökü.
- **Çıkış/hedef yolları:** Tamamlanınca `(tabs)/(today)` köküne yönlenir; bir daha gösterilmez (ikinci davranış eklemek için ayrı, kısaltılmış Behavior Builder kullanılır, bkz. 3.2).
- **İlgili modal/sheet:** Mini-demo adımı, Craving-Help'in gerçek görsel diliyle aynı component'i kullanır (DESIGN.md §36).
- **DESIGN.md kuralları:** §36 Onboarding (hero adımda tek gradient istisnası, "Step X/Y" baskısı yok, segmented progress line).

#### 3.2 Behavior Builder (Create/Edit Behavior) — `Flow` · `(modals)/behavior-builder`
- **Amaç:** Yeni bir odak davranış (sigara, telefon/sosyal medya veya custom) tanımlamak ya da mevcut birini düzenlemek.
- **Ana işler:** Şablon seçimi (Sigara/Nikotin, Telefon/Sosyal Medya, Kendi davranışım) → isim/niyet (fark et, azalt, bırak, geciktir) → birim (olay/dakika/adet/evet-hayır) → opsiyonel maliyet birimi → zor anda denenecek tek alternatif → (opsiyonel, sonradan) tek neden.
- **Primary CTA:** "Kaydet ve başla".
- **Secondary actions:** "İptal", düzenleme modunda "Bu davranışı arşivle".
- **Ana component'ler:** Şablon seçim kartları, segmented niyet seçici, Input (§13), Secondary/Ghost butonlar.
- **Gösterilecek veri:** Düzenleme modunda mevcut davranış alanları.
- **Empty state:** N/A.
- **Loading state:** N/A (anlık local yazma).
- **Error state:** İsim boşsa inline `terracotta` hata; şablon dışı custom davranışta yasak kelime/klinik sınıflandırma denemesi engellenir (nazik inline uyarı, ürün politikası gereği).
- **Offline davranışı:** Tamamen offline; local DB'ye yazar.
- **Giriş yolları:** Onboarding adım 2, Yolculuk → "Yeni davranış ekle", Behavior Portfolio boş/dolu state CTA'sı.
- **Çıkış/hedef yolları:** Kaydedince Behavior Detail'e (yeni davranış için) veya bir önceki ekrana (düzenlemede) döner.
- **İlgili modal/sheet:** Kendisi zaten modal; içinde ek sheet yok.
- **DESIGN.md kuralları:** §11 Input, §12 Button, §17-18 (modal/sheet sunum kuralları), "custom behavior serbest metninden klinik sınıflandırma üretilmez" ürün kuralı.

#### 3.3 Authentication (opsiyonel hesap/sync) — `Screen` · `(auth)/`
- **Amaç:** Yalnızca kullanıcı çoklu cihaz senkronu/yedek istediğinde hesap oluşturmak; MVP'de zorunlu değil, varsayılan olarak hiç görünmez.
- **Ana işler:** E-posta ile hesap oluştur / giriş yap; senkron kapsamının ne anlama geldiğinin (hangi veri, hangi şifreleme) açık özeti.
- **Primary CTA:** "Hesap oluştur".
- **Secondary actions:** "Zaten hesabım var → Giriş yap", "Vazgeç, local kullanmaya devam et".
- **Ana component'ler:** Input (email/parola), Primary/Secondary Button, açıklama metni bloğu.
- **Gösterilecek veri:** Yok.
- **Empty state:** N/A.
- **Loading state:** Auth isteği sırasında buton içi spinner (§20 indeterminate, 5sn altı).
- **Error state:** Hatalı kimlik bilgisi / ağ hatası → inline `terracotta` mesaj, tekrar dene ghost aksiyonu.
- **Offline davranışı:** Çevrimdışıyken bu ekran erişilebilir ama işlem tamamlanamaz; net "internet bağlantısı gerekiyor" mesajı, çekirdek uygulama bundan etkilenmez.
- **Giriş yolları:** Yalnızca Sen → Ayarlar → "Senkronu aç" üzerinden.
- **Çıkış/hedef yolları:** Başarılı işlemde Sen → Ayarlar'a geri döner; iptalde de aynı.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §13 Input, §12 Button, §34 Error States.
- **Kapsam notu:** MVP'de bu ekran **yoktur** (route bile kayıtlı değil); V1.1'de opsiyonel sync ile birlikte eklenir.

---

### B. Bugün (Today) Tab

#### 3.4 Today / Home — `Screen` · tab kökü, `(tabs)/(today)/index`
- **Amaç:** Kullanıcının birkaç saniye içinde mevcut durumunu, bugünkü planını ve gerektiğinde desteğe nasıl ulaşacağını anlamasını sağlamak — uygulamanın en sık açılan ekranı.
- **Ana işler:** Bugünkü hedef/planı görme, Quick Log yapma, check-in'e yanıt verme (opsiyonel), kendi nedenini/kısa editoryal notu okuma, en son olayın nazik kapanışını görme.
- **Primary CTA:** "Şu an zorlanıyorum" (FAB, ekranın alt üçte birinde, en büyük dokunma alanı) — bu ekranın CTA'sı aynı zamanda global shortcut ile aynı route'a çıkar.
- **Secondary actions:** "Dürtü geldi" (hafif quick-log tetikleyici, ayrı buton/kart), "Yaptım" (nötr, yargısız üçüncü seçenek), check-in kartındaki "Şimdi değil".
- **Ana component'ler:** Hero durum kartı (aktif davranış + clean-time Stat Large), Daily Check-in kartı (collapsed/expanded), Reasons/editoryal not kartı, en-son-olay kapanış kartı, davranış hızlı geçiş (birden fazla aktif davranış varsa üstte kompakt seçici).
- **Gösterilecek veri:** Aktif odak davranış(lar)ın güncel clean-time'ı, bugünün planı/if-then'i, check-in durumu, son 1 olayın özeti, kullanıcının Reason Vault'undan bir cümle veya editoryal içerik.
- **Empty state:** İlk günlerde (henüz olay yok) — "Henüz kayıt yok, istediğinde buradan başlayabilirsin" tonunda, boş Journey ile aynı nötr dil (DESIGN.md §33).
- **Loading state:** Local DB okuması anlık olduğundan pratikte görünmez; ilk açılışta <150ms skeleton (hero kart iskeleti, §20).
- **Error state:** Local DB okunamazsa (bozuk kayıt) — nötr hata kartı + "Tekrar dene" / "Destek" (DESIGN.md §34, kırmızı ekran yok).
- **Offline davranışı:** Varsayılan davranış zaten budur — tüm veriler cihazda; çevrimdışı göstergesi bile gerekmez (opsiyonel sync açıksa küçük, sessiz bir senkron durum ikonu Sen tabında yaşar, Today'de değil).
- **Giriş yolları:** Uygulama açılışı (varsayılan kök), tab bar "Bugün", herhangi bir yerden "Ana ekrana dön".
- **Çıkış/hedef yolları:** FAB → Craving-Help; Quick Log kartı → Quick Log sheet; check-in kartı → Daily Check-in sheet; hero kart → Behavior Detail; bildirim çanı → Notification Center.
- **İlgili modal/sheet:** `quick-log`, `daily-checkin`, `craving-help` (modal), `behavior-quick-switch` (birden fazla davranış varsa).
- **DESIGN.md kuralları:** §12 Craving-help CTA (60px), §21 Streak Visualization (Stat Large, ring yok/opsiyonel), §27 Daily Check-in, §32 Success States (sessiz onay), Headline yalnızca bu ekranda büyük kullanılır (§15 top navigation notu).

#### 3.5 Notification Center — `Screen` · `(tabs)/(today)/notifications`
- **Amaç:** Kullanıcının açık izin verdiği bildirimlerin geçmişini/merkezini göstermek (push kaçırılsa bile buradan erişilebilir).
- **Ana işler:** Bildirimleri okuma, ilgili ekrana geçiş, bildirim türünü kalıcı kapatma (kestirme link → Ayarlar).
- **Primary CTA:** Bildirime dokunma → ilgili route'a git.
- **Secondary actions:** "Tümünü okundu işaretle", "Bildirim ayarları" ghost linki.
- **Ana component'ler:** Liste satırları (icon + Body + Caption zaman), swipe-to-dismiss.
- **Gösterilecek veri:** Son 30 günün bildirim geçmişi (yalnızca uygulama içi metadata; hassas içerik lock-screen'de zaten görünmediği gibi burada da davranış detayları nötr dille yazılır).
- **Empty state:** "Henüz bildirim yok" + "Bildirim ayarlarını düzenle" ghost CTA.
- **Loading state:** Skeleton satırlar (§20).
- **Error state:** N/A (local veri).
- **Offline davranışı:** Tamamen offline çalışır.
- **Giriş yolları:** Today top bar bell ikonu.
- **Çıkış/hedef yolları:** İlgili hedef ekrana (Weekly Review, Craving-Help follow-up, Plan hatırlatma vb.) veya Bildirim Ayarları'na.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §16 Top Navigation, §33 Empty States.

---

#### 3.6 Daily Check-in — `Bottom Sheet` · `(sheets)/daily-checkin`
- **Amaç:** Düşük baskılı, opsiyonel günlük bir soruya kısa yanıt almak (araştırma "Daily Questions" bölümü).
- **Ana işler:** Duruma göre seçilen tek soruyu yanıtlama (metin/ses/pas geç).
- **Primary CTA:** "Kaydet".
- **Secondary actions:** "Şimdi değil" (Today kartındaki collapsed state'e geri döner, ceza yok).
- **Ana component'ler:** Title soru metni, çok satırlı Input veya ses kaydı ikonu, üç eşit ağırlıklı aksiyon.
- **Gösterilecek veri:** Günün seçilmiş sorusu (rule-based rotasyon).
- **Empty state:** N/A.
- **Loading state:** N/A (anlık local yazma).
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Today kartından "genişlet".
- **Çıkış/hedef yolları:** Kaydedince Today'e döner, kart "cevaplandı" özet state'ine geçer; isteğe bağlı Journal'a bağlanır.
- **İlgili modal/sheet:** Kendisi sheet.
- **DESIGN.md kuralları:** §17 Bottom Sheets, §27 Daily Check-in, §11 Input.

#### 3.7 Quick Log (Urge / Action / Resist) — `Bottom Sheet + mini-flow` · `(sheets)/quick-log`
- **Amaç:** 1–3 saniyede geçerli bir olay izi bırakmak; ayrıntı her zaman opsiyonel.
- **Ana işler:** Olay türünü seçme (Dürtü / Yaptım / Direndim), opsiyonel şiddet (Craving Intensity Selector), opsiyonel 1 bağlam/mood etiketi, "geçti/erteledim/yaptım/emin değilim" ile kapanış.
- **Primary CTA:** Olay türü butonlarının kendisi (tek dokunuşta commit olur — "kaydet" onayı gerekmez).
- **Secondary actions:** "Ayrıntı ekle" (genişlet: şiddet, mood, bağlam, 1 cümle not), "Kapat".
- **Ana component'ler:** Büyük 3'lü seçim butonları, Craving Intensity Selector (§25), Mood Selector (§24), 1 cümlelik Input.
- **Gösterilecek veri:** Aktif davranış(lar) arasında hızlı geçiş (birden fazla varsa), son kullanılan davranış varsayılan seçili.
- **Empty state:** N/A.
- **Loading state:** N/A.
- **Error state:** N/A (validasyon gerektirmeyen, her zaman geçerli minimum veri).
- **Offline davranışı:** Tamamen offline, local append-only event log.
- **Giriş yolları:** Today "Dürtü geldi" kartı, global FAB'in ikincil aksiyonu, widget, app-icon long-press, bildirim aksiyonu.
- **Çıkış/hedef yolları:** "Yaptım" seçilirse → Relapse & Recovery Flow'a yumuşak geçiş teklifi (zorunlu değil, "Kısaca ne oldu?" / "Şimdilik kapat"); "Dürtü" seçilirse ve kullanıcı isterse → Craving-Help'e geçiş teklifi.
- **İlgili modal/sheet:** Kendisi sheet; içinden `craving-help` veya `relapse-recovery` modal'ına geçiş yapabilir.
- **DESIGN.md kuralları:** §17 Bottom Sheets, §24 Mood Selector, §25 Craving Intensity Selector, §12 Button press feedback.

#### 3.8 Emergency / Craving-Help — `Full-screen Flow` · `(modals)/craving-help`
- **Amaç:** 30 saniye–5 dakikalık, kullanıcı kontrollü mikro müdahale; ürünün en yüksek özenli akışı.
- **Ana işler:** Fark et (opsiyonel şiddet) → alan aç (nefes/timer/sadece gözlemle, atlanabilir) → kendi planı (geciktir, su/yürü, ortam değiştir, reason/future-self notu, birine yaz) → sonuç ve kapanış (geçti/erteledim/yaptım/yardım bulmam lazım).
- **Primary CTA:** Her adımın tek büyük seçimi (§12, ≥56px hedefler).
- **Secondary actions:** "Geç" (her adımda), sürekli görünür "Kriz desteği" text linki.
- **Ana component'ler:** Tek soru/Headline, büyük dokunma hedefleri, breathing-pulse timer (§31), Reasons Vault/Future-Self tam ekran gösterim (serif accent, DESIGN.md §6).
- **Gösterilecek veri:** Kullanıcının o davranış için kayıtlı Reason/Future-Self notu ve önceden seçtiği plan seçenekleri.
- **Empty state:** Henüz Reason/Plan girilmemişse, o adım nötr editoryal içerikle (jenerik değil, davranışa uygun) doldurulur + "kendi notunu şimdi ekle" fırsatı.
- **Loading state:** Yok, tamamen local ve anlık.
- **Error state:** Yok (client-side, veri kaybı riski olmayan bir akış).
- **Offline davranışı:** Tamamen offline çalışır — bu akışın internet'e hiçbir bağımlılığı olamaz (ürün güvenlik ilkesi).
- **Giriş yolları:** Global FAB, Today CTA, widget, lock-screen, app-icon long-press, bildirim aksiyonu, Quick Log içi teklif.
- **Çıkış/hedef yolları:** "Geçti/Erteledim" → Today'e nazik kapanış kartıyla döner; "Yaptım" → Relapse & Recovery Flow; "Yardım bulmam lazım" → Help Escalation kartı (bölgesel kaynak, uygulama içi ayrı bir tam-sayfa değil, aynı akışın son adımı).
- **İlgili modal/sheet:** Kendisi modal; Reasons Vault/Future-Self kendi route'undan içeriğini burada salt-okunur gösterir.
- **DESIGN.md kuralları:** §31 (bu bölümün tamamı bu ekran için yazıldı), §38 breathing pulse motion, §41 haptics (döngü başına haptik yok).

#### 3.9 Relapse & Recovery Flow — `Full-screen Flow` · `(modals)/relapse-recovery`
- **Amaç:** Olayı yargısız kaydetmek ve kullanıcıyı 45 saniyede plana geri döndürmek — "başarısızlık ekranı" değil, recovery akışı.
- **Ana işler:** Karşılama ("Bunu kaydetmen değerli") → opsiyonel bağlam (en yakın duygu/yer/önceki aktivite) → "şu an ne yardımcı olur?" (kapat / 5dk ara / reason / destek / sonraki plan) → "bugün yeniden başlamak için tek karar yeter" kapanışı.
- **Primary CTA:** İleri bakan aksiyon ("Şimdi ne yardımcı olur?" seçenekleri) — standart Primary buton stiliyle, **Critical/kırmızı değil** (DESIGN.md §35).
- **Secondary actions:** "Şimdilik kapat".
- **Ana component'ler:** Nötr Body metni (özel "üzgün" tipografi yok), seçim kartları, standart arka plan (kırmızı wash yok).
- **Gösterilecek veri:** Kullanıcının o davranış için Journey geçmişinden "bu tek olay değil" bağlamını destekleyecek nötr bir referans (ör. "27 gün planınla temas ettin").
- **Empty state:** N/A.
- **Loading state:** Yok.
- **Error state:** Yok.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Quick Log "Yaptım" sonucu, Craving-Help "Yaptım" çıkışı.
- **Çıkış/hedef yolları:** Today'e döner; sayaç kırılma/sıfırlanma animasyonu **olmadan** güncellenir (§21, §35).
- **İlgili modal/sheet:** Yok (kendisi zaten en üst seviye modal).
- **DESIGN.md kuralları:** §35 (bu bölüm bu ekran için yazıldı), §12 Button (Critical stil burada kullanılmaz), §38 motion (dramatik animasyon yasağı).
- **Kritik kural:** Bu akış hiçbir noktada paywall, upsell veya rating prompt tetiklemez.

---

### C. Yolculuk (Journey) Tab

#### 3.10 Journey / Overview — `Screen` · tab kökü, `(tabs)/(journey)/index`
- **Amaç:** Streak yerine "son 30 günde ne oldu"yu dürüst biçimde özetlemek; sekmenin gerçek hero'su burasıdır.
- **Ana işler:** 30 günlük journey özetini okuma (planla temas edilen günler, direnilen/geciktirilen dürtüler, zor günler, geri dönüş hızı), aktif davranışlar arasında gezinme, milestone timeline'a bakma.
- **Primary CTA:** Bir davranış kartına dokunma → Behavior Detail.
- **Secondary actions:** "Yeni davranış ekle" (Behavior Portfolio boşsa/genişletilecekse), "Takvimi gör", "İstatistikleri gör".
- **Ana component'ler:** Journey özet kartı (dürüst dil, "27/30 gün planınla temas ettin" formatı), davranış kartları listesi, milestone timeline şeridi.
- **Gösterilecek veri:** Rule-based hesaplanan 30 günlük özet, her aktif davranış için mini clean-time + son olay.
- **Empty state:** Nötr "hazır boşluk" dili — boş takvim hücreleri "başarısızlık" değil "henüz veri yok" olarak render edilir (§23, §33).
- **Loading state:** Skeleton kartlar.
- **Error state:** DESIGN.md §34 standart hata kartı.
- **Offline davranışı:** Tamamen offline, tüm hesaplamalar cihaz üzerinde (insight engine).
- **Giriş yolları:** Tab bar "Yolculuk".
- **Çıkış/hedef yolları:** Behavior Detail, Behavior Portfolio, Calendar, Statistics/Insights, Weekly Review (varsa hazır bildirimi), Milestone Celebration (otomatik tetiklenirse).
- **İlgili modal/sheet:** `milestone-celebration`, `weekly-review`.
- **DESIGN.md kuralları:** §21 Streak Visualization (streak ikincil), §26 Milestone, §22 Charts (kanıt satırı zorunlu).

#### 3.11 Active Behaviors (Behavior Portfolio) — `Screen` · `(tabs)/(journey)/behaviors`
- **Amaç:** Kullanıcının tüm aktif (ve arşivlenmiş) davranışlarını tek yerde yönetmek; "bir ana odak + bir destek davranışı" ilkesinin görünür olduğu yer.
- **Ana işler:** Davranış listeleme, yeni davranış ekleme (ilk 14 gün sonrası ikinci davranış açma), arşivleme.
- **Primary CTA:** "Yeni davranış ekle" (Behavior Builder'ı açar).
- **Secondary actions:** Davranış satırına uzun basma → hızlı arşivle/düzenle menüsü.
- **Ana component'ler:** Liste satırları (icon + isim + mini clean-time + hedef modu rozeti).
- **Gösterilecek veri:** Aktif ve arşivlenmiş davranışlar, her biri için özet durum.
- **Empty state:** Bu ekrana yalnızca en az 1 davranışla girilebildiği için tam boş olmaz; ikinci davranış eklenmemişse nazik bir "İkinci bir davranış eklemek ister misin?" kartı (baskı yapmadan).
- **Loading state:** Skeleton satırlar.
- **Error state:** Standart (§34).
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Journey Overview üst kısmı, Today davranış hızlı geçiş "Yönet" linki.
- **Çıkış/hedef yolları:** Behavior Detail, Behavior Builder (yeni/düzenle).
- **İlgili modal/sheet:** `behavior-builder`.
- **DESIGN.md kuralları:** §14 Cards, §33 Empty States.

#### 3.12 Behavior Detail — `Screen` · `(tabs)/(journey)/behaviors/[id]`
- **Amaç:** Tek bir davranışın derinlemesine görünümü — clean-time, plan, kanıt, geçmiş, faydalar.
- **Ana işler:** Clean-time/streak'i görme, if-then planını düzenleme, Reasons Vault/Future-Self'e erişme, Money/Time Saved kartlarını görme, Health/Personal Benefits timeline'ına gitme (uygunsa), geçmiş olay listesini inceleme.
- **Primary CTA:** "Planı düzenle" veya davranışa özel birincil aksiyon.
- **Secondary actions:** "Reasons & Future Self", "Geçmişi gör", "Arşivle".
- **Ana component'ler:** Hero clean-time kartı (Stat Large + opsiyonel ring), Plan kartı, Money/Time Saved stat kartları (yalnız maliyet girilmişse), evidence-card'lı pattern özeti, olay geçmişi listesi.
- **Gösterilecek veri:** Bu davranışa ait tüm event/plan/reason verisi; para/zaman yalnızca kullanıcı birim maliyeti girdiyse, "tahmini" ibaresiyle.
- **Empty state:** Yeni oluşturulan davranışta "İlk kaydını buradan yapabilirsin" + Quick Log kısayolu.
- **Loading state:** Skeleton.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Journey Overview, Active Behaviors, Today hero kart.
- **Çıkış/hedef yolları:** Reasons Vault & Future Self ekranı, Health/Benefits Timeline, Calendar (bu davranışa filtreli), Behavior Builder (düzenleme).
- **İlgili modal/sheet:** `behavior-builder`, `quick-log` (davranış önceden seçili).
- **DESIGN.md kuralları:** §14 Cards, §20 Progress Indicators (ring opsiyonel), §21 Streak.

#### 3.13 Calendar / Heatmap — `Screen` · `(tabs)/(journey)/calendar`
- **Amaç:** Gün bazında desen görünürlüğü sağlamak, olmadan "skor" hissi vermeden.
- **Ana işler:** Ay/hafta gezinme, gün hücresine dokunup o günün olaylarına bakma, davranışa göre filtreleme.
- **Primary CTA:** Gün hücresine dokunma → o günün mini özeti (sheet).
- **Secondary actions:** Davranış filtre seçici, ay değiştirme okları.
- **Ana component'ler:** Heatmap grid (§23 — şekil+etiket, renk tek taşıyıcı değil), filtre chip'leri.
- **Gösterilecek veri:** Günlük plan-uyum/zor-gün/veri-yok 3 durumlu hücreler.
- **Empty state:** Tüm hücreler nötr "veri yok" durumunda, boş=başarısızlık değil mesajı üstte.
- **Loading state:** Skeleton grid.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Journey Overview, Behavior Detail.
- **Çıkış/hedef yolları:** Gün detay sheet'i, ilgili Journal entry'sine (o gün bir not varsa) link.
- **İlgili modal/sheet:** Gün detay sheet (adhoc, ayrı route değil).
- **DESIGN.md kuralları:** §23 Calendar/Heatmap (3 durumlu, saturasyon-skor yasağı).

#### 3.14 Statistics / Insights (Explore) — `Screen` · `(tabs)/(journey)/insights`
- **Amaç:** "Ne öğreniyorum?" sorusuna kanıt temelli, ihtiyatlı yanıt vermek — trigger kartları, zaman dağılımı, müdahale etkinliği.
- **Ana işler:** Trigger/pattern kartlarını okuma, "bu bana doğru geliyor mu?" ile doğrulama, önerilen bir Pause Plan'ı deneme.
- **Primary CTA:** Insight kartındaki "Bunu test etmek ister misin?" aksiyonu.
- **Secondary actions:** "Bu doğru değil" / "Bu kartı gizle", zaman şeridi ve basit çubuk grafik arasında geçiş.
- **Ana component'ler:** AI/Insight Card (§30 — yeterli veri yoksa rule-based, V1.1'de AI-narrated), Chart (§22, her zaman kanıt satırıyla), Trigger taksonomi chip'leri.
- **Gösterilecek veri:** Yalnızca eşik karşılanan (§ araştırma "istatistiksel güvenlik çiti": 8+/12+ olay) pattern'ler; altında değilse "daha çok örnek topluyoruz" nötr mesajı.
- **Empty state:** "Henüz yeterli veri yok" + ne kadar kaldığı bilgisi (ör. "3 kayıt daha").
- **Loading state:** Skeleton kartlar.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline — insight engine cihazda çalışır (bkz. araştırma "Rule-first, AI-second").
- **Giriş yolları:** Journey Overview "İstatistikleri gör".
- **Çıkış/hedef yolları:** İlgili davranışın Behavior Detail'i, Pause Plan düzenleme (Behavior Builder'ın plan bölümü).
- **İlgili modal/sheet:** `insight-detail` sheet (bir kartın tam kanıt paketini gösterir).
- **DESIGN.md kuralları:** §22 Charts (pie/dual-axis yasağı, kanıt satırı zorunlu), §30 AI Insight Cards.

#### 3.15 Weekly Review — `Modal Screen` · `(modals)/weekly-review`
- **Amaç:** Haftalık, kural tabanlı 1–2 içgörü + mikro plan önerisiyle öğrenme döngüsünü kapatmak.
- **Ana işler:** Haftanın özetini okuma, önerilen mikro planı kabul etme/reddetme.
- **Primary CTA:** "Bu planı dene" veya "Anladım, kapat".
- **Secondary actions:** "Bu bana doğru gelmiyor" geri bildirimi.
- **Ana component'ler:** Evidence Card, tek CTA.
- **Gösterilecek veri:** Haftalık event özeti, evidence paketi.
- **Empty state:** Yeterli veri yoksa bu modal hiç tetiklenmez (bildirim de gitmez).
- **Loading state:** Yok (rule-based hesap anlık).
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Haftalık opt-in bildirim, Journey Overview kartı.
- **Çıkış/hedef yolları:** Journey Overview'a döner; plan kabul edilirse Behavior Detail plan bölümüne.
- **İlgili modal/sheet:** Kendisi modal.
- **DESIGN.md kuralları:** §30 AI Insight Cards (rule-based versiyonu da aynı görsel dili kullanır), §18 Modals.
- **Kapsam notu:** MVP'de kural-tabanlı; AI-narrated doğal dil anlatımı V1.1.

#### 3.16 Health & Personal Benefits Timeline — `Screen` · `(tabs)/(journey)/behaviors/[id]/benefits`
- **Amaç:** Kategoriye özgü (öncelikle sigara/nikotin) somut fayda zaman çizelgesini göstermek — tıbbi iddia olmadan, kamu sağlığı kaynaklarına dayalı genel bilgi.
- **Ana işler:** Zaman çizelgesinde ilerlemeyi görme (ör. "20 dk: nabzın normale döner" tarzı genel, kaynaklı bilgi kartları).
- **Primary CTA:** Yok (bilgilendirici, salt-okunur ekran).
- **Secondary actions:** İlgili kaynağa link (Sources bölümü referansı).
- **Ana component'ler:** Dikey timeline, her adım bir Card.
- **Gösterilecek veri:** Kategoriye göre önceden tanımlı editoryal içerik + kullanıcının clean-time'ına göre hangi adımların "geçildi" işaretlendiği.
- **Empty state:** N/A (davranış kategoriye uygun değilse bu ekran menüde hiç görünmez).
- **Loading state:** Skeleton.
- **Error state:** Standart.
- **Offline davranışı:** İçerik cihazda paketli gelir, tamamen offline.
- **Giriş yolları:** Behavior Detail.
- **Çıkış/hedef yolları:** Behavior Detail'e geri.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards, tıbbi iddia yasağı (ürün politikası).

#### 3.17 Milestone Celebration — `Modal (auto-triggered)` · `(modals)/milestone-celebration`
- **Amaç:** Anlamlı bir eşiğe ulaşıldığında tek, ölçülü bir an yaratmak.
- **Ana işler:** Kutlamayı görme, arşive kaydetme.
- **Primary CTA:** "Devam et" (kapatır, Journey timeline'ına arşivlenir).
- **Secondary actions:** Yok.
- **Ana component'ler:** Milestone Card (§26 — bronze ince border, confetti yok).
- **Gösterilecek veri:** Ulaşılan eşik, spesifik onay metni.
- **Empty state:** N/A.
- **Loading state:** N/A.
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline, local eşik hesaplaması.
- **Giriş yolları:** Otomatik tetiklenir (eşik karşılandığında, ilk açılışta).
- **Çıkış/hedef yolları:** Kapanınca tetiklendiği ekrana (genelde Today veya Journey) döner.
- **İlgili modal/sheet:** Kendisi modal.
- **DESIGN.md kuralları:** §26 Milestone Components (bu bölüm bu ekran için yazıldı), §41 haptics (`notificationSuccess`, tek sefer).

---

### D. Günlük (Journal) Tab

#### 3.18 Journal List — `Screen` · tab kökü, `(tabs)/(journal)/index`
- **Amaç:** Mikro not, günün sorusu yanıtları ve serbest journal girişlerini kronolojik, tek akışta toplamak.
- **Ana işler:** Geçmiş entry'leri tarama, yeni entry başlatma, arama.
- **Primary CTA:** "Yeni not" (FAB veya üst bar aksiyonu → Journal Composer).
- **Secondary actions:** Arama ikonu → Search modal, filtre (mood/davranış etiketine göre).
- **Ana component'ler:** Entry satır kartları (§28 — ilk satır + Caption zaman + opsiyonel etiket chip).
- **Gösterilecek veri:** Tüm journal entry'leri (mikro not + serbest + check-in yanıtları), en yeni üstte.
- **Empty state:** "Henüz bir şey yazmadın. İstediğinde, istediğin kadar." + "Yeni not" CTA.
- **Loading state:** Skeleton satırlar.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Tab bar "Günlük".
- **Çıkış/hedef yolları:** Journal Composer, Journal Entry Detail, Search, Educational Library (üst bar ikincil link).
- **İlgili modal/sheet:** `search`.
- **DESIGN.md kuralları:** §28 Journal UI, §33 Empty States.

#### 3.19 Journal Composer (Yeni Entry) — `Screen` · `(tabs)/(journal)/new`
- **Amaç:** Serbest yazma için sürtünmesiz bir "kağıt" deneyimi sunmak.
- **Ana işler:** Yazma (metin/ses), opsiyonel bir olaya bağlama, opsiyonel etiket ekleme.
- **Primary CTA:** "Kaydet" (üst bar, sürekli erişilebilir).
- **Secondary actions:** Ses kaydına geçiş, "Bir olaya bağla" (event picker).
- **Ana component'ler:** Full-bleed composer (§28 — görünür kutu yok), waveform (ses girişinde).
- **Gösterilecek veri:** Bağlanan event varsa özet chip'i.
- **Empty state:** Placeholder metin (yazma alanı için).
- **Loading state:** N/A (anlık local taslak kaydı).
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline; ses ham dosyası varsayılan olarak buluta gitmez.
- **Giriş yolları:** Journal List "Yeni not", Quick Log/Craving-Help sonrası "Kısaca ne oldu?" teklifi, app-icon long-press.
- **Çıkış/hedef yolları:** Kaydedince Journal List'e veya Journal Entry Detail'e döner.
- **İlgili modal/sheet:** `journal-ai-summarize` (V1.1, açık kullanıcı eylemiyle).
- **DESIGN.md kuralları:** §28 Journal UI (composer, waveform, AI özetleme butonu kuralları).

#### 3.20 Journal Entry Detail — `Screen` · `(tabs)/(journal)/[id]`
- **Amaç:** Geçmiş bir entry'yi okuma/düzenleme.
- **Ana işler:** Okuma, düzenleme, silme, dışa aktarma, (V1.1) AI özetleme isteği.
- **Primary CTA:** "Düzenle".
- **Secondary actions:** "Sil", "Dışa aktar", (V1.1) "Bu notu özetle".
- **Ana component'ler:** Serif accent başlık (tarih/bağlam), Body Large metin gövdesi.
- **Gösterilecek veri:** Entry metni/sesi, bağlı event varsa özeti, etiketler.
- **Empty state:** N/A.
- **Loading state:** Skeleton.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Journal List satırı, Calendar gün detayından link.
- **Çıkış/hedef yolları:** Journal Composer (düzenleme modu), Journal List (silme sonrası).
- **İlgili modal/sheet:** Silme onayı (adhoc confirm modal, §18).
- **DESIGN.md kuralları:** §28 Journal UI (serif accent kuralı burada).

#### 3.21 Educational & Personal Development Library — `Screen` · `(tabs)/(journal)/library`
- **Amaç:** Editoryal, kaynaklı bilgi içeriği ile kişisel gelişim/destek alışkanlığı içeriğini tek kütüphanede sunmak (araştırma "Daily Motivation Content", "Personal Development" bölümleri).
- **Ana işler:** İçerik tarama (kategoriye göre filtre), favorileme, destek alışkanlığı seçme/düzenleme.
- **Primary CTA:** İçerik kartına dokunma → tam içerik.
- **Secondary actions:** Favorile, "Destek alışkanlığımı değiştir".
- **Ana component'ler:** İçerik kartları (kısa pratik / derin reflection / uzman incelemeli bilgi etiketiyle), destek-alışkanlığı seçici.
- **Gösterilecek veri:** Editoryal kütüphane (insan yazımı, MVP'de AI üretimi yok), kullanıcının favorileri.
- **Empty state:** N/A (kütüphane her zaman dolu gelir).
- **Loading state:** Skeleton kartlar (paketli içerik olduğu için nadiren görünür).
- **Error state:** Standart.
- **Offline davranışı:** İçerik cihazla birlikte paketlenir/önceden indirilir, tamamen offline.
- **Giriş yolları:** Journal List üst bar ikincil link, Today "kısa editoryal not" kartından "devamını oku".
- **Çıkış/hedef yolları:** İçerik detay (adhoc route değil, aynı ekranda genişler), Behavior Detail (destek alışkanlığı davranışla ilişkiliyse).
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards, §6 serif accent (derin reflection içeriklerinde opsiyonel).

---

### E. Sen (You) Tab

#### 3.22 Profile — `Screen` · tab kökü, `(tabs)/(you)/index`
- **Amaç:** Kullanıcının kendi kimliği, Reasons Vault/Future-Self'e ve ayarlara giden kapı.
- **Ana işler:** Genel ilerleme özetini görme, Reasons Vault & Future Self'e erişme, ayarlara geçiş.
- **Primary CTA:** "Ayarlar" veya en üstte ilgili bölüme hızlı linkler.
- **Secondary actions:** "Kendime notlar" (Reasons Vault & Future Self), "Verilerimi dışa aktar" kısayolu.
- **Ana component'ler:** Basit özet kartı, liste-stili menü satırları.
- **Gösterilecek veri:** Aktif davranış sayısı, hesap durumu (local-only / sync açık).
- **Empty state:** N/A.
- **Loading state:** Skeleton.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Tab bar "Sen".
- **Çıkış/hedef yolları:** Settings, Reasons Vault & Future Self, Subscription/Premium.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards, §16 Top Navigation.

#### 3.23 Reasons Vault & Future Self ("Kendime notlar") — `Screen` · `(tabs)/(you)/notes`
- **Amaç:** Değişim nedenlerini ve gelecekteki-benden notları yönetmek; Craving-Help'in beslendiği kişisel kaynak.
- **Ana işler:** Neden/not ekleme-düzenleme-silme, gösterim tetikleyicisi seçme (zor an modu / planlanan tarih / slip sonrası).
- **Primary CTA:** "Yeni not ekle".
- **Secondary actions:** Sırala/favorile ("Bunu gördüm, devam et" / "şimdi uygun değil").
- **Ana component'ler:** Not kartları, serif accent tam-ekran önizleme.
- **Gösterilecek veri:** Kullanıcının kendi metni/fotoğrafı (fotoğraf yalnızca açık seçimle).
- **Empty state:** Onboarding'de girilen tek neden zaten burada olduğu için tam boş nadiren görülür; "İkinci bir not eklemek ister misin?" nazik teklif.
- **Loading state:** Skeleton.
- **Error state:** Standart.
- **Offline davranışı:** Tamamen offline; fotoğraf bulut senkronuna girmeden önce açık seçim gerekir.
- **Giriş yolları:** Profile, Behavior Detail, Craving-Help (salt-okunur gösterim, buradan direkt düzenleme yok).
- **Çıkış/hedef yolları:** Not düzenleme formu (adhoc sheet).
- **İlgili modal/sheet:** Not ekleme/düzenleme sheet'i.
- **DESIGN.md kuralları:** §6 serif accent, §28 benzeri composer mantığı.

#### 3.24 Settings (root) — `Screen` · `(tabs)/(you)/settings`
- **Amaç:** Tüm uygulama ayarlarına tek merkezden erişim.
- **Ana işler:** Bildirim, gizlilik/güvenlik, görünüm (light/dark/otomatik), dil, senkron, abonelik bölümlerine gitme.
- **Primary CTA:** Yok (liste ekranı).
- **Secondary actions:** Her satır kendi hedefine gider.
- **Ana component'ler:** Gruplu liste satırları (icon + Label + chevron).
- **Gösterilecek veri:** Mevcut ayar özetleri (ör. "Bildirimler: Açık", "Görünüm: Sistem").
- **Empty state:** N/A.
- **Loading state:** N/A.
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline (senkron durumu hariç tüm ayarlar local).
- **Giriş yolları:** Profile "Ayarlar".
- **Çıkış/hedef yolları:** Notification Settings, Privacy & Security, Data Export/Delete, Subscription/Premium, Authentication (senkron açma).
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards / liste satırı varyantı.

#### 3.25 Notification Settings — `Screen` · `(tabs)/(you)/settings/notifications`
- **Amaç:** Bildirim türlerini, sessiz saatleri ve önizleme gizliliğini kullanıcı kontrolüne vermek.
- **Ana işler:** Her bildirim türünü aç/kapat (varsayılan çoğu kapalı, araştırma tablosuna uygun), sessiz saat aralığı belirleme, önizleme modu seçme (genel/özel/kapalı).
- **Primary CTA:** Yok (toggle listesi).
- **Secondary actions:** "Sıklığı azalt" önerisi (3 kez art arda kaçırma tespit edilirse otomatik teklif).
- **Ana component'ler:** Toggle satırları, segmented önizleme seçici.
- **Gösterilecek veri:** Mevcut bildirim tercihleri.
- **Empty state:** N/A.
- **Loading state:** N/A.
- **Error state:** OS izni reddedilmişse inline uyarı + sistem ayarına link.
- **Offline davranışı:** Tamamen offline (tercihler local).
- **Giriş yolları:** Settings, Notification Center ghost linki.
- **Çıkış/hedef yolları:** Settings'e geri.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards.

#### 3.26 Privacy & Security Settings — `Screen` · `(tabs)/(you)/settings/privacy`
- **Amaç:** Local-first güven sözleşmesinin somut kontrollerini sunmak.
- **Ana işler:** App Lock (biyometri/PIN) açma, AI veri izinlerini yönetme (V1.1), hangi AI hafıza kartlarının tutulduğunu görme/silme (V1.1), SDK/analitik şeffaflığını okuma.
- **Primary CTA:** "Uygulama kilidini aç" (toggle).
- **Secondary actions:** "AI izinlerini yönet" (V1.1), "Analitik hakkında".
- **Ana component'ler:** Toggle satırları, açıklama blokları (izin ekranından önce "neden bu veri" metni).
- **Gösterilecek veri:** Mevcut gizlilik tercihleri.
- **Empty state:** N/A.
- **Loading state:** N/A.
- **Error state:** Biyometri kurulu değilse nazik uyarı + OS ayarına link.
- **Offline davranışı:** Tamamen offline.
- **Giriş yolları:** Settings.
- **Çıkış/hedef yolları:** App Lock kurulum akışı (adhoc), Data Export/Delete.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §14 Cards, §18 Modals (izin onayları modal formatında).

#### 3.27 App Lock (Biyometri/PIN gate) — `Screen (gate)` · `applock/`
- **Amaç:** Uygulama açılışında ve hassas ekranlarda (Journal, Reasons Vault) kullanıcı kontrollü kilit.
- **Ana işler:** Biyometri/PIN doğrulama.
- **Primary CTA:** Biyometri istemi (otomatik) veya PIN girişi.
- **Secondary actions:** "PIN ile gir" (biyometri başarısızsa fallback).
- **Ana component'ler:** Basit merkezi ikon + PIN keypad.
- **Gösterilecek veri:** Yok.
- **Empty state:** N/A.
- **Loading state:** Biyometri doğrulama anlık spinner.
- **Error state:** Yanlış PIN → inline `terracotta` uyarı, deneme sınırı sonrası soğuma süresi.
- **Offline davranışı:** Tamamen offline (cihaz üstü biyometri/keychain).
- **Giriş yolları:** Uygulama her açılışında (kilit açıksa), arka plandan öne gelişte (opsiyonel ayar).
- **Çıkış/hedef yolları:** Başarılı doğrulamada son kaldığı ekrana veya Today'e.
- **İlgili modal/sheet:** Yok.
- **DESIGN.md kuralları:** §34 Error States, minimal/ nötr tasarım.
- **Önemli:** Craving-Help deep link'i (widget/bildirim), kilit açıksa önce App Lock'tan geçer ama **PIN girildikten hemen sonra doğrudan Craving-Help'e** yönlenir — Today'e uğramaz (adım sayısını artırmama ilkesi).

#### 3.28 Data Export / Delete — `Screen` · `(tabs)/(you)/settings/data`
- **Amaç:** Veri sahipliğini somutlaştırmak — export ve silme hiçbir zaman kilitlenmez.
- **Ana işler:** Tüm veriyi dışa aktarma (JSON/PDF), tekil davranış/journal silme, tüm hesabı/veriyi silme.
- **Primary CTA:** "Verilerimi dışa aktar".
- **Secondary actions:** "Hesabı ve tüm verileri sil" (Critical stil, çift onaylı).
- **Ana component'ler:** İki net bölüm (Export / Delete), Critical button (§12).
- **Gösterilecek veri:** Yaklaşık veri boyutu/kayıt sayısı özeti.
- **Empty state:** N/A.
- **Loading state:** Export sırasında ilerleme göstergesi (büyük veri setlerinde).
- **Error state:** Export başarısızsa toast + tekrar dene.
- **Offline davranışı:** Export ve silme tamamen offline çalışır (local dosyaya export).
- **Giriş yolları:** Settings, Privacy & Security.
- **Çıkış/hedef yolları:** Silme sonrası Onboarding'e döner (uygulama sıfırlanmış olur).
- **İlgili modal/sheet:** Silme onay modalı (çift onay, §18).
- **DESIGN.md kuralları:** §12 Critical button, §18 Modals — bu ekran hiçbir zaman premium kilidi taşımaz.

#### 3.29 Subscription / Premium — `Screen` · `(tabs)/(you)/settings/premium`
- **Amaç:** Mevcut aboneliği yönetmek, premium içeriği şeffaf biçimde göstermek.
- **Ana işler:** Plan görüntüleme, yükseltme/iptal, satın alma geçmişi.
- **Primary CTA:** "Premium'a geç" (aktif değilse) / "Aboneliği yönet" (aktifse, OS store'a yönlenir).
- **Secondary actions:** "Neyi ücretsiz kullanıyorum" özet linki.
- **Ana component'ler:** Plan kartı, özellik satırları.
- **Gösterilecek veri:** Mevcut plan durumu, yenileme tarihi.
- **Empty state:** N/A.
- **Loading state:** Store bilgisi çekilirken skeleton.
- **Error state:** Store bağlantı hatası → toast + tekrar dene.
- **Offline davranışı:** Görüntüleme offline mümkün (son bilinen durum), satın alma için bağlantı gerekir.
- **Giriş yolları:** Settings, Profile, kilitli özellik dokunuşu (§37 lock icon).
- **Çıkış/hedef yolları:** Paywall (yükseltme akışı).
- **İlgili modal/sheet:** `paywall`.
- **DESIGN.md kuralları:** §37 Paywall/Premium ilkeleri.

#### 3.30 Paywall — `Modal Screen` · `(modals)/paywall`
- **Amaç:** Premium'a geçişi tek, sakin ekranda sunmak — asla kesintiye zorlamadan.
- **Ana işler:** Fiyat/plan karşılaştırma, satın alma.
- **Primary CTA:** "Devam et" (seçili plan ile satın alma).
- **Secondary actions:** "Belki sonra" (ghost, eşit ağırlıkta).
- **Ana component'ler:** 3–5 özellik satırı, tek fiyat bloğu.
- **Gösterilecek veri:** Plan seçenekleri, fiyat, yenileme koşulları.
- **Empty state:** N/A.
- **Loading state:** Satın alma sırasında buton içi spinner.
- **Error state:** Store hatası → inline mesaj, işlem iptal edilebilir.
- **Offline davranışı:** Görüntülenebilir ama satın alma için bağlantı gerekir; çevrimdışıyken net bilgilendirme.
- **Giriş yolları:** Subscription/Premium ekranı, kilitli özellik dokunuşu — **asla** craving-help/relapse/export/delete akışlarından tetiklenmez.
- **Çıkış/hedef yolları:** Başarılı satın almada tetikleyici ekrana geri (artık kilidi açık).
- **İlgili modal/sheet:** Kendisi modal.
- **DESIGN.md kuralları:** §37 (bu bölüm bu ekran için yazıldı) — sahte indirim/geri sayım/sosyal baskı yasağı.

---

### F. Global / Cross-cutting

#### 3.31 Search — `Modal` · `(modals)/search`
- **Amaç:** Journal ve içerik kütüphanesinde hızlı arama.
- **Ana işler:** Metin arama, sonuçlara gitme.
- **Primary CTA:** Sonuç satırına dokunma.
- **Secondary actions:** Filtre (Journal / Kütüphane).
- **Ana component'ler:** Arama input'u (üstte, otomatik odak), sonuç listesi.
- **Gösterilecek veri:** Eşleşen journal entry'leri ve kütüphane içerikleri.
- **Empty state:** "Sonuç bulunamadı".
- **Loading state:** Anlık (local full-text arama), gerekiyorsa ince spinner.
- **Error state:** N/A.
- **Offline davranışı:** Tamamen offline (local index).
- **Giriş yolları:** Journal List, Library üst bar arama ikonu.
- **Çıkış/hedef yolları:** Journal Entry Detail, Library içerik detayı.
- **İlgili modal/sheet:** Kendisi modal.
- **DESIGN.md kuralları:** §11 Input, §33 Empty States.
- **Not:** Journal aramasında arama sonuçları uygulama değiştiricide (app switcher preview) ve ekran görüntüsünde otomatik gizlenir (gizlilik ilkesi).

#### 3.32 AI Coach (bağlamsal) — `Contextual Sheet/Inline` · çeşitli host ekranlar içinde
- **Amaç:** Ayrı bir chatbot değil; Journal özetleme, Weekly Review anlatımı ve Craving-Help plan önerisi gibi noktalarda **davet edildiğinde** devreye giren bir katman.
- **Ana işler:** (V1.1) Journal entry özetleme, kullanıcının planını cümleleştirme, (V2) açık uçlu soru sorma — bu sonuncusu MVP/V1.1 kapsamında değil.
- **Primary CTA:** Her zaman kullanıcının açık eylemiyle başlar ("Bu notu özetle" gibi) — otomatik açılmaz.
- **Secondary actions:** "Bu doğru değil", "Bu kartı gizle".
- **Ana component'ler:** §29 AI Coach UI (violet accent, mesaj balonları).
- **Gösterilecek veri:** Yalnızca kullanıcının o an açıkça seçtiği veri.
- **Empty state:** N/A (talebe bağlı render).
- **Loading state:** "Hazırlanıyor" + ince indigo spinner (§20).
- **Error state:** Model/servis hatası → nötr toast, "tekrar dene".
- **Offline davranışı:** AI özellikleri bağlantı gerektirir; çevrimdışıyken buton disabled + "İnternet gerekiyor" notu, çekirdek ekran işlevini etkilemez.
- **Giriş yolları:** Journal Entry Detail, Weekly Review, Statistics/Insights (insight anlatımı).
- **Çıkış/hedef yolları:** Host ekrana geri.
- **İlgili modal/sheet:** Sheet olarak host ekranın üzerine açılır, tam ekran chatbot'a asla geçmez.
- **DESIGN.md kuralları:** §29 AI Coach UI, §30 AI Insight Cards.
- **Kapsam notu:** MVP'de tamamen yok. V1.1'de yalnızca özetleme/etiket önerisi. Açık uçlu sohbet V2/Future.

#### 3.33 AI Insights (bağlamsal) — bkz. 3.14 Statistics/Insights ve 3.15 Weekly Review içine gömülüdür; bağımsız ekranı yoktur.

---

## 4. Gömülü bileşen eşleme tablosu

Aşağıdaki, kullanıcı isteğindeki maddelerden bağımsız bir route almayan, bir ana ekranın içine gömülü olan kavramların nerede yaşadığını gösterir.

| İstek listesi maddesi | Yaşadığı yer | Neden bağımsız ekran değil |
|---|---|---|
| Clean-time / Streak | Today hero kart + Behavior Detail | Streak MVP metriği değil; Journey'nin gölgesinde kalmalı (§21) |
| Trigger kayıtları | Quick Log detay alanı (bağlam etiketi) + Statistics/Insights trigger kartları | Ayrı bir "trigger log" ekranı, Quick Log'un basitliğini bozar |
| Mood tracking | Quick Log detay alanı + Daily Check-in + Journal entry etiketi | Mood tek başına bir hedef değil, bağlam değişkenidir |
| Daily motivation | Today "editoryal not" kartı + Library'de arşiv | Ayrı ekran "quote app" hissi yaratır, ürün buna karşı |
| Evening reflection | Today'de gün sonunda beliren özel kart varyantı + Journal'a kaydedilir | Sabah/akşam aynı ekranın zaman-duyarlı varyantları |
| Achievements | Journey Milestone timeline'ı ile birleşik | Ayrı rozet rafı gamification'ı çocuklaştırır (Do/Don't) |
| Money saved / Time saved | Behavior Detail stat kartları | Davranışa özgü, bağımsız anlamı yok |
| Health / personal benefits | Behavior Detail → Health & Benefits Timeline (yalnızca uygun kategoride) | Kategoriye özgü, her davranışta anlamlı değil |
| Personal development content | Library (Educational content ile birleşik) + Today destek-alışkanlığı kartı | İçerik omurgası ortak, ayrımı sekme değil filtre |
| AI Insights | Statistics/Insights + Weekly Review | Bağımsız bir "AI" ekranı, "her şeyi ele geçiren chatbot" hissi yaratır (ürün kısıtı) |

---

## 5. Kapsam ayrımı

### MVP

Araştırmanın P0 setiyle birebir: bu olmadan ürün tezini ("Kendini yargılamadan dur, seç ve öğren") test edemeyiz.

- Onboarding Flow, Behavior Builder
- Today / Home, Notification Center
- Daily Check-in, Quick Log, Emergency/Craving-Help, Relapse & Recovery Flow
- Journey Overview, Active Behaviors, Behavior Detail, Calendar/Heatmap, Statistics/Insights (yalnızca rule-based), Weekly Review (rule-based), Milestone Celebration
- Journal List, Journal Composer, Journal Entry Detail, Educational & Personal Development Library (statik editoryal içerik)
- Profile, Reasons Vault & Future Self, Settings (root), Notification Settings, Privacy & Security, App Lock, Data Export/Delete
- Odak şablonları: Sigara/Nikotin, Telefon/Sosyal Medya, Custom
- Global Emergency shortcut (FAB), tüm deep link giriş noktaları (widget hariç — widget V1.1)

**MVP'de bilerek olmayanlar:** Authentication/sync, Subscription/Premium, Paywall, AI Coach, AI-narrated insight, Health & Benefits Timeline (yalnızca içerik hazırsa dahil edilir, yoksa V1.1), Search (Journal küçükken kritik değil), Widget.

### V1.1

Ürün tezi doğrulandıktan (MVP'nin 3 sorusu olumlu yanıtlandıktan) sonra eklenecekler — kullanıcı değeri hâlâ yüksek ama güvenlik/olgunluk ön koşulu olanlar.

- Authentication (opsiyonel sync), Subscription/Premium, Paywall
- AI Coach (yalnızca özetleme/etiket önerisi/plan cümleleştirme), AI-narrated Weekly Review ve Insight kartları
- Search
- Health & Benefits Timeline (kategori genişlemesiyle)
- Widget / lock-screen kısayolları
- Sesli journal, genişletilmiş custom behavior şablonları
- İkinci aktif davranış açma (portföy genişlemesi)

### Future

Ayrı güvenlik/klinik/operasyonel paket gerektiren, MVP tezini doğrulamadan yatırım yapılmaması gereken alanlar.

- Açık uçlu AI sohbet ("terapist" algısı riski)
- Proaktif AI
- Invite-only buddy / herhangi bir sosyal katman
- OS-seviyesi screen blocker
- Wearable entegrasyonu
- Yüksek riskli kategoriler (alkol, kumar, yeme, cinsel davranış, ilişki-recovery) — klinik danışma kurulu onayı olmadan
- Health platform (Apple Health/Google Fit) entegrasyonu
- Klinisyen paylaşım export'u
