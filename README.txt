TEK WORKER KURULUMU

Bu repo artık siteyi ve API'yi tek Cloudflare Worker üzerinden yayınlar.

1. Cloudflare'da mevcut `sinyal-defteri` KV namespace'inin ID'sini alın.
2. `wrangler.jsonc` içindeki `BURAYA_KV_NAMESPACE_ID` değerini bu ID ile değiştirin.
3. `SIGNALS` KV binding'inin adının `SIGNALS` olduğunu doğrulayın.
4. Worker Secrets bölümünde `API_KEY` adında uzun ve rastgele bir secret oluşturun.
5. Repo deploy edildiğinde `site/` statik dosyaları, `worker/index.js` ise `/api/*` yollarını yönetir.
6. API testi: `https://kripto-sinyal.erenkaraca2005.workers.dev/api/signals` adresi JSON dizi döndürmelidir.
7. n8n akışlarında API URL'sini aynı Worker adresiyle, anahtarı da `API_KEY` secret ile eşleştirin.
8. Gerçek sinyal üretimi için `n8n/sinyal-motoru.json` akışını içe aktarın, içindeki `BURAYA_API_ANAHTARI` değerini API anahtarınızla değiştirin ve önce pasif/manual çalıştırarak test edin. Bu akış yalnızca sinyal üretir; otomatik borsa emri açmaz.

CLI ile deploy etmek için:

```powershell
npx wrangler deploy
```

Gerçek `API_KEY` değerini bu repoya yazmayın. `sinyal-defteri-api` Worker'ı bu yapıdan sonra kullanılmaz; eski Worker'ı silmeden önce yeni birleşik Worker'ın API testini tamamlayın.

KLASÖR DÜZENİ

site/    -> statik web sitesi
worker/  -> API Worker kodu
n8n/     -> n8n akış dosyaları

Sinyal motoru EMA20/EMA50 trendi, RSI14, MACD ve ATR ile saatlik mumlarda koşulları kontrol eder. Başlangıçta kâğıt/test sinyali olarak kullanılmalı; gerçek para ile işlemden önce yeterli geçmiş veri ve test sonucu olmadan otomatikleştirilmemelidir.
