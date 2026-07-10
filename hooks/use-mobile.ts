import { useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = 1024;
const TAB_BREAKPOINT = 768;
const MOBILE_BREAKPOINT = 448;

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsDesktop(window.innerWidth < DESKTOP_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsDesktop(window.innerWidth < DESKTOP_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isDesktop;
}

export function useIsTab() {
  const [isTab, setIsTab] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TAB_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsTab(window.innerWidth < TAB_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsTab(window.innerWidth < TAB_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isTab;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
