import {useSyncExternalStore} from 'react';

// Whether the falling leaves move: the menu's pause control sets it, and until
// then it follows the reduced-motion setting. Kept for the visit only (the
// privacy page promises no cookies), which survives page changes because the
// site doesn't reload between pages.
let choice: boolean | null = null;
const listeners = new Set<() => void>();

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const leavesPlaying = (): boolean => choice ?? !reducedMotion();

export function setLeavesPlaying(playing: boolean): void {
  choice = playing;
  listeners.forEach((listener) => listener());
}

export function onLeavesPlayingChange(listener: () => void): () => void {
  listeners.add(listener);
  const motion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  motion?.addEventListener('change', listener);
  return () => {
    listeners.delete(listener);
    motion?.removeEventListener('change', listener);
  };
}

export const useLeavesPlaying = (): boolean =>
  useSyncExternalStore(onLeavesPlayingChange, leavesPlaying, () => true);
