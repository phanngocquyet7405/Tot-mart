// Integration helper. Import into CartContext and Checkoutpageservice; never calculate final prices here.
export function giftOptions(value = {}) {
  if (typeof (value.message ?? '') !== 'string') throw new Error('Gift message invalid');
  const gift = { wrap: value.wrap ?? 'none', message: (value.message ?? '').trim() };
  if (!['none', 'classic', 'eco', 'premium'].includes(gift.wrap) || typeof gift.message !== 'string' || gift.message.length > 500) throw new Error('Gift options invalid');
  return gift;
}
function itemIdentity(item) {
  const type = item.itemType ?? item.type ?? (item.boxId ? 'box' : 'product');
  if (!['box', 'product'].includes(type)) throw new Error('Cart item type invalid');
  const value = (type === 'box' ? item.boxId : item.productId) ?? item.id ?? item._id;
  const id = typeof value === 'object' && value ? value._id : value;
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new Error('Cart item ID invalid');
  return { type, id };
}
export function cartLineKey(item) {
  const { type, id } = itemIdentity(item), gift = giftOptions(item.gift);
  return JSON.stringify([type, id.toLowerCase(), gift.wrap, gift.message]);
}
export function toCartPayload(items) {
  return items.map(item => {
    const { type, id } = itemIdentity(item), quantity = item.quantity;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Quantity invalid');
    // Server derives lineId. Never reuse server lineId after changing gift options.
    return { [type === 'box' ? 'boxId' : 'productId']: id.toLowerCase(), quantity, gift: giftOptions(item.gift) };
  });
}
export function mergeCartLines(items) {
  const merged = new Map();
  for (const item of items) {
    toCartPayload([item]);
    const key = cartLineKey(item), previous = merged.get(key), quantity = (previous?.quantity ?? 0) + item.quantity;
    if (quantity > 999) throw new Error('Quantity exceeds 999');
    merged.set(key, { ...item, gift: giftOptions(item.gift), quantity });
  }
  return [...merged.values()];
}
