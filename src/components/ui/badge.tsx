import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {status.replace("_", " ")}
    </span>
  );
}
