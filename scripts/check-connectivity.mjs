const endpoints = [
  ['consensus', 'https://rpc-testnet.qore.host/status', undefined],
  ['evm', 'https://evm-testnet.qore.host', {jsonrpc:'2.0', id:1, method:'eth_chainId', params:[]}],
];
let failed = false;
for (const [name, url, body] of endpoints) {
  try {
    const response = await fetch(url, {method: body ? 'POST' : 'GET', headers: body ? {'content-type':'application/json'} : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const actual = name === 'consensus' ? data.result?.node_info?.network : data.result;
    const expected = name === 'consensus' ? 'qorechain-diana' : '0x2648';
    if (actual !== expected) throw new Error(`expected ${expected}, got ${JSON.stringify(actual)}`);
    console.log(`${name}: ${actual}${name === 'consensus' ? ` height=${data.result.sync_info.latest_block_height} catching_up=${data.result.sync_info.catching_up}` : ''}`);
  } catch (error) { failed = true; console.error(`${name}: ${error.message}`); }
}
if (failed) process.exitCode = 1;
