const BASE = 'https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/';
const MAX_BYTES = 1024 * 1024;
const error = (res, status, message) => res.status(status).json({ error: message });

// Only native transaction reads are supported; no caller-controlled host or path.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return error(res, 405, 'Method not allowed'); }
  const hash = req.query?.hash;
  if (typeof hash !== 'string' || !/^[a-fA-F0-9]{64}$/.test(hash)) return error(res, 400, 'Invalid native transaction hash');
  try {
    const upstream = await fetch(BASE + hash.toUpperCase(), { method:'GET', redirect:'error', signal:AbortSignal.timeout(8000), headers:{Accept:'application/json'} });
    if (upstream.status !== 200 && upstream.status !== 404) return error(res, 502, 'Testnet REST service unavailable');
    const length = Number(upstream.headers.get('content-length'));
    if (length > MAX_BYTES || !upstream.body) return error(res, 502, 'Invalid upstream response');
    const reader = upstream.body.getReader();
    const chunks = []; let total = 0;
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); return error(res, 502, 'Upstream response too large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body; try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return error(res, 502, 'Invalid upstream response'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return error(res, 502, 'Invalid upstream response');
    if (upstream.status === 404 && !(body.code === 5 && typeof body.message === 'string' && /not found/i.test(body.message))) return error(res, 502, 'Unexpected upstream response');
    return res.status(upstream.status).json(body);
  } catch (cause) {
    const timeout = cause?.name === 'TimeoutError' || cause?.name === 'AbortError';
    return error(res, timeout ? 504 : 502, timeout ? 'Testnet REST request timed out' : 'Testnet REST service unavailable');
  }
}
