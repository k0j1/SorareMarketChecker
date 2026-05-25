import React from "react";
import { cn } from "@/src/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] bg-[var(--color-background-card)] border border-[var(--color-border-card)] shadow-[var(--shadow-card)] overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("px-[var(--spacing-card-p)] py-4 border-b border-[var(--color-border-default)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn("p-[var(--spacing-card-p)]", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-tight text-[var(--color-text-primary)]", className)}
      {...props}
    />
  );
}
