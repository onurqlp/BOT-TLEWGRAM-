# GELİŞTİRME AYARLARI

| Ayar | Nerede | Örnek / açıklama |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Cloudflare Secret | BotFather'dan alınır. Depoya ASLA yazılmaz. |
| `TELEGRAM_WEBHOOK_SECRET` | Secret | En az 32 karakter rastgele webhook doğrulama dizesi |
| `TELEGRAM_GROUP_ID` | Secret | -100 ile başlayan gerçek hedef grup kimliği |
| `ADMIN_USER_IDS` | Secret | Virgülle ayrılmış Telegram numeric yönetici ID'leri |
| `PUBLIC_BASE_URL` | Secret | HTTPS ile başlayan Worker adresi |
| `OPENAI_API_KEY` | Secret | Yalnızca AI açılacaksa gereklidir |
| `AI_MODEL` | wrangler vars | `gpt-4.1-mini` varsayılanı; sağlayıcıda erişimi kontrol edilmeli |
| `NEWS_FEEDS` | wrangler vars | `Kaynak|https://foo.com/rss;Kaynak2|https://bar.com/feed` |
| `AI_DAILY_USER_LIMIT` | wrangler vars | 5 |
| `AI_MONTHLY_TOTAL_LIMIT` | wrangler vars | 1500 (çağrı adedi) |

Bir kullanıcı grubu ve konusu belirtilmeden NEWS_FEEDS boş tutulur. Gerçek yayın konuları, güvenilir ve telif uygunluğu incelenmiş RSS kaynaklarından seçilir.

## V0.2.0 — Kota ve gizlilik
- `migrations/0002_ai_limits_and_privacy.sql` geçmiş AI kullanımını taşır ve aylık atomik çağrı limiti tablosu ekler.
- AI token tüketimi aylık toplulaştırılmış sayılır; soru metinleri saklanmaz.
- Kaynaklar yalnızca HTTPS DNS host adından kabul edilir; özel IP ve kimlik bilgili URL'ler engellenir.
- GitHub Actions deploy etmez, yalnızca kontrol eder; CI token gerektirmez.
