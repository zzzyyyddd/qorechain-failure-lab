# DiagnosticProofRegistry: Diana deployment

**Status: deployed and independently checked via Diana RPC on 2026-11-23.** Chain ID: `9800`; contract: `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be`; deployment transaction: `0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`; block: `10589871`; receipt: success; creation input and runtime bytecode match the local compilation. See [EVIDENCE.md](EVIDENCE.md).

The contract records a nonzero 32-byte commitment per caller and emits `DiagnosticRecorded`. A duplicate from the same caller reverts; another caller may record the same hash. On-chain hashes, caller addresses and event timing are public. A hash is not encryption: do not hash sensitive or predictable content without understanding the disclosure risk. The registry proves a caller recorded a hash; it does not establish the report's truth.

## Official network and wallet requirements

Diana uses EVM chain ID 9800 (`0x2648`) and `https://evm-testnet.qore.host`. Use the [QoreChain explorer](https://explore.qore.network/) with Testnet selected; see [network documentation](https://docs.qorechain.io/getting-started/connecting-to-testnet/) and [EVM development](https://docs.qorechain.io/developer-guide/evm-development/). QoreX exposes its EVM provider at `window.qorex.evm` as documented in [QoreX integrations](https://docs.qorechain.io/developer-tools/qorex-integrations/). The [deployment guide](https://docs.qorechain.io/getting-started/deploy-in-5-minutes/) explains the funded coin-60 account, PQC registration and EVM authorisation window. Contract creation requires a window that permits creation; opening a window is itself a separate wallet-approved native transaction. The local deployment page has not been independently confirmed as the flow used for this deployment.

## Reproduce compilation and verification

Run `npm ci`, then `npm run compile:registry` to regenerate the ignored artifact using locked `solc` 0.8.39, optimizer enabled with 200 runs, and EVM Paris. Run `npm run verify:registry -- 0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921` to check chain ID, receipt, creation input and runtime bytecode via read-only RPC. No wallet or transaction is required.

## Optional future deployment steps

1. Run `npm test`, `npm run typecheck`, `npm run build`, `npm audit` and `npm run compile:registry`. Compilation uses the locked solc version, optimizer 200 runs and EVM Paris. Keep the same source, compiler and settings until verification is complete.
2. In QoreX select Diana testnet and a funded coin-60 account. Register its PQC key and open an appropriately limited EVM authorisation window according to the official guide. Review each wallet transaction and fee.
3. Run `npm run deploy:registry` and open `http://127.0.0.1:3189/` in that same browser. The local-only page checks QoreX's chain ID and account, then requests a contract creation only when its button is clicked. Review and approve the wallet prompt. If a hash is not returned after approval, inspect wallet history before retrying.
4. Copy the returned transaction hash and run `npm run verify:registry -- 0x...`. The verifier checks the public Diana RPC chain ID, successful receipt, creation input, address and matching compiled runtime code. It does not broadcast a transaction. Record its actual output and explorer search link in EVIDENCE.md. Close the EVM window in QoreX when finished.

No private keys or recovery phrases are needed by these scripts. Explorer URL structure for an EVM transaction has not been independently verified; use the explorer home and select Testnet rather than assuming a direct transaction URL works.
