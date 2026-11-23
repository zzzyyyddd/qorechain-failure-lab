// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from '../src/App';
import { NATIVE_HASH } from '../src/components/ProofCards';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function receiptResponse() {
  return { status: 200, ok: true, json: async () => ({ tx_response: { txhash: NATIVE_HASH, height: '10533933', code: 0 } }) };
}

describe('transaction workspace', () => {
  it('runs the verified example directly from the hero and displays receipt evidence', async () => {
    const fetcher = vi.fn(async () => receiptResponse());
    vi.stubGlobal('fetch', fetcher);
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: /try verified transaction/i }));
    await screen.findByRole('heading', { name: 'Confirmed success' });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe(`/lcd/cosmos/tx/v1beta1/txs/${NATIVE_HASH}`);
    expect((screen.getByLabelText('Native transaction hash') as HTMLInputElement).value).toBe(NATIVE_HASH);
    expect(screen.getByText('10533933')).toBeTruthy();
  });

  it('keeps simulations local and the wallet disconnected', () => {
    const fetcher = vi.fn();
    const enable = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    Object.defineProperty(window, 'qorex', { configurable: true, value: { native: { enable } } });
    render(<App />);
    for (let i = 0; i < 8; i++) fireEvent.change(screen.getByLabelText('Choose a scenario'), { target: { value: String(i) } });
    fireEvent.change(screen.getByLabelText('Choose a scenario'), { target: { value: '4' } });
    const lab = screen.getByRole('region', { name: /practice without the risk/i });
    expect(within(lab).getByText('RPC unavailable')).toBeTruthy();
    expect(within(lab).getByText(/SIMULATED \/ LOCAL FIXTURE/)).toBeTruthy();
    expect(fetcher).not.toHaveBeenCalled();
    expect(enable).not.toHaveBeenCalled();
    delete window.qorex;
  });

  it('shows a retry after a failed lookup and succeeds on retry', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(receiptResponse());
    vi.stubGlobal('fetch', fetcher);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /use verified example/i }));
    await screen.findByRole('heading', { name: 'RPC unavailable' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry lookup' }));
    await screen.findByRole('heading', { name: 'Confirmed success' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not display a mismatched receipt as transaction evidence', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200, ok: true, json: async () => ({ tx_response: { txhash: 'C'.repeat(64), height: '987', code: 0 } }) })));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /use verified example/i }));
    await screen.findByRole('heading', { name: 'Insufficient evidence' });
    expect(screen.queryByText('987')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry lookup' })).toBeTruthy();
    fireEvent.click(screen.getByText('View technical report'));
    expect(screen.getByText(/"evidence": null/)).toBeTruthy();
    fireEvent.click(screen.getByText('View raw receipt'));
    expect(screen.getByText(/do not treat it as matching evidence/i)).toBeTruthy();
  });

  it('shows a reported EVM revert instead of calling the native wrapper a success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 200, ok: true, json: async () => ({ tx_response: { txhash: NATIVE_HASH, height: '10578918', code: 0, events: [{ type: 'ethereum_tx', attributes: [{ key: 'ethereumTxHash', value: '0x03485c05590097811fb608ed7e941c4fe50fa591aa09165c7f7f2f0f9c966518' }, { key: 'ethereumTxFailed', value: 'execution reverted' }] }] }, tx: { body: { messages: [{ '@type': '/cosmos.evm.vm.v1.MsgEthereumTx' }] } } }) })));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /use verified example/i }));
    await screen.findByRole('heading', { name: 'EVM execution failure reported' });
    expect(screen.queryByRole('heading', { name: 'Confirmed success' })).toBeNull();
    const summary = screen.getByText('View technical report');
    fireEvent.click(summary);
    expect(summary.parentElement?.querySelector('pre')?.textContent).toContain('execution reverted');
  });

  it('copies the full contract address, not its shortened display', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy contract address' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('0xebffbd63020757ffdd4ca40c2ddcc3ae564403be'));
    expect(screen.getByText('Contract address copied')).toBeTruthy();
  });
});
