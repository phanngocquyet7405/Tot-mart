import { axiosConfig } from "./axiosConfig";

export function buildVietQrUrl(orderInfo) {
  const bank = process.env.NEXT_PUBLIC_VIETQR_BANK_ID;
  const account = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO;
  const name = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME;
  if (!bank || !account || !name)
    throw new Error("Chưa cấu hình tài khoản VietQR.");
  if (
    !Number.isSafeInteger(orderInfo.totalAmount) ||
    orderInfo.totalAmount <= 0 ||
    !orderInfo.orderCode
  ) {
    throw new Error("Thông tin thanh toán không hợp lệ.");
  }
  const query = new URLSearchParams({
    amount: String(orderInfo.totalAmount),
    addInfo: orderInfo.orderCode,
    accountName: name,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(bank)}-${encodeURIComponent(account)}-compact2.jpg?${query}`;
}

export async function getPaymentOrder(orderId, signal) {
  const response = await axiosConfig.get(
    `/orders/${encodeURIComponent(orderId)}`,
    { signal },
  );
  if (
    !response.success ||
    !response.data?.checkout ||
    !["pending", "paid", "cancelled"].includes(response.status)
  ) {
    throw new Error("Phản hồi trạng thái thanh toán không hợp lệ.");
  }
  return { ...response.data.checkout, status: response.status };
}

// Recursive timeouts prevent overlapping requests. Abort also stops in-flight Axios.
export function pollOrderPayment(
  orderId,
  {
    onPaid,
    onError,
    read = getPaymentOrder,
    intervalMs = 3000,
    timeoutMs = 600000,
  },
) {
  const controller = new AbortController();
  let timer;
  let stopped = false;
  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    clearTimeout(deadline);
    controller.abort();
  };
  const deadline = setTimeout(() => {
    if (stopped) return;
    stop();
    onError(
      new Error(
        "Hết thời gian kiểm tra. Bạn có thể kiểm tra lại đơn hiện tại.",
      ),
    );
  }, timeoutMs);
  const tick = async () => {
    const startedAt = Date.now();
    try {
      const order = await read(orderId, controller.signal);
      if (stopped) return;
      if (order.status === "paid") {
        stop();
        onPaid(order);
        return;
      }
      if (order.status === "cancelled")
        throw new Error("Đơn đã huỷ. Không chuyển khoản cho mã này.");
      timer = setTimeout(
        tick,
        Math.max(0, intervalMs - (Date.now() - startedAt)),
      );
    } catch (error) {
      if (stopped) return;
      stop();
      onError(error);
    }
  };
  tick();
  return stop;
}
