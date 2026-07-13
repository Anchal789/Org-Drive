'use client';

import { DownloadCloud, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ShareDownloadClient({
  ids,
  type,
  userId,
}: {
  ids: number[];
  type: string;
  userId?: number;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    toast.success('Starting download...');
    let apiPath = '';
    if (type === 'multi')
      apiPath = `/api/file/download/multiple?ids=${ids}&userId=${userId}`;
    else if (type === 'folder')
      apiPath = `/api/file/download/folder?ids=${ids}&userId=${userId}`;
    else apiPath = `/api/file/download/file?fileId=${ids}&userId=${userId}`;

    const a = document.createElement('a');
    a.href = apiPath;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset button state after a short delay
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className='w-full py-6 text-base'
    >
      {isDownloading ? (
        <>
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          Preparing Download...
        </>
      ) : (
        <>
          <DownloadCloud className='mr-2 h-5 w-5' />
          Download Now
        </>
      )}
    </Button>
  );
}
