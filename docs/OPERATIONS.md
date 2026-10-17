# OPERASYON VE GÜVENLİK

## Sessiz yayın politikası
1. Ana grupta bot tarafından günde en çok 1 günlük haber özeti hazırlanır; yalnızca onayla yayınlanır.
2. Yeni üye geldi diye gruba ayrı mesaj atılmaz.
3. Soru yanıtlama yalnızca botun özel sohbetinde mümkündür.
4. DM aboneliği varsayılan KAPALI. `/bildirim` opt-in ve `/sessiz` opt-out.
5. Yönetici gerekirse `/panel` içinde `publish_enabled=false` yaparak yayını durdurur. Mevcut bot API anahtarlarını değiştirmek için ayrıca Cloudflare Secrets gerekir.

## Olay müdahalesi
- İstenmeyen gönderimde panel yayın kontrolünü kapat, Telegram'da gönderilen mesajı yönetici hesabından manuel sil.
- Moderasyonun yanlışlıkla mesaj sildiğinden şüphelenirsen panelde `moderation_enabled=false` yap. Bot silinen mesaj içeriğini geri yükleyemez.
- AI beklenmedik masraf yaratırsa `ai_enabled=false` yap, OpenAI proje bütçe ve anahtarlarını kontrol et.
- Token sızıntısı: BotFather ile Telegram tokenini iptal et/yenile, Cloudflare'de secret'i güncelle ve webhook'u yeniden tanımla. Gerekirse OpenAI API anahtarını da iptal et.

## Minimum izin ve saklama
- Moderasyon için gereken Telegram yönetici izinleri dışında izin talep etme.
- DB'de kalıcı ham grup mesajı içeriği yok.
- Kişisel verilere erişim ve silme süreçlerini KVKK kapsamında uygulamaya alınmadan önce kontrol et.
- D1 ve Worker erişimi Cloudflare hesabı MFA ile korunmalı; GitHub repo private ve branch protection uygun şekilde ayarlanmalı.

## Takip edilecek metrikler
- `join`, `leave`, `message`, `spam_deleted`, `spam_review`, `digest_sent`, `ai_answer`, `weekly_report` olayları.
- D1 kullanım limitleri, Workers hata oranı, webhook HTTP 5xx oranı, OpenAI API faturalandırma verileri ayrıca izlenmeli.
- Telegram grup görüntülenmeleri veya gerçek aktif üye sayısı tam doğrulukla bot API'sinden gelmediği için raporda uydurulmamalıdır.
