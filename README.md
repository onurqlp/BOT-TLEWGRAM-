# BOT TLEWGRAM V0.2.0 — Sessiz Telegram Topluluk Botu

**Durum: Deploy edilmemiş teknik MVP.** Kaynak kodu `onurqlp/BOT-TLEWGRAM-` deposundadır; Telegram/Cloudflare deploy henüz yapılmamıştır. Canlı gruba erişim veya mesaj gönderimi henüz yapılmamıştır.

## Neler çalışır (bağlandıktan sonra)?
- Cloudflare Worker üzerinden güvenli Telegram webhook (`X-Telegram-Bot-Api-Secret-Token`).
- Cloudflare D1'e kaydedilen üyelik tercihleri, RSS haber kuyruğu, günlük taslak, haftalık bot olayı raporu.
- RSS haberleri linkleriyle listelenir, yalnızca **yönetici mobil panelde onay verince** grup mesajı yayınlanır.
- Üye karşılama gürültüsü yok. `/start`, `/ozet`, `/sor soru`, `/bildirim`, `/sessiz`, `/sil` özel mesajdan kullanılır.
- İsteğe bağlı bot moderasyonu; kesin görülen link flood'u silinir, şüpheliler kayıt olur. Varsayılan KAPALI.
- Yönetici Telegram Mini App paneli, Telegram Web App imza doğrulaması + yönetici allowlist.
- Pazartesi botun gözlemleyebildiği haftalık olay özetini yöneticiye DM ile gönderir.
- AI varsayılan KAPALI. Açılırsa kullanıcı başına 5 soru/gün, toplam 1500 çağrı/ay başlangıç sınırları.

## Üretimden önce / tek seferlik kurulum

1. Mevcut [GitHub deposunda](https://github.com/onurqlp/BOT-TLEWGRAM-) kod hazırdır. Depoyu **private** yap. Token ve gizli anahtar commit etme.
2. Cloudflare hesabında `bot-tlewgram-db` isimli D1 veritabanı oluştur. Gerçek `database_id` değerini `wrangler.jsonc` içine koy.
3. Node 22+ ortamında `npm install`, `npm test`, `npx wrangler d1 migrations apply bot-tlewgram-db --remote` çalıştır.
4. `wrangler.jsonc` içindeki `NEWS_FEEDS` dizisini gerçek konuyla ilgili kaynaklardan oluşacak biçimde gir: `Kaynak adı|https://site/rss.xml;İkinci kaynak|https://site/rss`. Başta **boş** bırakıldı.
5. Cloudflare Secrets'e `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_GROUP_ID`, `ADMIN_USER_IDS`, `PUBLIC_BASE_URL`; AI kullanacaksan `OPENAI_API_KEY` ekle. `TELEGRAM_GROUP_ID` ve `ADMIN_USER_IDS` hassas değil ama servis yapılandırmasında tutulması gerekir.
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
   npx wrangler secret put TELEGRAM_GROUP_ID
   npx wrangler secret put ADMIN_USER_IDS
   npx wrangler secret put PUBLIC_BASE_URL
   npx wrangler secret put OPENAI_API_KEY
   ```
6. `npx wrangler deploy` ile Workeri yükle. Çıkan URL'yi `PUBLIC_BASE_URL` olarak tanımla. İlgili hesapta `BotFather` üzerinden bot tokeni al, gerçek grupta sınırlı yönetici izinleri ver. Önce ayrı test grubunda dene.
7. Yerel terminalde (asla chat içine yazmadan) `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `PUBLIC_BASE_URL` ortam değişkenlerini tanımlayarak `bash scripts/set-webhook.sh` çalıştır.
8. Telegram'da bota özelden `/start` sonra `/panel` yaz. Panelde **AI**, **moderasyon** ve **yayın** kontrolleri başlangıçta kapalı. Testler geçtikten sonra bunları ayrı ayrı aç.
9. Her adımı `docs/TEST_PLAN.md` ile doğrula. Gerçek kullanıcı izni ve gizlilik duyurusu olmadan üretim trafiğine açma.

## Çalışma ayrıntıları
- Günlük cron: `07:00 UTC` = Türkiye 10.00 (yıl boyunca UTC+3). RSS kaynakları okunur ve bir bekleyen günlük taslak oluşturulur. **Otomatik grup gönderimi yapılmaz.**
- Haftalık cron: Pazartesi `08:00 UTC` = Türkiye 11.00. Haftalık bot olay raporu yöneticiye sessiz özel mesaj olarak gider (yönetici botu daha önce başlatmış olmalı).
- DM aboneleri: kullanıcı `/bildirim` derse, **yönetici onaylı yayının özel kopyası** maksimum 30 opt-in aboneye sessiz gönderilir. 30'dan büyük kitlede Queue ile fan-out geliştirilmelidir. Bu bir MVP güvenlik sınırıdır.
- AI haberleri çevrimiçi aramaz; son onaylı haber özeti ve kullanıcı sorusuna dayanır. Güncel sorulara kaynak yoksa kesinlik iddiasında bulunmamalıdır.
- Ham sohbet mesajları saklanmaz. Olaylar 30 gün, AI günlük sayaçları 45 gün tutulur. Telegram kullanıcı kimliği DM tercihi için saklanır; `/sil` ile kaldırılır.

## Bilinen sınırlar
- RSS XML ayrıştırıcısı basittir, bazı Atom/CDATА biçimlerinde öğeler atlanabilir; ilk testlerde kontrol edilmelidir.
- Bot'un göremediği Telegram mesajları ve grup analitiği rapora yansımaz. Grup mesaj görünürlüğü bot yöneticisi ve privacy ayarlarına bağlıdır.
- Aylık AI sınırı D1 UPSERT üzerinden atomik sınırlıdır; yine de **çağrı sınırıdır, dolar bazında gerçek harcama kilidi değildir**. Token tüketimi panelde görünür. Sağlayıcı düzeyinde bütçe ve alarm ayrıca uygulanmalıdır.
- AI aylık toplam ve kişi başı günlük limitleri veritabanının atomik kayıtlarıyla kontrol edilir. Sağlayıcı hatalarında çağrı hakkı tüketilebilir.
- RSS URL tekrar denetimi URL bazlıdır; farklı URL'lerde aynı haber için anlamsal benzerlik tespiti henüz yoktur.
- Bot grup moderator kuralları hakaret tespiti yapmaz; hatalı silme riskini azaltmak için varsayılan kapalıdır.
- Ücretli deployment, canlı Telegram bağlantısı veya diğer repolarda değişiklik yapılmamıştır.

## 0.2.0 güncellemesi — 17.10.2026
- Aylık AI kotası atomik ve token tüketimi ölçümlü hale getirildi.
- AI kayıtlarında kişisel kimlikler azaltıldı; /sil kapsamı genişletildi.
- RSS haber tarih filtresi, HTTPS adres güvenlik kontrolleri ve webhook boyut sınırı.
- Mini App kimlik doğrulama testleri, CI izin daraltması, Dependabot ve kontrol belgeleri.
- Yeniden kurulum: 0001 + 0002 migration sırasıyla uygulanır. Henüz deploy yapılmadı.
