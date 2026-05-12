"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  PageHeader,
  Breadcrumb,
  Alert,
  Spinner,
  Badge,
  fmtPrice,
  fmtDate,
} from "@/components/ui";
import { boxApi } from "@/lib/api";
import { Trash2, AlertTriangle, Package } from "lucide-react";

export default function DeleteBoxPage() {
  const router = useRouter();
  const { id } = useParams();

  const [box, setBox] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await boxApi.getById(id);
        setBox(res.data);
      } catch (e) {
        setApiError(e.message);
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (confirm !== box.name) return;
    setLoading(true);
    setApiError(null);
    try {
      await boxApi.delete(id);
      router.push("/admin/boxes");
    } catch (e) {
      setApiError(e.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner size={20} />
          <span className="text-sm">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Boxes", href: "/admin/boxes" },
            { label: "Xoá" },
          ]}
        />
        <PageHeader
          title="Xoá Box"
          description="Thao tác này không thể hoàn tác"
        />

        {apiError && (
          <Alert type="error" className="mb-5">
            <span>{apiError}</span>
          </Alert>
        )}

        {!box ? (
          <Alert type="error">
            <span>Không tìm thấy box</span>
          </Alert>
        ) : (
          <>
            {/* Cảnh báo */}
            <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle
                size={16}
                className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              />
              <div className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                <strong>Hành động nguy hiểm!</strong> Xoá box sẽ đồng thời xoá
                toàn bộ hình ảnh liên quan trên Cloudinary và không thể khôi
                phục.
              </div>
            </div>

            {/* Thông tin box sắp bị xoá */}
            <Card className="mb-5">
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {box.name}
                      </h3>
                      {box.isGift && <Badge color="amber">Quà tặng</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {box.descriptions}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Giá trị", fmtPrice(box.value)],
                        ["Tồn kho", `${box.stock} cái`],
                        ["Số sản phẩm", `${box.products?.length || 0} loại`],
                        ["Hiệu lực đến", fmtDate(box.validTo)],
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
              </CardBody>
            </Card>

            {/* Xác nhận tên */}
            <Card>
              <CardBody>
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 mb-4"
                />

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/boxes")}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={loading}
                    disabled={confirm !== box.name}
                  >
                    <Trash2 size={14} />
                    {loading ? "Đang xoá..." : "Xoá vĩnh viễn"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
