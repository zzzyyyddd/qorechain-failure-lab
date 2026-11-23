# Audit and deployment readiness

## Current status — 2026-11-23

The repository and application are public, and the Diana EVM registry deployment was verified through read-only RPC. The production inspector was tested against 12 unfamiliar native successes; no real committed failure was found, so that classification remains unverified. A mismatched-receipt display bug found during that audit was fixed and released in Mission 07B. See [EVIDENCE.md](EVIDENCE.md), [DEPLOYMENT.md](DEPLOYMENT.md), and [JUDGE_GUIDE.md](JUDGE_GUIDE.md). Browser checks did not exercise a real QoreX approval. No independent PQC or consensus verification is claimed.

Event eligibility, organizer acceptance, participant account state, project-page details, and any required video have not been independently verified. This repository is not a hackathon submission.

## Historical Mission 03 review

> Historical Mission 03 snapshot. The Diana contract was subsequently deployed and verified; see [EVIDENCE.md](EVIDENCE.md) for current evidence.

Reviewed 2026-11-22 against the official [rules](https://build.qorechain.io/rules), [prizes](https://build.qorechain.io/prizes), [start page](https://build.qorechain.io/start), and [kits](https://build.qorechain.io/kits). Event terms may change. The published rules say judges use a category rubric but the reviewed pages do not specify a detailed Quantum Pass scoring rubric; no scores are assumed.

## Mandatory requirements

| Item | Result | Evidence / remaining work |
| --- | --- | --- |
| Original small QoreChain app built during event | PARTIAL | Original local diagnostic implementation and official starter credited; independent originality review and qualifying dated Git commits are still needed. |
| `create-qorechain-dapp` | PASS with provenance limitation | 0.14.0 fullstack-web scaffold was generated locally; no initial Git commit or machine-verifiable scaffold history was recorded. README credits it. Organiser detection is unverified. |
| QoreX connection and hybrid-signed testnet transaction | PARTIAL | User reported QoreX connection and wallet shield; Diana REST reports code 0 and a verified hybrid event for the recorded transaction. Independent cryptographic verification was not performed; organiser check and a current browser retest remain outstanding. |
| Testnet deployment | NOT DONE | No app or contract has been deployed by this project; Quantum Pass says deploy on testnet. Confirm the organiser's applicable deployment interpretation before submission. Do not assume a successful transfer alone satisfies it. |
| Public GitHub repository, MIT or Apache-2.0, README | NOT DONE | Local MIT licence and README exist; local Git repository initialized but no commits, public repo, or remote exist. |
| Video of working app, at most 3 minutes | NOT DONE | JUDGE_GUIDE is a script, not a recorded video. |
| Project page, category, testnet `qor1` address and details | UNVERIFIED | Add the recorded testnet sender to the project page, select Quantum Pass and record accurate kits/features. Its presence on the event project page cannot be verified locally. |
| Individual registration, age 18+, one GitHub account, GitHub/X/QoreX linked, team size 1–2 | UNVERIFIED | Must be completed and checked by each participant; no personal eligibility or account state was inspected. |
| Cover image | UNVERIFIED | Rules list a featured image, while start says a 16:9 cover is optional because the site can generate one. Confirm generated cover on the project page. Custom cover if used: at least 1200×675, JPG/PNG/WebP, ≤5 MB. |
| Deadline | PENDING | All required information must be in place by 2 December 2026 23:59 UTC; start says there is no separate submit button and the page becomes read-only at the deadline. |

Optional improvements: manual desktop/mobile and real-wallet regression, independent PQC cryptographic verification, and public progress updates. The Q-Day Drill is a separate award, with registration and drill dates already past; it is not a Quantum Pass condition.

## Technical review

- Live Diana REST independently returned the recorded hash, height 10533933, code 0, gas 200000/167681, fee 30000 uqor, and `pqc_hybrid_verify` status `verified`. Event is chain-reported; no independent cryptographic verification is claimed. Consensus `/status` identified `qorechain-diana`; separate EVM `eth_chainId` returned 9800. See EVIDENCE.md.
- QoreX code and wallet panel hashes match the previous known versions; no transaction was sent during this audit. Prior wallet success is reported evidence, not a current regression test.
- Live lookup, explicit transport errors, simulated fixtures and their labels were reviewed in code. Mobile CSS uses stacked controls and wrapping, but a current interactive desktop/mobile UI pass was not possible: the sandbox refused a local listener. No claim is made that every button was exercised.
- Production Vercel proxy: `vercel.json` rewrites only the native hash route to `api/receipt.js`, a GET-only, fixed-upstream serverless function with hash validation, no redirect following, a timeout, bounded body, JSON validation and explicit errors. Unit tests cover success and failure. Actual Vercel rewrite, runtime, upstream egress and live-wallet behavior are **not tested**. Vite's own `/lcd` proxy is only for local dev/preview.
- External documentation, SDK, explorer, schema and advisory hyperlinks returned HTTP 200 on 2026-11-22; chain service endpoints were checked with their appropriate read methods, not generic webpage GETs. Local placeholder endpoint paths are not standalone links.
- The untracked candidate files received a non-exhaustive pattern scan with no flagged private-key, token or credential assignments. `.env*` (except the empty example), `.vercel/`, `*.pem`, `*.key`, logs, build and dependency outputs are ignored. A pattern scan cannot prove absence of every possible secret; review before the first commit.
- `npm test`: 20 passed; `npm run typecheck`, `npm run build`: passed; full dependency audit: zero findings. MIT LICENSE, README, EVIDENCE.md, JUDGE_GUIDE.md, AI_USAGE.md and DEPENDENCY_SECURITY.md are present.

## Decision

**NO-GO for deployment/submission now:** live Vercel behavior and interactive UI regression are unverified; the public repository, event project information, video, participant eligibility and testnet deployment requirement remain incomplete or unverified. User explicitly prohibited push and deployment during this audit. After review and explicit authorization, create/link the public repo and Vercel project, run a preview deployment, test the actual lookup and wallet UX on desktop/mobile without automatic transactions, then complete event page requirements and record the video.
