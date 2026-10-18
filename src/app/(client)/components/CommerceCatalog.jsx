"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnnouncementBar from './ui/AnnouncementBar';
import NavMenu from './ui/nav_menu';
import { toast } from 'sonner';
import { getAllBoxesApi } from '@/app/services/api/boxService';
import { getActiveTemplatesApi } from '@/app/services/api/subscribePlanService';
import { useCart } from '@/app/context/CartContext';
import { toBoxCartItem } from '../products/box/[id]/boxPricing';
import ChoosePlan from '@/components_box/ChoosePlan';
import MainHeader from './ui/main_header';
import Footer from './ui/footer';
const money = n => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
const names = { combo: 'Combo sản phẩm', gift: 'Hộp quà', subscription: 'Đăng ký hàng tháng' };
export default function CommerceCatalog({ kind, onlyAvailable = true }) {
  const [rows, setRows] = useState([]), [page, setPage] = useState(1), [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [quantities, setQuantities] = useState({});
  const { addToCart, isMounted } = useCart();
  useEffect(() => {
    let active = true;
    // Loading/error reset is owned by the user action that changes the request.
    const request = kind === 'subscription' ? getActiveTemplatesApi() : getAllBoxesApi({ kind, page, limit: 12, ...(onlyAvailable ? { available: true } : {}) });
    request.then(res => { if (active) { setRows(res.data || []); setPages(res.pagination?.totalPages || 1); } })
      .catch(() => { if (active) setError('Không tải được danh sách. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, page, reload, onlyAvailable]);
  return <><AnnouncementBar /><MainHeader /><NavMenu /><main className="tm-commerce tm-commerce--atelier mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <nav aria-label="Mua sắm" className="tm-breadcrumb">
      <Link href="/homepage">Cửa hàng</Link>{[['/subscription','Đăng ký tháng','subscription'],['/box','Combo','combo'],['/gift','Hộp quà','gift']].map(([href,label,type])=><Link key={href} href={href} aria-current={kind===type ? 'page' : undefined}>{label}</Link>)}
    </nav>
    <header className="mb-10 max-w-3xl"><h1 className="tm-product-title">{names[kind]}</h1>
      <p className="mt-4 text-stone-600">Phí vận chuyển do khách trả trực tiếp cho bên giao hàng, ngoài số tiền thanh toán cho TotMart. Phí cần được thống nhất trước khi giao{kind === 'subscription' ? ' cho từng lần giao trong kỳ đăng ký' : ''}.</p>
    </header>
    {loading ? <div role="status" className="min-h-64 py-10"><p>Đang tải {names[kind].toLowerCase()}…</p></div> : error ? <div role="alert" className="space-y-4 py-8"><h2 className="text-xl font-bold">Chưa tải được danh sách</h2><p>{error}</p><button type="button" className="tm-button tm-button--outline" onClick={()=>{setLoading(true);setError('');setReload(n=>n+1);}}>Thử lại</button></div> : !rows.length ? <div className="tm-state" role="status"><h2>Chưa có {names[kind].toLowerCase()} đang bán</h2><p>Bạn có thể xem các sản phẩm khác trong cửa hàng.</p><Link href="/products" className="tm-button tm-button--outline">Xem sản phẩm</Link></div> : kind === 'subscription' ? <ChoosePlan plans={rows} embedded /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(row=>{
        const quantity=quantities[row._id] ?? 1;
        const validQuantity=Number.isInteger(Number(quantity)) && Number(quantity)>0 && Number(quantity)<=Math.min(999,row.stock);
        return <article key={row._id} className="tm-plan-card">
          <Link href={`/products/box/${row._id}`} className="tm-plan-card__image"><Image src={row.images?.[0]?.url || '/assets/placeholder.png'} alt={row.name || names[kind]} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-4" /></Link>
          <div className="tm-plan-card__body"><h2 className="font-serif text-2xl font-bold leading-snug"><Link href={`/products/box/${row._id}`} className="underline-offset-4 hover:underline">{row.name}</Link></h2>
            <p className="tm-price">{money(row.value)}<span className="ml-1 text-sm font-normal text-stone-600">/hộp</span></p>
            {kind === 'gift' && ((row.giftPolicy?.bulkTiers || []).length>0 || (row.giftPolicy?.amenities || []).length>0) && <details className="text-sm"><summary className="min-h-11 cursor-pointer py-2 font-semibold">Ưu đãi & tiện ích của hộp</summary><ul className="space-y-2 py-3">{(row.giftPolicy?.bulkTiers || []).map(t=><li key={t.minQuantity}>Từ {t.minQuantity} hộp: giảm {t.percent}% giá hộp</li>)}{(row.giftPolicy?.amenities || []).map((a,i)=><li key={i}>{a.name}: +{money(a.fee)}/hộp</li>)}</ul><p>Tiện ích đã cấu hình được cộng khi báo giá giỏ hàng.</p></details>}
            <p className={row.stock>0 ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{row.stock>0 ? `Còn ${row.stock} hộp` : 'Tạm hết hàng'}</p>
            <label className="flex flex-wrap items-center justify-between gap-3 text-sm">Số lượng<input aria-label={`Số lượng ${row.name}`} className="min-h-11 w-24 rounded-lg border border-stone-400 bg-white px-3 text-base" type="number" min="1" max={Math.min(999,row.stock)} disabled={!(row.stock>0)} value={quantity} onChange={event=>setQuantities(previous=>({...previous,[row._id]:event.target.value}))} /></label>
            <button type="button" className="tm-button tm-button--primary mt-auto w-full" disabled={!isMounted || !validQuantity} onClick={()=>{addToCart(toBoxCartItem(row,'/assets/placeholder.png'),Number(quantity));toast.success('Đã thêm vào giỏ. Giá cuối cùng được xác nhận tại checkout.');}}>{row.stock>0 ? 'Thêm vào giỏ' : 'Tạm hết hàng'}</button>
            <Link className="tm-text-button" href={`/products/box/${row._id}`}>Xem sản phẩm trong hộp</Link>
          </div>
        </article>;
      })}
    </div>}
    {pages>1 && <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-4"><button type="button" className="tm-button tm-button--outline" disabled={page<=1 || loading} onClick={()=>{setLoading(true);setError('');setPage(p=>p-1);}}>Trước</button><span aria-live="polite">Trang {page}/{pages}</span><button type="button" className="tm-button tm-button--outline" disabled={page>=pages || loading} onClick={()=>{setLoading(true);setError('');setPage(p=>p+1);}}>Sau</button></nav>}
  </main><Footer /></>;
}
