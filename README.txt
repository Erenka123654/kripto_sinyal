KURULUM (sırayla)
1. Cloudflare > Workers & Pages > Create application > Create Worker > ad: sinyal-defteri-api > Deploy.
2. Worker sayfasında "Edit code" aç, içeriği worker/index.js ile değiştir > Deploy.
3. Settings > Bindings > Add > KV namespace > Variable name: SIGNALS > Namespace: sinyal-defteri (hesabında hazır) > Deploy.
4. Settings > Variables and Secrets > Add > Type: Secret > Name: API_KEY > Value: kendi belirlediğin uzun rastgele bir şifre > Deploy.
5. Tarayıcıda şu adresi aç: https://sinyal-defteri-api.erenkaraca2005.workers.dev/api/signals  (cevap [] olmalı)
6. n8n > Import from file > n8n/sinyal-sonuc-takibi.json. "Sonuçları kontrol et" düğümünde BURAYA_API_ANAHTARI yerine 4. adımdaki şifreyi yaz. Workflow'u Active yap.
7. Mevcut Telegram akışında mesaj düğümünden sonra n8n/sinyal-gonder-dugumu.json içindeki düğümü kopyalayıp yapıştır. Alan adlarını ({{ $json.symbol }} vb.) kendi akışına göre düzelt, anahtarı yaz.
8. Siteyi (index.html, config.js, signals.js) Cloudflare Pages'e yükle. config.js içindeki API adresi Worker adresin olmalı.
Worker yayınlanana kadar site demo veriyle çalışır; gerçek veri gelince demo notu otomatik gizlenir.
