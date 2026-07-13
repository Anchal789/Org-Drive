'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { useIsTab } from '@/hooks/use-mobile';

export default function TopbarWrapper({
  mobileTopBar,
  desktopTopBar,
}: {
  mobileTopBar: React.ReactNode;
  desktopTopBar: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsTab();

  const hiddenRoutes = ['/analytics', '/smart-search', '/ai-chat'];
  const shouldHide = hiddenRoutes.includes(pathname);

  if (shouldHide && !isMobile) {
    return null;
  }

  return <>{isMobile ? mobileTopBar : desktopTopBar}</>;
}
