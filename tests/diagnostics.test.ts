import { describe, expect, it, vi } from 'vitest';
import { diagnose, evidence, isExplicitWalletRejection, lookupTransaction, type Lookup } from '../src/diagnostics';
import { fixtures } from '../src/fixtures';
const hash = 'b'.repeat(64);
const receipt = (overrides: Record<string, unknown> = {}): Lookup => ({kind:'receipt',hash,data:{tx_response:{txhash:hash,height:'123',code:0,...overrides}}});
describe('diagnostic evidence', () => {
  it('requires matching hash, committed height and numeric code', () => {
    expect(diagnose(receipt()).status).toBe('Confirmed success');
    for(const fields of [{txhash:'c'.repeat(64)}, {height:'0'}, {height:undefined}, {code:undefined}, {code:'0'}, {code:-1}]) expect(diagnose(receipt(fields)).status).toBe('Insufficient evidence');
  });
  it('classifies failures only on documented codespace and code', () => {
    expect(diagnose(receipt({code:11,codespace:'sdk'})).status).toBe('Out-of-gas');
    expect(diagnose(receipt({code:11,codespace:'other'})).status).toBe('Confirmed on-chain failure');
    expect(diagnose(receipt({code:21,codespace:'pqc'})).status).toBe('Signature or authorization failure');
    expect(diagnose(receipt({code:21,codespace:'other'})).status).toBe('Confirmed on-chain failure');
    expect(diagnose(receipt({code:0,codespace:'pqc'})).status).toBe('Confirmed success');
  });
  it('never treats a lookup error as an on-chain failure', () => {
    for(const kind of ['invalid','not-found','unavailable','insufficient'] as const) expect(diagnose({kind,detail:'test'}).status).not.toMatch(/on-chain failure|Confirmed success/);
  });
  it('only identifies explicit wallet rejection', () => {
    expect(isExplicitWalletRejection({code:4001})).toBe(true); expect(isExplicitWalletRejection(new Error('QoreX: signature rejected'))).toBe(true); expect(isExplicitWalletRejection(new Error('RPC rejected transaction'))).toBe(false);
  });
  it('runs each simulated case as the labelled category', () => {
    expect(fixtures.map(x=>diagnose(x.input).status)).toEqual(['Confirmed success','Confirmed on-chain failure','Invalid input','Transaction not found','RPC unavailable','Wallet rejection','Insufficient evidence','Out-of-gas']);
  });
  it('does not include raw signature fields in technical report', () => {
    const data = {tx_response:{txhash:hash,height:'1',code:0},tx:{body:{messages:[],extension_options:[{pqc_signature:'secret marker'}]},signatures:['secret marker']}};
    expect(JSON.stringify(evidence({kind:'receipt',hash,data}))).not.toContain('secret marker');
  });
  it('does not expose a mismatched receipt as evidence for the requested transaction', () => {
    const mismatched = receipt({txhash:'c'.repeat(64), height:'987', code:0});
    expect(diagnose(mismatched).status).toBe('Insufficient evidence');
    expect(evidence(mismatched)).toBeNull();
  });
});
describe('lookup', () => {
  it('validates locally without a request', async () => {
    const f=vi.fn(); expect((await lookupTransaction('0xabc',f as unknown as typeof fetch)).kind).toBe('invalid'); expect(f).not.toHaveBeenCalled();
  });
  it('distinguishes a chain not-found response from a proxy 404', async () => {
    const endpoint=vi.fn(async()=>({status:404,ok:false,json:async()=>({code:5,message:'tx not found'})})); expect((await lookupTransaction(hash,endpoint as unknown as typeof fetch)).kind).toBe('not-found');
    const proxy=vi.fn(async()=>({status:404,ok:false,json:async()=>{throw Error('HTML');}})); expect((await lookupTransaction(hash,proxy as unknown as typeof fetch)).kind).toBe('unavailable');
  });
  it('handles timeout, transport failure, malformed JSON and mismatched receipts', async () => {
    const timeout=vi.fn(async()=>{throw new DOMException('timeout','TimeoutError');}); expect(await lookupTransaction(hash,timeout as unknown as typeof fetch)).toMatchObject({kind:'unavailable',detail:'The REST request timed out.'});
    const offline=vi.fn(async()=>{throw new TypeError('Failed to fetch');}); expect((await lookupTransaction(hash,offline as unknown as typeof fetch)).kind).toBe('unavailable');
    const bad=vi.fn(async()=>({status:200,ok:true,json:async()=>{throw Error('bad json');}})); expect((await lookupTransaction(hash,bad as unknown as typeof fetch)).kind).toBe('insufficient');
    const other=vi.fn(async()=>({status:200,ok:true,json:async()=>({tx_response:{txhash:'c'.repeat(64),height:'1',code:0}})})); expect(diagnose(await lookupTransaction(hash,other as unknown as typeof fetch)).status).toBe('Insufficient evidence');
  });
});
