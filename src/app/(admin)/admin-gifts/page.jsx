"use client";
import { useEffect, useRef, useState } from "react";
import { axiosConfig } from "@/app/services/api/axiosConfig";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { packageDraft, validatePackage } from "@/app/manager/lib/packageModel.mjs";
import GiftForm from "@/app/manager/components/GiftForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Plus, RefreshCw, AlertCircle, Edit, Trash2 } from "lucide-react";
import { AdminPageHeader, AdminEmptyState } from "../components/shared";

export default function AdminGifts() {
  const [rows, setRows] = useState([]);
  const [combos, setCombos] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const lock = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      axiosConfig.get("/admin/gifts", { params: { page, limit: 20 } }),
      (async () => {
        const first = await getAllBoxesApi({ kind: "combo", limit: 100 });
        const result = [...first.data];
        for (let p = 2; p <= (first.pagination?.totalPages || 1); p++) {
          result.push(
            ...(await getAllBoxesApi({ kind: "combo", limit: 100, page: p })).data
          );
        }
        return result.filter(
          (row) => row.ownerId && new Date(row.validTo) > new Date()
        );
      })(),
    ])
      .then(([gifts, sources]) => {
        if (active) {
          setRows(gifts.data);
          setPages(Math.max(1, gifts.pagination?.totalPages || 1));
          setCombos(sources);
        }
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.message || "Không tải được danh sách gói quà.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision]);

  const change = (key, value) => setDraft((p) => ({ ...p, [key]: value }));
  const field = (key, label, type = "text") => (
    <label className="grid gap-2 text-sm">
      {label}
      <Input
        required
        type={type}
        className="min-h-11"
        value={draft[key]}
        onChange={(e) => change(key, e.target.value)}
      />
    </label>
  );
  const select = (key, label, options) => (
    <label className="grid gap-2 text-sm">
      {label}
      <select
        required
        className="min-h-11 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={draft[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        <option value="">Chọn combo đã xác minh chủ</option>
        {options.map((row) => (
          <option key={row._id} value={row._id}>
            {row.name}
          </option>
        ))}
      </select>
    </label>
  );

  async function save(event) {
    event.preventDefault();
    if (lock.current) return;
    const errors = validatePackage("gifts", draft, Boolean(editing), [], combos);
    if (Object.keys(errors).length) {
      setFormError(Object.values(errors).join(" "));
      return;
    }
    const giftPolicy = {
      bulkTiers: draft.bulkTiers.map((t) => ({
        minQuantity: Number(t.minQuantity),
        percent: Number(t.percent),
      })),
      amenities: draft.amenities.map((a) => ({
        name: a.name.trim(),
        fee: Number(a.fee),
      })),
    };
    const data = {
      name: draft.name.trim(),
      validTo: new Date(draft.validTo + "T23:59:59+07:00").toISOString(),
      giftPolicy,
      ...(!editing
        ? { comboId: draft.comboId, stock: Number(draft.stock) }
        : {}),
    };
    lock.current = true;
    setBusy(true);
    setFormError("");
    try {
      if (editing) await axiosConfig.patch(`/admin/gifts/${editing._id}`, data);
      else await axiosConfig.post("/admin/gifts", data);
      setDraft(null);
      setRevision((n) => n + 1);
    } catch (e) {
      setFormError(e.response?.data?.message || "Chưa lưu được gói quà.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function archive() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setFormError("");
    try {
      await axiosConfig.delete(`/admin/gifts/${deleting._id}`);
      setDeleting(null);
      setRevision((n) => n + 1);
    } catch (e) {
      setFormError(e.response?.data?.message || "Chưa ngừng bán được gói quà.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="p-6 space-y-6">
      <AdminPageHeader
        title="Quản lý gói quà"
        description="Gói quà giữ chủ sở hữu và cấu phần của combo nguồn. Combo chưa xác minh chủ sẽ không thể dùng để tạo gói quà."
        icon={Gift}
        actions={
          <Button
            className="gap-2 min-h-11"
            onClick={() => {
              setEditing(null);
              setDraft(packageDraft());
              setFormError("");
            }}
          >
            <Plus size={16} /> Tạo gói quà từ combo
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive-text flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 border-destructive/30 hover:bg-destructive/10 text-destructive-text"
            onClick={() => setRevision((n) => n + 1)}
          >
            <RefreshCw size={14} className="mr-1.5" /> Thử lại
          </Button>
        </div>
      ) : !rows.length ? (
        <AdminEmptyState
          title="Chưa có gói quà nào"
          description="Bắt đầu tạo gói quà từ combo đã xác minh chủ để mở rộng chính sách quà tặng."
          action={
            <Button
              className="gap-2 min-h-11"
              onClick={() => {
                setEditing(null);
                setDraft(packageDraft());
                setFormError("");
              }}
            >
              <Plus size={16} /> Tạo gói quà từ combo
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            {rows.map((row) => (
              <div
                key={row._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-foreground text-sm sm:text-base">
                      {row.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-primary/10 text-primary border-primary/20"
                    >
                      {row.sourceComboId ? "Gói quà từ combo" : "Quà tặng legacy"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Giá combo:{" "}
                    <strong className="text-foreground tabular-nums">
                      {Number(row.value).toLocaleString("vi-VN")} ₫
                    </strong>{" "}
                    · Còn{" "}
                    <strong className="text-foreground tabular-nums">
                      {row.stock}
                    </strong>{" "}
                    suất
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    className="min-h-11 gap-1 text-xs sm:text-sm"
                    onClick={() => {
                      setEditing(row);
                      setDraft(packageDraft(row));
                      setFormError("");
                    }}
                  >
                    <Edit size={14} /> Sửa
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11 gap-1 text-xs sm:text-sm text-destructive-text hover:bg-destructive/10 border-destructive/20"
                    onClick={() => {
                      setDeleting(row);
                      setFormError("");
                    }}
                  >
                    <Trash2 size={14} /> Ngừng bán
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <nav
            aria-label="Phân trang gói quà"
            className="flex items-center justify-between pt-2 text-sm text-muted-foreground"
          >
            <span>
              Trang <strong className="text-foreground tabular-nums">{page}</strong> /{" "}
              <span className="tabular-nums">{pages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Dialog Sửa / Tạo gói quà */}
      <Dialog
        open={Boolean(draft)}
        onOpenChange={(open) => {
          if (!open && !lock.current) setDraft(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogTitle>{editing ? "Sửa gói quà" : "Tạo gói quà"}</DialogTitle>
          <DialogDescription>
            Giá và quyền sở hữu được backend xác minh từ combo nguồn.
          </DialogDescription>
          {draft && (
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <fieldset disabled={busy} className="contents">
                {field("name", "Tên gói quà")}
                <GiftForm
                  field={field}
                  select={select}
                  editing={Boolean(editing)}
                  form={draft}
                  change={change}
                  combos={combos}
                />
              </fieldset>
              {formError && (
                <p role="alert" className="text-destructive-text text-sm sm:col-span-2">
                  {formError}
                </p>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={busy}
                  onClick={() => setDraft(null)}
                >
                  Hủy
                </Button>
                <Button disabled={busy} type="submit" className="min-h-11">
                  {busy ? "Đang lưu…" : "Lưu gói quà"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Ngừng bán */}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !lock.current) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Ngừng bán {deleting?.name}?</DialogTitle>
          <DialogDescription>
            Đơn và hợp đồng đã tạo được giữ lại. Hệ thống sẽ chặn nếu gói quà còn nghĩa vụ chưa xử lý.
          </DialogDescription>
          {formError && (
            <p role="alert" className="text-destructive-text text-sm">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="min-h-11"
              disabled={busy}
              onClick={archive}
            >
              {busy ? "Đang xử lý…" : "Xác nhận ngừng bán"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
