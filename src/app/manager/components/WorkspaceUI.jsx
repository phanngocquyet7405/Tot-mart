"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';

export function ItemThumbnail({ image, name = '', icon: FallbackIcon, className = 'size-12' }) {
  const [failed, setFailed] = useState(false);
  const url = typeof image === 'string' ? image : image?.url;
  return (
    <div
      className={`${className} grid shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted`}
    >
      {url && !failed ? (
        <Image
          unoptimized
          width={80}
          height={80}
          src={url}
          alt={name || ''}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : FallbackIcon ? (
        <FallbackIcon aria-hidden="true" className="size-5 text-muted-foreground" />
      ) : (
        <ImageIcon aria-hidden="true" className="size-5 text-muted-foreground" />
      )}
    </div>
  );
}

export function ErrorPanel({ children, onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-text ${className}`}
    >
      <p className="min-w-0 break-words font-medium">{children}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="min-h-11 border-destructive/30 text-destructive-text hover:bg-destructive/15"
          onClick={onRetry}
        >
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function LoadingList({ count = 4, className = 'grid gap-3' }) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">Đang tải dữ liệu…</span>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function PageTitle({ title, description, action, onAction, disabled, leading, id }) {
  return (
    <WorkspacePageHeader
      id={id}
      className="mb-6"
      title={title}
      description={description}
      leading={leading}
      actions={
        action && (
          <Button className="min-h-11" disabled={disabled} onClick={onAction}>
            {action}
          </Button>
        )
      }
    />
  );
}

export function Pagination({ page, pages, onChange, disabled }) {
  return (
    <nav
      aria-label="Phân trang"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      <p aria-live="polite" className="text-sm tabular-nums text-muted-foreground">
        Trang {page} / {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="min-h-11"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Trang trước
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Trang sau
        </Button>
      </div>
    </nav>
  );
}

export function EmptyList({ title, children, action, onAction, actionLabel, icon }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={children}
      action={
        action ? (
          action
        ) : actionLabel ? (
          <Button variant="outline" className="min-h-11" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null
      }
    />
  );
}

export function FieldError({ id, error }) {
  return error ? (
    <p id={id} role="alert" className="text-sm font-medium text-destructive-text">
      {error}
    </p>
  ) : null;
}
