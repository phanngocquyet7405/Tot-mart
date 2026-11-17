"use client";
import { useEffect, useState } from 'react';
import { subscriptionApi } from '@/app/services/api/subscribePlanService';
import ChoosePlanModal from '@/app/(client)/components/Subsciber_components/ChoosePlanModal';
import PlanCard from '@/app/(client)/components/Subsciber_components/PlanCard';
import { normalizeSubscriptionPlans } from '@/app/util/subscriptionDisplay.mjs';
export default function ChoosePlan({ plans, embedded = false }) {
  const [reload,setReload]=useState(0);
  const [templates,setTemplates]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{if (plans) return; let active=true;subscriptionApi.getActive().then(response=>{if(active)setTemplates(response.data||[])}).catch(()=>{if(active)setError('Không tải được các gói đang bán. Vui lòng tải lại trang.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[plans,reload]);
  const boxes = normalizeSubscriptionPlans(plans || templates);
  return <section className={`tm-commerce tm-commerce--atelier ${embedded ? '' : 'bg-background py-10 sm:py-14 px-4 sm:px-6'}`}>
    <div className="max-w-6xl mx-auto space-y-6">{!embedded && <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Chọn gói nhận hộp mỗi tháng</h2>}<p>Trả trước toàn bộ gói. Sau khi xác nhận thanh toán, mỗi tháng nhận một hộp; lượt đầu tiên đến hạn sau một tháng.</p>
      {!plans&&loading&&<div role="status" aria-label="Đang tải các gói đăng ký" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({length: 3}).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5 space-y-4"><div className="aspect-video rounded-lg bg-muted" /><div className="h-6 w-2/3 rounded bg-muted" /><div className="h-4 w-full rounded bg-muted" /><div className="h-11 rounded-lg bg-muted" /></div>))}</div>}{error&&<div role="alert" className="space-y-3 text-center py-6"><p className="text-destructive-text font-semibold">{error}</p><button className="tm-button tm-button--outline" type="button" onClick={()=>{setError('');setLoading(true);setReload(n=>n+1);}}>Thử tải lại</button></div>}{(plans || !loading)&&!error&&!boxes.length&&<p>Hiện chưa có gói đang bán.</p>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{boxes.map(box=><PlanCard key={box._id} box={box} onOpenPlan={setSelected} />)}</div>
    </div>{selected&&<ChoosePlanModal box={selected} plansProps={selected.apiPlans} onClose={()=>setSelected(null)} />}
  </section>;
}
