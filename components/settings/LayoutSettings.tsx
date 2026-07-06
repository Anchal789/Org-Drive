'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useFileLayout } from '@/store/store';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import styles from './Settings.module.scss';

const LayoutSettings = () => {
  const { fileLayout, setFileLayout } = useFileLayout();
  return (
    <Tabs
      defaultValue="grid"
      value={fileLayout}
      onValueChange={(value) => {
        setFileLayout(value as 'grid' | 'list');
      }}
    >
      <TabsList>
        <TabsTrigger value="grid" className={styles.viewOption}>
          <LayoutGrid size={16} />
          Grid
        </TabsTrigger>
        <TabsTrigger value="list" className={styles.viewOption}>
          <List size={16} />
          List
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LayoutSettings;
