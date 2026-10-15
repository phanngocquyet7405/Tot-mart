"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listManagerResource } from '../services/managerApi';
import { managerError, money } from '../lib/productModel.mjs';
import { PageTitle, ErrorPanel, LoadingList } from './WorkspaceUI';
import { orderStatuses } from './OrdersWorkspace';
const sections=[['products','Sản phẩm'],['combos','Combo'],['gifts','Gift'],['subscriptions','Mẫu đăng ký'],['orders','Đơn hàng']];
export default function OverviewWorkspace(){
  const [version,setVersion]=useState(0),[data,setData]=useState({version:-1,results:[]});
  useEffect(()=>{const controller=new AbortController();Promise.all(sections.map(async([kind])=>{try{const result=await listManagerResource(kind,{limit:1,signal:controller.signal});if(result.success===false||!Array.isArray(result.data)||!Number.isSafeInteger(result.pagination?.total))throw new Error('BE chưa trả tổng số hợp lệ.');return {kind,total:result.pagination.total,rows:result.data};}catch(error){return {kind,error:managerError(error)};}})).then(results=>{if(!controller.signal.aborted)setData({version,results});});return()=>controller.abort();},[version]);
  const orders=data.results.find(item=>item.kind==='orders');
  return <section className="space-y-6"><PageTitle title="Tổng quan" description="Số lượng và đơn gần đây trong phạm vi cửa hàng, lấy từ API merchant." />{data.version!==version?<LoadingList />:<>
    <section aria-label="Số lượng toàn cửa hàng"><h2 className="mb-3 text-lg font-semibold">Danh mục và đơn hàng</h2><dl className="divide-y rounded-xl border bg-card">{sections.map(([kind,label])=>{const result=data.results.find(item=>item.kind===kind);return <div key={kind} className="flex flex-wrap items-center justify-between gap-3 p-4"><dt><Link className="inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline" href={`/manager/${kind}`}>{label}</Link>{result?.error&&<p className="max-w-xl text-sm text-destructive">{result.error}</p>}</dt><dd className="tabular-nums font-semibold">{result?.total??'Chưa tải được'}</dd></div>;})}</dl><p className="mt-2 text-xs text-muted-foreground">Tổng lấy từ pagination.total của từng API, không phải số dòng trong trang hiện tại. Không bao gồm doanh thu hoặc chỉ số không có hợp đồng BE.</p></section>
    {data.results.some(item=>item.error)&&<ErrorPanel onRetry={()=>setVersion(value=>value+1)}>Một số nguồn chưa tải được; các số liệu lỗi không được thay bằng 0.</ErrorPanel>}
    {orders&&!orders.error&&<section><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Đơn hàng gần đây</h2><Link href="/manager/orders" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Xem đơn hàng</Link></div><ul className="divide-y rounded-xl border bg-card">{orders.rows.slice(0,5).map(order=><li key={order._id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><Link href="/manager/orders" className="font-medium underline-offset-4 hover:underline">{order.orderId}</Link><span className="text-muted-foreground">{orderStatuses[order.status]||order.status}</span><span className="tabular-nums">{money(order.totalAmount)}</span></li>)}{!orders.rows.length&&<li className="p-5 text-sm text-muted-foreground">Chưa có đơn hàng.</li>}</ul></section>}
  </>}</section>;
}
