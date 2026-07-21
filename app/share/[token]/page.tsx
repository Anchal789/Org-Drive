import { FileIcon, FolderIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { decrypt } from '@/lib/crypto';
import ShareDownloadClient from './ShareDownloadClient';

export const metadata: Metadata = {
  title: 'Shared file - Org Drive',
  robots: { index: false, follow: false },
};

function InvalidLink() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-background text-foreground'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-2'>Invalid Link</h1>
        <p className='text-muted-foreground'>
          This share link is broken or has expired.
        </p>
      </div>
    </div>
  );
}

export default async function SharedLinkPage({
  params,
}: {
  params: { token: string };
}) {
  const tokenParam = await params;
  const decodedToken = tokenParam.token;
  let shareData = '';

  try {
    shareData = decrypt(decodedToken) || '';
  } catch {
    return <InvalidLink />;
  }

  if (!shareData) return <InvalidLink />;

  const { type, ids, exp } = JSON.parse(shareData);

  if (!exp || Date.now() > exp) {
    return <InvalidLink />;
  }

  const title =
    type === 'multi'
      ? `${ids.length} Shared Files`
      : type === 'folder'
        ? 'Shared Folder'
        : 'Shared File';

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-background p-6'>
      <div className='w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl text-center'>
        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
          {type === 'folder' ? (
            <FolderIcon size={32} />
          ) : (
            <FileIcon size={32} />
          )}
        </div>

        <h1 className='text-2xl font-semibold text-foreground mb-2'>{title}</h1>
        <p className='text-sm text-muted-foreground mb-8'>
          Someone shared this securely via Org Drive.
        </p>

        {/* Client component to handle the actual hidden download */}
        <ShareDownloadClient token={decodedToken} type={type} />
      </div>
    </div>
  );
}
