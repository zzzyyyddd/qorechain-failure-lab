import { compileRegistry } from './compile-registry.mjs';

const hash = process.argv[2];
if (!/^0x[0-9a-fA-F]{64}$/.test(hash || '')) throw new Error('Pass the deployment transaction hash, e.g. npm run verify:registry -- 0x...');
const rpc = 'https://evm-testnet.qore.host';
async function read(method, params = []) {
  const response = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC ${method}: ${body.error.message}`);
  return body.result;
}
const chain = await read('eth_chainId');
if (chain !== '0x2648') throw new Error(`Unexpected RPC chain ${chain}; expected 0x2648.`);
const receipt = await read('eth_getTransactionReceipt', [hash]);
if (!receipt) throw new Error('Receipt is unavailable or pending. Do not redeploy without checking wallet history.');
if (receipt.status !== '0x1' || !/^0x[0-9a-fA-F]{40}$/.test(receipt.contractAddress || '') || !receipt.blockNumber || receipt.transactionHash?.toLowerCase() !== hash.toLowerCase()) throw new Error('Receipt is not a successful matching contract creation.');
const tx = await read('eth_getTransactionByHash', [hash]);
const expected = compileRegistry();
if (!tx || tx.to !== null || tx.input?.toLowerCase() !== expected.bytecode.toLowerCase()) throw new Error('Transaction creation bytecode does not match the local registry artifact.');
const code = await read('eth_getCode', [receipt.contractAddress, receipt.blockNumber]);
if (code?.toLowerCase() !== expected.deployedBytecode.toLowerCase()) throw new Error('On-chain code does not match the locally compiled registry.');
console.log(JSON.stringify({ chainId: 9800, transactionHash: hash, contractAddress: receipt.contractAddress, blockNumber: Number(BigInt(receipt.blockNumber)), receiptStatus: 'success', codeMatches: true, explorer: 'https://explore.qore.network/ (select Testnet; search the transaction hash or contract address)', rpc }, null, 2));
