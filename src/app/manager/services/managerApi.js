import { axiosConfig } from '@/app/services/api/axiosConfig';
export async function collect(resource) {
  const first = await axiosConfig.get(resource + '&page=1');
  const rows = [...first.data];
  for (let page = 2; page <= (first.pagination?.totalPages || 1); page++) {
    const result = await axiosConfig.get(resource + '&page=' + page); rows.push(...result.data);
  }
  return rows;
}

export async function saveManagerForm({ tab, form, editing, images }) {
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

}
