# Judge guide: three minutes, no wallet required

Open the [production application](https://qorechain-failure-lab.vercel.app/). The inspector reads **native Diana testnet** transactions; an EVM transaction hash is a different identifier. Live endpoint availability can affect results.

## 0:00–0:45 · Inspect a known receipt

Click **Try verified transaction**. The app looks up:

```text
162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9
```

The recorded REST response reports height `10533933` and code `0`. Open **View evidence details** and **View technical report**, or copy the report. The chain-reported PQC event is not an independent signature verification. The raw receipt may contain public signature material.

## 0:45–1:30 · Try an unfamiliar transaction

Paste this native hash into **Native transaction hash**, without `0x`, and inspect it:

```text
7749F8F0BFE9DF62A15EF75481144241F237EC3AB74DE7EB2E5FCF9783FA0A2C
```

The sampled receipt reported height `10604453`, code `0`, and native `MsgRegisterKEMKey`. Compare with the [independent native REST response](https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/7749F8F0BFE9DF62A15EF75481144241F237EC3AB74DE7EB2E5FCF9783FA0A2C). Eleven further samples appear in [EVIDENCE.md](EVIDENCE.md#unfamiliar-native-transaction-audit--2026-11-23). Endpoints can be unavailable; a lookup error does not establish a failed transaction.

## 1:30–2:15 · Explore failure handling

In **Failure simulation lab**, select **Out-of-gas**, **On-chain failure**, and **RPC timeout**. Each example is invented, labeled simulated, and runs locally. A matching committed nonzero native code supports failure, with specific categories only for recognized codespace/code pairs. Native code `0` alone does not establish EVM execution success; the inspector reports an EVM failure event separately and otherwise leaves the EVM outcome unverified. An unavailable endpoint is a transport observation. A mismatched, incomplete or malformed receipt yields insufficient evidence. A real native failure is documented in [EVIDENCE.md](EVIDENCE.md#real-failure-validation--2026-11-23); other failure categories remain unverified against real receipts.

## 2:15–3:00 · Compare the evidence cards

The **native** card describes the receipt above. The separate **EVM** card identifies a deployed commitment registry and its deployment transaction. The registry records a caller-provided hash; it does not prove the content or accuracy of a diagnosis. Open **QoreX native wallet test** to see the optional, approval-gated self-transfer flow; do not connect or send for this demonstration.

## Verify independently afterward

1. Select Testnet on the [QoreChain explorer](https://explore.qore.network/) and search the native hash, or query the [native REST receipt](https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9).
2. In a local checkout with a supported Node version and network access, run:

   ```sh
   npm ci
   npm run compile:registry
   npm run verify:registry -- 0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921
   ```

   The read-only verifier checks Diana EVM chain ID `9800`, creation receipt and input, and runtime bytecode against local compilation. Expected contract: `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be`; block `10589871`. It neither sends a transaction nor proves consensus independently.
3. For the full test suite and known limitations, see the [README](README.md#run-and-verify), [evidence](EVIDENCE.md), and [deployment notes](DEPLOYMENT.md).
