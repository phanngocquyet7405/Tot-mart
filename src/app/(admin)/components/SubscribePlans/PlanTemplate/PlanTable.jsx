// components/SubscribePlans/PlanTable.jsx
// Bảng danh sách Subscription Templates (mẫu gói).
// Hỗ trợ mobile card layout (< 768px).

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
  CalendarClock,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  EyeOff,
  Gift,
} from "lucide-react";
import {
  formatCurrency,
  PLAN_TYPE_LABELS,
} from "@/app/util/formatter";

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey === col)
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="inline ml-1" />
    ) : (
      <ChevronDown size={12} className="inline ml-1" />
    );
  return <ChevronUp size={12} className="inline ml-1 opacity-20" />;
}

export function PlanTable({
  filtered,
  totalPlans,
  isLoading,
  sortKey,
  sortDir,
  onSort,
  onViewDetail,
  onEditClick,
  onDeleteClick,
  onToggleActive,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-muted animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-muted-foreground">
        <CalendarClock size={36} className="mx-auto mb-2 opacity-30 text-muted-foreground" />
        <p className="text-sm">Không tìm thấy mẫu gói nào.</p>
      </div>
    );
  }

  return (
    <div className="rounded-b-xl overflow-hidden">
      {/* Mobile Card Layout (< 768px) */}
      <div className="md:hidden divide-y divide-border">
        {filtered.map((template) => (
          <Card key={template._id} className="rounded-none border-x-0 border-t-0 shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    ID: {template._id?.slice(-6)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {template.isActive ? (
                    <Badge className="bg-success/15 text-success-text border-success/20 gap-1 text-[11px] font-medium">
                      <CheckCircle2 size={11} /> Hiển thị
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border gap-1 text-[11px] font-medium">
                      <EyeOff size={11} /> Đã ẩn
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-11 min-w-11 -mr-2 text-muted-foreground hover:text-foreground"
                        aria-label="Thao tác"
                      >
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                        onClick={() => onViewDetail(template)}
                      >
                        <Eye size={14} className="mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                        onClick={() => onEditClick(template)}
                      >
                        <Pencil size={14} className="mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                        onClick={() => onToggleActive?.(template)}
                      >
                        {template.isActive ? (
                          <>
                            <EyeOff size={14} className="mr-2" />
                            Ẩn mẫu gói
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} className="mr-2" />
                            Hiển thị mẫu gói
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive-text cursor-pointer pointer-coarse:min-h-11 flex items-center"
                        onClick={() => onDeleteClick(template)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Xóa mẫu gói
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground">Chu kỳ: </span>
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20 bg-primary/10 text-[11px]"
                  >
                    {PLAN_TYPE_LABELS[template.planType] || template.planType}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Combo chính: </span>
                  <span className="font-medium text-foreground">
                    {template.boxId?.name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giá KM: </span>
                  <span className="font-bold text-primary tabular-nums">
                    {formatCurrency(template.discountPrice)}
                  </span>
                  {template.discountPercent > 0 && (
                    <Badge className="ml-1 bg-destructive/15 text-destructive-text border-destructive/20 text-[10px] tabular-nums">
                      -{template.discountPercent}%
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Giá gốc: </span>
                  <span className="line-through text-muted-foreground tabular-nums">
                    {formatCurrency(template.basePrice)}
                  </span>
                </div>
                {template.gift?.length > 0 && (
                  <div className="col-span-2 flex items-center gap-1 text-primary">
                    <Gift size={12} />
                    <span>Quà kèm: {template.gift.length} combo</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => onSort("name")}
              >
                Tên mẫu gói{" "}
                <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => onSort("planType")}
              >
                Chu kỳ{" "}
                <SortIcon col="planType" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className="font-semibold">Combo chính</TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => onSort("basePrice")}
              >
                Giá gốc{" "}
                <SortIcon col="basePrice" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => onSort("discountPrice")}
              >
                Giá KM{" "}
                <SortIcon
                  col="discountPrice"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </TableHead>
              <TableHead className="font-semibold">Quà kèm</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold pr-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((template) => (
              <TableRow key={template._id} className="group hover:bg-muted/20">
                <TableCell>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    ID: {template._id?.slice(-6)}
                  </p>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20 bg-primary/10"
                  >
                    {PLAN_TYPE_LABELS[template.planType] || template.planType}
                  </Badge>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-foreground">{template.boxId?.name || "—"}</p>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatCurrency(template.basePrice)}
                  </p>
                </TableCell>

                <TableCell>
                  <p className="font-medium text-primary tabular-nums">
                    {formatCurrency(template.discountPrice)}
                  </p>
                  {template.discountPercent > 0 && (
                    <Badge className="mt-0.5 bg-destructive/15 text-destructive-text border-destructive/20 text-[11px] py-0 tabular-nums">
                      −{template.discountPercent}%
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {template.gift?.length > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Gift size={12} />
                      <span className="tabular-nums">{template.gift.length} combo</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                <TableCell>
                  {template.isActive ? (
                    <Badge className="bg-success/15 text-success-text border-success/20 gap-1 font-medium">
                      <CheckCircle2 size={11} /> Hiển thị
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border gap-1 font-medium">
                      <EyeOff size={11} /> Đã ẩn
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* Nút toggle Ẩn/Hiện nhanh */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                      title={template.isActive ? "Ẩn mẫu gói" : "Hiển thị mẫu gói"}
                      aria-label={template.isActive ? "Ẩn mẫu gói" : "Hiển thị mẫu gói"}
                      onClick={() => onToggleActive?.(template)}
                    >
                      {template.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    </Button>

                    {/* Nút sửa nhanh */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                      title="Chỉnh sửa mẫu gói"
                      aria-label="Chỉnh sửa mẫu gói"
                      onClick={() => onEditClick(template)}
                    >
                      <Pencil size={15} />
                    </Button>

                    {/* Menu thao tác mở rộng */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                          title="Thao tác khác"
                          aria-label="Thao tác khác"
                        >
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onViewDetail(template)}
                        >
                          <Eye size={14} className="mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onEditClick(template)}
                        >
                          <Pencil size={14} className="mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onToggleActive?.(template)}
                        >
                          {template.isActive ? (
                            <>
                              <EyeOff size={14} className="mr-2" />
                              Ẩn mẫu gói
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} className="mr-2" />
                              Hiển thị mẫu gói
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive-text cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          onClick={() => onDeleteClick(template)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Xoá mẫu gói
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>
            Hiển thị <strong className="text-foreground tabular-nums">{filtered.length}</strong>{" "}
            / <span className="tabular-nums">{totalPlans}</span> mẫu gói
          </span>
          <span className="tabular-nums">
            {filtered.filter((p) => p.isActive).length} hiển thị ·{" "}
            {filtered.filter((p) => !p.isActive).length} ẩn
          </span>
        </div>
      )}
    </div>
  );
}

export default PlanTable;
