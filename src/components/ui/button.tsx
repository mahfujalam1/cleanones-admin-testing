import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow hover:shadow-md",
          {
            "bg-[#0ea5e9] text-white hover:bg-[#0284c7] border border-transparent": variant === "default",
            "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700": variant === "outline",
            "hover:bg-gray-100 hover:text-gray-900 shadow-none hover:shadow-none": variant === "ghost",
            "text-[#0ea5e9] underline-offset-4 hover:underline shadow-none hover:shadow-none": variant === "link",
            "h-9 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
