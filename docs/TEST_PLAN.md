# TEST PLANI — ÜRETİM ÖNCESİ

| ID | Senaryo | Beklenen sonuç |
|---|---|---|
| T-01 | `npm test` | Bütün birim testleri geçer |
| T-02 | `/health` | JSON ok, gerçek üretim etkinliği iddiası yok |
| T-03 | Yanlış Telegram webhook secret | HTTP 403 |
| T-04 | Aynı Telegram update iki kez | İkinci `duplicate:true`, aynı eylem tekrarlanmaz |
| T-05 | Yönetici olmayan `/panel` | Panel düğmesi gösterilmez |
| T-06 | Sahte/eskimiş Telegram Mini App initData | Admin API HTTP 403 |
| T-07 | Yönetici doğru initData | Panel ayarları okunur |
| T-08 | Haber kaynağı boş | Taslak, grup mesajı yok |
| T-09 | Geçerli RSS ve cron | D1'de sadece `pending` taslak oluşur |
| T-10 | Yayın kontrolü kapalıyken onay | Grup mesajı gönderilemez |
| T-11 | Yayın açılıp tek onay | Bir adet sessiz grup özeti gider |
| T-12 | Aynı taslağa ikinci onay | Tekrarlı yayın engellenir |
| T-13 | Üye `/start` | Bot DM komutları açıklar |
| T-14 | Üye `/sessiz` | DM haber tercihi kapalı |
| T-15 | Üye `/sil` | Tercihler ve AI soru sayacı silinir |
| T-16 | AI kapalıyken `/sor` | API çağrılmaz, açıklayıcı mesaj gönderilir |
| T-17 | AI açıldığında 5 soru | Sınır uygulanır, 6. soru reddedilir |
| T-18 | Moderasyon kapalıyken şüpheli metin | Otomatik silme gerçekleşmez |
| T-19 | Moderasyon açık / test spam linkleri | Test grubunda yüksek puanlı link flood'u silinir |
| T-20 | Haftalık cron | Yalnızca yöneticinin özel sohbetine rapor gider |

Testler önce ayrı test grubunda ve test botu ile yapılmalıdır. Telegram üretim grubu izinlerini onay olmadan değiştirmeyin.
