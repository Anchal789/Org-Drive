import { useSyncExternalStore } from 'react';

const DESKTOP_BREAKPOINT = 1024;
const TAB_BREAKPOINT = 768;

function subscribeToBreakpoint(breakpoint: number) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  };
}

function useBreakpoint(breakpoint: number) {
  return useSyncExternalStore(
    subscribeToBreakpoint(breakpoint),
    () => window.innerWidth < breakpoint,
    () => false,
  );
}

export function useIsDesktop() {
  return useBreakpoint(DESKTOP_BREAKPOINT);
}

export function useIsTab() {
  return useBreakpoint(TAB_BREAKPOINT);
}
