import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Gift,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const isExpired = (validTo) => {
  if (!validTo) return false;
  return new Date(validTo) < new Date();
};

export function BoxTable({ boxes, isLoading, onEditClick, onDeleteClick }) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-muted animate-pulse"
            style={{ opacity: 1 - i * 0.18 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-b-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-18">Ảnh</TableHead>
            <TableHead className="min-w-22.5">Tên Box</TableHead>
            <TableHead className="w-22.5 text-center">Tồn kho</TableHead>
            <TableHead className="w-27.5 text-right">Giá trị</TableHead>
            <TableHead className="w-22.5 text-center">Giảm giá</TableHead>
            <TableHead className="w-20 text-center">SP</TableHead>
            <TableHead className="w-45">Thời hạn</TableHead>
            <TableHead className="w-27.5 text-center">Trạng thái</TableHead>
            <TableHead className="w-15 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {boxes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center h-40 text-muted-foreground"
              >
                <Package size={36} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Không tìm thấy box nào.</p>
              </TableCell>
            </TableRow>
          ) : (
            boxes.map((box) => {
              const expired = isExpired(box.validTo);
              const thumbSrc = box.images?.[0]?.url || "/placeholder.png";

              return (
                <TableRow
                  key={box._id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* Ảnh đại diện – luôn lấy images[0] */}
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg border overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={thumbSrc}
                        alt={box.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>

                  {/* Tên + badge */}
                  <TableCell>
                    <p className="font-semibold text-sm line-clamp-1">
                      {box.name}
                    </p>
                    {box.descriptions && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {box.descriptions}
                      </p>
                    )}
                    {box.isGift && (
                      <Badge className="mt-1 bg-pink-100 text-pink-700 border-pink-200 text-[10px] py-0 px-1.5">
                        <Gift size={10} className="mr-0.5" />
                        Quà tặng
                      </Badge>
                    )}
                  </TableCell>

                  {/* Tồn kho */}
                  <TableCell className="text-center">
                    <span
                      className={`text-sm font-bold ${
                        (box.stock || 0) <= 5
                          ? "text-red-500"
                          : "text-slate-700"
                      }`}
                    >
                      {box.stock ?? "—"}
                    </span>
                  </TableCell>

                  {/* Giá trị box */}
                  <TableCell className="text-right text-sm font-medium text-indigo-600">
                    {box.value ? formatCurrency(box.value) : "—"}
                  </TableCell>

                  {/* Giảm giá */}
                  <TableCell className="text-center">
                    {box.discountPercent > 0 ? (
                      <Badge className="bg-red-100 text-red-600 border-red-200 font-bold text-xs">
                        -{box.discountPercent}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Số sản phẩm */}
                  <TableCell className="text-center text-sm font-medium">
                    {box.products?.length ?? 0}
                  </TableCell>

                  {/* Thời hạn */}
                  <TableCell>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>
                        <span className="text-slate-400">Từ: </span>
                        {formatDate(box.validFrom)}
                      </div>
                      <div>
                        <span className="text-slate-400">Đến: </span>
                        <span
                          className={expired ? "text-red-500 font-medium" : ""}
                        >
                          {formatDate(box.validTo)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell className="text-center">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                        <XCircle size={13} />
                        Hết hạn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 size={13} />
                        Đang bán
                      </span>
                    )}
                  </TableCell>

                  {/* Thao tác */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEditClick(box)}
                        >
                          <Pencil size={14} className="mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => onDeleteClick(box)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Xóa box
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {boxes.length > 0 && (
        <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Hiển thị <strong className="text-foreground">{boxes.length}</strong>{" "}
            box
          </span>
          <span className="text-slate-400">
            {boxes.filter((b) => !isExpired(b.validTo)).length} đang hoạt động •{" "}
            {boxes.filter((b) => isExpired(b.validTo)).length} hết hạn
          </span>
        </div>
      )}
    </div>
  );
}
