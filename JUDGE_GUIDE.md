# Three-minute judge demo

1. **0:00–0:30 — Start:** Run `npm install` and `npm run dev -- --host 127.0.0.1`, then open the printed local URL. Explain this is a Diana native-lane diagnostic tool.
2. **0:30–1:15 — Live evidence:** Paste `162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9`. Inspect the receipt-confirmed status, height, gas, fee, message and address. Copy the report. Contrast wallet-reported shield and chain-reported verification event with independent cryptographic verification, which has not been performed.
3. **1:15–2:15 — Simulations:** Select out-of-gas, missing transaction, and RPC timeout. Each is explicitly SIMULATED; show that unavailable lookup is not an on-chain failure. Explain codespace plus code drive the out-of-gas classification.
4. **2:15–3:00 — Wallet:** Show the QoreX panel. With a funded Diana account, connect and optionally click the self-transfer only after reviewing the fee and approving the wallet prompts. Otherwise describe the flow without sending. Finish with the limits in README and the sanitized evidence file.

No testnet transaction is needed to demonstrate the lookup or simulations. The local proxy needs network access.

The lookup above is the **native** transaction proof. Separately, the EVM registry deployment at `0xebffbd63020757ffdd4ca40c2ddcc3ae564403be` succeeded in transaction `0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921` at block 10589871 on chain 9800; its receipt and runtime code were checked via RPC. Search the address or transaction on the [explorer](https://explore.qore.network/) with Testnet selected. See [EVIDENCE.md](EVIDENCE.md) for both records and their limits.
