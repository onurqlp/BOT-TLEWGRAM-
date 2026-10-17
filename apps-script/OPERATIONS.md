# BOT TLEWGRAM — İşletim, bakım ve arıza rehberi

**Aktif sistem:** Google Apps Script + Google Sheets, Telegram [@TLEWGRAM_bot](https://t.me/TLEWGRAM_bot). GitHub kaynak kod deposudur; tek başına canlı dağıtım değildir.

## Günlük işletim

| İşlem | Nerede |
|---|---|
| Botu aç, /start veya /ozet gönder | Telegram özel sohbeti |
| Yönetici paneli /panel | Telegram özel sohbeti, yalnızca tanımlı admin |
| Haftalık rapor /rapor | Telegram admin özel sohbeti |
| Haber kaynaklarını seç | Google Apps Script > Proje Ayarları > Script Properties > NEWS_FEEDS |
| Kuyruk, haberler, taslaklar, hatalar | [Google Sheets](https://docs.google.com/spreadsheets/d/1h_YTc1DPpkDhZpZJTBNXMga04E6ut-fyAO6t4U3sqWM/edit) |
| Botun çalışıp çalışmadığı | Apps Script > Yürütmeler (Executions) |
| Kod ve otomatik testler | GitHub > Actions |

### Sessiz mod değişiklikleri

- Yayın, moderasyon, AI **başlangıçta kapalı**. Telegram özel `/panel` içinden ayrı ayrı açılır.
- Yayın için yalnızca butona basmak yetmez: bekleyen taslak ayrıca **Onayla/Gönder** butonuyla onaylanır.
- AI'ı açmadan önce OpenAI API anahtarı, maliyet ve kullanım kotasını kontrol et.
- Moderasyonu gerçek grupta değil, önce test grubunda sınayıp bot yönetici izinlerini en az yetkiyle ayarla.
- Haber aboneliği kullanıcı `/bildirim` komutuyla açılınca çalışır. `/sessiz` kapatır; `/sil` tercih ve kişisel sayaçları kaldırır.

## Arıza giderme

1. **Bot beş dakika cevap vermiyor:** Google Apps Script > Yürütmeler. `pollTelegram` tetikleyicisi açık mı, hata var mı? `pollTelegram` fonksiyonunu bir kez elle çalıştır. Hata tekrar ederse Script Properties değerlerini kontrol et. **Tokeni günlüklere veya GitHub'a kopyalama.**
2. **Telegram 409 conflict:** Aynı token ile başka bir bot uygulaması `getUpdates` çalıştırıyor olabilir; yalnızca tek tüketici kalsın. Webhook eskiyse `setupBot` kurulum sırasında `deleteWebhook(drop_pending_updates:false)` çağırır.
3. **Grup olayları görünmüyor:** `TELEGRAM_GROUP_ID` doğru mu? Grup `/id` ile alınır; botun gerekli yetkileri var mı? Telegram bot gizlilik modunda bazı mesajlar ulaşmayabilir.
4. **Haber yok:** `NEWS_FEEDS` boşsa beklenen davranıştır. Kaynak `https://` olmalı ve cevap HTTP 200 olmalı. RSS/Atom formatı ve son 7 günlük haber olup olmadığı kontrol edilmeli.
5. **AI cevap vermiyor:** Varsayılan kapalıdır. Script Properties `OPENAI_API_KEY`, model erişimi, API bütçesi ve 5/gün, 1500/ay çağrı limitleri kontrol edilmeli. **Başarısız görünen bazı API çağrıları da kota tüketebilir**, sağlayıcı tarafından ücretlendirilmiş olabilir.
6. **Çok fazla mesaj / kaçırılan güncellemeler:** V0.3.1 GitHub sürümü çalıştırma başına 120 güncellemeye veya 25 saniyeye kadar kontrollü kuyruk taraması yapar; yine de Apps Script kotaları ve tetikleyici gecikmesi geçerlidir. Gerçek zamanlı moderasyon için polling doğru mimari olmayabilir.
7. **Bekleyen yayın `needs_review`:** Telegram grubunda mesajın gerçekten gönderilip gönderilmediğini kontrol et. Onay tuşunu tekrar tekrar kullanma.

## Acil durdurma

**Apps Script editöründe `stopBot` fonksiyonunu elle çalıştır.** Bu sadece otomatik tetikleyicileri kaldırır; Telegram botunu, Google Sheet'i veya verileri silmez. **Bu işlev Script Properties içindeki açık özellik bayraklarını değiştirmez**; tekrar başlatırken paneldeki yayın, AI ve moderasyon durumunu kontrol et.

Telegram botuna birden fazla sunucu veya webhook bağlama. Kullanıcıların gönderdiği tokenleri GitHub'a yapıştırma.

## GitHub'dan Google'a kod yükseltme

**GitHub V0.3.1, canlı Google Apps Script V0.3.0 kurulumunu otomatik güncellemez.**

1. Google Sheets → Uzantılar → Apps Script'e gir.
2. Önce mevcut `Code.gs` içeriğini yedekle (ör. güvenli özel belge/kopya).
3. GitHub'daki [apps-script/Code.gs](Code.gs) dosyasının **tamamını** kopyala, Google editördeki dosyanın yerine yapıştır, kaydet.
4. Google'da `pollTelegram` fonksiyonunu bir kez çalıştır; Telegram'da `/panel` ve `/ozet` komutlarını test et. Yalnızca yeni tetikleyici yapılandırması gerekiyorsa `setupBot` çalıştır.
5. Kontrol et: Telegram panelinin üstündeki sürüm güncellenmiş mi? Haber, spam silme ve AI özellikleri kullanıcı onayı olmadan açılmış mı? **Hiçbir yayını deneme amacıyla gerçek gruba gönderme.**
6. Hata olursa önceki Google kod yedeğine dön. Değişikliklerden önce `stopBot` kullanabilir, geri aldıktan sonra tetikleyicileri gerektikçe `setupBot` ile tekrar kurabilirsin.

## Veri güvenliği

- Bot tokeni ve API anahtarları yalnızca Google Apps Script **Script Properties** alanında tutulur. Bu alana script editörleri erişebilir; erişimleri sınırlı tut.
- Repo şu anda Public olabilir. Public GitHub Issue, commit, Actions loglarına sır paylaşma.
- Kişisel kullanıcı hesapları `users` sayfasında; bireysel AI kotası Script Properties içinde. Raporlar sayısal etkinlik sayaçlarıdır.
- RSS başlıkları V0.3.1'de Google Sheets'e formül olarak işlenmeyecek şekilde korunur.
- GitHub'ın yeşil testleri Apps Script üretim kotalarını veya Telegram uçtan uca işleyişini doğrulamaz.

## GitHub V0.3.1 değişiklik özeti

- 5 dakikalık polling için bounded batch (maksimum 120 / çalıştırma ve 25 saniyelik döngü limiti).
- Başarısız Telegram update işlemi iki kez daha denenir; üçüncü başarısızlıktan sonra hata kaydına işlenip atlanır.
- RSS/Atom haberlerinin tarihi biliniyorsa 7 gün dışındakiler ayıklanır, Google Sheets formül enjeksiyonu engellenir.
- Grup yayını başarılıysa admin teyidi veya takipçi DM hatası yayın durumunu `needs_review` olarak değiştirmez.
- AI çağrısının dış servise ulaşmış olabileceği hatalarda kota geri verilmez, harcama koruması tercih edilir.
- GitHub testleri canlı sistemden ayrı çalışır.

**Üretime geçiş eşiği:** Test grubunda bot izinleri, haber kaynakları, yayın onayı ve `/sil` kontrol edilmeden gerçek grupta moderasyon ya da AI açılmaz.
