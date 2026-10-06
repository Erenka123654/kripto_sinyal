// Sinyal verisi. n8n bu dosyayı (veya aynı formatı) güncelleyebilir.
// demo:true olan açık sinyaller canlı fiyata göre otomatik oluşturulur. Gerçek veride demo alanını kaldırın.
const h = x => new Date(Date.now() - x * 36e5).toISOString();
window.SIGNALS = [
  { id: 1, symbol: 'BTCUSDT', side: 'BUY',  tf: '4s', time: h(160), entry: 64000, tp: 66500, sl: 62800, status: 'tp' },
  { id: 2, symbol: 'ETHUSDT', side: 'SELL', tf: '1s', time: h(140), entry: 3150,  tp: 3020,  sl: 3220,  status: 'sl' },
  { id: 3, symbol: 'SOLUSDT', side: 'BUY',  tf: '4s', time: h(120), entry: 142,   tp: 150,   sl: 138,   status: 'tp' },
  { id: 4, symbol: 'BNBUSDT', side: 'BUY',  tf: '1s', time: h(96),  entry: 590,   tp: 612,   sl: 580,   status: 'tp' },
  { id: 5, symbol: 'XRPUSDT', side: 'SELL', tf: '4s', time: h(80),  entry: 0.58,  tp: 0.55,  sl: 0.60,  status: 'tp' },
  { id: 6, symbol: 'BTCUSDT', side: 'SELL', tf: '1s', time: h(60),  entry: 66100, tp: 64900, sl: 66700, status: 'sl' },
  { id: 7, symbol: 'ETHUSDT', side: 'BUY',  tf: '4s', time: h(40),  entry: 3080,  tp: 3200,  sl: 3010,  status: 'tp' },
  { id: 8, symbol: 'BTCUSDT', side: 'BUY',  tf: '4s', time: h(9),   demo: true, off: -0.8, status: 'open' },
  { id: 9, symbol: 'SOLUSDT', side: 'SELL', tf: '1s', time: h(5),   demo: true, off: 0.6,  status: 'open' },
  { id: 10, symbol: 'ETHUSDT', side: 'BUY', tf: '1s', time: h(2),   demo: true, off: -0.3, status: 'open' }
];
