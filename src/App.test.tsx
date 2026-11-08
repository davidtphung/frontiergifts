import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

let fetchSpy: ReturnType<typeof vi.fn>;
let beaconSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn(() => Promise.reject(new Error('network should not be used')));
  vi.stubGlobal('fetch', fetchSpy);
  beaconSpy = vi.fn();
  Object.defineProperty(navigator, 'sendBeacon', { value: beaconSpy, configurable: true });
  window.localStorage.clear();
  window.scrollTo = vi.fn() as never;
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const primary = (name: RegExp) => screen.getByRole('button', { name });

/** Answer each screen with the first option (or skip), until results. */
async function walkToResults(user: ReturnType<typeof userEvent.setup>) {
  await user.click(primary(/^begin$/i));
  for (let i = 0; i < 40; i++) {
    if (screen.queryByText(/here are a few places your story could connect/i)) return;
    const radios = screen.queryAllByRole('radio');
    const checks = screen.queryAllByRole('checkbox');
    if (radios.length) await user.click(radios[0]);
    else if (checks.length) await user.click(checks[0]);
    const next = screen.queryByRole('button', { name: /^(continue|see my results)$/i });
    const skip = screen.queryByRole('button', { name: /^skip$/i });
    if (!radios.length && !checks.length && skip) await user.click(skip);
    else if (next) await user.click(next);
  }
  throw new Error('never reached results');
}

describe('participant experience', () => {
  it('shows the privacy notice and shared heart before starting', () => {
    render(<App />);
    expect(screen.getByText(/nothing is sent anywhere unless you review it/i)).toBeInTheDocument();
    expect(screen.getByText(/we serve because we belong to one another in christ/i)).toBeInTheDocument();
  });

  it('can be completed with the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<App />);
    // Tab to Begin and press Enter
    let guard = 0;
    while (document.activeElement?.textContent?.trim().toLowerCase() !== 'begin' && guard++ < 10) await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /where are you with frontier/i })).toHaveFocus();
    // choose an option with the keyboard
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    // move to Continue and activate
    const cont = primary(/^continue$/i);
    while (document.activeElement !== cont && guard++ < 30) await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /what do you notice/i })).toHaveFocus();
  });

  it('asks for an answer or skip instead of silently advancing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(primary(/^begin$/i));
    await user.click(primary(/^continue$/i));
    expect(screen.getByRole('alert')).toHaveTextContent(/skip/i);
  });

  it('enforces multi-select maximums with a clear message', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(primary(/^begin$/i));
    await user.click(primary(/^skip$/i)); // familiarity
    await user.click(primary(/^continue$/i)); // chapter card
    const boxes = screen.getAllByRole('checkbox');
    await user.click(boxes[0]);
    await user.click(boxes[1]);
    expect(boxes[2]).toBeDisabled();
    expect(screen.getByText(/2 of 2 chosen/i)).toHaveTextContent(/deselect one/i);
  });

  it('shows results without asking for contact details and makes no network requests', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0); // nothing persisted without opt-in
  });

  it('requires explicit consent and still sends nothing when no endpoint is configured', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    await user.click(primary(/share with frontier/i));
    await user.click(primary(/18 or older/i));
    await user.click(primary(/review what i’ll share/i));
    expect(screen.getByRole('alert')).toHaveTextContent(/tick/i);
    await user.click(screen.getByLabelText(/share my summary with frontier/i));
    await user.click(primary(/review what i’ll share/i));
    expect(screen.getByText(/exactly what would be shared/i)).toBeInTheDocument();
    await user.click(primary(/^finish$/i));
    expect(screen.getByText(/nothing was sent/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not collect contact details from someone under 18', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    await user.click(primary(/share with frontier/i));
    await user.click(primary(/under 18/i));
    expect(screen.getByText(/parent or guardian/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('lets participants correct recommendations and browse every team', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    await user.click(primary(/show me other teams/i));
    const list = screen.getAllByRole('listitem').filter((li) => within(li).queryByRole('heading', { name: /kids ministry/i }));
    const kids = list[0];
    await user.click(within(kids).getByRole('button', { name: /this feels like me/i }));
    expect(within(kids).getByRole('button', { name: /this feels like me/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('heading', { name: /kids ministry/i }).length).toBeGreaterThan(1); // now also a card
  });

  it('only saves to the device after opting in, and erases when turned off', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    const toggle = screen.getByLabelText(/save my answers on this device/i);
    await user.click(toggle);
    expect(window.localStorage.length).toBe(1);
    await user.click(toggle);
    expect(window.localStorage.length).toBe(0);
  });
});
