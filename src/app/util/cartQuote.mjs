import { giftOptions, toCartPayload } from './cartLine.mjs';
export function matchQuoteLine(item, quote) {
  if (!quote?.lines) return undefined;
  const payload = toCartPayload([item])[0], id = payload.boxId || payload.productId;
  const kind = payload.boxId ? 'box' : 'product', gift = giftOptions(payload.gift);
  return quote.lines.find(line => {
    const options = giftOptions(line.gift);
    return line.itemType === kind && String(line.itemId) === id && line.quantity === item.quantity && options.wrap === gift.wrap && options.message === gift.message;
  });
}
