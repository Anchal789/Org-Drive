'use client';

import type * as React from 'react';

import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot='table-container'
      className='relative w-full overflow-x-auto border border-border sm:border-none rounded-lg bg-card'
    >
      <table
        data-slot='table'
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn(
        'border-b border-border bg-surface text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em]',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({
  className,
  notApplyBackground = false,
  ...props
}: React.ComponentProps<'tr'> & {
  notApplyBackground?: boolean;
}) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        `border-b border-border transition-colors text-xs ${notApplyBackground ? '' : 'data-[state=selected]:bg-muted bg-card hover:bg-muted/30'}`,
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'px-3.5 py-2.5 text-left align-middle font-semibold whitespace-nowrap has-[[role=checkbox]]:pr-0 leading-5.5',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  noData = false,
  ...props
}: React.ComponentProps<'td'> & { noData?: boolean }) {
  return (
    <td
      data-slot='table-cell'
      className={cn(
        `align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0 ${noData ? 'p-6 text-center' : 'px-3.5 py-2.5'}`,
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
