import { useRef } from 'react';
import { Inspector } from './components/Inspector';
import { ProofCards } from './components/ProofCards';
import { SimulationLab } from './components/SimulationLab';
import { WalletPanel } from './WalletPanel';
import './style.css';

const GITHUB = 'https://github.com/zzzyyyddd/qorechain-failure-lab';
const DOCS = 'https://docs.qorechain.io/';
export function App(): JSX.Element {
  const inspectorRef = useRef<{ runExample: () => void }>(null);
  return <><a className="skip-link" href="#inspector">Skip to transaction inspector</a><header className="topbar"><div className="topbar-inner"><a className="brand" href="#top" aria-label="QoreChain Failure Lab home"><span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>QoreChain <strong>Failure Lab</strong></span></a><nav aria-label="Main navigation"><span className="network-tag">Diana Testnet</span><a href={GITHUB} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a href={DOCS} target="_blank" rel="noreferrer">Docs <span aria-hidden="true">↗</span></a></nav></div></header>
    <main id="top" className="container"><section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="kicker"><span className="kicker-line"></span> THE TESTNET DIAGNOSTICS WORKSPACE</p><h1 id="hero-title">Debug QoreChain transactions with <em>evidence, not guesswork.</em></h1><p className="hero-description">Inspect live Diana receipts, diagnose transaction failures, and explore safe simulations.</p><div className="hero-actions"><a className="button primary" href="#inspector" onClick={() => inspectorRef.current?.runExample()}>Try verified transaction <span aria-hidden="true">→</span></a><a className="button secondary" href="#simulations">Explore failure scenarios <span aria-hidden="true">↗</span></a></div></div><div className="hero-aside" aria-hidden="true"><span>FAILURE LAB / 01</span><div className="hero-aside-line"></div><p>See what happened.<br/><strong>Know what to do next.</strong></p><div className="hero-aside-bottom"><span>DIANA TESTNET</span><span>READ · DIAGNOSE · LEARN</span></div></div></section>
      <ProofCards/><Inspector ref={inspectorRef}/><SimulationLab/>
      <section className="workspace-section advanced" aria-labelledby="advanced-title"><div className="section-heading"><div><p className="kicker">03 / ADVANCED TOOLS</p><h2 id="advanced-title">Need to test a wallet?</h2><p>A separate native QoreX signing flow for testnet.</p></div></div><details className="wallet-disclosure"><summary><span><strong>QoreX native wallet test</strong><small>Manual connection and approval required for every transaction.</small></span><span className="disclosure-label">Open tool <span aria-hidden="true">＋</span></span></summary><WalletPanel/></details></section>
    </main><footer className="site-footer"><div className="container footer-inner"><div><strong>QoreChain Failure Lab</strong><p>Diana testnet only · Chain-reported events are not independent cryptographic verification.</p></div><nav aria-label="Footer navigation"><a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a><a href={DOCS} target="_blank" rel="noreferrer">Documentation ↗</a></nav></div></footer></>;
}
