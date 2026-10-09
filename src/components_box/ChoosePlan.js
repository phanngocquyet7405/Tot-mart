"use client";
import { useEffect, useState } from 'react';
import { subscriptionApi } from '@/app/services/api/subscribePlanService';
import ChoosePlanModal from '@/app/(client)/components/Subsciber_components/ChoosePlanModal';
import { Button } from '@/components/ui/button';
export default function ChoosePlan() {
  const [templates,setTemplates]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{let active=true;subscriptionApi.getActive().then(response=>{if(active)setTemplates(response.data||[])}).catch(()=>{if(active)setError('Không tải được các gói đang bán. Vui lòng tải lại trang.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  const boxes=new Map();for(const template of templates){const box=template.boxId;if(box?._id&&!boxes.has(box._id))boxes.set(box._id,box)}
  return <section className="bg-[#FFFAF8] py-16 px-6">
    <div className="max-w-5xl mx-auto space-y-6"><h2 className="text-3xl font-bold text-[#2C1810]">Chọn gói nhận hộp mỗi tháng</h2><p>Trả trước toàn bộ gói. Sau khi xác nhận thanh toán, mỗi tháng nhận một hộp; lượt đầu tiên đến hạn sau một tháng.</p>
      {loading&&<p>Đang tải gói...</p>}{error&&<p role="alert">{error}</p>}{!loading&&!error&&!boxes.size&&<p>Hiện chưa có gói đang bán.</p>}
      <div className="grid md:grid-cols-3 gap-4">{[...boxes.values()].map(box=><article key={box._id} className="rounded-xl border border-[#F0DDD5] bg-white p-6 space-y-4"><h3 className="font-semibold text-xl">{box.name}</h3><p>{templates.filter(t=>t.boxId?._id===box._id).map(t=>({'1_month':'1','3_month':'3','6_month':'6','12_month':'12'}[t.planType])).join(' / ')} tháng</p><Button onClick={()=>setSelected(box)}>Xem giá & chọn địa chỉ</Button></article>)}</div>
    </div>{selected&&<ChoosePlanModal box={selected} onClose={()=>setSelected(null)} />}
  </section>;
}
