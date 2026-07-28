import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "gold" | "glass"
  glow?: boolean
}

const PremiumBadge = React.forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ className, variant = "primary", glow = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300",
          variant === "primary" && "bg-primary/10 text-primary border border-primary/20",
          variant === "secondary" && "bg-secondary text-secondary-foreground border border-border",
          variant === "accent" && "bg-accent/15 text-accent border border-accent/20",
          variant === "outline" && "bg-background text-foreground border border-border hover:border-primary/50",
          variant === "gold" && "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
          variant === "glass" && "bg-white/10 text-white border border-white/20 backdrop-blur-md",
          glow && "shadow-[0_0_12px_rgba(37,99,235,0.2)]",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
PremiumBadge.displayName = "PremiumBadge"

export { PremiumBadge }
