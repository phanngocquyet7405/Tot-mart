"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  Gift,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Warehouse,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { collectManagerResource, quoteManagerGift } from '../services/managerApi';
import { useManagerList } from '../lib/useManagerList';
import { money, managerError } from '../lib/productModel.mjs';
import { labels, subscriptionAmounts } from '../lib/packageModel.mjs';
import PackageEditor from './PackageEditor';
import { ProductActionDialog } from './ProductsWorkspace';
import { PageTitle, ErrorPanel, Pagination, ItemThumbnail } from './WorkspaceUI';

function GiftQuote({ row, onClose }) {
  const [quantity, setQuantity] = useState(3);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function quote(event) {
    event.preventDefault();
    if (busy) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await quoteManagerGift(row._id, Number(quantity), {
        signal: current.signal,
      });
      if (!current.signal.aborted) {
        if (!Number.isSafeInteger(response.data?.totalAmount))
          throw new Error('BE chưa trả báo giá hợp lệ.');
        setResult(response.data);
      }
    } catch (failure) {
      if (!current.signal.aborted) setError(managerError(failure));
    } finally {
      if (!current.signal.aborted) setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle className="text-lg font-bold text-foreground">
          Báo giá Gift từ máy chủ
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {row.name} · Báo giá áp dụng cho cấu hình đã lưu trên hệ thống. Không tạo đơn hàng, không thực hiện thanh toán.
        </DialogDescription>
        <form onSubmit={quote} className="space-y-4">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Số lượng phần quà
            <Input
              type="number"
              min={1}
              max={999}
              step={1}
              required
              className="min-h-11 text-base"
              value={quantity}
              disabled={busy}
              onChange={(event) => {
                setQuantity(event.target.value);
                setResult(null);
              }}
            />
          </label>
          <Button className="min-h-11 w-full" disabled={busy}>
            {busy ? 'Đang lấy báo giá…' : 'Lấy báo giá chính thức'}
          </Button>
        </form>
        {error && <ErrorPanel>{error}</ErrorPanel>}
        {result && (
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/50 p-4 text-sm tabular-nums">
            <dt className="text-muted-foreground">Tiền hàng trước giảm:</dt>
            <dd className="text-right font-medium text-foreground">{money(result.baseSubtotal)}</dd>
            <dt className="text-success-text">Giảm theo số lượng:</dt>
            <dd className="text-right font-medium text-success-text">−{money(result.bulkDiscountAmount)}</dd>
            <dt className="text-muted-foreground">Phí tiện ích:</dt>
            <dd className="text-right font-medium text-foreground">+{money(result.giftFee)}</dd>
            <dt className="border-t border-border pt-2 font-bold text-foreground">Tổng cộng từ BE:</dt>
            <dd className="border-t border-border pt-2 text-right font-bold text-foreground">
              {money(result.totalAmount)}
            </dd>
          </dl>
        )}
        <Button variant="outline" className="min-h-11 w-full" onClick={onClose}>
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function stockBadge(stock) {
  if (stock === 0) return <Badge variant="destructive">Hết hàng</Badge>;
  if (stock == null) return <Badge variant="outline">Chưa có tồn</Badge>;
  if (stock <= 5) return <Badge variant="warning">Tồn: {stock}</Badge>;
  return <Badge variant="secondary">Tồn: {stock}</Badge>;
}

export default function PackagesWorkspace({ kind, onDirtyChange }) {
  const list = useManagerList(kind);
  const [catalog, setCatalog] = useState({ products: [], combos: [], key: -1, error: '' });
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [editor, setEditor] = useState(null);
  const [action, setAction] = useState(null);
  const [quote, setQuote] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      kind === 'gifts'
        ? Promise.resolve([])
        : collectManagerResource('products', { signal: controller.signal }),
      kind === 'combos'
        ? Promise.resolve([])
        : collectManagerResource('combos', { signal: controller.signal }),
    ])
      .then(([products, combos]) => {
        if (!controller.signal.aborted)
          setCatalog({ products, combos, key: catalogVersion, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setCatalog({
            products: [],
            combos: [],
            key: catalogVersion,
            error: managerError(error),
          });
      });
    return () => controller.abort();
  }, [kind, catalogVersion]);

  const ready = catalog.key === catalogVersion && !catalog.error;

  function closed() {
    setEditor(null);
    onDirtyChange(false);
  }

  function done(message) {
    closed();
    setAction(null);
    setNotice(message);
    toast.success(message);
    list.reload();
    setCatalogVersion((value) => value + 1);
  }

  const kindIcon =
    kind === 'combos' ? Boxes : kind === 'gifts' ? Gift : CalendarDays;

  return (
    <section aria-labelledby="packages-heading" className="space-y-6">
      <PageTitle
        id="packages-heading"
        title={labels[kind]}
        description={
          kind === 'combos'
            ? 'Kết hợp các sản phẩm riêng của cửa hàng thành combo tiện ích.'
            : kind === 'gifts'
            ? 'Quà tặng đóng gói từ combo, hỗ trợ chính sách giảm theo số lượng và tiện ích kèm phí.'
            : 'Mẫu gói giao hàng mỗi tháng. Thu tiền trước theo kỳ hạn 1, 3, 6 hoặc 12 tháng.'
        }
        action={`Tạo ${kind === 'subscriptions' ? 'mẫu đăng ký' : labels[kind].toLocaleLowerCase('vi')}`}
        disabled={!ready}
        onAction={() => setEditor({ row: null })}
      />

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success-text"
        >
          {notice}
        </p>
      )}

      {catalog.error ? (
        <ErrorPanel onRetry={() => setCatalogVersion((value) => value + 1)}>
          Không tải được nguồn tạo gói: {catalog.error}
        </ErrorPanel>
      ) : !ready ? (
        <p role="status" className="text-sm text-muted-foreground">
          Đang tải danh mục cấu phần…
        </p>
      ) : null}

      {kind === 'subscriptions' && (
        <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
          Đây là các mẫu gói đăng ký định kỳ của cửa hàng, không phải danh sách hợp đồng đăng ký đang chạy của khách hàng. Xóa mẫu không làm hủy các gói đã bán và không tự hoàn tiền.
        </p>
      )}

      {list.loading ? (
        <div role="status" className="space-y-3">
          <span className="sr-only">Đang tải danh sách {labels[kind]}…</span>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : list.error ? (
        <ErrorPanel onRetry={list.reload}>
          {notice
            ? 'Thao tác đã thành công nhưng tải lại danh sách chưa thành công. '
            : ''}
          {list.error}
        </ErrorPanel>
      ) : !list.rows.length ? (
        <EmptyState
          icon={kindIcon}
          title={`Chưa có ${labels[kind].toLocaleLowerCase('vi')}`}
          description={`Tạo ${labels[kind].toLocaleLowerCase('vi')} mới từ sản phẩm hoặc combo riêng của cửa hàng để bắt đầu bán.`}
          action={
            <Button
              className="min-h-11"
              disabled={!ready}
              onClick={() => setEditor({ row: null })}
            >
              <Plus className="mr-1.5 size-4" />
              Tạo {labels[kind].toLocaleLowerCase('vi')} đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {list.rows.map((row) => {
            const amounts =
              kind === 'subscriptions' ? subscriptionAmounts(row) : null;
            const itemImage =
              row.images?.[0] ||
              row.image ||
              (kind === 'gifts'
                ? catalog.combos.find((combo) => combo._id === row.sourceComboId)?.images?.[0]
                : kind === 'subscriptions'
                ? catalog.combos.find((combo) => combo._id === (row.boxId?._id || row.boxId))?.images?.[0]
                : null);

            return (
              <article
                key={row._id}
                className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                  <ItemThumbnail
                    image={itemImage}
                    name={row.name}
                    icon={kindIcon}
                    className="size-16 sm:size-20 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-bold text-foreground">
                        {row.name}
                      </h2>
                      {kind === 'subscriptions' && (
                        <Badge variant={row.isActive ? 'success' : 'outline'}>
                          {row.isActive ? 'Đang mở bán' : 'Tạm ngừng'}
                        </Badge>
                      )}
                    </div>

                  {kind === 'subscriptions' ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {row.sourceType === 'retail' ? 'Từ Hàng lẻ' : 'Từ Combo'}
                        </Badge>
                        <Badge variant="outline">
                          Kỳ hạn {row.planType?.split('_')[0]} tháng
                        </Badge>
                      </div>

                      {/* Đăng ký hàng tháng: "Tổng thu trước" tách riêng "Bình quân mỗi tháng" */}
                      <div className="grid gap-2 sm:grid-cols-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Tổng thu trước:
                          </span>
                          <span className="text-base font-bold tabular-nums text-foreground">
                            {money(amounts?.total)}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Bình quân mỗi tháng:
                          </span>
                          <span className="text-base font-medium tabular-nums text-foreground">
                            {money(amounts?.monthly)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-semibold tabular-nums text-foreground">
                          {money(row.value)}
                        </span>
                        {stockBadge(row.stock)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hạn bán:{' '}
                        {row.validTo
                          ? new Date(row.validTo).toLocaleDateString('vi-VN')
                          : 'Chưa có dữ liệu'}
                        {kind === 'combos'
                          ? ` · Phiên bản cấu phần: ${row.definitionVersion ?? 'Chưa có'}`
                          : ''}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        {(row.products || [])
                          .map((part) => `${part.name || 'Sản phẩm'} × ${part.quantity}`)
                          .join(', ') || 'Cấu phần chưa được trả về.'}
                      </p>
                      {kind === 'gifts' && (
                        <p className="text-xs text-muted-foreground">
                          Combo nguồn:{' '}
                          {catalog.combos.find((combo) => combo._id === row.sourceComboId)
                            ?.name || 'Nguồn đã lưu'}{' '}
                          · {(row.giftPolicy?.bulkTiers || []).length} bậc giảm ·{' '}
                          {(row.giftPolicy?.amenities || []).length} tiện ích kèm phí
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

                {/* Các nút thao tác vùng chạm >= 44px */}
                <div className="flex flex-wrap gap-2 lg:items-center lg:justify-end">
                  <Button
                    variant="outline"
                    className="min-h-11"
                    disabled={!ready}
                    onClick={() => setEditor({ row })}
                  >
                    <Pencil className="mr-1.5 size-4" />
                    Sửa
                    <span className="sr-only"> {row.name}</span>
                  </Button>
                  {kind !== 'subscriptions' && (
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={() => setAction({ kind: 'stock', product: row })}
                    >
                      <Warehouse className="mr-1.5 size-4" />
                      Tồn kho
                      <span className="sr-only"> {row.name}</span>
                    </Button>
                  )}
                  {kind === 'gifts' && (
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={() => setQuote(row)}
                    >
                      <Receipt className="mr-1.5 size-4" />
                      Báo giá BE
                      <span className="sr-only"> {row.name}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="min-h-11 border-destructive/30 text-destructive-text hover:bg-destructive/10"
                    onClick={() => setAction({ kind: 'delete', product: row })}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Xóa {row.name}</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!list.error && (
        <Pagination
          page={list.page}
          pages={list.pages}
          disabled={list.loading}
          onChange={list.setPage}
        />
      )}

      {editor && ready && (
        <PackageEditor
          kind={kind}
          row={editor.row}
          products={catalog.products}
          combos={catalog.combos}
          onClose={closed}
          onSaved={done}
          onDirtyChange={onDirtyChange}
        />
      )}

      {action && (
        <ProductActionDialog
          action={action}
          resource={kind}
          onClose={() => setAction(null)}
          onDone={done}
        />
      )}

      {quote && <GiftQuote row={quote} onClose={() => setQuote(null)} />}
    </section>
  );
}
