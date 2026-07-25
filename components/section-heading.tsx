import { ArrowRight } from "lucide-react"

type SectionHeadingAction = {
  label: string
  href?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = "start",
  action,
}: {
  title: string
  subtitle?: string
  align?: "center" | "start"
  action?: SectionHeadingAction
}) {
  const heading = (
    <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
      {title}
    </h2>
  )

  if (align === "center") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        {heading}
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {heading}
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <a
          href={action.href ?? "#"}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </a>
      )}
    </div>
  )
}
