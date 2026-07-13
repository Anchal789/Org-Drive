'use client';

import { Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFileLayout, useSortByStore } from '@/store/store';
import styles from './LayoutSettings.module.scss';

const LayoutSettings = () => {
  const { fileLayout, setFileLayout } = useFileLayout();
  const { sortBy, setSortBy } = useSortByStore();

  const handleChangeDriveLayout = (layout: 'list' | 'grid') => {
    setFileLayout(layout);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className={styles.triggerBtn}>
          <Settings size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={styles.popoverContent}
        align='end'
        sideOffset={6}
      >
        {/* 1. Sort By Section */}
        <div className={styles.section}>
          <div className={styles.label}>Sort by</div>
          <Tabs
            defaultValue='name'
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as 'name' | 'modified' | 'size' | 'type')
            }
          >
            <TabsList fullwidth>
              <TabsTrigger value='name'>Name</TabsTrigger>
              <TabsTrigger value='modified'>Modified</TabsTrigger>
              <TabsTrigger value='size'>Size</TabsTrigger>
              <TabsTrigger value='type'>Type</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 2. Density Section */}
        <div className={styles.section}>
          <div className={styles.label}>Density</div>
          <Tabs defaultValue='comfortable'>
            <TabsList>
              <TabsTrigger value='comfortable'>Comfortable</TabsTrigger>
              <TabsTrigger value='compact'>Compact</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 3. Default View Section */}
        <div className={styles.section}>
          <div className={styles.label}>Default view</div>
          <Tabs
            defaultValue='grid'
            value={fileLayout}
            onValueChange={(value: string) =>
              handleChangeDriveLayout(value as 'grid' | 'list')
            }
          >
            <TabsList>
              <TabsTrigger value='grid'>Grid</TabsTrigger>
              <TabsTrigger value='list'>List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className={styles.divider} />

        {/* 4. Toggle Switches */}
        <span className={styles.switchButton}>
          <span className={styles.switchLabel}>Show file extensions</span>
          <Switch defaultChecked className={styles.switch} />
        </span>
        <span className={styles.switchButton}>
          <span className={styles.switchLabel}>Show indexing status</span>
          <Switch defaultChecked className={styles.switch} />
        </span>

        <div className={styles.divider} />

        {/* 5. Action Button */}
        <Button className={styles.actionButton}>
          <Users size={15} className={styles.actionIcon} />
          <span>Manage access</span>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default LayoutSettings;
