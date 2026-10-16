import { cn } from '@/lib/utils';

export default function WorkspacePageHeader({ title, description, actions, leading, id, className }) {
  return <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
    <div className="flex min-w-0 items-start gap-3">{leading}<div className="min-w-0"><h1 id={id} className="break-words font-sans text-2xl font-bold tracking-tight text-foreground">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div></div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>;
}
