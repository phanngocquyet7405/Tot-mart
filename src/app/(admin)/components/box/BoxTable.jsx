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
import { Card, CardContent } from "@/components/ui/card";
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

  if (boxes.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-muted-foreground">
        <Package size={36} className="mx-auto mb-2 opacity-30 text-muted-foreground" />
        <p className="text-sm">Không tìm thấy combo nào.</p>
      </div>
    );
  }

  return (
    <div className="rounded-b-xl overflow-hidden">
      {/* Mobile Card Layout (< 768px) */}
      <div className="md:hidden divide-y divide-border">
        {boxes.map((box) => {
          const expired = isExpired(box.validTo);
          const thumbSrc = box.images?.[0]?.url || "/placeholder.png";

          return (
            <Card key={box._id} className="rounded-none border-x-0 border-t-0 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                    <Image
                      src={thumbSrc}
                      alt={box.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-2 text-foreground">
                        {box.name}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="min-h-11 min-w-11 shrink-0 -mr-2 -mt-2 text-muted-foreground"
                          >
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer min-h-11 flex items-center"
                            onClick={() => onEditClick(box)}
                          >
                            <Pencil size={15} className="mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive-text cursor-pointer min-h-11 flex items-center"
                            onClick={() => onDeleteClick(box)}
                          >
                            <Trash2 size={15} className="mr-2" />
                            Xóa combo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {box.descriptions && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {box.descriptions}
                      </p>
                    )}
                    {box.isGift && (
                      <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-[11px] py-0 px-1.5 inline-flex items-center">
                        <Gift size={10} className="mr-0.5" />
                        Quà tặng
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground">Giá trị: </span>
                    <span className="font-semibold text-primary tabular-nums">
                      {box.value ? formatCurrency(box.value) : "—"}
                    </span>
                    {box.discountPercent > 0 && (
                      <Badge className="ml-1 bg-destructive/15 text-destructive-text border-destructive/20 font-bold text-[10px] tabular-nums">
                        -{box.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Tồn kho: </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        (box.stock || 0) <= 5
                          ? "text-destructive-text"
                          : "text-foreground"
                      }`}
                    >
                      {box.stock ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sản phẩm: </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {box.products?.length ?? 0}
                    </span>
                  </div>
                  <div className="text-right">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive-text font-medium">
                        <XCircle size={13} />
                        Hết hạn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-success-text font-medium">
                        <CheckCircle2 size={13} />
                        Đang bán
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-muted-foreground tabular-nums">
                    <span>Hạn: </span>
                    {formatDate(box.validFrom)} –{" "}
                    <span className={expired ? "text-destructive-text font-medium" : ""}>
                      {formatDate(box.validTo)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead className="min-w-40">Tên Combo</TableHead>
              <TableHead className="w-24 text-center">Tồn kho</TableHead>
              <TableHead className="w-32 text-right">Giá trị</TableHead>
              <TableHead className="w-24 text-center">Giảm giá</TableHead>
              <TableHead className="w-20 text-center">SP</TableHead>
              <TableHead className="w-44">Thời hạn</TableHead>
              <TableHead className="w-28 text-center">Trạng thái</TableHead>
              <TableHead className="w-16 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {boxes.map((box) => {
              const expired = isExpired(box.validTo);
              const thumbSrc = box.images?.[0]?.url || "/placeholder.png";

              return (
                <TableRow
                  key={box._id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                      <Image
                        src={thumbSrc}
                        alt={box.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-semibold text-sm line-clamp-1 text-foreground">
                      {box.name}
                    </p>
                    {box.descriptions && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {box.descriptions}
                      </p>
                    )}
                    {box.isGift && (
                      <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-[11px] py-0 px-1.5 inline-flex items-center">
                        <Gift size={10} className="mr-0.5" />
                        Quà tặng
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        (box.stock || 0) <= 5
                          ? "text-destructive-text"
                          : "text-foreground"
                      }`}
                    >
                      {box.stock ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right text-sm font-medium text-primary tabular-nums">
                    {box.value ? formatCurrency(box.value) : "—"}
                  </TableCell>

                  <TableCell className="text-center">
                    {box.discountPercent > 0 ? (
                      <Badge className="bg-destructive/15 text-destructive-text border-destructive/20 font-bold text-xs tabular-nums">
                        -{box.discountPercent}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-sm font-medium tabular-nums">
                    {box.products?.length ?? 0}
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-muted-foreground space-y-0.5 tabular-nums">
                      <div>
                        <span>Từ: </span>
                        {formatDate(box.validFrom)}
                      </div>
                      <div>
                        <span>Đến: </span>
                        <span
                          className={expired ? "text-destructive-text font-medium" : ""}
                        >
                          {formatDate(box.validTo)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive-text font-medium">
                        <XCircle size={13} />
                        Hết hạn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-success-text font-medium">
                        <CheckCircle2 size={13} />
                        Đang bán
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onEditClick(box)}
                        >
                          <Pencil size={14} className="mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive-text cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onDeleteClick(box)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Xóa combo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {boxes.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <span>
            Hiển thị <strong className="text-foreground tabular-nums">{boxes.length}</strong>{" "}
            combo
          </span>
          <span className="tabular-nums">
            {boxes.filter((b) => !isExpired(b.validTo)).length} đang hoạt động •{" "}
            {boxes.filter((b) => isExpired(b.validTo)).length} hết hạn
          </span>
        </div>
      )}
    </div>
  );
}
