import { Skeleton } from '@/components/ui/skeleton';

export default function SmartSearchLoading() {
  return (
    <div className='flex flex-col items-center gap-6 p-6'>
      <div className='flex flex-col items-center gap-3'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <Skeleton className='h-6 w-64' />
        <Skeleton className='h-4 w-80' />
      </div>
      <Skeleton className='h-12 w-full max-w-2xl rounded-full' />
      <div className='flex w-full max-w-2xl flex-wrap justify-center gap-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, order never changes
          <Skeleton key={i} className='h-8 w-32 rounded-full' />
        ))}
      </div>
    </div>
  );
}
