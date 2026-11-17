import { useEffect, useState } from 'react';
import { subscriptionApi } from '@/app/services/api/subscribePlanService';
import { normalizeSubscriptionPlans } from '@/app/util/subscriptionDisplay.mjs';
export function useOtherPlans(excludeBoxIds = []) {
  const [plans, setPlans] = useState([]), [isLoading, setLoading] = useState(true), [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const excluded = JSON.stringify(Array.isArray(excludeBoxIds) ? excludeBoxIds : []);
  useEffect(() => {
    let active = true;
    subscriptionApi.getActive().then(res => {
      if (active) setPlans(normalizeSubscriptionPlans(res.data || []).filter(box => !JSON.parse(excluded).includes(box._id)));
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [excluded, reload]);
  return { plans, isLoading, error, retry: () => { setLoading(true); setError(null); setReload(n => n + 1); } };
}
