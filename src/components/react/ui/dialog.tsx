import * as React from 'react';
import { cn } from '@/utils/cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

const Dialog = (props: DialogProps) => {
  const { open, onOpenChange, children } = props;

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn(
        'relative z-50 grid w-full max-w-lg gap-4 border border-gray-200 bg-white p-6 shadow-2xl rounded-lg',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...rest}
    >
      {children}
    </div>
  );
});
DialogContent.displayName = 'DialogContent';

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const DialogHeader = (props: DialogHeaderProps) => {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...rest}
    />
  );
};

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

const DialogFooter = (props: DialogFooterProps) => {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...rest}
    />
  );
};

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...rest}
    />
  );
});
DialogTitle.displayName = 'DialogTitle';

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...rest} />;
  }
);
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
