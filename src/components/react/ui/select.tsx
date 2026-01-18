import * as React from 'react';
import { cn } from '@/utils/cn';

type SelectContextType = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within Select');
  }
  return context;
};

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

const Select = (props: SelectProps) => {
  const { value, onValueChange, children } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn('relative', open && 'z-50')}>{children}</div>
    </SelectContext.Provider>
  );
};

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>((props, ref) => {
  const { className, children, ...rest } = props;
  const { setOpen, open } = useSelectContext();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setOpen(!open)}
      {...rest}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = (props: { placeholder?: string }) => {
  const { placeholder } = props;
  const { value } = useSelectContext();
  return <span>{value || placeholder || 'Select...'}</span>;
};

type SelectContentProps = {
  children: React.ReactNode;
  className?: string;
};

const SelectContent = (props: SelectContentProps) => {
  const { children, className } = props;
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white text-gray-900 shadow-lg',
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

const SelectItem = (props: SelectItemProps) => {
  const { value, children, className } = props;
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-start rounded-sm py-2 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors',
        isSelected && 'bg-gray-100 font-medium',
        className
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
