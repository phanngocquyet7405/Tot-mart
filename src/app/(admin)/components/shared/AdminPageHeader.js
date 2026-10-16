"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  actions,
  className,
}) {
  return (
    <WorkspacePageHeader title={title} description={description} actions={actions} className={cn(className)} leading={<>
        {backHref && (
          <Button variant="ghost" className="size-11" asChild>
            <Link href={backHref} aria-label="Quay lại">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
        )}
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted text-foreground">
            <Icon size={18} aria-hidden="true" />
          </div>
        )}
    </>} />
  );
}
