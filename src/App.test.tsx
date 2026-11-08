import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, { buildSteps } from './App';

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn(() => Promise.reject(new Error('network should not be used')));
  vi.stubGlobal('fetch', fetchSpy);
  Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn(), configurable: true });
  window.localStorage.clear();
  window.scrollTo = vi.fn() as never;
});
afterEach(() => vi.unstubAllGlobals());

const btn = (name: RegExp) => screen.getByRole('button', { name });

/** Rate every statement "Very like me" (or pick the first scenario option) until results. */
async function walkToResults(user: ReturnType<typeof userEvent.setup>) {
  await user.click(btn(/^begin$/i));
  for (let i = 0; i < 40; i++) {
    if (screen.queryByRole('heading', { name: /your gifts, and where they could serve/i })) return;
    const groups = screen.queryAllByRole('radiogroup');
    for (const g of groups) {
      const strong = within(g).queryByRole('radio', { name: /very like me/i });
      await user.click(strong ?? within(g).getAllByRole('radio')[0]);
    }
    await user.click(screen.getByRole('button', { name: /^(continue|see my gifts)$/i }));
  }
  throw new Error('never reached results');
}

describe('gifts inventory flow', () => {
  it('has a chapter card before each chapter and 13 answer screens', () => {
    const steps = buildSteps();
    expect(steps.filter((s) => s.type === 'screen')).toHaveLength(13);
    expect(steps.filter((s) => s.type === 'chapter').map((s) => (s as { chapter: string }).chapter)).toEqual(['notice', 'alive', 'care', 'others']);
  });

  it('can be started and answered with the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<App />);
    let guard = 0;
    while (document.activeElement?.textContent?.trim().toLowerCase() !== 'begin' && guard++ < 10) await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /what do you notice/i })).toHaveFocus();
    await user.keyboard('{Tab}{Tab}{Enter}'); // Back, Continue
    expect(screen.getByRole('heading', { name: /how much is each of these like you/i })).toHaveFocus();
    // first rating group: focus the first point, then use Space and the arrow keys
    const first = screen.getAllByRole('radiogroup')[0];
    within(first).getAllByRole('radio')[0].focus();
    await user.keyboard(' ');
    expect(within(first).getByRole('radio', { name: /not like me/i })).toBeChecked();
    // Arrow-key movement along the scale is native radio behavior; jsdom doesn't
    // emulate it reliably, so it is checked in a real browser instead.
  });

  it('asks for ratings (or skip) instead of silently advancing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(btn(/^begin$/i));
    await user.click(btn(/^continue$/i)); // chapter card
    await user.click(btn(/^continue$/i));
    expect(screen.getByRole('alert')).toHaveTextContent(/not sure/i);
    await user.click(btn(/^skip$/i));
    expect(screen.getByRole('heading', { name: /what do you most often find yourself doing/i })).toBeInTheDocument();
  });

  it('never asks about teams, roles, or contact details', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(btn(/^begin$/i));
    for (let i = 0; i < 17; i++) {
      expect(screen.queryByText(/tech and av|welcome team|kids ministry|prayer ministry|worship team/i)).toBeNull();
      expect(screen.queryByLabelText(/email|name/i)).toBeNull();
      const skip = screen.queryByRole('button', { name: /^skip$/i });
      await user.click(skip ?? btn(/^continue$/i));
    }
  });

  it('shows a gift profile and team recommendations, with no network requests', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    expect(screen.getByRole('heading', { name: /your gift profile/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^(strong|present|emerging)$/i).length).toBe(7);
    expect(screen.getAllByText(/recommended/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/%/)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
  });

  it('skipping everything gives an honest "need more answers" result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(btn(/^begin$/i));
    for (let i = 0; i < 17; i++) {
      const skip = screen.queryByRole('button', { name: /^skip$/i });
      await user.click(skip ?? btn(/^continue$/i));
    }
    expect(screen.getByText(/we need a few more answers/i)).toBeInTheDocument();
  });

  it('lets participants correct recommendations and browse every team', async () => {
    const user = userEvent.setup();
    render(<App />);
    await walkToResults(user);
    await user.click(btn(/show me other teams/i));
    const items = screen.getAllByRole('listitem').filter((li) => within(li).queryByRole('heading', { name: /^kids ministry$/i }));
    await user.click(within(items[0]).getByRole('button', { name: /this feels like me/i }));
    expect(within(items[0]).getByRole('button', { name: /this feels like me/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('heading', { name: /^kids ministry$/i }).length).toBeGreaterThan(1);
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
