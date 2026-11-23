# Testnet evidence

## Unfamiliar native transaction audit — 2026-11-23

Twelve distinct native hashes were discovered in the public Diana consensus transaction index and checked against the separate [native REST endpoint](https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/7749F8F0BFE9DF62A15EF75481144241F237EC3AB74DE7EB2E5FCF9783FA0A2C). For each, the REST hash and committed height matched the index, both reported code 0, and the production inspector displayed confirmed success and the matching height. The sample includes native EVM-window management messages, not EVM transaction hashes. These are endpoint reports, not independently verified consensus or PQC proofs.

| Native hash | Height | Native message |
| --- | ---: | --- |
| `7749F8F0BFE9DF62A15EF75481144241F237EC3AB74DE7EB2E5FCF9783FA0A2C` | 10604453 | MsgRegisterKEMKey |
| `6B64F68D4DC51ED5F448958105A34C8775513E65A2FCA5F3A2B6969F24DF090F` | 10604449 | MsgRegisterPQCKeyV2 |
| `96F1A8750AD426F1E93FD4DBCF5165A63AA3B9C23131FED5C2C03A8DA922D620` | 10604400 | MsgSubmitBatch |
| `E982636A64B349F4FAFD30EADD5600D9B5360EEBF7BDD83EAC0A21A0EB4B3BFF` | 10604362 | MsgPostRollupData |
| `54CCF6E5A88EFD9E8269ADF43CF8F61544FF59EE070D29861D449B097CA83044` | 10604346 | MsgHeartbeat |
| `B872F61E6F718A28D8F5465B8B1AE959130EFBA0B50E3A854B7D5968518AB821` | 10604319 | MsgOpenEVMWindow |
| `B3DDADBFFAE7E44F612C8AB6666ADAF8E4FA75B9DB5F19B0BB5CC1BF51BE7CF6` | 10604265 | MsgExecuteWithdrawal |
| `B469DA8F67D07FF2BF1314A97626419D68E25D7F6A0FA6A51A76D62095A45397` | 10604217 | MsgSubmitBatch |
| `275F74F7F0C9E1A885A38D29B968B2AF97183C799384D61A366472CB990D8AF7` | 10604202 | MsgOpenEVMWindow |
| `4B1278128FCB468C2F973B4E5FEF847D563230090B3DBCF67AF5074400352A25` | 10604198 | MsgCloseEVMWindow |
| `D2B896CBE49316D43702B173ED3DE39A565A21B1DF7CFADA07E2DF8AAFF9A9DE` | 10604179 | MsgPostRollupData |
| `875A1B77FDDDF2FF880A87B34830CEDCED72B516918C675B4ACD5F4C51751F0D` | 10604167 | MsgOpenEVMWindow |

The latest 100 indexed transactions and another 100 sampled farther back all reported code 0. No real committed failed receipt was found; real-failure classification remains unverified. A controlled mismatched response exposed a display bug: the diagnosis said insufficient evidence, but its summary showed the other receipt's block and code. The fix in this revision excludes mismatched fields from the evidence summary and report, while labeling the raw response as unverified. No transaction was sent during this audit.

## DiagnosticProofRegistry deployment — independently rechecked 2026-11-23

The read-only verifier queried `https://evm-testnet.qore.host` and confirmed chain ID **9800**, a successful creation receipt at block **10589871**, deployment transaction `0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`, and contract address `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be`. It checked that the creation input and deployed runtime bytecode match the current locally compiled source. Search either identifier on the [QoreChain explorer](https://explore.qore.network/) with Testnet selected. Reproduce the check with `npm run verify:registry -- 0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`; see [DEPLOYMENT.md](DEPLOYMENT.md). This is an RPC check, not an independent consensus proof.

On 2026-11-23 the separate native REST lookup again returned the native hash, height 10533933, code 0 and `pqc_hybrid_verify` status `verified` with algorithm `dilithium5`.

## Historical public release checks — 2026-11-23

Repository: https://github.com/zzzyyyddd/qorechain-failure-lab. Production: https://qorechain-failure-lab.vercel.app/ (Vercel deployment `dpl_9VfBBNsSqMdRf1q5vY3PLERgrxn5`). Unauthenticated requests to the production alias returned HTTP 200 for the homepage and its JavaScript bundle. Both the `/lcd/cosmos/tx/v1beta1/txs/` lookup route and `/api/receipt?hash=` returned HTTP 200 and the known native hash, height 10533933, code 0 and chain-reported hybrid verification status `verified`. The API rejected an invalid hash with HTTP 400. This checks the deployed HTTP routes, not an interactive browser session or independent signature verification.

Release validation: `npm test` passed 20 application tests and both contract test files; `npm run typecheck`, `npm run build`, and `npm audit` passed, with zero reported vulnerabilities. The Vercel production build succeeded.

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
