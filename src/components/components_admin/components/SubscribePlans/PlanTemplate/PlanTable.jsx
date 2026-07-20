// components/SubscribePlans/PlanTable.jsx
// Bảng danh sách Subscription Templates (mẫu gói).
// Thao tác: Xem chi tiết, Chỉnh sửa, Xoá.

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
  formatDate,
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

  return (
    <div className="rounded-b-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("name")}
            >
              Tên mẫu gói{" "}
              <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("planType")}
            >
              Chu kỳ{" "}
              <SortIcon col="planType" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Box chính</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("basePrice")}
            >
              Giá gốc{" "}
              <SortIcon col="basePrice" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("discountPrice")}
            >
              Giá KM{" "}
              <SortIcon
                col="discountPrice"
                sortKey={sortKey}
                sortDir={sortDir}
              />
            </TableHead>
            <TableHead>Quà kèm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center h-32 text-muted-foreground"
              >
                <CalendarClock size={32} className="mx-auto mb-2 opacity-20" />
                Không tìm thấy mẫu gói nào.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((template) => (
              <TableRow key={template._id} className="group hover:bg-muted/20">
                {/* Tên */}
                <TableCell>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {template._id?.slice(-6)}
                  </p>
                </TableCell>

                {/* Chu kỳ */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-violet-700 border-violet-200 bg-violet-50"
                  >
                    {PLAN_TYPE_LABELS[template.planType] || template.planType}
                  </Badge>
                </TableCell>

                {/* Box chính */}
                <TableCell>
                  <p className="text-sm">{template.boxId?.name || "—"}</p>
                </TableCell>

                {/* Giá gốc */}
                <TableCell>
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(template.basePrice)}
                  </p>
                </TableCell>

                {/* Giá KM */}
                <TableCell>
                  <p className="font-medium text-indigo-600">
                    {formatCurrency(template.discountPrice)}
                  </p>
                  {template.discountPercent > 0 && (
                    <Badge className="mt-0.5 bg-red-50 text-red-600 border-red-100 text-[10px] py-0">
                      −{template.discountPercent}%
                    </Badge>
                  )}
                </TableCell>

                {/* Quà kèm */}
                <TableCell>
                  {template.gift?.length > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-pink-600">
                      <Gift size={12} />
                      {template.gift.length} box
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* Trạng thái isActive */}
                <TableCell>
                  {template.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 size={11} /> Hiển thị
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 gap-1">
                      <EyeOff size={11} /> Đã ẩn
                    </Badge>
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
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onViewDetail(template)}
                      >
                        <Eye size={14} className="mr-2 text-blue-500" />
                        Xem chi tiết
                      </DropdownMenuItem>

                      {onEditClick && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEditClick(template)}
                        >
                          <Pencil size={14} className="mr-2 text-indigo-500" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                      )}

                      {onDeleteClick && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:text-destructive focus:bg-red-50"
                            onClick={() => onDeleteClick(template)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Xoá mẫu gói
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {filtered.length > 0 && (
        <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex justify-between">
          <span>
            Hiển thị{" "}
            <strong className="text-foreground">{filtered.length}</strong> /{" "}
            {totalPlans} mẫu gói
          </span>
          <span>
            {filtered.filter((t) => t.isActive).length} hiển thị ·{" "}
            {filtered.filter((t) => !t.isActive).length} đã ẩn
          </span>
        </div>
      )}
    </div>
  );
}
