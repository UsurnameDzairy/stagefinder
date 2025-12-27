import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-zinc-200 border-t-zinc-900",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoaderDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
    </div>
  );
}
