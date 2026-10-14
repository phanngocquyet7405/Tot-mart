"use client";
import { useCallback, useContext, useEffect, useState } from 'react';
import { withRole } from '@/app/middleware/roleMiddleware';
import { AppContext } from '@/app/context/AppContext';
import { axiosConfig } from '@/app/services/api/axiosConfig';

const labels = { products: 'Sản phẩm', combos: 'Combo', subscriptions: 'Đăng ký hàng tháng', gifts: 'Hộp quà', orders: 'Đơn hàng' };
const empty = () => ({ name: '', description: '', price: '', stock: '0', category: '', brand: '', discountPercent: '0', validTo: '', planType: '1_month', boxId: '', comboId: '', sourceType: 'combo', products: [], bulkTiers: [], amenities: [] });
async function collect(resource) {
  const first = await axiosConfig.get(resource + '&page=1');
  const rows = [...first.data];
  for (let page = 2; page <= (first.pagination?.totalPages || 1); page++) {
    const result = await axiosConfig.get(resource + '&page=' + page); rows.push(...result.data);
  }
  return rows;
}
const money = n => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
function Manager() {
  const { logout } = useContext(AppContext);
  const [tab, setTab] = useState('products'), [rows, setRows] = useState([]), [catalog, setCatalog] = useState([]), [combos, setCombos] = useState([]);
  const [options, setOptions] = useState({ brands: [], categories: [] }), [form, setForm] = useState(null), [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => { setSearch(draftSearch); setPage(1); }, 300); return () => clearTimeout(timer); }, [draftSearch]);
  const [images, setImages] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [page, setPage] = useState(1), [pages, setPages] = useState(1);
  const load = useCallback(async () => {
    try {
      const resource = tab === 'gifts' ? 'combos' : tab;
      const result = await axiosConfig.get(`/manager/${resource}?page=${page}&limit=20${tab === "products" ? "&keyword=" + encodeURIComponent(search) : ""}${tab === "gifts" ? "&kind=gift" : tab === "combos" ? "&kind=combo" : ""}`);
      setRows(result.data); setPages(result.pagination?.totalPages || 1);
      const [p, b, o] = await Promise.all([collect('/manager/products?limit=100'), collect('/manager/combos?limit=100&kind=combo'), axiosConfig.get('/manager/catalog-options')]);
      setCatalog(p); setCombos(b.filter(x => !x.isGift && !x.subscriptionOnly)); setOptions(o.data);
    } catch (e) { setError(e.response?.data?.message || 'Không thể tải dữ liệu'); }
  }, [tab, page, search]);
  useEffect(() => { load(); }, [load]);
  function change(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function open(row) {
    setEditing(row?._id || null); setImages([]); setError('');
    setForm(row ? { ...empty(), ...row, description: row.description || row.descriptions || '', validTo: row.validTo?.slice(0, 10) || '', products: (row.products || []).map(p => ({ productId: p.productId?._id || p.productId, quantity: p.quantity })), bulkTiers: row.giftPolicy?.bulkTiers || [], amenities: row.giftPolicy?.amenities || [] } : empty());
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const f = form, products = f.products.map(p => ({ productId: p.productId, quantity: Number(p.quantity) }));
      let resource = tab, payload, method = editing ? (tab === 'subscriptions' || tab === 'gifts' ? 'patch' : 'put') : 'post';
      if (tab === 'products') {
        payload = { name: f.name, description: f.description, price: Number(f.price), stock: Number(f.stock), category: f.category, brand: f.brand };
      } else if (tab === 'combos') {
        payload = { name: f.name, descriptions: f.description, stock: Number(f.stock), validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString(), discountPercent: Number(f.discountPercent), products };
      } else if (tab === 'gifts') {
        payload = { name: f.name, validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString(), giftPolicy: { bulkTiers: f.bulkTiers.map(t => ({ minQuantity: Number(t.minQuantity), percent: Number(t.percent) })), amenities: f.amenities.map(a => ({ name: a.name, fee: Number(a.fee) })) } };
        if (!editing) Object.assign(payload, { comboId: f.comboId, stock: Number(f.stock) });
      } else {
        payload = { name: f.name, description: f.description, planType: f.planType, discountPercent: Number(f.discountPercent) };
        if (!editing && f.sourceType === 'retail') {
          resource = 'retail-subscriptions'; Object.assign(payload, { products, stock: Number(f.stock), validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString() });
        } else if (!editing || f.sourceType !== 'retail') payload.boxId = f.boxId;
      }
      if (tab === 'products' || tab === 'combos') {
        const data = new FormData();
        for (const [key, value] of Object.entries(payload)) data.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        images.forEach(image => data.append('images', image)); payload = data;
      }
      await axiosConfig[method](`/manager/${resource}${editing ? '/' + editing : ''}`, payload, payload instanceof FormData ? { headers: { 'Content-Type': undefined } } : undefined);
      setForm(null); await load();
    } catch (e) { setError(e.response?.data?.errors?.map(x => x.message).join('; ') || e.response?.data?.message || 'Không thể lưu'); }
    finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm(`Xóa “${row.name}”?`)) return;
    try { await axiosConfig.delete(`/manager/${tab === 'gifts' ? 'combos' : tab}/${row._id}`); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Không thể xóa'); }
  }
  async function stock(row) {
    const value = window.prompt('Nhập số lượng tăng/giảm tồn kho (ví dụ 10 hoặc -2)');
    if (value === null) return;
    try { await axiosConfig.patch(`/manager/${tab === 'gifts' ? 'combos' : tab}/${row._id}/stock`, { delta: Number(value), reason: 'Merchant điều chỉnh tồn kho' }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Không thể điều chỉnh'); }
  }
  const field = (key, label, type = 'text', required = true) => <label className="grid gap-1">{label}<input className="rounded border p-2" type={type} required={required} min={type === 'number' ? 0 : undefined} value={form[key] ?? ''} onChange={e => change(key, e.target.value)} /></label>;
  const select = (key, label, items) => <label className="grid gap-1">{label}<select required className="rounded border p-2" value={form[key]} onChange={e => change(key, e.target.value)}><option value="">Chọn {label.toLowerCase()}</option>{items.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></label>;
  const productPicker = <fieldset className="grid gap-2 rounded border p-3"><legend>Sản phẩm của bạn</legend>{catalog.map(p => {
    const item = form?.products.find(x => x.productId === p._id);
    return <label key={p._id} className="flex items-center gap-2"><input type="checkbox" checked={!!item} onChange={e => change('products', e.target.checked ? [...form.products, { productId: p._id, quantity: 1 }] : form.products.filter(x => x.productId !== p._id))} />{p.name} — {money(p.price)}{item && <input aria-label={`Số lượng ${p.name}`} className="w-20 rounded border p-1" type="number" min="1" required value={item.quantity} onChange={e => change('products', form.products.map(x => x.productId === p._id ? { ...x, quantity: e.target.value } : x))} />}</label>;
  })}{!catalog.length && <p>Hãy tạo sản phẩm trước.</p>}</fieldset>;
  const visible = rows.filter(row => !search || String(row.name || row.orderId).toLocaleLowerCase().includes(search.toLocaleLowerCase())).filter(row => tab !== 'combos' && tab !== 'gifts' || (tab === 'gifts' ? row.isGift && row.sourceComboId : !row.isGift && !row.subscriptionOnly));
  return <main className="mx-auto max-w-6xl space-y-6 p-6">
    <header><h1 className="text-3xl font-bold">Quản lý cửa hàng</h1><p className="text-gray-600">Sản phẩm và các chính sách của cửa hàng bạn</p><button className="mt-2 underline" onClick={logout}>Đăng xuất</button></header>
    <nav className="flex flex-wrap gap-2">{Object.entries(labels).map(([key, label]) => <button className={`rounded px-4 py-2 ${tab === key ? 'bg-green-800 text-white' : 'bg-gray-100'}`} key={key} onClick={() => { setTab(key); setPage(1); setForm(null); setError(''); }}>{label}</button>)}</nav>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>}
    {tab !== 'orders' && <button className="rounded bg-green-800 px-4 py-2 text-white" onClick={() => open()}>Tạo {labels[tab].toLowerCase()}</button>}
    {tab === 'subscriptions' && <p>Giao hàng mỗi tháng. Thu tiền trước theo kỳ 1, 3, 6 hoặc 12 tháng.</p>}
    {form && <form onSubmit={save} className="grid gap-4 rounded-xl border bg-white p-5">
      <h2 className="text-xl font-semibold">{editing ? 'Chỉnh sửa' : 'Tạo'} {labels[tab].toLowerCase()}</h2>
      {field('name', 'Tên')}
      {tab !== 'gifts' && field('description', 'Mô tả')}
      {tab === 'products' && <>{field('price', 'Giá (VND)', 'number')}{!editing && field('stock', 'Tồn kho', 'number')}{select('brand', 'Thương hiệu', options.brands)}{select('category', 'Danh mục', options.categories)}{!options.brands.length && <p>Admin cần tạo thương hiệu và gán cho tài khoản merchant trước.</p>}</>}
      {tab === 'combos' && <>{productPicker}{!editing && field('stock', 'Tồn kho combo', 'number')}{field('validTo', 'Ngày kết thúc bán', 'date')}{field('discountPercent', 'Giảm giá combo (%)', 'number')}</>}
      {(tab === 'products' || tab === 'combos') && <label>Thêm ảnh<input className="block" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setImages(Array.from(e.target.files))} /></label>}
      {tab === 'subscriptions' && <>
        {!editing && <label>Nguồn gói<select className="ml-2 rounded border p-2" value={form.sourceType} onChange={e => change('sourceType', e.target.value)}><option value="combo">Combo</option><option value="retail">Hàng lẻ</option></select></label>}
        {form.sourceType === 'retail' ? !editing && <>{productPicker}{field('stock', 'Số gói khả dụng', 'number')}{field('validTo', 'Ngày kết thúc nhận đăng ký', 'date')}</> : select('boxId', 'Combo', combos)}
        <label>Kỳ đăng ký<select className="ml-2 rounded border p-2" value={form.planType} onChange={e => change('planType', e.target.value)}>{[1,3,6,12].map(n => <option key={n} value={`${n}_month`}>{n} tháng</option>)}</select></label>{field('discountPercent', 'Giảm giá kỳ đăng ký (%)', 'number')}
      </>}
      {tab === 'gifts' && <>
        {!editing && <>{select('comboId', 'Combo nguồn', combos)}{field('stock', 'Số hộp quà khả dụng', 'number')}</>}{field('validTo', 'Ngày kết thúc bán', 'date')}
        <p>Hộp quà giữ cấu phần và giá của combo tại lúc tạo. Các tiện ích được bao gồm trong mỗi hộp quà.</p>
        <fieldset className="space-y-2"><legend>Giảm giá theo số hộp quà</legend>{form.bulkTiers.map((t, i) => <div className="flex gap-2" key={i}><input aria-label="Từ số lượng" placeholder="Từ số lượng" className="w-36 rounded border p-2" type="number" min="2" required value={t.minQuantity} onChange={e => change('bulkTiers', form.bulkTiers.map((x, j) => j === i ? { ...x, minQuantity: e.target.value } : x))} /><input aria-label="Giảm phần trăm" className="w-36 rounded border p-2" type="number" min="0" max="100" required value={t.percent} onChange={e => change('bulkTiers', form.bulkTiers.map((x, j) => j === i ? { ...x, percent: e.target.value } : x))} /><button type="button" onClick={() => change('bulkTiers', form.bulkTiers.filter((_, j) => j !== i))}>Bỏ</button></div>)}<button type="button" onClick={() => change('bulkTiers', [...form.bulkTiers, { minQuantity: 3, percent: 5 }])}>+ Mức giảm giá</button></fieldset>
        <fieldset className="space-y-2"><legend>Tiện ích kèm theo</legend>{form.amenities.map((a, i) => <div className="flex gap-2" key={i}><input aria-label="Tên tiện ích" placeholder="Thiệp, gói quà…" className="rounded border p-2" required value={a.name} onChange={e => change('amenities', form.amenities.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /><input aria-label="Phí tiện ích VND" className="w-36 rounded border p-2" type="number" min="0" required value={a.fee} onChange={e => change('amenities', form.amenities.map((x, j) => j === i ? { ...x, fee: e.target.value } : x))} /><button type="button" onClick={() => change('amenities', form.amenities.filter((_, j) => j !== i))}>Bỏ</button></div>)}<button type="button" onClick={() => change('amenities', [...form.amenities, { name: '', fee: 0 }])}>+ Tiện ích</button></fieldset>
      </>}
      <div className="flex gap-3"><button disabled={busy} className="rounded bg-green-800 px-4 py-2 text-white">{busy ? 'Đang lưu…' : 'Lưu'}</button><button type="button" disabled={busy} onClick={() => setForm(null)}>Hủy</button></div>
    </form>}
    <label className="block">{tab === "products" ? "Tìm sản phẩm" : "Tìm trong trang hiện tại"}<input className="ml-2 rounded border p-2" value={draftSearch} onChange={e => setDraftSearch(e.target.value)} /></label>
    <section className="grid gap-3">{visible.map(row => <article className="flex flex-wrap items-center justify-between gap-3 rounded border p-4" key={row._id}><div><h2 className="font-semibold">{row.name || row.orderId}</h2><p>{tab === 'orders' ? `${row.status} · ${money(row.totalAmount)}` : `${money(row.price ?? row.discountPrice ?? row.value)}${row.stock !== undefined ? ' · Tồn: ' + row.stock : ''}`}</p>{tab === 'orders' && <><p>{row.products.map(p => `${p.name} × ${p.quantity}`).join(', ')}</p><p>{row.shippingAddress?.fullName} · {row.shippingAddress?.phone} · {row.shippingAddress?.address} · {row.shippingAddress?.city}</p></>}</div>{tab !== 'orders' && <div className="flex gap-3"><button onClick={() => open(row)}>Sửa</button>{tab !== 'subscriptions' && <button onClick={() => stock(row)}>Tồn kho</button>}<button className="text-red-700" onClick={() => remove(row)}>Xóa</button></div>}</article>)}{!visible.length && <p>Chưa có dữ liệu.</p>}</section>
    <footer className="flex gap-4"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Trang trước</button><span>Trang {page}/{pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Trang sau</button></footer>
  </main>;
}
export default withRole(Manager, ['merchant']);
