import { validHash } from './wallet';

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};
const string = (v: unknown): string => typeof v === 'string' ? v : '';
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const evmEvents = (data: unknown): Obj[] => arr(obj(obj(data).tx_response).events).map(obj).filter(event => event.type === 'ethereum_tx');
const evmFailure = (event: Obj): boolean => arr(event.attributes).some(attribute => { const a = obj(attribute); return a.key === 'ethereumTxFailed' && string(a.value).trim() !== ''; });
type ErrorKind = 'invalid' | 'not-found' | 'unavailable' | 'insufficient' | 'wallet-rejected';
export type Lookup = { kind: 'receipt'; hash: string; data: unknown } | { [K in ErrorKind]: { kind: K; detail: string } }[ErrorKind];
export type Diagnosis = { status: string; source: string; explanation: string; action: string; confidence: string };
const d = (status: string, source: string, explanation: string, action: string, confidence: string): Diagnosis => ({status, source, explanation, action, confidence});

export function diagnose(input: Lookup): Diagnosis {
  if (input.kind === 'invalid') return d('Invalid input', 'Input validation', input.detail, 'Enter a 64-character hexadecimal native transaction hash, without 0x.', 'Confirmed input error');
  if (input.kind === 'not-found') return d('Transaction not found', 'Diana REST endpoint', input.detail, 'Check the hash and network, then retry; it may be pending or unavailable in the node index.', 'Endpoint response only');
  if (input.kind === 'unavailable') return d('RPC unavailable', 'REST transport', input.detail, 'Check your connection and proxy, then retry. A lookup failure says nothing about transaction execution.', 'Transport evidence only');
  if (input.kind === 'wallet-rejected') return d('Wallet rejection', 'Wallet response', input.detail, 'Review the request and retry only if you intend to approve it.', 'Explicit wallet observation');
  if (input.kind === 'insufficient') return d('Insufficient evidence', 'REST response', input.detail, 'Retry against the testnet endpoint and inspect the response.', 'Unknown');
  const tx = obj(obj(input.data).tx_response);
  if (string(tx.txhash).toUpperCase() !== input.hash.toUpperCase() || !/^[1-9]\d*$/.test(string(tx.height)) || !Number.isInteger(tx.code) || (tx.code as number) < 0) return d('Insufficient evidence', 'REST response', 'A matching hash, positive committed height, and numeric result code are required.', 'Check the returned response and retry.', 'Unknown');
  const code = tx.code as number;
  if (code === 0) {
    const events = evmEvents(input.data);
    const messages = arr(obj(obj(obj(input.data).tx).body).messages);
    if (events.length || messages.some(message => obj(message)['@type'] === '/cosmos.evm.vm.v1.MsgEthereumTx')) {
      if (events.some(evmFailure)) return d('EVM execution failure reported', 'Diana native REST event', 'The matching native receipt reports code 0, but an ethereum_tx event reports an EVM execution failure. This is a chain-reported event, not an independently checked EVM receipt.', 'Check the EVM transaction hash and receipt through the Diana EVM RPC.', 'Chain-reported event');
      return d('Native receipt succeeded; EVM outcome unverified', 'Diana native REST receipt', 'The matching native receipt reports code 0 for an EVM transaction. The EVM execution outcome has not been independently checked.', 'Check the EVM transaction hash and receipt through the Diana EVM RPC.', 'Native receipt only');
    }
    return d('Confirmed success', 'Diana native REST receipt', 'The matching committed receipt reports code 0. This does not independently verify a PQC signature.', 'Inspect the transaction details and any chain events.', 'Receipt-confirmed');
  }
  const space = string(tx.codespace);
  if (space === 'sdk' && code === 11) return d('Out-of-gas', 'Diana native REST receipt', 'The committed receipt reports codespace sdk and code 11 (out of gas).', 'Review gas used and gas limit; reproduce with an appropriate limit.', 'Receipt-confirmed code');
  if ((space === 'pqc' && [20,21,26,27,28].includes(code)) || (space === 'sdk' && code === 4)) return d('Signature or authorization failure', 'Diana native REST receipt', `The committed receipt reports codespace ${space}, code ${code}. Consult the raw log and documented code meanings.`, 'Inspect the raw log, keys and authorization requirements; do not infer a specific cause from the category alone.', 'Receipt-confirmed code');
  return d('Confirmed on-chain failure', 'Diana native REST receipt', `The matching committed receipt reports nonzero code ${code}${space ? ` in codespace ${space}` : ''}. The cause is not classified.`, 'Inspect the raw log and module-specific error codes.', 'Receipt-confirmed');
}

export async function lookupTransaction(hash: string, fetcher: typeof fetch = fetch): Promise<Lookup> {
  hash = hash.trim();
  if (!validHash(hash)) return {kind:'invalid', detail:'The hash must contain exactly 64 hexadecimal characters.'};
  try {
    const response = await fetcher(`/lcd/cosmos/tx/v1beta1/txs/${hash.toUpperCase()}`, {signal: AbortSignal.timeout(10000)});
    if (response.status === 404) {
      let body: Obj = {}; try { body = obj(await response.json()); } catch { /* generic proxy 404 is not evidence of an absent transaction */ }
      if (body.code === 5 && /not found/i.test(string(body.message))) return {kind:'not-found', detail:'The testnet REST endpoint returned a transaction-not-found response (HTTP 404, code 5).'};
      return {kind:'unavailable', detail:'HTTP 404 without a recognizable transaction-not-found response; the proxy or endpoint may be unavailable.'};
    }
    if (!response.ok) return {kind:'unavailable', detail:`REST request returned HTTP ${response.status}.`};
    let data: unknown; try { data = await response.json(); } catch { return {kind:'insufficient', detail:'The endpoint returned invalid JSON.'}; }
    return {kind:'receipt', hash, data};
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error));
    return {kind:'unavailable', detail: e.name === 'TimeoutError' || e.name === 'AbortError' ? 'The REST request timed out.' : `Network or proxy error: ${e.message}. CORS or connectivity may be the cause.`};
  }
}

export function evidence(input: Lookup): Record<string, unknown> | null {
  if (input.kind !== 'receipt') return null;
  const data = obj(input.data), r = obj(data.tx_response), tx = obj(data.tx), body = obj(tx.body), fee = obj(obj(tx.auth_info).fee);
  // Never present another transaction's fields as evidence for the requested hash.
  if (string(r.txhash).toUpperCase() !== input.hash.toUpperCase()) return null;
  return { network:'Diana testnet REST endpoint', hash:r.txhash ?? null, height:r.height ?? null, code:r.code ?? null, codespace:r.codespace ?? null, raw_log:r.raw_log ?? null, gas_wanted:r.gas_wanted ?? null, gas_used:r.gas_used ?? null, fees:fee.amount ?? null, messages:arr(body.messages).map((m) => {const message=obj(m); return {type:message['@type'] ?? null, sender:message.from_address ?? message.sender ?? null, recipient:message.to_address ?? message.recipient ?? null, amount:message.amount ?? null};}), timestamp:r.timestamp ?? null, evm_events:evmEvents(input.data).map(event => ({type:event.type, attributes:arr(event.attributes).filter(attribute => ['ethereumTxHash','ethereumTxFailed','msg_index'].includes(string(obj(attribute).key))).map(attribute => ({key:obj(attribute).key,value:obj(attribute).value}))})), pqc_events:arr(r.events).filter((event) => ['pqc_verify','pqc_hybrid_verify'].includes(string(obj(event).type))).map((event) => ({type:obj(event).type, attributes:arr(obj(event).attributes).filter((attribute) => ['status','algorithm_id','key_type','hybrid_mode'].includes(string(obj(attribute).key))).map((attribute) => ({key:obj(attribute).key, value:obj(attribute).value}))})), extension_types:arr(body.extension_options).map((entry) => obj(entry)['@type'] ?? null), pqc_note:'Independent cryptographic verification not performed.' };
}

export function isExplicitWalletRejection(error: unknown): boolean {
  const value = obj(error);
  return value.code === 4001 || (typeof value.message === 'string' && /^QoreX: (?:signature|connection) rejected$/i.test(value.message.trim()));
}
