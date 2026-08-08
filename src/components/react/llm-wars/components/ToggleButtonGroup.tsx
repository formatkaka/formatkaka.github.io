type ToggleButtonGroupProps = {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
};

export function ToggleButtonGroup({ label, options, value, onChange }: ToggleButtonGroupProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 sm:flex-col sm:items-stretch sm:gap-2.5">
      <label className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#17313b] sm:text-[#666]">{label}</label>
      <div className="flex w-auto min-w-[11.5rem] gap-1 rounded-lg bg-[#d9eef8] p-1 sm:w-full sm:bg-white sm:shadow-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-10 flex-1 rounded-md border-0 px-2 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e77943] sm:flex-none sm:px-3.5 sm:focus-visible:ring-[#f6ad7b] ${
              value === option.value
                ? 'bg-[#c95012] text-white shadow-sm sm:bg-[#f6ad7b]'
                : 'text-[#4a5660] hover:text-[#1b2021]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
