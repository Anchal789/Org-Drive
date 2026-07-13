import type { FunctionComponent } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const CustomTooltip: FunctionComponent<{
  title: string;
  children: React.ReactNode;
}> = ({ children, title }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
};

export default CustomTooltip;
