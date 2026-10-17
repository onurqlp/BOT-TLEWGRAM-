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
