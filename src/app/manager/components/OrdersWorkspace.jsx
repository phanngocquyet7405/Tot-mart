"use client";

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  ChevronDown,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useManagerList } from '../lib/useManagerList';
import { managerError, money } from '../lib/productModel.mjs';
import { managerOrderActions, orderActionMessage } from '../lib/orderActions.mjs';
import { updateManagerOrderStatus } from '../services/managerApi';
import { PageTitle, ErrorPanel, Pagination, ItemThumbnail } from './WorkspaceUI';

export const orderStatuses = {
  pending: 'Chờ xử lý',
  processing: 'Đang chuẩn bị',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  returned: 'Trả hàng',
  on_hold: 'Tạm giữ',
};

const payments = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
};

export const ORDER_STATUS_TABS = [
  { value: '', label: 'Tất cả', dot: null },
  { value: 'pending', label: 'Chờ xử lý', dot: 'bg-warning' },
  { value: 'processing', label: 'Đang chuẩn bị', dot: 'bg-primary' },
  { value: 'shipped', label: 'Đang giao', dot: 'bg-ring' },
  { value: 'delivered', label: 'Đã giao', dot: 'bg-success' },
  { value: 'cancelled', label: 'Đã hủy', dot: 'bg-destructive' },
  { value: 'returned', label: 'Trả hàng', dot: 'bg-destructive' },
  { value: 'on_hold', label: 'Tạm giữ', dot: 'bg-destructive' },
];

export function OrderStatusBadge({ status, className = '' }) {
  const label = orderStatuses[status] || status;
  let colorClasses = 'border-border bg-muted text-muted-foreground';
  let dotColor = 'bg-muted-foreground';

  switch (status) {
    case 'pending':
      colorClasses = 'border-warning/30 bg-warning/15 text-warning-text';
      dotColor = 'bg-warning';
      break;
    case 'processing':
      colorClasses = 'border-primary/30 bg-primary/15 text-primary font-semibold';
      dotColor = 'bg-primary';
      break;
    case 'shipped':
      colorClasses = 'border-ring/40 bg-ring/15 text-ring font-semibold';
      dotColor = 'bg-ring';
      break;
    case 'delivered':
      colorClasses = 'border-success/30 bg-success/15 text-success-text';
      dotColor = 'bg-success';
      break;
    case 'cancelled':
    case 'returned':
      colorClasses = 'border-destructive/30 bg-destructive/15 text-destructive-text';
      dotColor = 'bg-destructive';
      break;
    case 'on_hold':
      colorClasses = 'border-destructive/40 bg-destructive/20 text-destructive-text font-semibold';
      dotColor = 'bg-destructive animate-pulse';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${colorClasses} ${className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function PaymentStatusBadge({ method, status, className = '' }) {
  const methodLabel = method === 'cod' ? 'COD' : 'Online';
  const statusLabel = payments[status] || status;
  let colorClasses = 'border-border bg-muted text-muted-foreground';

  if (status === 'paid') {
    colorClasses = 'border-success/30 bg-success/15 text-success-text';
  } else if (status === 'pending') {
    colorClasses = 'border-warning/30 bg-warning/15 text-warning-text';
  } else if (status === 'failed') {
    colorClasses = 'border-destructive/30 bg-destructive/15 text-destructive-text';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClasses} ${className}`}
    >
      <span>{methodLabel}</span>
      <span>·</span>
      <span>{statusLabel}</span>
    </span>
  );
}

const noop = () => {};

export default function OrdersWorkspace({ onDirtyChange = noop }) {
  const [filters, setFilters] = useState({});
  const [filterDraft, setFilterDraft] = useState({
    keyword: '',
    status: '',
    paymentMethod: '',
    from: '',
    to: '',
    includeUnpaid: false,
  });
  const [filterError, setFilterError] = useState('');
  const list = useManagerList('orders', filters);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      onDirtyChange(false, false);
    };
  }, [onDirtyChange]);

  function close() {
    if (!lock.current) {
      setAction(null);
      setError('');
    }
  }

  async function confirm() {
    if (lock.current || !action) return;
    lock.current = true;
    setBusy(true);
    setError('');
    onDirtyChange(false, true);
    try {
      await updateManagerOrderStatus(action.order._id, action.status, action.order.status);
      if (mounted.current) {
        setAction(null);
        toast.success('Đã cập nhật tiến độ đơn hàng');
        list.reload();
      }
    } catch (failure) {
      if (mounted.current) {
        setError(managerError(failure));
        list.reload();
      }
    } finally {
      lock.current = false;
      onDirtyChange(false, false);
      if (mounted.current) setBusy(false);
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    if (filterDraft.from && filterDraft.to && filterDraft.from > filterDraft.to) {
      setFilterError('Ngày bắt đầu phải trước ngày kết thúc.');
      return;
    }
    setFilterError('');
    list.setPage(1);
    setFilters({ ...filterDraft, includeUnpaid: String(filterDraft.includeUnpaid) });
  }

  function handleResetFilters() {
    const emptyDraft = {
      keyword: '',
      status: '',
      paymentMethod: '',
      from: '',
      to: '',
      includeUnpaid: false,
    };
    setFilterDraft(emptyDraft);
    setFilterError('');
    list.setPage(1);
    setFilters({ ...emptyDraft, includeUnpaid: 'false' });
  }

  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.status ||
      filters.paymentMethod ||
      filters.from ||
      filters.to ||
      filters.includeUnpaid === 'true'
  );

  return (
    <section aria-labelledby="orders-heading" className="space-y-6">
      <PageTitle
        id="orders-heading"
        title="Đơn hàng"
        description="Theo dõi và vận hành đơn hàng của cửa hàng. Merchant cập nhật trạng thái giao nhận, không chỉnh sửa số tiền hay thao tác hoàn tiền."
      />

      {/* Thanh Tabs phân loại trạng thái đơn hàng */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div
          role="tablist"
          aria-label="Lọc theo trạng thái đơn hàng"
          className="inline-flex min-w-full sm:min-w-0 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1.5"
        >
          {ORDER_STATUS_TABS.map((tab) => {
            const active = (filters.status || '') === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-card text-foreground shadow-sm border border-border font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => {
                  setFilterDraft((prev) => ({ ...prev, status: tab.value }));
                  setFilters((prev) => ({ ...prev, status: tab.value }));
                  list.setPage(1);
                }}
              >
                {tab.dot && (
                  <span
                    className={`size-2 shrink-0 rounded-full ${tab.dot}`}
                    aria-hidden="true"
                  />
                )}
                <span>{tab.label}</span>
                {active && list.total != null && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal tabular-nums text-foreground">
                    {list.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form bộ lọc đơn hàng */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Mã đơn hàng
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  className="min-h-11 pl-9 text-base"
                  placeholder="Nhập mã đơn…"
                  maxLength={100}
                  value={filterDraft.keyword}
                  onChange={(e) =>
                    setFilterDraft((p) => ({ ...p, keyword: e.target.value }))
                  }
                />
              </div>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Trạng thái đơn
              <select
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filterDraft.status}
                onChange={(e) =>
                  setFilterDraft((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(orderStatuses).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Phương thức thanh toán
              <select
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filterDraft.paymentMethod}
                onChange={(e) =>
                  setFilterDraft((p) => ({ ...p, paymentMethod: e.target.value }))
                }
              >
                <option value="">Tất cả phương thức</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="online">Thanh toán trực tuyến</option>
              </select>
            </label>

            {['from', 'to'].map((key, i) => (
              <label key={key} className="grid gap-1.5 text-sm font-medium text-foreground">
                {i ? 'Đến ngày' : 'Từ ngày'}
                <Input
                  className="min-h-11 text-base"
                  type="date"
                  value={filterDraft[key]}
                  onChange={(e) =>
                    setFilterDraft((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </label>
            ))}

            <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium text-foreground sm:col-span-2 lg:col-span-1">
              <input
                type="checkbox"
                className="size-5 rounded border-border"
                checked={filterDraft.includeUnpaid}
                onChange={(e) =>
                  setFilterDraft((p) => ({ ...p, includeUnpaid: e.target.checked }))
                }
              />
              Hiện cả đơn online chưa thanh toán
            </label>
          </div>

          {filterError && (
            <p role="alert" className="text-sm font-medium text-destructive-text">
              {filterError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
            <Button type="submit" className="min-h-11" disabled={busy}>
              <Filter className="mr-1.5 size-4" />
              Áp dụng bộ lọc
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
            {list.meta?.hiddenUnpaidOnline > 0 && (
              <p className="ml-auto text-xs text-muted-foreground">
                Hệ thống đang ẩn {list.meta.hiddenUnpaidOnline} đơn online chưa thanh toán nhằm bảo vệ dữ liệu vận chuyển.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Danh sách đơn hàng đủ 5 trạng thái */}
      {list.loading ? (
        <div role="status" className="space-y-3">
          <span className="sr-only">Đang tải danh sách đơn hàng…</span>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : list.error ? (
        <ErrorPanel onRetry={list.reload}>{list.error}</ErrorPanel>
      ) : !list.rows.length ? (
        <EmptyState
          icon={ShoppingBag}
          title={
            filters.status
              ? `Không có đơn hàng "${orderStatuses[filters.status] || filters.status}"`
              : hasActiveFilters
              ? 'Không tìm thấy đơn hàng'
              : 'Chưa có đơn hàng'
          }
          description={
            filters.status
              ? `Hiện tại cửa hàng không có đơn hàng nào ở trạng thái "${orderStatuses[filters.status]}". Bạn có thể chọn tab trạng thái khác hoặc xóa bộ lọc.`
              : hasActiveFilters
              ? 'Không có đơn nào khớp với bộ lọc bạn đã chọn. Hãy thử xóa bộ lọc.'
              : 'Đơn hàng mới của khách sẽ xuất hiện tại đây khi phát sinh giao dịch.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" className="min-h-11" onClick={handleResetFilters}>
                Xóa bộ lọc và xem tất cả
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {list.rows.map((order) => {
            const availableActions = managerOrderActions(order);

            return (
              <article key={order._id} className="p-4 sm:p-5">
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold text-foreground">
                          {order.orderId}
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge
                          method={order.paymentMethod}
                          status={order.paymentStatus}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Khách: {order.shippingAddress?.fullName} ({order.shippingAddress?.phone}) ·{' '}
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                      </p>
                      {(order.products || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center -space-x-1 overflow-hidden py-0.5">
                            {(order.products || []).slice(0, 3).map((item, idx) => (
                              <ItemThumbnail
                                key={item._id || idx}
                                image={item.image || item.images?.[0] || item.productId?.images?.[0]}
                                name={item.name}
                                icon={Package}
                                className="size-8 rounded-md ring-2 ring-card"
                              />
                            ))}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {(order.products || []).map((p) => `${p.name} × ${p.quantity}`).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold tabular-nums text-foreground">
                        {money(order.totalAmount)}
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                    </div>
                  </summary>

                  {/* Chi tiết đơn hàng mở rộng */}
                  <div className="mt-4 space-y-4 border-t border-border pt-4 text-sm text-foreground">
                    {order.codCollectionStatus === 'pending_review' && (
                      <p
                        role="status"
                        className="rounded-lg border border-warning/30 bg-warning/10 p-3 font-medium text-warning-text"
                      >
                        Đã giao hàng thành công; khoản tiền thu COD đang chờ kế toán admin đối soát.
                      </p>
                    )}

                    {order.trackingReference && (
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="size-4 text-muted-foreground" />
                        Mã vận đơn:{' '}
                        <span className="font-mono text-primary">
                          {order.trackingReference}
                        </span>
                      </p>
                    )}

                    <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground block mb-0.5">
                        Địa chỉ giao hàng:
                      </span>
                      {[
                        order.shippingAddress?.address,
                        order.shippingAddress?.district,
                        order.shippingAddress?.city,
                        order.shippingAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Sản phẩm trong đơn:
                      </h4>
                      <ul className="divide-y divide-border rounded-lg border border-border">
                        {(order.products || []).map((item, i) => (
                          <li
                            key={item._id || i}
                            className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <ItemThumbnail
                                image={item.image || item.images?.[0] || item.productId?.images?.[0]}
                                name={item.name}
                                icon={Package}
                                className="size-12 rounded-lg shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">
                                  {item.name}{' '}
                                  <span className="text-muted-foreground font-normal">× {item.quantity}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Đơn giá phân bổ: {money(item.unitPrice)}
                                </p>
                                {item.giftFee > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Phí quà tặng gift: +{money(item.giftFee)}
                                  </p>
                                )}
                                {item.bulkDiscountAmount > 0 && (
                                  <p className="text-xs font-medium text-success-text">
                                    Đã giảm theo số lượng: −{money(item.bulkDiscountAmount)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-bold tabular-nums text-foreground">
                              {money(item.totalPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap justify-between text-xs text-muted-foreground pt-1">
                      <span>
                        {order.shippingPayment === 'customer_to_carrier'
                          ? 'Phí vận chuyển khách thanh toán trực tiếp cho đơn vị vận chuyển ngoài giá trị đơn hàng.'
                          : `Phí giao hàng tính trong đơn: ${money(order.shippingFee)}`}
                      </span>
                    </div>
                  </div>
                </details>

                {/* Các nút hành động chuyển đổi tiến độ */}
                {availableActions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                    {availableActions.map((option) => (
                      <Button
                        key={option.status}
                        className="min-h-11"
                        disabled={busy}
                        onClick={() => {
                          setError('');
                          setAction({ order, ...option });
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!list.error && (
        <Pagination
          page={list.page}
          pages={list.pages}
          onChange={list.setPage}
          disabled={list.loading || busy}
        />
      )}

      {/* Dialog xác nhận chuyển tiến độ */}
      <Dialog
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        {action && (
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-md"
            onEscapeKeyDown={(event) => {
              if (lock.current) event.preventDefault();
            }}
          >
            <DialogTitle className="text-lg font-bold text-foreground">
              {action.label} · {action.order.orderId}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {orderActionMessage(action.order, action.status)}
            </DialogDescription>
            {error && <ErrorPanel>{error}</ErrorPanel>}
            <DialogFooter className="mt-2">
              <Button variant="outline" className="min-h-11" disabled={busy} onClick={close}>
                Đóng
              </Button>
              <Button className="min-h-11" disabled={busy} onClick={confirm}>
                {busy ? 'Đang xử lý…' : 'Xác nhận chuyển trạng thái'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
