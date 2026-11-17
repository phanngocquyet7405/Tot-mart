"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { axiosConfig } from "@/app/services/api/axiosConfig";
import {
  listRefunds,
  listAudit,
  reconciliationCommand,
} from "@/app/services/api/reconciliationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  RefreshCw,
  AlertCircle,
  Package,
  ArrowRightLeft,
  History,
  FileCheck2,
} from "lucide-react";
import { AdminPageHeader } from "../components/shared";

const subPath = "/subcribe-plans";
const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " đ";

export default function OperationsPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [events, setEvents] = useState([]);
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [audits, setAudits] = useState([]);
  const [refundPage, setRefundPage] = useState(1);
  const [refundPages, setRefundPages] = useState(1);
  const [page, setPage] = useState(1);
  const [eventPages, setEventPages] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [due, refundResult, paymentEvents, auditResult] = await Promise.all([
        axiosConfig.get(subPath + "/today-deliveries"),
        listRefunds(refundPage),
        axiosConfig.get("/checkout/payment-events", { params: { page } }),
        listAudit(1),
      ]);
      setDeliveries(due.data || []);
      setRefunds(refundResult.data || []);
      setRefundPages(
        Math.max(1, Math.ceil((refundResult.pagination?.total || 0) / 50))
      );
      setAudits(auditResult.data || []);
      setEvents(paymentEvents.data || []);
      setEventPages(paymentEvents.pagination?.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu vận hành");
    } finally {
      setLoading(false);
    }
  }, [page, refundPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (key, path, payload = {}) => {
    if (busy) return;
    setBusy(key);
    try {
      await axiosConfig.post(path, payload);
      toast.success("Đã cập nhật");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không cập nhật được");
    } finally {
      setBusy(null);
    }
  };

  const command = async (key, path, payload) => {
    if (busy) return;
    setBusy(key);
    try {
      await reconciliationCommand(key, path, payload);
      toast.success("Đã ghi nhận đối soát");
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Chưa xác định kết quả. Giữ nguyên dữ liệu và thử lại để dùng cùng mã thao tác."
      );
    } finally {
      setBusy(null);
    }
  };

  const referenceInput = (key, placeholder) => (
    <Input
      aria-label={placeholder}
      value={references[key] || ""}
      onChange={(event) =>
        setReferences((prev) => ({ ...prev, [key]: event.target.value }))
      }
      placeholder={placeholder}
      className="min-h-11"
    />
  );

  return (
    <section className="p-6 space-y-6">
      <AdminPageHeader
        title="Giao định kỳ & đối soát tiền"
        description="Quản lý lượt giao hàng định kỳ, xác nhận hoàn tiền và đối soát giao dịch ngân hàng"
        icon={Truck}
        actions={
          <Button
            variant="outline"
            disabled={loading || !!busy}
            onClick={load}
            className="gap-2 min-h-11"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Tải lại
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive-text">
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-muted animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      )}

      {/* 1. Lượt giao đến hạn */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck size={18} className="text-primary" /> Lượt giao đến hạn
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Quét lịch chỉ tạo yêu cầu giao. Số lượt còn lại giảm khi xác nhận đã giao.
              </p>
            </div>
            <Button
              disabled={!!busy}
              onClick={() => act("scan", subPath + "/process-deliveries")}
              className="min-h-11 shrink-0"
            >
              Tạo lượt đến hạn
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {!loading && !deliveries.length && (
            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
              Không có lượt giao nào đang chờ.
            </p>
          )}
          {deliveries.map((item) => (
            <div
              key={item._id}
              className="border border-border rounded-xl p-4 space-y-2 bg-muted/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">
                  {item.subscriptionId?.userId?.name || "Khách hàng"} ·{" "}
                  {item.subscriptionId?.boxId?.name || "Combo"} · lượt{" "}
                  <span className="tabular-nums">{item.sequence}</span>
                </p>
                <Badge
                  variant="outline"
                  className={
                    item.state === "dispatched"
                      ? "bg-warning/15 text-warning-text border-warning/20 font-medium"
                      : "bg-primary/10 text-primary border-primary/20 font-medium"
                  }
                >
                  {item.state === "dispatched" ? "Đang giao" : "Chờ xuất hàng"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground tabular-nums">
                Hạn: {new Date(item.dueAt).toLocaleDateString("vi-VN")} · Địa chỉ:{" "}
                {item.subscriptionId?.shippingAddress?.address},{" "}
                {item.subscriptionId?.shippingAddress?.district},{" "}
                {item.subscriptionId?.shippingAddress?.city} ·{" "}
                {item.subscriptionId?.shippingAddress?.phone}
              </p>

              {item.state === "pending" ? (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <div className="flex-1">
                    {referenceInput(item._id, "Mã vận đơn")}
                  </div>
                  <Button
                    disabled={
                      !!busy ||
                      !references[item._id]?.trim() ||
                      references[item._id].trim().length < 3
                    }
                    onClick={() =>
                      act(
                        item._id,
                        subPath + `/fulfillments/${item._id}/dispatch`,
                        { trackingReference: references[item._id].trim() }
                      )
                    }
                    className="min-h-11 shrink-0"
                  >
                    Giữ kho & xuất hàng
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    Vận đơn: <strong className="text-foreground">{item.trackingReference}</strong>
                  </span>
                  <Button
                    disabled={!!busy}
                    onClick={() =>
                      act(item._id, subPath + `/fulfillments/${item._id}/deliver`)
                    }
                    className="min-h-11 shrink-0"
                  >
                    Xác nhận đã giao
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Khoản hoàn tiền chờ xác nhận */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-primary" /> Khoản hoàn tiền chờ xác nhận
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Chuyển tiền hoàn bên ngân hàng trước, sau đó nhập mã giao dịch để ghi nhận. Trang này không tự chuyển tiền.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {!loading && !refunds.length && (
            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
              Không có khoản hoàn nào đang chờ.
            </p>
          )}
          {refunds.map((item) => (
            <div
              key={item._id}
              className="border border-border rounded-xl p-4 space-y-2.5 bg-muted/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">
                  {item.purpose} ·{" "}
                  {item.orderId ||
                    item.subscriptionId ||
                    item.checkoutId ||
                    item.eventId}
                </p>
                <span className="text-sm font-bold text-destructive-text tabular-nums">
                  {money(item.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.reason}</p>

              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {referenceInput(item._id, "Mã giao dịch hoàn tiền")}
                {referenceInput(
                  item._id + ":evidence",
                  "Bằng chứng đối chiếu sao kê (ít nhất 10 ký tự)"
                )}
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  disabled={
                    !!busy ||
                    (references[item._id]?.trim().length || 0) < 3 ||
                    (references[item._id + ":evidence"]?.trim().length || 0) < 10
                  }
                  onClick={() =>
                    command(
                      "complete:" + item._id,
                      `/refunds/${item._id}/complete`,
                      {
                        amount: item.amount,
                        reference: references[item._id].trim(),
                        evidence: references[item._id + ":evidence"].trim(),
                      }
                    )
                  }
                  className="min-h-11"
                >
                  Ghi nhận đã hoàn {money(item.amount)}
                </Button>
              </div>
            </div>
          ))}

          {refundPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span className="tabular-nums">
                Trang {refundPage} / {refundPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || refundPage <= 1}
                  onClick={() => setRefundPage((p) => p - 1)}
                  className="min-h-11"
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || refundPage >= refundPages}
                  onClick={() => setRefundPage((p) => p + 1)}
                  className="min-h-11"
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Giao dịch cần đối soát */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck2 size={18} className="text-primary" /> Giao dịch cần đối soát
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Kiểm tra chuyển thiếu tiền, mã không khớp, đơn hết hạn hoặc lỗi xử lý với sao kê ngân hàng. Mọi thao tác cần lý do và lưu audit.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {!loading && !events.length && (
            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
              Không có giao dịch cần đối soát.
            </p>
          )}
          {events.map((item) => (
            <div
              key={item._id}
              className="border border-border rounded-xl p-4 space-y-2 bg-muted/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">
                  {item.referenceCode} · {item.paymentCode || "Không có mã đơn"}
                </p>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {money(item.transferAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                Trạng thái: {item.state} · {item.disposition} · Số lần xử lý:{" "}
                {item.attempts} · {new Date(item.createdAt).toLocaleString("vi-VN")}
              </p>

              {item.paymentLedgerVersion === 2 && (
                <div className="space-y-2 pt-1 border-t border-border/60">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {referenceInput(item._id + ":code", "Mã TMART đích để phân bổ")}
                    {referenceInput(
                      item._id + ":reason",
                      "Lý do đối soát (ít nhất 10 ký tự)"
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <Button
                      disabled={
                        !!busy ||
                        !/^TMART[A-Z0-9]{1,100}$/.test(
                          references[item._id + ":code"] || ""
                        ) ||
                        (references[item._id + ":reason"]?.trim().length || 0) < 10
                      }
                      onClick={() =>
                        command("allocate:" + item._id, "/allocate", {
                          paymentCode: references[item._id + ":code"],
                          eventIds: [item._id],
                          reason: references[item._id + ":reason"].trim(),
                          allowUnmatched: true,
                        })
                      }
                      className="min-h-11"
                    >
                      Phân bổ theo mã đích
                    </Button>
                    <Button
                      variant="outline"
                      disabled={
                        !!busy ||
                        (references[item._id + ":reason"]?.trim().length || 0) < 10
                      }
                      onClick={() =>
                        command(
                          "refund-receipt:" + item._id,
                          "/refund-receipt",
                          {
                            eventId: item._id,
                            reason: references[item._id + ":reason"].trim(),
                          }
                        )
                      }
                      className="min-h-11 border-destructive/20 text-destructive-text hover:bg-destructive/10"
                    >
                      Tạo yêu cầu hoàn chưa phân bổ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {eventPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span className="tabular-nums">
                Trang {page} / {Math.max(1, eventPages)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="min-h-11"
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page >= eventPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="min-h-11"
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. 50 audit gần nhất */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History size={18} className="text-primary" /> 50 audit gần nhất
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {!audits.length && (
            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
              Chưa có lịch sử đối soát nào.
            </p>
          )}
          {audits.map((item) => (
            <div
              key={item._id}
              className="border border-border/60 rounded-lg p-3 text-xs bg-muted/20 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {item.action}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-muted-foreground">{item.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
