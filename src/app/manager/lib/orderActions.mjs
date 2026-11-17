const names = { processing: 'Xác nhận đơn COD', shipped: 'Bắt đầu giao', delivered: 'Báo đã giao' };
export function managerOrderActions(order) {
  // Server capabilities are authoritative; old backends remain read-only.
  if (!Array.isArray(order?.allowedTransitions)) return [];
  return [...new Set(order.allowedTransitions)].filter(status => Object.hasOwn(names, status)).map(status => ({ status, label: names[status] }));
}
export function orderActionMessage(order, status) {
  if (status === 'delivered' && order.paymentMethod === 'cod') return 'Ghi nhận đã giao hàng. Tiền COD vẫn chờ admin đối soát; thao tác này không đánh dấu đã thanh toán.';
  if (status === 'delivered') return 'Ghi nhận đã giao đơn hàng đã được hệ thống xác nhận thanh toán.';
  if (status === 'processing') return 'Xác nhận chuẩn bị đơn COD đã được hệ thống giữ hàng.';
  return 'Ghi nhận bắt đầu giao đơn này. Không thay đổi số tiền hay trạng thái thanh toán.';
}
