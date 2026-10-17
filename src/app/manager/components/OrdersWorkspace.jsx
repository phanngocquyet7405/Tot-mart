"use client";
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useManagerList } from '../lib/useManagerList';
import { managerError, money } from '../lib/productModel.mjs';
import { managerOrderActions, orderActionMessage } from '../lib/orderActions.mjs';
import { updateManagerOrderStatus } from '../services/managerApi';
import { PageTitle, LoadingList, EmptyList, ErrorPanel, Pagination } from './WorkspaceUI';
export const orderStatuses = { pending:'Chờ xử lý', processing:'Đang chuẩn bị', shipped:'Đang giao', delivered:'Đã giao', cancelled:'Đã hủy', returned:'Trả hàng', on_hold:'Tạm giữ' };
const payments = { pending:'Chờ thanh toán', paid:'Đã thanh toán', failed:'Thanh toán lỗi' };
const noop = () => {};

export default function OrdersWorkspace({ onDirtyChange = noop }) {
  const list = useManagerList('orders');
  const [action, setAction] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false), mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; onDirtyChange(false, false); }; }, [onDirtyChange]);
  function close() { if (!lock.current) { setAction(null); setError(''); } }
  async function confirm() {
    if (lock.current || !action) return;
    lock.current = true; setBusy(true); setError(''); onDirtyChange(false, true);
    try {
      await updateManagerOrderStatus(action.order._id, action.status, action.order.status);
      if (mounted.current) { setAction(null); toast.success('Đã cập nhật tiến độ đơn hàng'); list.reload(); }
    } catch (failure) {
      if (mounted.current) { setError(managerError(failure)); list.reload(); }
    } finally {
      lock.current = false; onDirtyChange(false, false);
      if (mounted.current) setBusy(false);
    }
  }
  return <section className="space-y-5">
    <PageTitle title="Đơn hàng" description="Vận hành đơn của cửa hàng. Merchant không xác nhận tiền, hủy đơn hay hoàn tiền." />
    {list.loading ? <LoadingList /> : list.error ? <ErrorPanel onRetry={list.reload}>{list.error}</ErrorPanel> : !list.rows.length ? <EmptyList title="Chưa có đơn hàng">Đơn của cửa hàng sẽ xuất hiện tại đây. Đơn online chưa thanh toán được hệ thống ẩn mặc định.</EmptyList> : <div className="divide-y rounded-xl border bg-card">
      {list.rows.map(order => <div key={order._id} className="p-4 sm:p-5">
        <details><summary className="cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="inline-grid w-[calc(100%-1.5rem)] gap-3 align-top sm:grid-cols-[1fr_auto]"><span className="font-semibold">{order.orderId}</span><span className="flex flex-wrap gap-2"><span>{money(order.totalAmount)}</span><Badge variant="secondary">{orderStatuses[order.status] || order.status}</Badge></span></span>
        </summary><div className="mt-4 space-y-4 border-t pt-4 text-sm">
          <p>{order.paymentMethod === 'cod' ? 'COD' : 'Online'} · {payments[order.paymentStatus] || order.paymentStatus}</p>
          {order.codCollectionStatus === 'pending_review' && <p role="status" className="font-medium">Đã báo giao hàng; tiền COD đang chờ admin đối soát.</p>}
          {order.trackingReference && <p>Vận đơn: {order.trackingReference}</p>}
          <p>{order.shippingAddress?.fullName} · {order.shippingAddress?.phone}</p>
          <p>{[order.shippingAddress?.address, order.shippingAddress?.district, order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ')}</p>
          <ul className="divide-y rounded-lg border">{(order.products || []).map((item, i) => <li key={item._id || i} className="p-3"><p>{item.name} × {item.quantity}</p><p>Đơn giá phân bổ: {money(item.unitPrice)} · Thành tiền: {money(item.totalPrice)}</p>{item.giftFee > 0 && <p>Phí gift: {money(item.giftFee)}</p>}{item.bulkDiscountAmount > 0 && <p>Đã giảm theo lượng: {money(item.bulkDiscountAmount)}</p>}</li>)}</ul>
          <p>Phí giao hàng: {money(order.shippingFee)}</p>
          {order.createdAt && <p>Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>}
        </div></details>
        <div className="mt-4 flex flex-wrap gap-2">{managerOrderActions(order).map(option => <Button key={option.status} className="min-h-11" disabled={busy} onClick={() => { setError(''); setAction({ order, ...option }); }}>{option.label}</Button>)}</div>
      </div>)}
    </div>}
    {!list.error && <Pagination page={list.page} pages={list.pages} onChange={list.setPage} disabled={list.loading || busy} />}
    <Dialog open={Boolean(action)} onOpenChange={open => { if (!open) close(); }}>
      {action && <DialogContent showCloseButton={false} onEscapeKeyDown={event => { if (lock.current) event.preventDefault(); }}>
        <DialogTitle>{action.label} · {action.order.orderId}</DialogTitle>
        <DialogDescription>{orderActionMessage(action.order, action.status)}</DialogDescription>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button variant="outline" disabled={busy} onClick={close}>Đóng</Button><Button disabled={busy} onClick={confirm}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</Button></DialogFooter>
      </DialogContent>}
    </Dialog>
  </section>;
}
