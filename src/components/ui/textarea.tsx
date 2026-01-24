import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-[13px] font-medium leading-relaxed text-zinc-100 placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 scrollbar-hide",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
