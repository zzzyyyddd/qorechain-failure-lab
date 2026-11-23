import { useState } from 'react';

export const NATIVE_HASH = '162C94567D7BE3CA25150867FA2477E849591F149BC8E8739F57A6ECD16273C9';
const CONTRACT = '0xebffbd63020757ffdd4ca40c2ddcc3ae564403be';
const DEPLOYMENT = '0xed6bd49d5ac1a6e075d138aa0c4b8960121bee32604996fdb115e377a80c8921';
const short = (value: string) => `${value.slice(0, 12)}…${value.slice(-8)}`;

function CopyValue({ label, value }: { label: string; value: string }) {
  const [message, setMessage] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(value); setMessage(`${label} copied`); }
    catch { setMessage(`Copy unavailable. Full ${label.toLowerCase()}: ${value}`); }
  }
  return <div className="copy-value"><code title={value}>{short(value)}</code><button className="icon-button" type="button" onClick={() => void copy()} aria-label={`Copy ${label.toLowerCase()}`}>Copy</button><span className="copy-feedback" role="status">{message}</span></div>;
}

export function ProofCards() {
  return <section className="proof-section" aria-labelledby="proof-title">
    <div className="section-heading proof-heading"><div><p className="kicker">ON-CHAIN EVIDENCE</p><h2 id="proof-title">Two records. One transparent trail.</h2></div><a className="text-link" href="https://github.com/zzzyyyddd/qorechain-failure-lab/blob/main/EVIDENCE.md" target="_blank" rel="noreferrer">View evidence notes <span aria-hidden="true">↗</span></a></div>
    <div className="proof-grid">
      <article className="proof-card"><div className="card-heading"><div><span className="card-index">01 / NATIVE</span><h3>Hybrid transaction</h3></div><span className="badge success"><span aria-hidden="true">●</span> Receipt success</span></div>
        <div className="proof-hash"><span className="meta-label">TRANSACTION HASH</span><CopyValue label="Native transaction hash" value={NATIVE_HASH}/></div>
        <div className="proof-facts"><div><span>Block</span><strong>10,533,933</strong></div><div><span>Receipt code</span><strong>0</strong></div><div><span>PQC event</span><strong>Verified <small>chain-reported</small></strong></div></div>
      </article>
      <article className="proof-card"><div className="card-heading"><div><span className="card-index">02 / EVM</span><h3>DiagnosticProofRegistry</h3></div><span className="badge success"><span aria-hidden="true">●</span> Code matched</span></div>
        <div className="proof-identifiers"><div><span className="meta-label">CONTRACT</span><CopyValue label="Contract address" value={CONTRACT}/></div><div><span className="meta-label">DEPLOYMENT TX</span><CopyValue label="Deployment transaction hash" value={DEPLOYMENT}/></div></div>
        <div className="proof-facts"><div><span>Block</span><strong>10,589,871</strong></div><div><span>Chain ID</span><strong>9800</strong></div><div><span>Receipt</span><strong>Success</strong></div></div>
      </article>
    </div>
    <p className="proof-note"><span aria-hidden="true">ⓘ</span> The PQC event is chain-reported, not an independent cryptographic verification. Registry bytecode matches the compiled artifact. <a href="https://explore.qore.network/" target="_blank" rel="noreferrer">Search on explorer ↗</a> <span className="muted">(select Testnet)</span></p>
  </section>;
}
