# QoreChain Transaction Failure Lab

A native Diana testnet transaction diagnostics dashboard and QoreX wallet test, built from the official `create-qorechain-dapp` 0.14.0 fullstack-web Vite/React starter. Live lookups, wallet observations, and simulated examples are kept separate.

## Run locally

Requires Node.js 20, 22, or 24 and later (see `engines` in package.json). Run:

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints, normally http://127.0.0.1:5173/. Vite proxies `/lcd` reads to `https://api-testnet.qore.host`. The preview server uses the same proxy. For Vercel, `vercel.json` rewrites the native transaction lookup to a read-only serverless function in `api/receipt.js`, which validates hashes and uses the fixed Diana REST host. Other hosts must provide an equivalent proxy. No credentials are needed for lookups.

Enter a **native** transaction hash, 64 hex characters with no `0x`. The diagnosis requires a matching hash, positive committed height and numeric result code. For documented `sdk` and `pqc` codes, both codespace and code are checked. A missing result, network failure, timeout, or proxy/CORS problem does not prove a transaction failed. The report is copyable and omits signature material. The fixture selector is entirely simulated and never calls the network.

### QoreX test

Select Diana testnet in QoreX, connect, and explicitly click Send Test Transaction. The wallet must approve each request. It sends 1 uqor to the connected native address and QoreX shows the fee; there may be a separate key-registration request. No private keys or recovery phrases are requested. No transaction is automatic. The existing self-transfer has been observed on testnet; see [EVIDENCE.md](EVIDENCE.md).

## Two separate testnet records

- The native transaction `162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9` succeeded at height 10533933. Its REST receipt reports `pqc_hybrid_verify: verified`; QoreX separately reported `shielded`.
- The EVM `DiagnosticProofRegistry` was deployed at `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be` in transaction `0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921`, block 10589871, chain 9800. The creation receipt and matching bytecode were checked via Diana RPC. See [EVIDENCE.md](EVIDENCE.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

These are distinct transactions. Chain-reported PQC verification is not independent cryptographic signature verification, which this application has not performed. RPC responses are not light-client proofs, and pre-inclusion rejections may have no receipt.

## Validation and limits

`npm test`, `npm run typecheck`, and `npm run build`. Tests use simulated data and wallet stubs; they do not replace a real extension test. The classifier recognizes only a small documented set of codes and avoids guessing from gas usage or log fragments. The page supports native Cosmos transactions only, not EVM hashes. Some fields are unavailable for certain message types or endpoints. No independent chain proof verification or automatic evidence persistence is provided. The original wallet panel shows the raw receipt, which can contain public signatures; the diagnostic report and checked-in evidence intentionally omit them.

Credits: [QoreChain starter and SDK](https://github.com/qorechain/qorechain-sdk), [QoreX native integration](https://docs.qorechain.io/developer-tools/qorex-integrations/), [testnet endpoints](https://docs.qorechain.io/getting-started/connecting-to-testnet/), and documented [codespaces and codes](https://docs.qorechain.io/developer-tools/custody-kit/). MIT license.

The November 22, 2026 full dependency audit reported zero findings after targeted development dependency upgrades. The original findings, patched versions, and upgrade rationale are recorded in [DEPENDENCY_SECURITY.md](DEPENDENCY_SECURITY.md).
