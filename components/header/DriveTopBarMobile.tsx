'use client';

import { List } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import styles from './DriveTopbar.module.scss';

export default function DriveTopbarMobile() {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const urls = [
    {
      name: 'My Drive',
      url: '/my-drive',
    },
    {
      name: 'Shared with me',
      url: '/shared-with-me',
    },
    {
      name: 'Recent',
      url: '/recent',
    },
    {
      name: 'Bookmark',
      url: '/bookmark',
    },
    {
      name: 'Trash',
      url: '/trash',
    },
    {
      name: 'Analytics',
      url: '/analytics',
    },
    {
      name: 'Smart Search',
      url: '/smart-search',
    },
    {
      name: 'AI Chat',
      url: '/ai-chat',
    },
    {
      name: 'Settings',
      url: '/settings',
    },
  ];

  const activePage = urls.find((url) => pathname.includes(url.url))?.name;
  return (
    <>
      <Button
        variant='ghost'
        size={'icon'}
        className={styles.listButton}
        onClick={() => setOpenMobile(!openMobile)}
        aria-label={openMobile ? 'Close navigation menu' : 'Open navigation menu'}
      >
        <List size={20} className={styles.listButtonIcon} />
      </Button>
      <h6 className={styles.activePage}>{activePage}</h6>
    </>
  );
}
