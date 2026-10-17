"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAllBoxesApi } from '@/app/services/api/boxService';
import { getActiveTemplatesApi } from '@/app/services/api/subscribePlanService';
import { useCart } from '@/app/context/CartContext';
import { toBoxCartItem } from '../products/box/[id]/boxPricing';
import ChoosePlanModal from './Subsciber_components/ChoosePlanModal';
import MainHeader from './ui/main_header';
import Footer from './ui/footer';
const money = n => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
const names = { combo: 'Combo sản phẩm', gift: 'Hộp quà', subscription: 'Đăng ký hàng tháng' };
export default function CommerceCatalog({ kind }) {
  const [rows, setRows] = useState([]), [page, setPage] = useState(1), [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null), [quantities, setQuantities] = useState({});
  const { addToCart, isMounted } = useCart();
  useEffect(() => {
    let active = true;
    // Loading/error reset is owned by the user action that changes the request.
    const request = kind === 'subscription' ? getActiveTemplatesApi() : getAllBoxesApi({ kind, page, limit: 12, available: true });
    request.then(res => { if (active) { setRows(res.data || []); setPages(res.pagination?.totalPages || 1); } })
      .catch(() => { if (active) setError('Không tải được danh sách. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, page, reload]);
  return <><MainHeader /><main className="mx-auto max-w-6xl px-4 py-10">
    <nav aria-label="Mua sắm" className="mb-8 flex flex-wrap gap-5 text-sm underline">
      <Link href="/">Trang chính</Link><Link href="/homepage">Cửa hàng</Link><Link href="/subscription">Đăng ký tháng</Link><Link href="/box">Combo</Link><Link href="/gift">Hộp quà</Link>
    </nav>
    <h1 className="mb-3 text-3xl font-semibold">{names[kind]}</h1>
    <p className="mb-8 text-stone-600">Phí vận chuyển do khách trả trực tiếp cho bên giao hàng, ngoài số tiền thanh toán cho TotMart. Phí cần được thống nhất trước khi giao{kind === 'subscription' ? ' cho từng lần giao trong kỳ đăng ký' : ''}.</p>
    {loading ? <p role="status">Đang tải…</p> : error ? <div role="alert">{error} <button className="underline" onClick={() => (setLoading(true), setError(''), setReload(n => n + 1))}>Thử lại</button></div> : !rows.length ? <p>Chưa có {names[kind].toLowerCase()} đang bán.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(row => {
        const subscription = kind === 'subscription';
        const months = Number(String(row.planType).split('_')[0]);
        const amount = subscription ? row.discountPrice : row.value;
        const quantity = quantities[row._id] ?? 1;
        return <article key={row._id} className="space-y-4 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">{row.name}</h2>
          <p>{money(amount)}{subscription ? ` / ${months} tháng · ${months} lần giao` : ' / hộp'}</p>
          {subscription && <p className="text-sm">Nguồn: {row.sourceType === 'retail' ? 'Hàng lẻ' : 'Combo'} · {row.boxId?.name}</p>}
          {kind === 'gift' && <><ul className="text-sm">{(row.giftPolicy?.bulkTiers || []).map(t => <li key={t.minQuantity}>Từ {t.minQuantity} hộp: giảm {t.percent}% giá hộp</li>)}</ul><ul className="text-sm">{(row.giftPolicy?.amenities || []).map((a,i) => <li key={i}>{a.name}: +{money(a.fee)} / hộp</li>)}</ul><p className="text-xs">Tiện ích đã cấu hình sẽ được cộng khi báo giá giỏ hàng.</p></>}
          {!subscription && <><p className="text-sm">Còn {row.stock} hộp</p><label className="flex items-center gap-3">Số lượng<input aria-label={`Số lượng ${row.name}`} className="w-24 rounded border p-2" type="number" min="1" max={Math.min(999, row.stock)} value={quantity} onChange={e => setQuantities(p => ({...p, [row._id]: e.target.value}))} /></label><Link className="block underline" href={`/products/box/${row._id}`}>Xem cấu phần</Link></>}
          <button className="min-h-11 rounded-lg bg-emerald-800 px-5 py-2 text-white disabled:opacity-50" disabled={!isMounted || (!subscription && (!Number.isInteger(Number(quantity)) || Number(quantity)<1 || Number(quantity)>Math.min(999,row.stock)))} onClick={() => {
            if (subscription) setSelected(row);
            else { addToCart(toBoxCartItem(row, '/assets/placeholder.png'), Number(quantity)); toast.success('Đã thêm vào giỏ. Giá cuối cùng được xác nhận tại checkout.'); }
          }}>{subscription ? 'Chọn gói & địa chỉ' : 'Thêm vào giỏ'}</button>
        </article>;
      })}
    </div>}
    {pages > 1 && <nav aria-label="Phân trang" className="mt-8 flex items-center gap-5"><button disabled={page<=1 || loading} onClick={()=>(setLoading(true), setError(''), setPage(p=>p-1))}>Trước</button><span>{page}/{pages}</span><button disabled={page>=pages || loading} onClick={()=>(setLoading(true), setError(''), setPage(p=>p+1))}>Sau</button></nav>}
    {selected && <ChoosePlanModal box={{...selected.boxId, _id: selected.boxId?._id || selected.boxId, name: selected.name}} plansProps={[selected]} onClose={() => setSelected(null)} />}
  </main><Footer /></>;
}
