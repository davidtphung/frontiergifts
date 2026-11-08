import type { Answers, FeedbackMap } from './types';

/**
 * Opt-in, device-only persistence. Nothing is written unless the participant
 * turns on "Save on this device". Every access is wrapped because storage can
 * be unavailable (private mode, blocked site data).
 */
const KEY = 'frontiergifts:v2';

export interface SavedState {
  answers: Answers;
  feedback: FeedbackMap;
  step: number;
  savedAt: string;
}

export function loadSaved(): SavedState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}

export function save(state: Omit<SavedState, 'savedAt'>): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
  } catch {
    /* storage unavailable: silently keep session-only */
  }
}

export function clearSaved(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
