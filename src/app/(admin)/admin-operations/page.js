"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { axiosConfig } from '@/app/services/api/axiosConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const subPath = '/subcribe-plans';
const money = value => Number(value || 0).toLocaleString('vi-VN') + ' đ';
export default function OperationsPage() {
  const [deliveries, setDeliveries] = useState([]), [refunds, setRefunds] = useState([]), [events, setEvents] = useState([]);
  const [references, setReferences] = useState({}), [loading, setLoading] = useState(true), [busy, setBusy] = useState(null), [error, setError] = useState('');
  const [page, setPage] = useState(1), [eventPages, setEventPages] = useState(0);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [due, orderRefunds, subRefunds, paymentEvents] = await Promise.all([
        axiosConfig.get(subPath + '/today-deliveries'), axiosConfig.get('/checkout/pending-refunds', {params:{limit:100}}),
        axiosConfig.get(subPath + '/pending-refunds'), axiosConfig.get('/checkout/payment-events', {params:{page}}),
      ]);
      setDeliveries(due.data || []);
      setRefunds([...(orderRefunds.data || []).map(item => ({...item,kind:'order'})), ...(subRefunds.data || []).map(item => ({...item,kind:'subscription'}))]);
      setEvents(paymentEvents.data || []); setEventPages(paymentEvents.pagination?.totalPages || 0);
    } catch (err) { setError(err.response?.data?.message || 'Không tải được dữ liệu vận hành'); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  const act = async (key, path, payload = {}) => {
    if (busy) return; setBusy(key);
    try { await axiosConfig.post(path, payload); toast.success('Đã cập nhật'); await load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Không cập nhật được'); }
    finally { setBusy(null); }
  };
  const referenceInput = (key, placeholder) => <Input aria-label={placeholder} value={references[key] || ''} onChange={event => setReferences(prev => ({...prev,[key]:event.target.value}))} placeholder={placeholder} />;
  return <main className="p-6 space-y-8">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Giao định kỳ & đối soát tiền</h1><Button disabled={loading || !!busy} onClick={load}>Tải lại</Button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading && <p>Đang tải...</p>}
    <section className="space-y-3"><h2 className="text-xl font-semibold">Lượt giao đến hạn</h2>
      <Button disabled={!!busy} onClick={() => act('scan',subPath + '/process-deliveries')}>Tạo lượt đến hạn</Button>
      <p>Quét lịch chỉ tạo yêu cầu giao. Số lượt còn lại giảm khi xác nhận đã giao.</p>
      {!loading && !deliveries.length && <p>Không có lượt đang chờ.</p>}
      {deliveries.map(item => <div key={item._id} className="border rounded p-4 space-y-2">
        <p className="font-semibold">{item.subscriptionId?.userId?.name || 'Khách hàng'} · {item.subscriptionId?.boxId?.name || 'Hộp'} · lượt {item.sequence}</p>
        <p>{new Date(item.dueAt).toLocaleDateString('vi-VN')} · {item.state === 'dispatched' ? 'Đang giao' : 'Chờ xuất hàng'}</p>
        <p>Địa chỉ: {item.subscriptionId?.shippingAddress?.address}, {item.subscriptionId?.shippingAddress?.district}, {item.subscriptionId?.shippingAddress?.city} · {item.subscriptionId?.shippingAddress?.phone}</p>
        {item.state === 'pending' ? <div className="flex gap-2">{referenceInput(item._id,'Mã vận đơn')}<Button disabled={!!busy || !references[item._id]?.trim() || references[item._id].trim().length < 3} onClick={() => act(item._id,subPath + `/fulfillments/${item._id}/dispatch`,{trackingReference:references[item._id].trim()})}>Giữ kho & xuất hàng</Button></div> : <div className="flex gap-2 items-center"><span>Vận đơn: {item.trackingReference}</span><Button disabled={!!busy} onClick={() => act(item._id,subPath + `/fulfillments/${item._id}/deliver`)}>Xác nhận đã giao</Button></div>}
      </div>)}
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Khoản hoàn tiền chờ xác nhận</h2>
      <p>Chuyển tiền hoàn bên ngân hàng trước, sau đó nhập mã giao dịch để ghi nhận. Trang này không tự chuyển tiền.</p>
      {!loading && !refunds.length && <p>Không có khoản hoàn đang chờ.</p>}
      {refunds.map(item => <div key={item._id} className="border rounded p-4 space-y-2"><p>{item.kind === 'order' ? 'Đơn hàng' : 'Gói định kỳ'} {item.orderId || item.paymentCode} · {money(item.refundAmount)}</p><div className="flex gap-2">{referenceInput(item._id,'Mã giao dịch hoàn tiền')}<Button disabled={!!busy || !references[item._id]?.trim() || references[item._id].trim().length < 3} onClick={() => act(item._id,item.kind === 'order' ? `/checkout/complete-refund/${item._id}` : subPath + `/refunds/${item._id}/complete`,{amount:item.refundAmount,reference:references[item._id].trim()})}>Ghi nhận đã hoàn {money(item.refundAmount)}</Button></div></div>)}
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Giao dịch cần đối soát</h2><p>Kiểm tra chuyển thiếu tiền, mã không khớp, đơn hết hạn hoặc lỗi xử lý với sao kê ngân hàng. Chưa có thao tác ghi nhận trả tiền thủ công.</p>
      {events.map(item => <div key={item._id} className="border rounded p-3"><p>{item.referenceCode} · {item.paymentCode || 'Không có mã đơn'} · {money(item.transferAmount)}</p><p>{item.state} · số lần xử lý: {item.attempts} · {new Date(item.createdAt).toLocaleString('vi-VN')}</p></div>)}
      {!loading && !events.length && <p>Không có giao dịch cần đối soát.</p>}
      <div className="flex gap-4"><Button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Trang trước</Button><span>Trang {page}/{Math.max(1,eventPages)}</span><Button disabled={loading || page >= eventPages} onClick={() => setPage(page + 1)}>Trang sau</Button></div>
    </section>
  </main>;
}
