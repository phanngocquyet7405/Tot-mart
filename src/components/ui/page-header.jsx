import * as React from "react";
import { cn } from "@/lib/utils";

function PageHeader({
  title,
  description,
  actions,
  leading,
  breadcrumbs,
  id,
  className,
  ...props
}) {
  return (
    <div
      data-slot="page-header"
      className={cn("flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between", className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="min-w-0">
          {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
          <h1
            id={id}
            className="break-words font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}

export { PageHeader };
