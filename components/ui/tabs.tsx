'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import type * as React from 'react';
import styles from './tabs.module.scss';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      data-orientation={orientation}
      className={`${styles.tabsWrapper} ${className || ''}`}
      {...props}
    />
  );
}

function TabsList({
  className,
  fullwidth,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { fullwidth?: boolean }) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={`${styles.tabsList} ${className || ''} ${fullwidth ? 'w-full' : ''}`}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={`${styles.tabTrigger} ${className || ''}`}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={className}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
