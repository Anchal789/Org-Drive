'use client';

import { X } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import CustomTooltip from '@/components/ui/custom-tooltip';

const RemoveAccess: FunctionComponent<{
  removeAccess: () => Promise<void>;
}> = ({ removeAccess }) => {
  return (
    <CustomTooltip title='Remove access'>
      <Button variant='destructive' size='icon-sm' onClick={removeAccess}>
        <X size={16} />
      </Button>
    </CustomTooltip>
  );
};

export default RemoveAccess;
