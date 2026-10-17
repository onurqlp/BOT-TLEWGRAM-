# V0.2.0 — Yayına alma kontrol listesi

## GitHub
- [x] Kaynak kodu, testler, migration, CI ve bağımlılık güncelleme akışı
- [ ] GitHub Actions CI sonucu yeşil doğrulandı
- [ ] Repo Private yapıldı; branch protection belirlendi

## Cloudflare
- [ ] D1 oluşturuldu ve iki migration çalıştırıldı
- [ ] wrangler.jsonc gerçek database_id ile yapılandırıldı
- [ ] Secrets Cloudflare paneline girildi, kod deposuna eklenmedi
- [ ] Worker /health yanıtı doğrulandı
- [ ] Deploy ve haber kaynağı otomasyonu bilinçli olarak açıldı

## Telegram — yönetici tarafından
- [ ] BotFather botu oluşturuldu
- [ ] Bot test grubuna alındı, yönetici izinleri kontrol edildi
- [ ] Webhook secret ve kimliği tanımlandı
- [ ] /start, /ozet, /sil, /bildirim, /panel, /sor test edildi
- [ ] Hatalı kullanıcı ve yanlış bot tokeni testleri yapıldı
- [ ] İlk gerçek grup yayını ayrıca onaylandı

## Trafik ve bütçe
- Grupta günlük en fazla 1 sessiz özet, AI yalnızca özel DM'de
- AI çağrı limitleri yazılımdadır; dolar cinsinden kesin harcama tavanı değildir
- Sadece botun gördüğü grup olayları raporlanır
