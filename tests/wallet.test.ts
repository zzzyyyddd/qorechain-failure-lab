import { describe, expect, it, vi } from 'vitest';
import { CHAIN_ID, connect, encodeSelfSend, fetchReceipt, sendTest, type NativeWallet } from '../src/wallet';

const address = 'qor1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a';
const hash = 'ab'.repeat(32);
function wallet(): NativeWallet {
  return { capabilities: ['signAndBroadcast'], enable: vi.fn(async () => {}), getKey: vi.fn(async () => ({ bech32Address: address })), signAndBroadcast: vi.fn(async () => ({ txHash: hash, code: 0 })) };
}
describe('native test transaction', () => {
  it('connects on Diana without sending a transaction', async () => {
    const w = wallet(); expect(await connect(w)).toBe(address); expect(w.enable).toHaveBeenCalledWith(CHAIN_ID); expect(w.signAndBroadcast).not.toHaveBeenCalled();
  });
  it('encodes a self transfer of 1 uqor in a MsgSend wire structure', () => {
    const bytes = [...encodeSelfSend(address)]; const text = [...new TextEncoder().encode(address)];
    expect(bytes).toEqual([10, text.length, ...text, 18, text.length, ...text, 26, 9, 10, 4, 117, 113, 111, 114, 18, 1, 49]);
  });
  it('requires the advertised capability and refuses an account change', async () => {
    const w = wallet(); w.capabilities = []; await expect(sendTest(w, address)).rejects.toThrow('does not advertise'); expect(w.signAndBroadcast).not.toHaveBeenCalled();
    w.capabilities = ['signAndBroadcast']; await expect(sendTest(w, 'qor1different')).rejects.toThrow('account changed'); expect(w.signAndBroadcast).not.toHaveBeenCalled();
  });
  it('sends only the testnet request on explicit invocation', async () => {
    const w = wallet(); await sendTest(w, address);
    expect(w.signAndBroadcast).toHaveBeenCalledOnce(); expect(w.signAndBroadcast).toHaveBeenCalledWith(expect.objectContaining({chainId: CHAIN_ID, gasLimit: 200000, messages: [{typeUrl:'/cosmos.bank.v1beta1.MsgSend', value:encodeSelfSend(address)}]}));
  });
});
describe('receipt', () => {
  it('rejects bad hashes before network access', async () => {
    const f = vi.fn(); await expect(fetchReceipt('../bad', f as unknown as typeof fetch)).rejects.toThrow('invalid'); expect(f).not.toHaveBeenCalled();
  });
  it('checks receipt identity and returns the real response', async () => {
    const data = { tx_response: { txhash: hash.toUpperCase(), code: 0 } };
    const f = vi.fn(async () => ({ok:true, json:async () => data}));
    expect(await fetchReceipt(hash, f as unknown as typeof fetch)).toEqual(data);
    expect(f.mock.calls[0][0]).toBe(`/lcd/cosmos/tx/v1beta1/txs/${hash.toUpperCase()}`);
    const other = vi.fn(async () => ({ok:true, json:async () => ({tx_response:{txhash:'cd'.repeat(32)}})}));
    await expect(fetchReceipt(hash, other as unknown as typeof fetch)).rejects.toThrow('does not match');
  });
  it('does not treat an unavailable receipt as a failed transaction', async () => {
    const f = vi.fn(async () => ({ok:false, status:404})); await expect(fetchReceipt(hash, f as unknown as typeof fetch)).rejects.toThrow('may still be pending');
  });
});
