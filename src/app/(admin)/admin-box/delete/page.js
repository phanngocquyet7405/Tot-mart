"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getBoxByIdApi, deleteBoxApi } from "@/app/services/api/boxService";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

export default function DeleteBoxPage() {
  const router = useRouter();
  const { id } = useParams();

  const [box, setBox] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    async function fetchBox() {
      try {
        const res = await getBoxByIdApi(id);
        setBox(res.data);
      } catch (err) {
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchBox();
  }, [id]);

  const handleDelete = async () => {
    if (confirm !== box.name) return;
    setLoading(true);
    setApiError("");
    try {
      await deleteBoxApi(id);
      toast.success("Xoá box thành công!");
      router.push("/admin-box");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Xoá Box
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thao tác này không thể hoàn tác
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {!box ? (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            Không tìm thấy box
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle
                size={16}
                className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              />
              <div className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                <strong>Hành động nguy hiểm!</strong> Xoá box sẽ đồng thời xoá
                toàn bộ hình ảnh liên quan và không thể khôi phục.
              </div>
            </div>

            <Card className="mb-5">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {box.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {box.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Giá trị", fmtPrice(box.value || 0)],
                        ["Tồn kho", `${box.stock} cái`],
                        ["Số sản phẩm", `${box.products?.length || 0} loại`],
                        ["Hiệu lực đến", box.validTo?.slice(0, 10) || "—"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
                        >
                          <div className="text-xs text-gray-400 mb-0.5">
                            {label}
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Để xác nhận, nhập chính xác tên box:{" "}
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100 text-xs font-mono">
                    {box.name}
                  </code>
                </p>
                <input
                  type="text"
                  placeholder="Nhập tên box để xác nhận..."
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 mb-4"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push("/admin-box")}
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirm !== box.name || loading}
                    className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    {loading ? "Đang xoá..." : "Xoá vĩnh viễn"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
