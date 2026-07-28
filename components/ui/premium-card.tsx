import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "scale" | "lift" | "glow" | "none"
  glassmorphic?: boolean
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, hoverEffect = "lift", glassmorphic = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300",
          glassmorphic && "bg-background/70 backdrop-blur-md border-white/10 dark:border-white/5",
          hoverEffect === "lift" && "hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20",
          hoverEffect === "scale" && "hover:scale-[1.02] hover:shadow-lg",
          hoverEffect === "glow" && "hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:border-primary/30",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PremiumCard.displayName = "PremiumCard"

export { PremiumCard }
