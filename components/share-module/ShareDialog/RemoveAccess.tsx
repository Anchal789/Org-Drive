'use client';

import { X } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { AsyncButton } from '@/components/ui/async-button';
import CustomTooltip from '@/components/ui/custom-tooltip';

const RemoveAccess: FunctionComponent<{
  removeAccess: () => Promise<void>;
}> = ({ removeAccess }) => {
  return (
    <CustomTooltip title='Remove access'>
      <AsyncButton
        variant='destructive'
        size='icon-sm'
        onClick={removeAccess}
        aria-label='Remove access'
      >
        <X size={16} />
      </AsyncButton>
    </CustomTooltip>
  );
};

export default RemoveAccess;
