// Cloudflare Worker: sinyal API (KV binding: SIGNALS, secret: API_KEY)
const jsonHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
});

const json = (data, status = 200, origin) => new Response(JSON.stringify(data), {
  status,
  headers: jsonHeaders(origin)
});

const positiveNumber = value => Number.isFinite(Number(value)) && Number(value) > 0;
const validSymbol = value => /^[A-Z0-9]{5,12}$/.test(value);
const validTimeframe = value => /^[0-9A-Za-z]{1,4}$/.test(value);

function requestOrigin(request, env) {
  const allowed = String(env.ALLOWED_ORIGIN || '').trim();
  if (!allowed) return '*';
  return request.headers.get('Origin') === allowed ? allowed : allowed;
}

async function readSignals(env) {
  if (!env.SIGNALS || typeof env.SIGNALS.get !== 'function') {
    throw new Error('SIGNALS KV binding is missing');
  }
  const raw = await env.SIGNALS.get('signals');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error('SIGNALS KV data is invalid JSON');
  }
}

async function writeSignals(env, signals) {
  if (!env.SIGNALS || typeof env.SIGNALS.put !== 'function') {
    throw new Error('SIGNALS KV binding is missing');
  }
  await env.SIGNALS.put('signals', JSON.stringify(signals.slice(-1000)));
}

function authorized(request, env) {
  const key = String(env.API_KEY || '');
  return Boolean(key) && request.headers.get('Authorization') === `Bearer ${key}`;
}

export default {
  async fetch(request, env) {
    const origin = requestOrigin(request, env);
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    const isApiRequest = path.startsWith('/api/');

    if (!isApiRequest) {
      if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') return json({ error: 'statik asset binding tanımlı değil' }, 500, origin);
      return env.ASSETS.fetch(request);
    }

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: jsonHeaders(origin) });

    if (path !== '/api/signals' && !/^\/api\/signals\/\d+$/.test(path)) return json({ error: 'bulunamadi' }, 404, origin);

    let signals;
    try {
      signals = await readSignals(env);
    } catch (error) {
      return json({ error: 'sinyal deposu kullanılamıyor' }, 500, origin);
    }

    if (request.method === 'GET' && path === '/api/signals') return json(signals, 200, origin);
    if (!authorized(request, env)) return json({ error: 'yetkisiz' }, 401, origin);

    if (request.method === 'POST' && path === '/api/signals') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'gecersiz json' }, 400, origin); }
      const side = String(body?.side || '').toUpperCase();
      const symbol = String(body?.symbol || '').toUpperCase();
      if (!validSymbol(symbol) || !['BUY', 'SELL'].includes(side) || !positiveNumber(body?.entry) || !positiveNumber(body?.tp) || !positiveNumber(body?.sl)) {
        return json({ error: 'symbol, side (BUY/SELL), entry, tp, sl gerekli' }, 400, origin);
      }
      const requestedId = Number(body?.id);
      const id = Number.isSafeInteger(requestedId) && requestedId > 0 && !signals.some(signal => signal.id === requestedId)
        ? requestedId
        : Date.now();
      const signal = {
        id,
        symbol,
        side,
        tf: validTimeframe(String(body?.tf || '')) ? String(body.tf) : '4s',
        time: new Date().toISOString(),
        entry: Number(body.entry),
        tp: Number(body.tp),
        sl: Number(body.sl),
        status: 'open'
      };
      signals.push(signal);
      try { await writeSignals(env, signals); } catch { return json({ error: 'sinyal kaydedilemedi' }, 500, origin); }
      return json(signal, 201, origin);
    }

    const match = path.match(/^\/api\/signals\/(\d+)$/);
    if (request.method === 'PATCH' && match) {
      const signal = signals.find(item => String(item.id) === match[1]);
      if (!signal) return json({ error: 'sinyal bulunamadi' }, 404, origin);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'gecersiz json' }, 400, origin); }
      if (!['tp', 'sl'].includes(body?.status)) return json({ error: 'status tp veya sl olmali' }, 400, origin);
      signal.status = body.status;
      signal.closedAt = new Date().toISOString();
      try { await writeSignals(env, signals); } catch { return json({ error: 'sinyal güncellenemedi' }, 500, origin); }
      return json(signal, 200, origin);
    }

    return json({ error: 'method desteklenmiyor' }, 405, origin);
  }
};
