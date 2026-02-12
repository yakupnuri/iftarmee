import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600":
            variant === "default",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500":
            variant === "outline",
          "text-gray-700 hover:bg-gray-100 focus:ring-gray-500":
            variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600":
            variant === "destructive",
        },
        {
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";
