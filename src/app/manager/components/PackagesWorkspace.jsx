"use client";
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { collectManagerResource, quoteManagerGift } from '../services/managerApi';
import { useManagerList } from '../lib/useManagerList';
import { money, managerError } from '../lib/productModel.mjs';
import { labels, subscriptionAmounts } from '../lib/packageModel.mjs';
import PackageEditor from './PackageEditor';
import { ProductActionDialog } from './ProductsWorkspace';
import { PageTitle, ErrorPanel, LoadingList, EmptyList, Pagination } from './WorkspaceUI';

function GiftQuote({ row, onClose }) {
  const [quantity,setQuantity]=useState(3),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const controller=useRef(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  async function quote(event){event.preventDefault();if(busy)return;const current=new AbortController();controller.current=current;setBusy(true);setError('');setResult(null);
    try{const response=await quoteManagerGift(row._id,Number(quantity),{signal:current.signal});if(!current.signal.aborted){if(!Number.isSafeInteger(response.data?.totalAmount))throw new Error('BE chưa trả báo giá hợp lệ.');setResult(response.data);}}
    catch(failure){if(!current.signal.aborted)setError(managerError(failure));}finally{if(!current.signal.aborted)setBusy(false);}}
  return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogTitle>Báo giá gift từ BE</DialogTitle><DialogDescription>{row.name} · Chỉ cho cấu hình đã lưu. Không tạo đơn, không thanh toán.</DialogDescription><form onSubmit={quote} className="space-y-4"><label className="grid gap-2 text-sm font-medium">Số lượng<Input type="number" min={1} max={999} step={1} required className="min-h-11" value={quantity} disabled={busy} onChange={event=>{setQuantity(event.target.value);setResult(null);}} /></label><Button className="min-h-11" disabled={busy}>{busy?'Đang lấy báo giá…':'Lấy báo giá BE'}</Button></form>{error&&<ErrorPanel>{error}</ErrorPanel>}{result&&<dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted p-4 text-sm tabular-nums"><dt>Tiền hàng trước giảm</dt><dd className="text-right">{money(result.baseSubtotal)}</dd><dt>Giảm theo lượng</dt><dd className="text-right">−{money(result.bulkDiscountAmount)}</dd><dt>Tiện ích</dt><dd className="text-right">+{money(result.giftFee)}</dd><dt className="font-semibold">Tổng theo BE</dt><dd className="text-right font-semibold">{money(result.totalAmount)}</dd></dl>}<Button variant="outline" className="min-h-11" onClick={onClose}>Đóng</Button></DialogContent></Dialog>;
}
export default function PackagesWorkspace({ kind, onDirtyChange }) {
  const list=useManagerList(kind);
  const [catalog,setCatalog]=useState({products:[],combos:[],key:-1,error:''});
  const [catalogVersion,setCatalogVersion]=useState(0),[editor,setEditor]=useState(null),[action,setAction]=useState(null),[quote,setQuote]=useState(null),[notice,setNotice]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    Promise.all([kind==='gifts'?Promise.resolve([]):collectManagerResource('products',{signal:controller.signal}),kind==='combos'?Promise.resolve([]):collectManagerResource('combos',{signal:controller.signal})]).then(([products,combos])=>{if(!controller.signal.aborted)setCatalog({products,combos,key:catalogVersion,error:''});}).catch(error=>{if(!controller.signal.aborted)setCatalog({products:[],combos:[],key:catalogVersion,error:managerError(error)});});
    return()=>controller.abort();
  },[kind,catalogVersion]);
  const ready=catalog.key===catalogVersion&&!catalog.error;
  function closed(){setEditor(null);onDirtyChange(false);}
  function done(message){closed();setAction(null);setNotice(message);toast.success(message);list.reload();setCatalogVersion(value=>value+1);}
  return <section className="space-y-5"><PageTitle title={labels[kind]} description={kind==='combos'?'Kết hợp sản phẩm riêng của cửa hàng thành combo.':kind==='gifts'?'Quà tặng từ combo, giảm theo lượng và tiện ích kèm phí.':'Giao hàng mỗi tháng. Thu tiền trước theo kỳ 1, 3, 6 hoặc 12 tháng.'} action={`Tạo ${kind==='subscriptions'?'gói đăng ký':labels[kind].toLocaleLowerCase('vi')}`} disabled={!ready} onAction={()=>setEditor({row:null})} />
    {notice&&<p role="status" className="rounded-lg border bg-card p-4 text-sm">{notice}</p>}
    {catalog.error?<ErrorPanel onRetry={()=>setCatalogVersion(value=>value+1)}>Không tải được nguồn tạo gói: {catalog.error}</ErrorPanel>:!ready?<p role="status" className="text-sm text-muted-foreground">Đang tải danh mục nguồn…</p>:null}
    {kind==='subscriptions'&&<p className="text-sm leading-relaxed text-muted-foreground">Đây là mẫu gói đăng ký, không phải danh sách đăng ký của khách. Xóa mẫu không hủy đăng ký đã bán và không tự hoàn tiền; merchant không có quyền xử lý hoàn tiền ở đây.</p>}
    {list.loading?<LoadingList />:list.error?<ErrorPanel onRetry={list.reload}>{notice?'Thao tác đã thành công nhưng tải lại danh sách chưa thành công. ':''}{list.error}</ErrorPanel>:!list.rows.length?<EmptyList title={`Chưa có ${labels[kind].toLocaleLowerCase('vi')}`}>Tạo từ sản phẩm hoặc combo riêng của cửa hàng.</EmptyList>:<div className="divide-y rounded-xl border bg-card">{list.rows.map(row=>{const amounts=kind==='subscriptions'?subscriptionAmounts(row):null;return <article key={row._id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]"><div className="min-w-0 space-y-2"><h2 className="break-words font-semibold">{row.name}</h2>{kind==='subscriptions'?<><div className="flex flex-wrap gap-2"><Badge variant="secondary">{row.sourceType==='retail'?'Hàng lẻ':'Combo'}</Badge><Badge variant="outline">{row.planType?.split('_')[0]} tháng</Badge><Badge variant="outline">{row.isActive?'Đang mở bán':'Tạm ngừng'}</Badge></div><dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm tabular-nums"><dt>Tổng thu trước</dt><dd className="font-semibold">{money(amounts?.total)}</dd><dt>Bình quân mỗi tháng</dt><dd>{money(amounts?.monthly)}</dd></dl></>:<><p className="text-sm tabular-nums">Giá BE: <strong>{money(row.value)}</strong> · Tồn: {row.stock??'Chưa có dữ liệu'}</p><p className="text-xs text-muted-foreground">Hạn bán: {row.validTo?new Date(row.validTo).toLocaleDateString('vi-VN'):'Chưa có dữ liệu'}{kind==='combos'?` · Phiên bản ${row.definitionVersion??'chưa có'}`:''}</p><p className="break-words text-sm text-muted-foreground">{(row.products||[]).map(part=>`${part.name||'Sản phẩm'} × ${part.quantity}`).join(', ')||'BE chưa trả cấu phần.'}</p>{kind==='gifts'&&<p className="text-xs text-muted-foreground">Combo nguồn: {catalog.combos.find(combo=>combo._id===row.sourceComboId)?.name||'Nguồn đã lưu'} · {(row.giftPolicy?.bulkTiers||[]).length} bậc giảm · {(row.giftPolicy?.amenities||[]).length} tiện ích</p>}</> }</div><div className="flex flex-wrap gap-2 lg:items-start lg:justify-end"><Button variant="outline" className="min-h-11" disabled={!ready} onClick={()=>setEditor({row})}>Sửa<span className="sr-only"> {row.name}</span></Button>{kind!=='subscriptions'&&<Button variant="outline" className="min-h-11" onClick={()=>setAction({kind:'stock',product:row})}>Tồn kho<span className="sr-only"> {row.name}</span></Button>}{kind==='gifts'&&<Button variant="outline" className="min-h-11" onClick={()=>setQuote(row)}>Báo giá BE<span className="sr-only"> {row.name}</span></Button>}<Button variant="destructive" className="min-h-11" onClick={()=>setAction({kind:'delete',product:row})}>Xóa<span className="sr-only"> {row.name}</span></Button></div></article>;})}</div>}
    {!list.error&&<Pagination page={list.page} pages={list.pages} disabled={list.loading} onChange={list.setPage} />}
    {editor&&ready&&<PackageEditor kind={kind} row={editor.row} products={catalog.products} combos={catalog.combos} onClose={closed} onSaved={done} onDirtyChange={onDirtyChange} />}
    {action&&<ProductActionDialog action={action} resource={kind} onClose={()=>setAction(null)} onDone={done} />}{quote&&<GiftQuote row={quote} onClose={()=>setQuote(null)} />}
  </section>;
}
