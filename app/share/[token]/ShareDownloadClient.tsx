'use client';

import { DownloadCloud, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ShareDownloadClient({
  token,
  type,
}: {
  token: string;
  type: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const encodedToken = encodeURIComponent(token);
    let apiPath = '';
    if (type === 'multi')
      apiPath = `/api/file/download/multiple?token=${encodedToken}`;
    else if (type === 'folder')
      apiPath = `/api/file/download/folder-files?token=${encodedToken}`;
    else apiPath = `/api/file/download/file?token=${encodedToken}`;

    try {
      const response = await fetch(apiPath, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Download failed.');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1])
        : 'download';

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success('Download started.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Download failed.',
      );
    } finally {
      setIsDownloading(false);
    }
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
