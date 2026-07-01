"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function TopbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hiddenRoutes = ["/analytics", "/smart-search", "/ai-chat"];
  const shouldHide = hiddenRoutes.includes(pathname);

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}
