import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/receipt.js';
const hash = 'a'.repeat(64);
function response() {
  return { headers:{} as Record<string,string>, statusCode:0, body:undefined as unknown, setHeader(k:string,v:string){this.headers[k]=v;return this;}, status(v:number){this.statusCode=v;return this;}, json(v:unknown){this.body=v;return this;} };
}
const req = (hashInput: unknown = hash, method = 'GET') => ({method, query:{hash:hashInput}});
afterEach(() => vi.unstubAllGlobals());
describe('read-only Vercel receipt proxy', () => {
  it('rejects non-GET and invalid hashes without upstream access', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const a=response(), b=response(), c=response(); await handler(req(hash,'POST'), a); await handler(req('../secret'), b); await handler(req([hash,hash]),c);
    expect([a.statusCode,b.statusCode,c.statusCode]).toEqual([405,400,400]); expect(fetch).not.toHaveBeenCalled();
  });
  it('requests only the fixed testnet endpoint and returns the receipt', async () => {
    const body = {tx_response:{txhash:hash.toUpperCase(),code:0}};
    const fetch = vi.fn(async () => new Response(JSON.stringify(body), {status:200})); vi.stubGlobal('fetch',fetch);
    const r=response(); await handler(req(),r);
    expect(fetch).toHaveBeenCalledWith('https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/'+hash.toUpperCase(), expect.objectContaining({method:'GET',redirect:'error'}));
    expect(r.statusCode).toBe(200); expect(r.body).toEqual(body); expect(r.headers['Cache-Control']).toBe('no-store');
  });
  it('passes only recognized not-found responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({code:5,message:'tx not found'}),{status:404})));
    const r=response(); await handler(req(),r); expect(r.statusCode).toBe(404);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>404</html>',{status:404})));
    const s=response(); await handler(req(),s); expect(s.statusCode).toBe(502);
  });
  it('handles timeout, upstream failures, oversized responses and malformed JSON', async () => {
    const cases = [() => { throw new DOMException('timeout','TimeoutError'); }, () => new Response('down',{status:500}), () => new Response('x',{status:200,headers:{'content-length':'1048577'}}), () => new Response('not json',{status:200})];
    for (const [i, run] of cases.entries()) { vi.stubGlobal('fetch', vi.fn(async () => run())); const r=response(); await handler(req(),r); expect(r.statusCode).toBe(i===0?504:502); }
  });
});
