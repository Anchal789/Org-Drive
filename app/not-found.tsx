import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
        {/* Optional: A subtle background accent or icon */}
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-muted/50'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-12 w-12 text-muted-foreground'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
            />
          </svg>
        </div>

        <h1 className='mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl'>
          404
        </h1>

        <h2 className='mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
          Page not found
        </h2>

        <p className='mt-4 text-muted-foreground'>
          Oops! It seems you've wandered into an unknown directory. The page or
          file you are looking for doesn't exist or has been moved.
        </p>

        <div className='mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button asChild variant='default' className='w-full sm:w-auto'>
            <Link href='/my-drive'>Go to My Drive</Link>
          </Button>

          <Button asChild variant='outline' className='w-full sm:w-auto'>
            <Link href='/'>Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
