import { useState } from 'react';
import { diagnose } from '../diagnostics';
import { fixtures } from '../fixtures';

export function SimulationLab() {
  const [fixtureIndex, setFixtureIndex] = useState(7);
  const diagnosis = diagnose(fixtures[fixtureIndex].input);
  return <section id="simulations" className="workspace-section" aria-labelledby="simulation-title">
    <div className="section-heading"><div><p className="kicker">02 / FAILURE SIMULATION LAB</p><h2 id="simulation-title">Practice without the risk.</h2><p>Explore how different outcomes are classified, without a wallet or network request.</p></div><span className="badge simulated">SIMULATED / LOCAL FIXTURE</span></div>
    <div className="simulation-panel"><div className="simulation-input"><label htmlFor="fixture">Choose a scenario</label><select id="fixture" value={fixtureIndex} onChange={e => setFixtureIndex(Number(e.target.value))}>{fixtures.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}</select><p>These examples are invented. They are never submitted to a network.</p></div><div className="simulation-output" aria-live="polite"><span className="meta-label">SIMULATED DIAGNOSIS</span><h3>{diagnosis.status}</h3><p>{diagnosis.explanation}</p><div className="simulation-action"><span>Suggested action</span><p>{diagnosis.action}</p></div></div></div>
  </section>;
}
