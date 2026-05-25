import React from "react";
import { cn } from "@/src/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "rare" | "limited" | "superrare" | "unique";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "danger",
          // Sorare relative colors
          "bg-yellow-400 text-yellow-900": variant === "limited",
          "bg-red-500 text-white": variant === "rare",
          "bg-blue-600 text-white": variant === "superrare",
          "bg-gray-900 text-yellow-400": variant === "unique",
        },
        className
      )}
      {...props}
    />
  );
}
