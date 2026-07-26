import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 text-gray-500", className)}>
      <p className="text-sm">{title}</p>
      <p className="text-xs mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
