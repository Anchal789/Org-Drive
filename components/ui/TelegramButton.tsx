import { iconsWithPaths } from '@/constants/common-constants';
import Icon from './Icon';

export default function TelegramButton({
  children,
  size = 'lg',
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'lg';
  onClick: () => void;
  className?: string;
}) {
  const hClass = size === 'lg' ? 'h-[44px]' : 'h-[36px]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 w-full text-white border-none rounded-md text-sm font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity bg-tg-blue ${hClass} ${className}`}
    >
      <Icon
        d={iconsWithPaths.send}
        size={16}
        stroke={2}
        className="rotate-15"
      />
      {children}
    </button>
  );
}
