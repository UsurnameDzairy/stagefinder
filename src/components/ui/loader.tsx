import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5 border",
    md: "h-5 w-5 border",
    lg: "h-8 w-8 border-[1.5px]",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-zinc-800 border-t-white",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoaderDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
      <div className="h-1 w-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
      <div className="h-1 w-1 animate-bounce rounded-full bg-zinc-600" />
    </div>
  );
}
