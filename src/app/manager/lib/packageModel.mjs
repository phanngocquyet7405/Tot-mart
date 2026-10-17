import { optionId } from './productModel.mjs';
export const labels = { combos:'Combo', gifts:'Gift', subscriptions:'Đăng ký hàng tháng', orders:'Đơn hàng', overview:'Tổng quan' };
export function packageDraft(row) {
  return {
    name:row?.name || '', description:row?.description || row?.descriptions || '',
    stock:row?.stock ?? 0, validTo:row?.validTo?.slice(0,10) || '', discountPercent:row?.discountPercent ?? 0,
    sourceType:row?.sourceType || 'combo', boxId:optionId(row?.boxId), originalBoxId:optionId(row?.boxId), comboId:optionId(row?.sourceComboId),
    planType:row?.planType || '1_month', isActive:row?.isActive ?? true,
    products:(row?.products || []).map(item=>({productId:optionId(item.productId),quantity:item.quantity})),
    bulkTiers:(row?.giftPolicy?.bulkTiers || []).map(item=>({...item})),
    amenities:(row?.giftPolicy?.amenities || []).map(item=>({...item})),
  };
}
const integer = value => value !== '' && Number.isSafeInteger(Number(value));
export function validatePackage(kind, form, editing, products, combos) {
  const errors = {};
  const minName = kind === 'subscriptions' && (editing || form.sourceType !== 'retail') ? 2 : 3;
  if (form.name.trim().length < minName || form.name.trim().length > 100) errors.name = `Tên cần từ ${minName} đến 100 ký tự.`;
  if (kind !== 'gifts' && (form.description.length > (kind === 'combos' ? 5000 : 500) || (kind === 'combos' && !form.description.trim()))) errors.description = kind === 'combos' ? 'Nhập mô tả, tối đa 5.000 ký tự.' : 'Mô tả tối đa 500 ký tự.';
  const needsParts = kind === 'combos' || (kind === 'subscriptions' && !editing && form.sourceType === 'retail');
  if (needsParts && (!form.products.length || form.products.some(item=>!products.some(p=>p._id === item.productId) || !integer(item.quantity) || Number(item.quantity)<1) || new Set(form.products.map(p=>p.productId)).size !== form.products.length)) errors.products = 'Chọn ít nhất một sản phẩm của bạn, số lượng nguyên dương, không trùng cấu phần.';
  if (!editing && (kind !== 'subscriptions' || form.sourceType === 'retail') && (!integer(form.stock) || Number(form.stock)<0)) errors.stock = 'Tồn kho phải là số nguyên không âm.';
  if (kind !== 'subscriptions' || (!editing && form.sourceType === 'retail')) {
    if (!form.validTo || !(new Date(form.validTo+'T23:59:59+07:00') > new Date())) errors.validTo = 'Chọn hạn kết thúc trong tương lai.';
  }
  if (kind !== 'gifts' && (form.discountPercent === '' || !Number.isFinite(Number(form.discountPercent)) || Number(form.discountPercent)<0 || (kind === 'subscriptions' ? Number(form.discountPercent)>=100 : Number(form.discountPercent)>100))) errors.discountPercent = kind === 'subscriptions' ? 'Mức giảm phải từ 0 đến dưới 100%.' : 'Mức giảm phải từ 0 đến 100%.';
  if (kind === 'gifts') {
    if (!editing && !combos.some(item=>item._id === form.comboId)) errors.comboId = 'Chọn combo thuộc cửa hàng.';
    if (form.bulkTiers.length>10 || new Set(form.bulkTiers.map(item=>Number(item.minQuantity))).size !== form.bulkTiers.length || form.bulkTiers.some(item=>!integer(item.minQuantity)||Number(item.minQuantity)<2||Number(item.minQuantity)>999||item.percent===''||!Number.isFinite(Number(item.percent))||Number(item.percent)<0||Number(item.percent)>100)) errors.bulkTiers = 'Tối đa 10 bậc không trùng; số lượng 2–999, giảm 0–100%.';
    if (form.amenities.length>10 || form.amenities.some(item=>!item.name.trim()||item.name.trim().length>100||!integer(item.fee)||Number(item.fee)<0||Number(item.fee)>100000000)) errors.amenities = 'Tối đa 10 tiện ích; tên 1–100 ký tự, phí nguyên 0–100.000.000 ₫.';
  }
  if (kind === 'subscriptions') {
    if (!['1_month','3_month','6_month','12_month'].includes(form.planType)) errors.planType = 'Chọn kỳ 1, 3, 6 hoặc 12 tháng.';
    if ((!editing && form.sourceType === 'combo') && !combos.some(item=>item._id === form.boxId)) errors.boxId = 'Chọn combo thuộc cửa hàng.';
  }
  return errors;
}
export function comboEstimate(form, products) {
  const base = form.products.reduce((sum,item)=>sum+Number(products.find(p=>p._id===item.productId)?.price || 0)*Number(item.quantity || 0),0);
  return {base,total:Math.round(base*(1-Number(form.discountPercent || 0)/100))};
}
export function giftEstimate(value, tiers, amenities, quantity) {
  const percent = [...tiers].filter(t=>Number(t.minQuantity)<=quantity).sort((a,b)=>Number(b.minQuantity)-Number(a.minQuantity))[0]?.percent || 0;
  const base = Math.round(Number(value || 0))*quantity;
  const discount = Math.round(base*Number(percent)/100);
  const fee = amenities.reduce((sum,item)=>sum+Number(item.fee || 0),0)*quantity;
  return {base,discount,fee,total:base-discount+fee};
}
export function subscriptionAmounts(row) {
  const months = Number(String(row.planType).split('_')[0]);
  const total = Number(row.discountPrice);
  if (![1,3,6,12].includes(months)||row.discountPrice==null||!Number.isFinite(total)) return null;
  return {months,total,monthly:Math.round(total/months)};
}
export function fieldErrors(error) {
  return Object.fromEntries((error.response?.data?.errors || []).map(item=>{const key=item.field?.split('.')[0];return [key==='descriptions'?'description':key,item.message];}));
}
