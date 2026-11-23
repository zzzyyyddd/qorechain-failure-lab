import { forwardRef, useImperativeHandle, useState, type FormEvent } from 'react';
import { diagnose, evidence, lookupTransaction, type Lookup } from '../diagnostics';
import { NATIVE_HASH } from './ProofCards';

export const Inspector = forwardRef<{ runExample: () => void }>(function Inspector(_props, ref) {
  const [hash, setHash] = useState('');
  const [live, setLive] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  async function inspect(value: string) {
    if (loading) return;
    setHash(value); setLoading(true); setLive(null); setCopyStatus('');
    try { setLive(await lookupTransaction(value)); } finally { setLoading(false); }
  }
  useImperativeHandle(ref, () => ({ runExample: () => void inspect(NATIVE_HASH) }));
  function submit(event: FormEvent) { event.preventDefault(); void inspect(hash); }
  const details = live && evidence(live);
  const diagnosis = live && diagnose(live);
  const report = { label: 'LIVE DIANA LOOKUP', diagnosis, evidence: details, note: 'Independent PQC cryptographic verification not performed.' };
  async function copyReport() {
    try { await navigator.clipboard.writeText(JSON.stringify(report, null, 2)); setCopyStatus('Report copied.'); }
    catch { setCopyStatus('Copy failed. Open the report below to select its text.'); }
  }
  return <section id="inspector" className="workspace-section" aria-labelledby="inspector-title">
    <div className="section-heading"><div><p className="kicker">01 / TRANSACTION INSPECTOR</p><h2 id="inspector-title">Start with the receipt.</h2><p>Look up a native transaction on Diana. No wallet required.</p></div><span className="quiet-tag">READ-ONLY LOOKUP</span></div>
    <div className="inspector-panel"><form onSubmit={submit}><div className="form-top"><label htmlFor="tx-hash">Native transaction hash</label><button type="button" className="inline-button" disabled={loading} onClick={() => void inspect(NATIVE_HASH)}>Use verified example <span aria-hidden="true">↗</span></button></div><div className="lookup-row"><input id="tx-hash" value={hash} onChange={e => setHash(e.target.value)} spellCheck={false} autoComplete="off" placeholder="Enter 64-character transaction hash" aria-describedby="hash-help"/><button className="button primary" disabled={loading} type="submit">{loading ? 'Inspecting…' : 'Inspect transaction'} <span aria-hidden="true">→</span></button></div><p id="hash-help" className="field-help">64 hexadecimal characters · Native transactions only · No 0x prefix</p></form>
      <div className="lookup-announcement" role="status" aria-live="polite">{loading ? 'Fetching Diana receipt…' : ''}</div>
      {!live && !loading && <div className="empty-state"><div className="empty-icon" aria-hidden="true">⌁</div><div><strong>Ready to investigate</strong><p>Enter a hash or try the verified example to see a diagnosis and its evidence.</p></div></div>}
      {diagnosis && live && <div className="result" aria-live="polite"><div className="result-header"><div><span className="meta-label">DIAGNOSIS</span><h3>{diagnosis.status}</h3></div><span className={`badge ${diagnosis.status === 'Confirmed success' ? 'success' : 'warning'}`}>{diagnosis.confidence}</span></div><p>{diagnosis.explanation}</p><div className="action-box"><span className="meta-label">RECOMMENDED NEXT ACTION</span><p>{diagnosis.action}</p></div>
        {details && <div className="summary-grid"><div><span>Block</span><strong>{String(details.height ?? 'Unavailable')}</strong></div><div><span>Receipt code</span><strong>{String(details.code ?? 'Unavailable')}</strong></div><div><span>Evidence source</span><strong>{diagnosis.source}</strong></div></div>}
        {!details && <button className="button secondary" type="button" onClick={() => void inspect(hash)} disabled={loading}>Retry lookup</button>}
        <div className="result-actions"><button type="button" className="button secondary" onClick={() => void copyReport()}>Copy report</button><span role="status">{copyStatus}</span></div>
        <details><summary>View evidence details</summary><pre>{JSON.stringify(details ?? { source: diagnosis.source, detail: diagnosis.explanation }, null, 2)}</pre></details>
        <details open={copyStatus.startsWith('Copy failed') || undefined}><summary>View technical report</summary><pre>{JSON.stringify(report, null, 2)}</pre></details>
        {live.kind === 'receipt' && <details><summary>View raw receipt</summary><p className="field-help">The raw response may contain public signature material.</p><pre>{JSON.stringify(live.data, null, 2)}</pre></details>}
      </div>}
    </div>
  </section>;
});
