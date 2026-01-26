type ToggleButtonGroupProps = {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
};

export function ToggleButtonGroup({ label, options, value, onChange }: ToggleButtonGroupProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-semibold uppercase tracking-wide text-[#666]">{label}</label>
      <div className="flex gap-1 rounded-lg border border-[#eee] bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md border-0 px-3.5 py-2 text-sm font-medium outline-none transition ${
              value === option.value
                ? 'bg-[#f6ad7b] text-white shadow-sm'
                : 'text-[#666] hover:text-[#1b2021]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
