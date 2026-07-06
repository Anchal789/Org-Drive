'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import type React from 'react';

export default function TopbarWrapper({
  mobileTopBar,
  desktopTopBar,
}: {
  mobileTopBar: React.ReactNode;
  desktopTopBar: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const hiddenRoutes = ['/analytics', '/smart-search', '/ai-chat'];
  const shouldHide = hiddenRoutes.includes(pathname);

  if (shouldHide) {
    return null;
  }

  return <>{isMobile ? mobileTopBar : desktopTopBar}</>;
}
