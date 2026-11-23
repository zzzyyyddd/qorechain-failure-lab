import { useRef, useState } from 'react';
import { CHAIN_ID, SIGNING_METHOD, connect, fetchReceipt, getWallet, sendTest, validHash } from './wallet';
import { diagnose, isExplicitWalletRejection } from './diagnostics';
import './style.css';

type WalletResult = Awaited<ReturnType<typeof sendTest>>;
export function WalletPanel(): JSX.Element {
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [rejected, setRejected] = useState(false);
  const [result, setResult] = useState<WalletResult | null>(null);
  const [receipt, setReceipt] = useState<unknown>(null);
  const [receiptError, setReceiptError] = useState('');

  async function run(task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(''); setRejected(false);
    try { await task(); } catch (e) { setRejected(isExplicitWalletRejection(e)); setError(e instanceof Error ? e.message : String(e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function loadReceipt(hash: string) {
    setReceiptError('');
    try { setReceipt(await fetchReceipt(hash)); }
    catch (e) { setReceiptError(e instanceof Error ? e.message : String(e)); }
  }
  function connectWallet() { void run(async () => { setAddress(''); setAddress(await connect(getWallet())); }); }
  function send() { void run(async () => {
    setResult(null); setReceipt(null); setReceiptError('');
    const response = await sendTest(getWallet(), address);
    setResult(response);
    if (typeof response.txHash === 'string' && validHash(response.txHash)) await loadReceipt(response.txHash);
    else setReceiptError('Wallet did not return a valid native transaction hash.');
  }); }
  return <div className="wallet-panel">
    <header><span className="eyebrow">QORECHAIN FAILURE LAB / WALLET TEST</span><h1>Test the native signing flow.</h1><p>Connect QoreX on Diana, then explicitly approve a small testnet self-transfer in your wallet.</p></header>
    <div className="notice"><strong>Testnet only.</strong> This sends 1 uqor to your own native address. QoreX sets the network fee and may request a separate key-registration approval. Review every wallet prompt; no transaction is sent automatically.</div>
    <section><div className="section-title"><span>01</span><h2>Connect wallet</h2></div><p>The requested native chain is <code>{CHAIN_ID}</code>. Select testnet in QoreX before connecting.</p><button disabled={busy} onClick={connectWallet}>Connect Wallet</button>
      <dl><dt>Wallet address</dt><dd>{address || 'Not connected'}</dd><dt>Requested chain ID</dt><dd><code>{CHAIN_ID}</code> (wallet selection must match)</dd><dt>Signing method</dt><dd>{SIGNING_METHOD}</dd></dl>
    </section>
    <section><div className="section-title"><span>02</span><h2>Send test transaction</h2></div><p>From and to: your connected address. Amount: <strong>1 uqor</strong> plus the wallet-displayed fee. Clicking opens QoreX; you decide whether to approve.</p><button disabled={!address || busy} onClick={send}>Send Test Transaction</button>{busy && <p role="status">Waiting for wallet or network…</p>}</section>
    {error && <div role="alert" className="error">{rejected ? <><strong>Wallet rejection</strong><p>{diagnose({kind:'wallet-rejected', detail:error}).explanation}</p><p>Evidence: explicit wallet response · Review and retry only if you intend to approve.</p></> : error}</div>}
    {result && <section><div className="section-title"><span>03</span><h2>Transaction evidence</h2></div><dl><dt>Transaction hash</dt><dd className="wrap">{result.txHash || 'Not returned'}</dd><dt>Wallet-reported code</dt><dd>{String(result.code ?? 'Not returned')}</dd><dt>Wallet-reported height</dt><dd>{String(result.height ?? 'Not returned')}</dd><dt>Wallet-reported shield</dt><dd>{String(result.shield ?? 'Not returned')}</dd></dl><p className="notice">The shield value is reported by QoreX. This page has not independently verified a post-quantum signature.</p><p><a href="https://explore.qore.network/" target="_blank" rel="noreferrer">Open QoreChain Explorer ↗</a> · Select Testnet and search the native hash.</p>
      {receiptError && <p role="alert" className="error">{receiptError}</p>}
      {validHash(result.txHash || '') && <button className="secondary" disabled={busy} onClick={() => void run(() => loadReceipt(result.txHash))}>Refresh receipt</button>}
      <h3>Native REST response</h3>{receipt ? <pre>{JSON.stringify(receipt, null, 2)}</pre> : <p>Receipt not yet available.</p>}
    </section>}
    <footer>Native lane · No private keys requested · <a href="https://docs.qorechain.io/developer-tools/qorex-integrations/" target="_blank" rel="noreferrer">QoreX documentation ↗</a></footer>
  </div>;
}
