# Testnet evidence

## DiagnosticProofRegistry deployment — independently rechecked 2026-11-23

The read-only verifier queried `https://evm-testnet.qore.host` and confirmed chain ID **9800**, a successful creation receipt at block **10589871**, deployment transaction `0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`, and contract address `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be`. It checked that the creation input and deployed runtime bytecode match the current locally compiled source. Search either identifier on the [QoreChain explorer](https://explore.qore.network/) with Testnet selected. Reproduce the check with `npm run verify:registry -- 0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`; see [DEPLOYMENT.md](DEPLOYMENT.md). This is an RPC check, not an independent consensus proof.

On 2026-11-23 the separate native REST lookup again returned the native hash, height 10533933, code 0 and `pqc_hybrid_verify` status `verified` with algorithm `dilithium5`.

## Independent REST retrieval — 2026-11-22

Retrieved from the public Diana native REST endpoint:

`GET https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9`

The returned `tx_response.txhash` matched the requested hash; `height` was **10533933**, `code` **0**, `gas_wanted` **200000**, `gas_used` **167681**, and timestamp **2026-11-22T04:36:48Z**. The decoded message was `/cosmos.bank.v1beta1.MsgSend`, sending **1 uqor** to the same native address; its fee was **30000 uqor**. The sanitized [selected receipt fields](evidence/transaction-success.json) include the address, fee, message and relevant events, but omit public keys and signatures. These are facts reported by that endpoint, not independently verified consensus proofs.

The REST event `pqc_hybrid_verify` reported `status=verified`, `algorithm_id=dilithium5`; the transaction body also reported a `PQCHybridSignature` extension. These are **chain-reported fields**, not a cryptographic verification performed independently by this project. The user separately reported QoreX returning height 10533933, code 0 and `shielded`; the height and code match the REST response. The shield label remains a wallet claim.

## Other connectivity and limits

On 2026-11-22 around 02:51 UTC, consensus `/status` reported `qorechain-diana` at height 10529488 and EVM `eth_chainId` returned `0x2648`. Those are separate endpoints and do not establish transaction status. The native REST endpoint returned HTTP 404 / code 5 for an all-zero test lookup; this is a lookup response, not an on-chain failed transaction.

The application's tests use stubs and simulations. No separate cryptographic signature verification, consensus proof, or production-network transaction has been performed. See README for setup and [JUDGE_GUIDE.md](JUDGE_GUIDE.md) for the demo.

## Mission 02 local validation

`npm test`: 16 passed, including the seven existing wallet stub tests. `npm run typecheck` and `npm run build`: passed. Production-only npm audit: zero vulnerabilities. A full npm audit identified six development dependency findings (3 moderate, 1 high, 2 critical), with breaking major upgrades recommended. No real QoreX wallet was exercised again after the dashboard integration; the original signing module was unchanged and its stub tests passed.

## Mission 02B dependency regression

On 2026-11-22, Vite 6.4.5 and Vitest 4.1.12 were installed with the existing React plugin 4.7.0. Full dependency audit reported zero findings; 16 tests, TypeScript and the production build passed. The SHA-256 hashes of `src/wallet.ts` and `src/WalletPanel.tsx` matched before and after the upgrade. No wallet transaction was sent or browser wallet session exercised. See DEPENDENCY_SECURITY.md for advisory paths and patched versions.

## Mission 03 read-only recheck

On 2026-11-22 the Diana REST endpoint again returned hash `162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9`, height 10533933, code 0 and its chain-reported `pqc_hybrid_verify` event with status `verified`. Consensus status reported `qorechain-diana` and the separate EVM RPC returned `0x2648`. No cryptographic verification or new transaction was performed.
