import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-indigo-600 text-white hover:bg-indigo-500": variant === "primary",
          "bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50":
            variant === "secondary",
          "bg-red-600 text-white hover:bg-red-500": variant === "destructive",
          "text-gray-700 hover:bg-gray-100": variant === "ghost",
          "text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50":
            variant === "outline",
        },
        {
          "h-8 px-3 text-xs": size === "sm",
          "h-10 px-4 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
