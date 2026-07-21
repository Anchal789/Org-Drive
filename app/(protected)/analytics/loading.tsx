import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-40' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-24 rounded-lg' />
          <Skeleton className='h-9 w-24 rounded-lg' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, order never changes
          <Skeleton key={i} className='h-24 w-full rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-64 w-full rounded-xl' />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Skeleton className='h-48 w-full rounded-xl' />
        <Skeleton className='h-48 w-full rounded-xl' />
      </div>
    </div>
  );
}
