import React from "react";
import { cn } from "@/src/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary-hover)]": variant === "primary",
            "bg-[var(--color-text-primary)] text-white hover:bg-gray-800": variant === "secondary",
            "border border-[var(--color-border-default)] bg-transparent hover:bg-gray-50 text-[var(--color-text-primary)]": variant === "outline",
            "bg-[var(--color-accent-danger)] text-white hover:bg-red-600": variant === "danger",
            "bg-transparent hover:bg-gray-100 text-[var(--color-text-secondary)]": variant === "ghost",
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
