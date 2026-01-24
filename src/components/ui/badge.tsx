import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-300",
        secondary:
          "border-zinc-800 bg-zinc-950 text-zinc-500",
        destructive:
          "border-zinc-900 bg-zinc-950 text-zinc-600",
        outline: "text-zinc-400 border-zinc-800 bg-transparent",
        success: "border-zinc-800 bg-zinc-900 text-zinc-200",
        warning: "border-zinc-800 bg-zinc-950 text-zinc-400",
        info: "border-zinc-800 bg-zinc-900 text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
