'use client';

import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type * as React from 'react';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: string;
  filled?: boolean;
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: props.size || '16px',
        height: props.size || '16px',
        flexShrink: 0,
        border: `1px solid ${props.checked ? 'var(--primary)' : 'var(--border)'}`,
        background: props.checked ? 'var(--primary)' : 'var(--background)',
        color: 'var(--primary-foreground)',
        borderRadius: 'var(--radius-sm)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition: 'background .12s, border-color .12s',
        opacity: props.disabled ? 0.5 : 1,
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none [&>svg]:size-3.5'
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
