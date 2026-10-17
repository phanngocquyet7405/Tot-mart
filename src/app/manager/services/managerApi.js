import { axiosConfig } from '@/app/services/api/axiosConfig';

export async function updateManagerOrderStatus(id, status, expectedStatus) {
  return confirmed(await axiosConfig.patch(`/manager/orders/${encodeURIComponent(id)}/status`, { status, expectedStatus }));
}

function confirmed(response) {
  if (response?.success === false) throw new Error(response.message || 'Hệ thống chưa xác nhận thao tác thành công.');
  return response;
}

// These are the existing merchant routes, never the broader admin catalog.
export function listManagerProducts({ page = 1, keyword = '', brand, category, minPrice, maxPrice, signal } = {}) {
  return axiosConfig.get('/manager/products', { params: { page, limit: 20, keyword, brand, category, minPrice, maxPrice }, signal });
}
const resources = { products: 'products', combos: 'combos', gifts: 'combos', subscriptions: 'subscriptions', orders: 'orders' };
export function listManagerResource(kind, { page = 1, limit = 20, signal } = {}) {
  if (!resources[kind]) throw new Error('Mục quản lý không hợp lệ.');
  return axiosConfig.get(`/manager/${resources[kind]}`, { params: { page, limit, ...(kind === 'combos' ? { kind: 'combo' } : kind === 'gifts' ? { kind: 'gift' } : {}) }, signal });
}
export async function collectManagerResource(kind, { signal } = {}) {
  const first = confirmed(await listManagerResource(kind, { limit: 100, signal }));
  if (!Array.isArray(first.data)) throw new Error('Dữ liệu trả về không đúng định dạng.');
  const rows = [...first.data];
  for (let page = 2; page <= (first.pagination?.totalPages || 1); page++) {
    const result = confirmed(await listManagerResource(kind, { page, limit: 100, signal }));
    if (!Array.isArray(result.data)) throw new Error('Dữ liệu trả về không đúng định dạng.');
    rows.push(...result.data);
  }
  return rows;
}
export async function deleteManagerResource(kind, id) {
  if (!['combos', 'gifts', 'subscriptions'].includes(kind)) throw new Error('Không được xóa mục này.');
  return confirmed(await axiosConfig.delete(`/manager/${resources[kind]}/${encodeURIComponent(id)}`));
}
export async function adjustManagerPackageStock(kind, id, delta, reason) {
  if (!['combos', 'gifts'].includes(kind)) throw new Error('Không được điều chỉnh tồn mục này.');
  return confirmed(await axiosConfig.patch(`/manager/combos/${encodeURIComponent(id)}/stock`, { delta, reason }));
}
// Source checkoutRouter permits authenticated accounts, including merchants; quote never creates an order.
export async function quoteManagerGift(id, quantity, { signal } = {}) {
  return confirmed(await axiosConfig.post('/checkout/quote', { items: [{ boxId: id, quantity }] }, { signal }));
}
export function getManagerCatalogOptions({ signal } = {}) {
  return axiosConfig.get('/manager/catalog-options', { signal });
}
export async function adjustManagerProductStock(id, delta, reason) {
  return confirmed(await axiosConfig.patch(`/manager/products/${encodeURIComponent(id)}/stock`, { delta, reason }));
}
export async function deleteManagerProduct(id) {
  return confirmed(await axiosConfig.delete(`/manager/products/${encodeURIComponent(id)}`));
}
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
        payload = { name: f.name, description: f.description, price: Number(f.price), category: f.category, brand: f.brand };
        // Stock changes use the dedicated atomic delta endpoint, not a stale edit snapshot.
        if (!editing) payload.stock = Number(f.stock);
      } else if (tab === 'combos') {
        payload = { name: f.name, descriptions: f.description, validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString(), discountPercent: Number(f.discountPercent), products };
        if (!editing) payload.stock = Number(f.stock);
      } else if (tab === 'gifts') {
        payload = { name: f.name, validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString(), giftPolicy: { bulkTiers: f.bulkTiers.map(t => ({ minQuantity: Number(t.minQuantity), percent: Number(t.percent) })), amenities: f.amenities.map(a => ({ name: a.name, fee: Number(a.fee) })) } };
        if (!editing) Object.assign(payload, { comboId: f.comboId, stock: Number(f.stock) });
      } else {
        payload = { name: f.name, description: f.description, planType: f.planType, discountPercent: Number(f.discountPercent) };
        if (f.isActive !== undefined && (editing || f.sourceType !== 'retail')) payload.isActive = f.isActive;
        if (!editing && f.sourceType === 'retail') {
          resource = 'retail-subscriptions'; Object.assign(payload, { products, stock: Number(f.stock), validTo: new Date(f.validTo + 'T23:59:59+07:00').toISOString() });
        } else if (!editing || (f.sourceType !== 'retail' && f.boxId !== f.originalBoxId)) payload.boxId = f.boxId;
      }
      if (tab === 'products' || tab === 'combos') {
        const data = new FormData();
        for (const [key, value] of Object.entries(payload)) data.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        images.forEach(image => data.append('images', image)); payload = data;
      }
      return confirmed(await axiosConfig[method](`/manager/${resource}${editing ? '/' + editing : ''}`, payload, payload instanceof FormData ? { headers: { 'Content-Type': undefined } } : undefined));

}
