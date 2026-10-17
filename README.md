# BOT TLEWGRAM

**Telegram için sessiz haber, moderasyon ve özel asistan botu.**

> **Canlı durum · 17 Ekim 2026:** [@TLEWGRAM_bot](https://t.me/TLEWGRAM_bot) özel mesajlarda `/start`, `/kimim` ve yönetici `/panel` komutlarına yanıt verdi; ekran görüntüsüyle doğrulandı. Google Apps Script `setupBot` çalıştı, kontrol aralığı **5 dakika**. **Grup kimliği, RSS kaynakları ve AI anahtarı henüz eklenmedi.** Son panelde yayın AÇIK (manuel) göründü; ancak grup bağlantısı olmadığı için çalışacak hedefi yok, diğer iki mod kapalı.

## Kullanılan mimari

```text
Telegram @TLEWGRAM_bot
       ↕  getUpdates (5 dakika / Google tetikleyicisi)
Google Apps Script (Google Sheets'e bağlı Code.gs)
       ↕
Google Sheets (users, news, digests, errors)
       ↳ Gerekirse OpenAI API (şimdilik kapalı)
```

**Cloudflare Worker, D1, webhook, ayrı sunucu ve Telegram Mini App gerekmiyor.** Yönetici butonları botun özel sohbetindeki `/panel` komutundadır. Çoğu yönetim işlemi mobil Telegram'dan yapılır.

## Proje dosyaları

| Amaç | Bağlantı |
| --- | --- |
| Aktif mimarinin kodu | [apps-script/Code.gs](apps-script/Code.gs) |
| Google kurulum adımları | [apps-script/README.md](apps-script/README.md) |
| Kullanım, hata çözümü, geri alma | [apps-script/OPERATIONS.md](apps-script/OPERATIONS.md) |
| Otomatik testler | [apps-script/test.mjs](apps-script/test.mjs) |
| Google yönetim ve takip tablosu | [Google Sheets](https://docs.google.com/spreadsheets/d/1h_YTc1DPpkDhZpZJTBNXMga04E6ut-fyAO6t4U3sqWM/edit) |
| Telegram grup bağlantısı ve testler | [Görev #4](https://github.com/onurqlp/BOT-TLEWGRAM-/issues/4) |
| Google kurulum durumu | [Görev #5](https://github.com/onurqlp/BOT-TLEWGRAM-/issues/5) |
| Eski Cloudflare alternatifi | [Arşiv dokümanı](docs/LEGACY_CLOUDFLARE.md) |

## Özellikler ve güvenli başlangıç

- **Haber:** İzinli RSS kaynaklarını topla; günlük tek taslak oluştur; **yönetici ayrıca onaylarsa** ana gruba sessiz mesaj gönder.
- **Üye deneyimi:** Otomatik grup karşılama mesajı yok; DM yalnızca kullanıcı önce botu başlattığında veya kendi isteğiyle haber aboneliği açtığında.
- **Anti-spam:** Varsayılan **kapalı**; açılırsa kurallara göre mesaj siler. **Anlık koruma değildir**, bir sonraki polling çalışmasına bağlıdır.
- **AI:** Varsayılan **kapalı**; kullanıcı başına 5 soru/gün ve toplam 1500 istek/ay sınırı; harici AI API ücretlidir.
- **Yönetim (V0.5.0 kaynak):** Telegram'da özel `/panel` üzerinden **mesaj tabanlı düğmeler** (eski zaman aşımına giren inline callback düğmeleri kaldırıldı). `/hepsiniac` yalnızca gerekli grup ve AI ayarları varsa ilgili modları açar. Haber gönderimi yine ayrı iki aşamalı yönetici onayı gerektirir.
- **Rapor:** Pazartesi yöneticiye özel ve sessiz mesaj; yalnızca botun gözlemleyebildiği olayları raporlar.

## V0.5.0: Telegram üzerinden ilk kurulum

GitHub sürümü bir kez Google Apps Script'e aktarıldıktan sonra yönetici özel sohbetinde `/kurulum` ile eksikleri görür. Bot Telegram grubuna eklendikten sonra grup içinde `/bagla` komutu, `TELEGRAM_GROUP_ID` değerini otomatik kaydeder. Özel sohbetten `/kaynak https://ornek.com/rss` ile RSS eklenir; `/kaynaklar`, `/kaynaksil 1` ve `/habercek` kullanılabilir. `/hepsiniac` yalnızca gereksinimleri karşılanan özellikleri açar. Ücretli AI için `OPENAI_API_KEY` yalnızca Google Script Properties içine girilir.

**Grupta bir yöneticinin açıkça /bagla yazması gerekir; bot kendisini Telegram grubuna ekleyemez.** Haber konusu belli olmadığı için rastgele kaynak seçilmedi.

## GitHub ve çalışan Google kodu farklı sürümler olabilir

**Repo kaynak sürümü: V0.5.0.** Otomatik testler bu kaynağı denetler. **Google Apps Script'te çalışan kurulumun V0.3.0 olduğu en son Telegram paneli ekran görüntüsünde doğrulandı.** GitHub'a kod göndermek Google'daki scripti otomatik güncellemez.

İleride kod güncellenecekse, Apps Script editöründen mevcut kodun bir kopyasını sakla; GitHub'daki `apps-script/Code.gs` dosyasının tamamını yapıştır; kaydet. Bu işlemde `setupBot` tekrar çalıştırmak genellikle gerekmez; tetikleyici zaten varsa sonraki çalışmada yeni kod kullanılır. `setupBot` yalnızca tetikleyicileri yeniden yapılandırmak gerektiğinde kullanılmalıdır. Yeni kaynak kod canlıya aktarıldıktan sonra önce test grubunda doğrulanmalı.

## Güvenlik, kota ve repo görünürlüğü

Token ve OpenAI anahtarları yalnızca Apps Script **Script Properties** alanındadır. Bunları commit, Issue veya README içine ekleme. Repo şu anda **Public** olduğu için kaynak ve belgeler herkes tarafından okunabilir; hassas kullanım için [repo ayarlarında](https://github.com/onurqlp/BOT-TLEWGRAM-/settings) Private önerilir.

Apps Script zaman tetikleyicileri dakika hassasiyetinde garanti vermez; düşük/orta trafikli pilotlar için uygundur. GitHub testlerinin yeşil olması Telegram, haber kaynakları, AI veya Google'ın günlük kota sınırlarının uçtan uca test edildiği anlamına **gelmez**.

**Eski Cloudflare Workers/D1 dosyaları** (ör. `src/`, `migrations/`, `wrangler.jsonc`) alternatif olarak saklanır, aktif Google Apps Script botuyla bağlantıları yoktur.

Son repo düzenlemesi: 17 Ekim 2026.
