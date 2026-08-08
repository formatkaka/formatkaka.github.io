import { useId } from 'react';

type ToggleButtonGroupProps = {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ToggleButtonGroup({ label, options, value, onChange, className = '' }: ToggleButtonGroupProps) {
  const groupId = useId();

  return (
    <div aria-labelledby={`${groupId}-label`} className={`flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3 ${className}`} role="radiogroup">
      <span id={`${groupId}-label`} className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#17313b] dark:text-[#cbd2df] sm:text-[#666] sm:dark:text-[#aeb6c5]">{label}</span>
      <div className="flex min-w-0 flex-1 gap-1 rounded-full bg-[#d9eef8] p-1 dark:bg-[#252d3c] sm:w-auto sm:flex-none sm:bg-[#e4ebfb] sm:dark:bg-[#252d3c]">
        {options.map((option) => (
          <label key={option.value} className="relative min-w-0 flex-1 sm:flex-none">
            <input
              checked={value === option.value}
              className="peer sr-only"
              name={groupId}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-full px-2 py-2 text-sm font-medium text-[#586474] transition-colors hover:bg-white/50 hover:text-[#172238] peer-checked:bg-white peer-checked:text-[#172238] peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[#386de0] dark:text-[#aab2c0] dark:hover:bg-white/10 dark:hover:text-white dark:peer-checked:bg-[#46536a] dark:peer-checked:text-white sm:px-3.5">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
