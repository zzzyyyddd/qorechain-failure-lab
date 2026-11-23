import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

async function exercise(chain) {
  let click; const sent = []; const button = { disabled: false, addEventListener: (_, fn) => { click = fn; } }; const status = {};
  const sessionStorage = { getItem: () => null, setItem: () => {} };
  const wallet = { request: async ({ method, params }) => {
    sent.push({ method, params });
    if (method === 'eth_chainId') return chain;
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') return ['0x1000000000000000000000000000000000000001'];
    if (method === 'eth_sendTransaction') return `0x${'ab'.repeat(32)}`;
  } };
  runInNewContext(readFileSync('deployment/deploy.js', 'utf8'), { document: { querySelector: (q) => q === '#deploy' ? button : status }, window: { qorex: { evm: wallet } }, sessionStorage, fetch: async () => ({ ok: true, json: async () => ({ bytecode: '0x6000' }) }) });
  await click();
  return { sent, status, button };
}

test('refuses non-Diana chain without requesting accounts or sending', async () => {
  const result = await exercise('0x2649');
  assert.deepEqual(result.sent.map((r) => r.method), ['eth_chainId']);
  assert.match(result.status.textContent, /select Diana/);
});
test('sends only an explicit chain-9800 creation after account and chain checks', async () => {
  const result = await exercise('0x2648');
  assert.deepEqual(result.sent.map((r) => r.method), ['eth_chainId', 'eth_requestAccounts', 'eth_chainId', 'eth_accounts', 'eth_sendTransaction']);
  const tx = result.sent.at(-1).params[0];
  assert.equal(tx.chainId, '0x2648');
  assert.equal(tx.value, '0x0');
  assert.equal(tx.to, undefined);
  assert.match(result.status.textContent, /not yet verified/);
});
