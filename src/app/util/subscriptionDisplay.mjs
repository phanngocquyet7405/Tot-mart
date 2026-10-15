const months = { '1_month': 1, '3_month': 3, '6_month': 6, '12_month': 12 };
export function normalizeSubscriptionPlans(plans) {
  const grouped = new Map();
  for (const plan of plans) {
    const box = plan.boxId, duration = months[plan.planType];
    if (!box?._id || !duration) continue;
    const total = plan.discountPrice ?? plan.basePrice;
    if (!Number.isSafeInteger(total) || total <= 0) continue;
    const id = String(box._id);
    if (!grouped.has(id)) grouped.set(id, { ...box, description: plan.description || box.descriptions || '',
      value: box.value ?? Math.round(plan.basePrice / duration), sourceType: plan.sourceType,
      minimumMonthlyPrice: Math.round(total / duration), apiPlans: [] });
    const group = grouped.get(id);
    group.minimumMonthlyPrice = Math.min(group.minimumMonthlyPrice, Math.round(total / duration));
    group.apiPlans.push(plan);
  }
  return [...grouped.values()];
}
