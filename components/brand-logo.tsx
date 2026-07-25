export function BrandLogo({ href = "#", className = "" }: { href?: string; className?: string }) {
  return (
    <a href={href} className={`flex shrink-0 items-center gap-2 ${className}`}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
        A
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">
        AL<span className="text-primary">SOUK</span>
      </span>
    </a>
  )
}
