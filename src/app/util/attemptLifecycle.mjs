// Transport is injected so recovery behavior is exercised independently of React.
export async function resolveAttempt({ attempt, kind, api, save, currentUser, terminate = false, confirm = false }) {
  const checkUser = () => {
    if (String(currentUser()) !== attempt.userId) throw new Error('Đăng nhập lại đúng tài khoản của yêu cầu cũ.');
  };
  checkUser();
  if (attempt.kind && attempt.kind !== kind) throw new Error('Loại giao dịch cũ không khớp. Liên hệ TotMart để đối chiếu.');
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(attempt.key || '')) throw new Error('Reference cũ thiếu hoặc không hợp lệ. Liên hệ TotMart để đối chiếu, không tạo key thay thế.');
  const body = attempt.serializedBody || (attempt.payload && JSON.stringify(attempt.payload));
  const persist = async data => {
    checkUser();
    if (data.key && data.key !== attempt.key) throw new Error('Reference trả về không khớp yêu cầu cũ. Giữ nguyên lần thử để đối chiếu.');
    if (data.result) {
      // Replay subscriptions contain shipping details; retain only recovery identifiers.
      const result = data.result;
      data = { ...data, result: { _id: result._id, orderId: result.orderId, orderCode: result.orderCode || result.paymentCode, paymentCode: result.paymentCode, totalAmount: result.totalAmount, shippingPayment: result.shippingPayment } };
    }
    attempt = { ...attempt, ...data, serializedBody: body };
    delete attempt.address; // Keep a single authoritative snapshot, not a duplicate.
    if (!await save(attempt)) throw new Error('Không lưu được kết quả. Giữ yêu cầu cũ và thử kiểm tra lại.');
  };
  const base = `/checkout/attempts/${kind}`;
  let preparedNow = false;
  if (!attempt.hash) {
    if (!body) throw new Error('Yêu cầu cũ thiếu nội dung và hash. Liên hệ TotMart để đối chiếu; không tạo đơn thay thế.');
    const response = await api.post(`${base}/prepare`, body, { headers: { 'Idempotency-Key': attempt.key } });
    if (!response.success || !/^[a-f0-9]{64}$/.test(response.data?.hash || '')) throw new Error('Chưa nhận được hash xác nhận. Giữ yêu cầu cũ để kiểm tra lại.');
    await persist({ ...response.data, snapshot: response.data.address, confirmed: false });
    preparedNow = true;
  }
  const headers = { 'Attempt-Payload-Hash': attempt.hash };
  if (!/^[a-f0-9]{64}$/.test(attempt.hash)) throw new Error('Hash cũ không hợp lệ. Liên hệ TotMart để đối chiếu.');
  const response = terminate
    ? await api.post(`${base}/${attempt.key}/terminate`, undefined, { headers })
    : await api.get(`${base}/${attempt.key}`, { headers });
  if (!response.success || !['unknown', 'processing', 'created', 'rejected', 'invalidated'].includes(response.data?.state)) throw new Error('Chưa xác nhận được trạng thái yêu cầu.');
  await persist(response.data);
  if (attempt.state === 'created') {
    if (!attempt.result?.orderCode) throw new Error('Giao dịch đã tạo nhưng thiếu mã đối chiếu. Liên hệ TotMart; không tạo đơn thay thế.');
    return { success: true, data: attempt.result };
  }
  if (attempt.state === 'invalidated' && attempt.canRestart === true) return { invalidated: true };
  if (terminate) throw new Error('Chưa thể kết thúc yêu cầu. Hãy kiểm tra lại.');
  if (attempt.state === 'invalidated') throw new Error('Chưa có xác nhận canRestart. Kiểm tra lại lần thử cũ.');
  if (attempt.state === 'rejected') throw new Error(attempt.error?.message || 'Yêu cầu bị từ chối. Kết thúc lần thử trước khi thay đổi.');
  if (preparedNow || !confirm) return { prepared: true, attempt };
  if (!body) throw new Error('Thiếu nội dung yêu cầu cũ. Có thể kiểm tra hoặc kết thúc lần thử, không thể gửi create.');
  if (kind === 'products' && !attempt.snapshot) throw new Error('Thiếu địa chỉ đã xác nhận. Kết thúc lần thử trước khi chọn lại địa chỉ.');
  checkUser();
  await persist({ confirmed: true });
  const created = await api.post(kind === 'products' ? '/checkout/check-out' : '/subcribe-plans/user-subscribe', body, { headers: { 'Idempotency-Key': attempt.key } });
  if (!created.success || !created.data?.orderCode) throw new Error('Chưa xác nhận mã giao dịch. Kiểm tra lại yêu cầu cũ.');
  await persist({ state: 'created', result: created.data, canRestart: false });
  return created;
}
