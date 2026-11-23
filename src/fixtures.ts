import type { Lookup } from './diagnostics';

// Entirely invented examples, never sent to the network.
const sampleHash = 'a'.repeat(64);
const receipt = (code?: number, codespace = ''): Lookup => ({ kind:'receipt', hash:sampleHash, data:{tx_response:{txhash:sampleHash, height:'123', ...(code === undefined ? {} : {code}), codespace, gas_wanted:'100000', gas_used:'100000'}} });
export const fixtures: {name: string; input: Lookup}[] = [
  {name:'Successful transaction', input:receipt(0)},
  {name:'On-chain failure', input:receipt(42, 'contract')},
  {name:'Invalid hash', input:{kind:'invalid', detail:'Simulated malformed hash.'}},
  {name:'Transaction not found', input:{kind:'not-found', detail:'Simulated REST not-found response.'}},
  {name:'RPC timeout', input:{kind:'unavailable', detail:'Simulated request timeout.'}},
  {name:'Wallet rejection', input:{kind:'wallet-rejected', detail:'Simulated explicit wallet rejection.'}},
  {name:'Insufficient evidence', input:receipt()},
  {name:'Out-of-gas', input:receipt(11, 'sdk')},
];
