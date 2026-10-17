# BOT TLEWGRAM — Sürüm geçmişi

## V0.3.1 — GitHub kaynak kodu (17.10.2026)

**GitHub'da hazırlandı, henüz Google Apps Script canlı editörüne aktarılmadı.**

- Telegram `getUpdates` işlemi en fazla 120 mesaj ve 25 saniyelik çalışma döngüsüyle sınırlandırıldı.
- Bir güncelleme işlenemediğinde offset ilerletilmiyor; sonraki tetikleyicide tekrar deneniyor. Üç başarısızlıkta hata kaydedilip bir sonraki mesaja geçiliyor.
- RSS/Atom haberinin geçerli tarihi biliniyorsa 7 gün dışındakiler atlanıyor. Günlük haber seçimi en son eklenen içerikleri öne alıyor.
- RSS metninden Google Sheets formül enjeksiyonu engelleniyor.
- Yayın başarılı olduktan sonraki rapor veya admin/abone DM hatası aynı grup mesajını yeniden gönderime sokmuyor.
- AI sağlayıcısına ulaşmış olabilecek başarısız çağrılar için kota yeniden kullanılabilir hâle getirilmiyor.
- Otomatik testler geliştirildi; API anahtarlarının yanlışlıkla commit edilmesini yakalayan temel GitHub Actions denetimi eklendi.
- Cloudflare eski dokümanı ayrı arşive alındı; Google Apps Script güncel çalışma rehberi yazıldı.

## V0.3.0 — Kullanıcı tarafından canlıda doğrulandı

- Google Apps Script + Google Sheets mimarisine geçildi.
- Telegram `@TLEWGRAM_bot` ile özel `/start`, `/kimim`, `/panel` çalışıyor.
- 5 dakika polling tetikleyicisi kurulumu onaylandı.
- Mobil admin düğmeleri Telegram'ın içinde.
- Yayın, moderasyon ve AI kapalı; test grubu ve haber kaynakları henüz tanımlanmadı.

## V0.2.0 — Cloudflare/D1 eski alternatif

- Worker webhook, D1, mobil Mini App ve raporlar için teknik prototip.
- **Güncel kurulumda kullanılmıyor.** Kod geri dönüş alternatifi olarak korunuyor: [Arşiv](docs/LEGACY_CLOUDFLARE.md).

## Sürüm yönetimi

GitHub'a push yapmak mevcut Google Apps Script'i otomatik güncellemez. Son kullanıcı değişiklikleri önce [işletim rehberine](apps-script/OPERATIONS.md) uygun olarak Google editöründe ve test grubunda doğrulanır. Canlı botun sürümü özel Telegram `/panel` mesajında görünür.
