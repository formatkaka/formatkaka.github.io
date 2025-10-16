import * as React from "react"
import { cn } from "@/utils/cn"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...rest}
      />
    );
  }
);
Label.displayName = "Label";

export { Label }
