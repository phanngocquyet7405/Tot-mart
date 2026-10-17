"use client";
import { useEffect, useRef, useState } from 'react';
import { axiosConfig } from '@/app/services/api/axiosConfig';
import { getAllBoxesApi } from '@/app/services/api/boxService';
import { packageDraft, validatePackage } from '@/app/manager/lib/packageModel.mjs';
import GiftForm from '@/app/manager/components/GiftForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
export default function AdminGifts() {
  const [rows,setRows]=useState([]), [combos,setCombos]=useState([]), [page,setPage]=useState(1), [pages,setPages]=useState(1);
  const [loading,setLoading]=useState(true), [error,setError]=useState(''), [revision,setRevision]=useState(0);
  const [draft,setDraft]=useState(null), [editing,setEditing]=useState(null), [busy,setBusy]=useState(false), [formError,setFormError]=useState('');
  const [deleting,setDeleting]=useState(null); const lock=useRef(false);
  useEffect(()=>{
    let active=true; setLoading(true); setError('');
    Promise.all([axiosConfig.get('/admin/gifts',{params:{page,limit:20}}), (async()=>{
      const first=await getAllBoxesApi({kind:'combo',limit:100}); const result=[...first.data];
      for(let p=2;p<=(first.pagination?.totalPages||1);p++) result.push(...(await getAllBoxesApi({kind:'combo',limit:100,page:p})).data);
      return result.filter(row=>row.ownerId && new Date(row.validTo)>new Date());
    })()]).then(([gifts,sources])=>{if(active){setRows(gifts.data);setPages(Math.max(1,gifts.pagination?.totalPages||1));setCombos(sources);}})
      .catch(e=>{if(active)setError(e.response?.data?.message||'Không tải được danh sách Gift.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[page,revision]);
  const change=(key,value)=>setDraft(p=>({...p,[key]:value}));
  const field=(key,label,type='text')=><label className="grid gap-2 text-sm">{label}<Input required type={type} value={draft[key]} onChange={e=>change(key,e.target.value)} /></label>;
  const select=(key,label,options)=><label className="grid gap-2 text-sm">{label}<select required className="min-h-11 rounded border p-2" value={draft[key]} onChange={e=>change(key,e.target.value)}><option value="">Chọn combo đã xác minh chủ</option>{options.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}</select></label>;
  async function save(event){
    event.preventDefault(); if(lock.current)return;
    const errors=validatePackage('gifts',draft,Boolean(editing),[],combos);
    if(Object.keys(errors).length){setFormError(Object.values(errors).join(' '));return;}
    const giftPolicy={bulkTiers:draft.bulkTiers.map(t=>({minQuantity:Number(t.minQuantity),percent:Number(t.percent)})),amenities:draft.amenities.map(a=>({name:a.name.trim(),fee:Number(a.fee)}))};
    const data={name:draft.name.trim(),validTo:new Date(draft.validTo+'T23:59:59+07:00').toISOString(),giftPolicy,...(!editing?{comboId:draft.comboId,stock:Number(draft.stock)}:{})};
    lock.current=true;setBusy(true);setFormError('');
    try{if(editing)await axiosConfig.patch(`/admin/gifts/${editing._id}`,data);else await axiosConfig.post('/admin/gifts',data);setDraft(null);setRevision(n=>n+1);}
    catch(e){setFormError(e.response?.data?.message||'Chưa lưu được Gift.');}
    finally{lock.current=false;setBusy(false);}
  }
  async function archive(){
    if(lock.current)return;lock.current=true;setBusy(true);setFormError('');
    try{await axiosConfig.delete(`/admin/gifts/${deleting._id}`);setDeleting(null);setRevision(n=>n+1);}
    catch(e){setFormError(e.response?.data?.message||'Chưa ngừng bán được Gift.');}
    finally{lock.current=false;setBusy(false);}
  }
  return <section className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><h1 className="text-2xl font-semibold">Quản lý Gift</h1><Button onClick={()=>{setEditing(null);setDraft(packageDraft());setFormError('');}}>Tạo Gift từ combo</Button></div>
    <p className="text-sm text-muted-foreground">Gift giữ chủ sở hữu và cấu phần của combo nguồn. Combo chưa xác minh chủ sẽ không thể dùng để tạo Gift.</p>
    {loading?<p role="status">Đang tải…</p>:error?<p role="alert">{error} <button onClick={()=>setRevision(n=>n+1)}>Thử lại</button></p>:!rows.length?<p>Chưa có Gift.</p>:<ul className="divide-y rounded-xl border">{rows.map(row=><li key={row._id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><h2 className="font-semibold">{row.name}</h2><p>Giá hộp: {Number(row.value).toLocaleString('vi-VN')} ₫ · Còn {row.stock} · {row.sourceComboId?'Gift từ combo':'Quà tặng legacy'}</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>{setEditing(row);setDraft(packageDraft(row));setFormError('');}}>Sửa</Button><Button variant="outline" onClick={()=>{setDeleting(row);setFormError('');}}>Ngừng bán</Button></div></li>)}</ul>}
    <nav aria-label="Phân trang Gift" className="flex gap-4"><Button variant="outline" disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>Trước</Button><span>{page}/{pages}</span><Button variant="outline" disabled={page>=pages||loading} onClick={()=>setPage(p=>p+1)}>Sau</Button></nav>
    <Dialog open={Boolean(draft)} onOpenChange={open=>{if(!open&&!lock.current)setDraft(null);}}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogTitle>{editing?'Sửa Gift':'Tạo Gift'}</DialogTitle><DialogDescription>Giá và quyền sở hữu được backend xác minh từ combo nguồn.</DialogDescription>{draft&&<form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><fieldset disabled={busy} className="contents">{field('name','Tên Gift')}<GiftForm field={field} select={select} editing={Boolean(editing)} form={draft} change={change} combos={combos}/></fieldset>{formError&&<p role="alert" className="text-destructive sm:col-span-2">{formError}</p>}<Button disabled={busy} type="submit">{busy?'Đang lưu…':'Lưu Gift'}</Button></form>}</DialogContent></Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={open=>{if(!open&&!lock.current)setDeleting(null);}}><DialogContent><DialogTitle>Ngừng bán {deleting?.name}?</DialogTitle><DialogDescription>Đơn và hợp đồng đã tạo được giữ lại. Hệ thống sẽ chặn nếu Gift còn nghĩa vụ chưa xử lý.</DialogDescription>{formError&&<p role="alert">{formError}</p>}<Button disabled={busy} onClick={archive}>Xác nhận ngừng bán</Button></DialogContent></Dialog>
  </section>;
}
