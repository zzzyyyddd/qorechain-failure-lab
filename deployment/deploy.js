const button = document.querySelector('#deploy');
const status = document.querySelector('#status');
const show = (message) => { status.textContent = message; };
const previous = sessionStorage.getItem('registryDeploymentHash');
if (previous) show(`A deployment was already submitted in this tab: ${previous}\nVerify it before submitting another.`);

button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    if (sessionStorage.getItem('registryDeploymentHash')) throw new Error('A deployment hash is already recorded in this tab. Verify it before retrying.');
    const wallet = window.qorex?.evm;
    if (!wallet || typeof wallet.request !== 'function') throw new Error('QoreX EVM provider not found. Open this local page in a browser with QoreX unlocked.');
    const checkChain = async () => {
      const id = await wallet.request({ method: 'eth_chainId' });
      if (id !== '0x2648') throw new Error(`Wallet chain is ${String(id)}; select Diana testnet (0x2648) in QoreX.`);
    };
    await checkChain();
    const accounts = await wallet.request({ method: 'eth_requestAccounts' });
    if (!Array.isArray(accounts) || !/^0x[0-9a-fA-F]{40}$/.test(accounts[0] || '')) throw new Error('QoreX returned no valid EVM account.');
    const response = await fetch('/registry-artifact.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Compiled artifact missing. Run npm run compile:registry.');
    const artifact = await response.json();
    if (!/^0x[0-9a-fA-F]+$/.test(artifact.bytecode)) throw new Error('Invalid compiled bytecode.');
    await checkChain();
    const current = await wallet.request({ method: 'eth_accounts' });
    if (!Array.isArray(current) || current[0]?.toLowerCase() !== accounts[0].toLowerCase()) throw new Error('Wallet account changed; reconnect.');
    show('Review the contract creation and fee in QoreX. Waiting for wallet approval…');
    const hash = await wallet.request({ method: 'eth_sendTransaction', params: [{ from: accounts[0], data: artifact.bytecode, chainId: '0x2648', value: '0x0' }] });
    if (typeof hash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new Error('Wallet returned no valid transaction hash. Check wallet history before retrying.');
    sessionStorage.setItem('registryDeploymentHash', hash);
    show(`Transaction submitted, not yet verified: ${hash}\nRun npm run verify:registry -- ${hash}`);
  } catch (error) {
    show(`${error?.message || String(error)}\nIf a wallet approval was already given, inspect wallet history before retrying.`);
  }
  // Deliberately do not re-enable in this page session; avoid accidental repeat submissions.
});
