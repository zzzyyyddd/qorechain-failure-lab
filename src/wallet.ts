export const CHAIN_ID = 'qorechain-diana';
export const TEST_AMOUNT = '1';
export const SIGNING_METHOD = 'QoreX native signAndBroadcast';

export interface NativeWallet {
  capabilities?: readonly string[];
  enable(chainId: string): Promise<void>;
  getKey(chainId: string): Promise<{ bech32Address: string }>;
  signAndBroadcast?: (request: { chainId: string; messages: { typeUrl: string; value: Uint8Array }[]; memo: string; gasLimit: number }) => Promise<{ txHash: string; code: number; height?: number | string; shield?: string }>;
}

declare global { interface Window { qorex?: { native?: NativeWallet } } }

export function getWallet(): NativeWallet {
  const wallet = window.qorex?.native;
  if (!wallet) throw new Error('QoreX native provider not found. Install or unlock the extension and reload this page.');
  return wallet;
}

export async function connect(wallet: NativeWallet): Promise<string> {
  await wallet.enable(CHAIN_ID);
  const key = await wallet.getKey(CHAIN_ID);
  if (!/^qor1[023456789acdefghjklmnpqrstuvwxyz]+$/.test(key.bech32Address)) throw new Error('QoreX did not return a valid-looking native address.');
  return key.bech32Address;
}

// Cosmos bank MsgSend: fields 1 and 2 are strings, field 3 is a nested Coin.
// This follows the protobuf wire format used by the official Hybrid Inspector.
function varint(value: number): number[] {
  const out: number[] = [];
  do { const byte = value % 128; value = Math.floor(value / 128); out.push(byte | (value ? 128 : 0)); } while (value);
  return out;
}
function field(tag: number, value: Uint8Array): number[] { return [tag, ...varint(value.length), ...value]; }
const utf8 = (value: string): Uint8Array => new TextEncoder().encode(value);
export function encodeSelfSend(address: string): Uint8Array {
  const coin = Uint8Array.from([...field(10, utf8('uqor')), ...field(18, utf8(TEST_AMOUNT))]);
  return Uint8Array.from([...field(10, utf8(address)), ...field(18, utf8(address)), ...field(26, coin)]);
}

export async function sendTest(wallet: NativeWallet, address: string) {
  if (!wallet.capabilities?.includes('signAndBroadcast') || typeof wallet.signAndBroadcast !== 'function') throw new Error('QoreX does not advertise native signAndBroadcast. Update the wallet and try again.');
  const current = await wallet.getKey(CHAIN_ID);
  if (current.bech32Address !== address) throw new Error('The QoreX account changed. Reconnect before sending.');
  return wallet.signAndBroadcast({ chainId: CHAIN_ID, messages: [{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: encodeSelfSend(address) }], memo: 'QoreChain Failure Lab test', gasLimit: 200000 });
}

export function validHash(hash: string): boolean { return /^[a-fA-F0-9]{64}$/.test(hash); }
export async function fetchReceipt(hash: string, fetcher: typeof fetch = fetch): Promise<unknown> {
  if (!validHash(hash)) throw new Error('The wallet returned an invalid native transaction hash; receipt lookup was not attempted.');
  const response = await fetcher(`/lcd/cosmos/tx/v1beta1/txs/${hash.toUpperCase()}`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Receipt unavailable (HTTP ${response.status}). The transaction may still be pending; retry the lookup.`);
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('tx_response' in result) || !(result as { tx_response: unknown }).tx_response) throw new Error('REST response did not include a transaction receipt.');
  const receipt = (result as { tx_response: { txhash?: unknown } }).tx_response;
  if (typeof receipt.txhash !== 'string' || receipt.txhash.toUpperCase() !== hash.toUpperCase()) throw new Error('Receipt hash does not match the requested transaction.');
  return result;
}
