import { getStatusBadgeConfig } from '../utils';

type StatusBadgeProps = {
  status: string;
  size?: 'default' | 'small';
};

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(status);
  const sizeClasses = size === 'small' 
    ? 'rounded-full px-2 py-0.5 text-[11px] font-medium'
    : 'rounded-full px-3 py-1 text-xs font-semibold';
  
  return (
    <div className={`${sizeClasses} ${config.bg} ${config.text}`}>
      {config.label}
    </div>
  );
}
