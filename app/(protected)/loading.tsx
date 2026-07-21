import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLoading() {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <Skeleton className='h-8 w-48' />
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, order never changes
          <Skeleton key={i} className='h-28 w-full rounded-xl' />
        ))}
      </div>
    </div>
  );
}
