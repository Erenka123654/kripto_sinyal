// Cloudflare Worker: sinyal API (KV: SIGNALS, gizli anahtar: API_KEY)
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Content-Type': 'application/json' };
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: H });
const num = v => Number.isFinite(+v) && +v > 0;

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    const p = new URL(req.url).pathname.replace(/\/+$/, '');
    const list = JSON.parse((await env.SIGNALS.get('signals')) || '[]');
    if (req.method === 'GET' && p === '/api/signals') return json(list);

    if (!env.API_KEY) return json({ error: 'API_KEY tanımlı değil' }, 500);
    if (req.headers.get('Authorization') !== 'Bearer ' + env.API_KEY) return json({ error: 'yetkisiz' }, 401);

    if (req.method === 'POST' && p === '/api/signals') {
      let b; try { b = await req.json(); } catch { return json({ error: 'gecersiz json' }, 400); }
      const side = String(b.side || '').toUpperCase(), symbol = String(b.symbol || '').toUpperCase();
      if (!/^[A-Z0-9]{5,12}$/.test(symbol) || !['BUY', 'SELL'].includes(side) || !num(b.entry) || !num(b.tp) || !num(b.sl))
        return json({ error: 'symbol, side (BUY/SELL), entry, tp, sl gerekli' }, 400);
      const s = { id: Date.now(), symbol, side, tf: /^[0-9a-zA-Z]{1,4}$/.test(String(b.tf)) ? String(b.tf) : '4s', time: new Date().toISOString(),
        entry: +b.entry, tp: +b.tp, sl: +b.sl, status: 'open' };
      list.push(s);
      await env.SIGNALS.put('signals', JSON.stringify(list.slice(-1000)));
      return json(s, 201);
    }

    const m = p.match(/^\/api\/signals\/(\d+)$/);
    if (req.method === 'PATCH' && m) {
      const s = list.find(x => String(x.id) === m[1]);
      if (!s) return json({ error: 'sinyal bulunamadi' }, 404);
      const b = await req.json().catch(() => ({}));
      if (!['tp', 'sl'].includes(b.status)) return json({ error: 'status tp veya sl olmali' }, 400);
      s.status = b.status; s.closedAt = new Date().toISOString();
      await env.SIGNALS.put('signals', JSON.stringify(list));
      return json(s);
    }
    return json({ error: 'bulunamadi' }, 404);
  }
};
