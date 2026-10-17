# BOT TLEWGRAM V0.3.1 (GitHub kaynağı) — Cloudflare ve D1 olmadan

**Oluşturulan Telegram botu:** [@TLEWGRAM_bot](https://t.me/TLEWGRAM_bot). **Durum:** Google Apps Script kuruldu; botun özel mesajları ve `/panel` komutu kullanıcı ekran görüntüsüyle doğrulandı. Grupla bağlantı, RSS ve AI henüz yapılandırılmadı.


Bu alternatif Google Apps Script + Google Sheets ile çalışır. Ayrı sunucu, Cloudflare, D1, webhook veya Google Web App dağıtımı gerektirmez. Önceki Worker kaynakları yalnızca geri dönüş amacıyla depoda korunur.

## 1 — Google Sheets'ten Apps Script'i aç

Botun mevcut tablosu: https://docs.google.com/spreadsheets/d/1h_YTc1DPpkDhZpZJTBNXMga04E6ut-fyAO6t4U3sqWM/edit

Uzantılar → Apps Script → Code.gs. Mevcut örnek kodu tamamen silip bu dizindeki Code.gs içeriğini yapıştır. Kaydet. Apps Script projesi tablonun içinden açılmalı, bağımsız proje olmamalı. V8 JavaScript çalışma zamanı kullan.

## 2 — Proje ayarlarında gizli tokeni gir

Apps Script → Proje Ayarları → Script Properties (Komut dosyası özellikleri).

| Anahtar | Ne girilmeli |
|---|---|
| TELEGRAM_BOT_TOKEN | BotFather'ın bot anahtarı. GitHub'a ASLA yazma. |
| POLL_MINUTES | Başlangıç 5 dakika (opsiyonel: 1, 5, 10, 15, 30) |
| ADMIN_USER_IDS | Önce /kimim ile öğrenilecek; ilk kurulumda boş olabilir |
| TELEGRAM_GROUP_ID | Sonra test grubunda /id ile öğrenilecek |
| NEWS_FEEDS | Konuya özel: Kaynak A\|https://site.com/rss;Kaynak B\|https://site.com/feed |
| OPENAI_API_KEY | İsteğe bağlı AI servisi; başlangıçta boş |
| AI_MODEL | Varsayılan gpt-4.1-mini |
| AI_DAILY_LIMIT | Varsayılan günlük kullanıcı kotası: 5 |
| AI_MONTH_LIMIT | Varsayılan aylık toplam çağrı kotası: 1500 |

## 3 — Bir defa çalıştır

Fonksiyon açılır menüsünden setupBot seç, Çalıştır'a bas, Google izinlerini onayla.

Bu işlem Google Sheet'te dört sekme oluşturur: users, news, digests, errors. Mesaj kontrolü, günlük kaynak taraması ve haftalık rapor tetikleyicilerini kaydeder. Telegram'da varsa eski webhook'u kaldırır; eski güncellemeleri silmez. Aynı botu iki sistemde aynı anda çalıştırma.

**Önemli:** YAYIN, AI ve MODERASYON ilk kurulumda kapalıdır. Kurulum ana gruba mesaj göndermez.

testBotConnection sadece token geçerliliğini kontrol eder, Telegram'a mesaj atmaz.

## 4 — Telegram tarafı

1. Botuna özelden /start ardından /kimim gönder. Sayı ADMIN_USER_IDS değeridir; Apps Script Script Properties alanına ekle.
2. Botu Telegram test grubuna ekle. Grupta /id yaz. Grup kimliği **özelden** gelir; bunu TELEGRAM_GROUP_ID alanına gir.
3. /panel komutunu botun özel sohbetinde aç. Mobil düğmelerle haber, yayın, AI, moderasyon ve raporu kontrol et.
4. Canlı moderasyon için botu grupta yönetici yap ve mesaj silme izni ver. Spam silme anlık değil, bir sonraki tarama sırasında yapılır.

## 5 — Üyeyi rahatsız etmeyen düzen

Gruba otomatik haber gitmez. Her gün seçili RSS kaynaklarından en fazla bir yeni taslak hazırlanır. Yönetici /panel üzerinden önce yayını açar, sonra taslağı ayrı işlemle onaylar. Grup mesajı sessiz bildirimle yayınlanır. Yeni üyelere grupta otomatik mesaj atılmaz.

Üye botu özelden kendisi başlatır; /ozet, /sor soru, /bildirim, /sessiz, /sil komutlarını kullanabilir. /bildirim ile yalnızca izin veren kullanıcılara onaylı haberin kopyası (pilot: en fazla 30) gider.

Pazartesi yaklaşık saat 11.00'de yöneticiye gözlemlenen mesajlar, katılımlar, spam ve AI kullanım raporu gelir. Bu tam Telegram istatistiği değil, botun gördüğü etkinliklerdir.

## 6 — Sınırlar ve maliyet

Google Apps Script ve Google Sheets ücretsiz kotalarla kullanılabilir ama kullanım yoğunlaştığında kota ve çalışma süresi sınırlarına takılabilir. Hesap açmak için yeni bir sunucu şirketi gerekmiyor. Google'ın ücretsiz kişisel hesaplarda toplam trigger runtime limiti 90 dakika/gündür. Yüksek mesaj hacminde POLL_MINUTES=5 tercih edilmeli.

Telegram güncellemeleri kontrollü döngüde çalıştırma başına en fazla **120 adet** işlenir; 25 saniye zaman sınırı da vardır. Başarısız bir güncelleme sonraki çalışmada yeniden denenir; üç başarısızlık sonunda kuyruktan çıkarılır ve hata kaydına yazılır. Yoğun gruplarda kuyruk büyüyebilir. Anti-spam gerçek zamanlı değildir: 5 dakikada bir kontrol + Google tetikleyici gecikmesi yaşanabilir; POLL_MINUTES=1 daha hızlı ama kota açısından daha pahalıdır. Google Apps Script webhook'undaki 302 yönlendirme riskini bu polling modeliyle bertaraf ediyoruz.

GitHub V0.3.1 kodu, RSS tarihleri biliniyorsa son **7 gün** içindeki içerikleri seçer ve haber başlığının Google Sheets formülü gibi çalışmasını engeller. Haber kaynakları henüz belirlenmedi, bu yüzden NEWS_FEEDS varsayılan boş ve haber üretimi kapalıdır. AI API ücretlidir; 1500 çağrı kotası dolar harcama limiti değildir.

Gizli anahtarlar sadece Apps Script Script Properties'de tutulur. Google Sheet'e veya GitHub'a yazılmaz. Script editör erişimi olan kişiler anahtarlara erişebileceğinden tabloyu gereksiz kişilerle düzenleyici olarak paylaşma. Google Apps Script'in Google hesabında yayınlanması/kullanıcı izinlerinin verilmesi gerekir.

## Durdurma

Apps Script fonksiyon listesinden stopBot çalıştır; otomatik kontroller durur. Bu, tabloyu veya Telegram botunu silmez.

**Sürüm ayrımı:** GitHub'daki `Code.gs` V0.3.1; Google hesabında kurulu botun son ekran görüntüsü V0.3.0 gösterdi. GitHub commitleri Google Apps Script'e otomatik yansımaz. Yeni sürüme geçmek için çalışan Apps Script kodunun yedeğini alıp yeni dosyayı kontrollü olarak yapıştırmak gerekir. **Yeniden `setupBot` çalıştırmak yalnızca tetikleyici ayarları değiştiğinde gerekir.**

[İşletim, sürüm yükseltme, arıza ve geri alma rehberi](OPERATIONS.md).

Resmî belgeler:
- https://developers.google.com/apps-script/guides/triggers/installable
- https://developers.google.com/apps-script/guides/properties
- https://developers.google.com/apps-script/guides/services/quotas
- https://core.telegram.org/bots/api#getupdates
