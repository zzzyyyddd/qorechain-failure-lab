import { useState, type FormEvent } from 'react';
import { diagnose, evidence, lookupTransaction, type Lookup, type Diagnosis } from './diagnostics';
import { fixtures } from './fixtures';
import { WalletPanel } from './WalletPanel';
import './style.css';

function DiagnosisCard({value}: {value: Diagnosis}) {
  return <div className="diagnosis"><strong>{value.status}</strong><dl><dt>Evidence source</dt><dd>{value.source}</dd><dt>Explanation</dt><dd>{value.explanation}</dd><dt>Next action</dt><dd>{value.action}</dd><dt>Confidence</dt><dd>{value.confidence}</dd></dl></div>;
}
export function App(): JSX.Element {
  const [hash, setHash] = useState('');
  const [live, setLive] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  async function lookup(event: FormEvent) {
    event.preventDefault(); if (loading) return;
    setLoading(true); setLive(null); setCopyStatus('');
    try { setLive(await lookupTransaction(hash)); } finally { setLoading(false); }
  }
  const details = live && evidence(live);
  const diagnosis = live && diagnose(live);
  async function copyReport() {
    if (!live || !diagnosis) return;
    try { await navigator.clipboard.writeText(JSON.stringify({label:'LIVE DIANA LOOKUP', diagnosis, evidence:details, note:'Independent PQC cryptographic verification not performed.'},null,2)); setCopyStatus('Report copied.'); }
    catch { setCopyStatus('Copy failed. Select and copy the report below.'); }
  }
  return <main>
    <header><span className="eyebrow">QORECHAIN / DEVELOPER TOOLS</span><h1>Transaction Failure Lab</h1><p>Inspect native Diana receipts, understand what the evidence supports, and rehearse failure handling with clearly marked simulations.</p></header>
    <div className="notice"><strong>Diana testnet · Native transactions</strong> — A receipt lookup cannot explain every rejection. A wallet shield label or chain event is not independent cryptographic verification.</div>
    <section><div className="section-title"><span>01</span><h2>Live transaction lookup</h2></div><p>Enter a native transaction hash (64 hexadecimal characters, no 0x). Read-only lookup through the Diana REST proxy.</p><form onSubmit={lookup}><label htmlFor="tx-hash">Transaction hash</label><div className="lookup-row"><input id="tx-hash" value={hash} onChange={e=>setHash(e.target.value)} spellCheck={false} autoComplete="off" placeholder="64-character native hash" /><button disabled={loading}>{loading ? 'Looking up…' : 'Inspect transaction'}</button></div></form>{loading && <p role="status">Fetching native receipt…</p>}
      {diagnosis && <><h3>Failure diagnosis</h3><DiagnosisCard value={diagnosis} /><h3>Transaction evidence</h3>{details ? <><pre>{JSON.stringify(details,null,2)}</pre><p><a href="https://explore.qore.network/" target="_blank" rel="noreferrer">Open explorer ↗</a> · Select Testnet and search the hash.</p></> : <p>No receipt was retrieved. Lookup errors do not imply an on-chain failure.</p>}<button className="secondary" onClick={()=>void copyReport()}>Copy technical report</button><span className="copy-status" role="status">{copyStatus}</span><details open={copyStatus.startsWith('Copy failed') || undefined}><summary>View report</summary><pre>{JSON.stringify({label:'LIVE DIANA LOOKUP',diagnosis,evidence:details,note:'Independent PQC cryptographic verification not performed.'},null,2)}</pre></details></>}
    </section>
    <section><div className="section-title"><span>02</span><h2>Simulated failure lab</h2></div><p className="simulation-label">SIMULATED · Local examples only. No transactions are sent or looked up.</p><label htmlFor="fixture">Choose an example</label><select id="fixture" value={fixtureIndex} onChange={e=>setFixtureIndex(Number(e.target.value))}>{fixtures.map((f,i)=><option key={f.name} value={i}>{f.name}</option>)}</select><DiagnosisCard value={diagnose(fixtures[fixtureIndex].input)} /></section>
    <section><div className="section-title"><span>03</span><h2>QoreX wallet test</h2></div><p>This separate panel preserves the native signing test. Every transaction requires your click and wallet approval.</p><WalletPanel /></section>
    <footer>Built from the official QoreChain full-stack starter · Native testnet only</footer>
  </main>;
}
