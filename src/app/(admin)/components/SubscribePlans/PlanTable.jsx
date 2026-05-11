// components/SubscribePlans/PlanTable.jsx
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
  XCircle,
  Zap,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatRelative,
  PLAN_TYPE_LABELS,
} from "@/utils/formatters";
import { StatusBadge } from "./StatusBadge";

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey === col) {
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="inline ml-1" />
    ) : (
      <ChevronDown size={12} className="inline ml-1" />
    );
  }
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
  onCancelClick,
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
              {/* ✅ Truyền props vào SortIcon */}
              Tên gói{" "}
              <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("planType")}
            >
              Loại gói{" "}
              <SortIcon col="planType" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Tiến độ</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("price")}
            >
              Giá <SortIcon col="price" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Giao tiếp theo</TableHead>
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
                Không tìm thấy gói đăng ký nào.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((plan) => {
              const progress =
                plan.totalDeliveries > 0
                  ? Math.round(
                      ((plan.completeDeliveries || 0) / plan.totalDeliveries) *
                        100,
                    )
                  : 0;
              return (
                <TableRow key={plan._id} className="group hover:bg-muted/20">
                  <TableCell>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {plan._id?.slice(-6)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {plan.userId?.name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.userId?.email || ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-violet-700 border-violet-200 bg-violet-50"
                    >
                      {PLAN_TYPE_LABELS[plan.planType] || plan.planType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-25">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {plan.completeDeliveries || 0}/{plan.totalDeliveries}
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(plan.price)}</p>
                    {plan.discountPercent > 0 && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(plan.oldPrice)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.nextDeliveries ? (
                      <div>
                        <p className="text-sm">
                          {formatDate(plan.nextDeliveries)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(plan.nextDeliveries)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={plan.status}
                      cancelAtPeriodEnd={plan.cancelAtPeriodEnd}
                    />
                  </TableCell>
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
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onViewDetail(plan)}
                        >
                          <Eye size={14} className="mr-2 text-blue-500" /> Xem
                          chi tiết
                        </DropdownMenuItem>
                        {plan.status === "active" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-orange-600 cursor-pointer focus:text-orange-700 focus:bg-orange-50"
                              onClick={() =>
                                onCancelClick({ plan, mode: "end" })
                              }
                            >
                              <XCircle size={14} className="mr-2" /> Hủy cuối kỳ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer focus:text-destructive focus:bg-red-50"
                              onClick={() =>
                                onCancelClick({ plan, mode: "immediate" })
                              }
                            >
                              <Zap size={14} className="mr-2" /> Hủy ngay lập
                              tức
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Table Footer Stats */}
      {filtered.length > 0 && (
        <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex justify-between">
          <span>
            Hiển thị{" "}
            <strong className="text-foreground">{filtered.length}</strong> /{" "}
            {totalPlans} gói
          </span>
          <span>
            {filtered.filter((p) => p.status === "active").length} active ·{" "}
            {
              filtered.filter(
                (p) => p.cancelAtPeriodEnd && p.status === "active",
              ).length
            }{" "}
            pending cancel
          </span>
        </div>
      )}
    </div>
  );
}
