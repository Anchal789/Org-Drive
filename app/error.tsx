'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center'>
      <h2 className='text-xl font-semibold'>Something went wrong</h2>
      <p className='text-sm text-muted-foreground'>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button type='button' onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
