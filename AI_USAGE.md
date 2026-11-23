# AI usage

In the initial stage, OpenAI Codex inspected official documentation, generated the official starter, performed read-only connectivity checks, and wrote the connectivity script and evidence notes. At that stage no live wallet interaction, transaction, diagnostic product, or hybrid verification was completed.

On continuation, Codex implemented the native QoreX test page, local receipt lookup, tests, and documentation using official QoreX API references. A real wallet and hybrid transaction were not exercised by the assistant.

For Mission 02, Codex retrieved the provided public testnet receipt, saved selected sanitized fields, implemented the live lookup, rule-based diagnostics and simulated fixtures, and added tests and documentation. The independent cryptographic verification of the signature was not performed. The pre-existing wallet submission logic was retained.

For Mission 02B, Codex reviewed npm advisories, upgraded the development toolchain, and ran local regression checks without submitting a transaction.

For Mission 03, Codex reviewed the official event requirements and local evidence, prepared a restricted Vercel receipt proxy and its tests, checked links and repository hygiene, and documented unresolved deployment and submission checks. No transaction or deployment was made.

Subsequent work documented and checked the deployed registry and public release, then redesigned the interface and added interface tests. See [EVIDENCE.md](EVIDENCE.md) for the provenance and limits of the on-chain records; documentation of a deployment does not imply Codex independently signed it.

For Mission 06, Codex reviewed and tested the redesign, pushed the release and verified the resulting Vercel production deployment. For Mission 07, Codex sampled public native transactions, compared REST receipts with consensus-index results, tested production and identified a mismatched-receipt display bug. It found no real committed failed receipt in the sample. For Mission 07B, Codex tested and released the fix and documented the sample. Those checks used read-only lookups and controlled browser responses; no transaction was sent, and no independent PQC signature or consensus proof was verified.
