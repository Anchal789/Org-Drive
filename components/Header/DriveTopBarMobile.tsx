'use client';

import { List } from 'lucide-react';
import styles from './DriveTopbar.module.scss';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';

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
      >
        <List size={20} className={styles.icon} />
      </Button>
      <h6 className={styles.activePage}>{activePage}</h6>
    </>
  );
}
