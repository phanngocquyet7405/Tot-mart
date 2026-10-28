"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "../../components/shared";
import {
  formatProductPrice,
  getProductStockStatus,
} from "../services/productsAdminService";

function StockBadge({ stock }) {
  const status = getProductStockStatus(stock);
  if (status.variant === "destructive") {
    return <Badge variant="destructive">{status.label}</Badge>;
  }
  if (status.variant === "warning") {
    return <Badge variant="warning">{status.label}</Badge>;
  }
  return <Badge variant="success">{status.label}</Badge>;
}

export function ProductTable({
  products,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onSort,
  onDelete,
}) {
  if (products.length === 0) {
    return (
      <AdminEmptyState message="Không có dữ liệu phù hợp với bộ lọc." />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === products.length && products.length > 0}
                  onCheckedChange={onToggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort("name")}
              >
                Tên sản phẩm <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort("price")}
              >
                Giá <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p._id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(p._id)}
                    onCheckedChange={() => onToggleSelectOne(p._id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative size-12 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
                    <Image
                      src={
                        p.images && p.images[0]?.url
                          ? p.images[0].url
                          : "/placeholder.svg"
                      }
                      alt={p.name}
                      fill
                      unoptimized
                      className="rounded-lg object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-50 truncate">
                  {p.name}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatProductPrice(p.price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.stock ?? 0}</TableCell>
                <TableCell>
                  <StockBadge stock={p.stock ?? 0} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin-products/update?id=${p._id}`}
                          className="cursor-pointer min-h-10"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive-text focus:bg-destructive/15 cursor-pointer min-h-10"
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {products.map((p) => (
          <article
            key={p._id}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedIds.includes(p._id)}
                onCheckedChange={() => onToggleSelectOne(p._id)}
                className="mt-1"
              />
              <div className="relative size-14 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
                <Image
                  src={
                    p.images && p.images[0]?.url
                      ? p.images[0].url
                      : "/placeholder.svg"
                  }
                  alt={p.name}
                  fill
                  unoptimized
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                  {p.name}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold tabular-nums text-foreground">
                    {formatProductPrice(p.price)}
                  </span>
                  <StockBadge stock={p.stock ?? 0} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
              <span>Tồn kho: <strong className="text-foreground tabular-nums">{p.stock ?? 0}</strong></span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="min-h-10 text-xs" asChild>
                  <Link href={`/admin-products/update?id=${p._id}`}>
                    <Pencil className="mr-1 size-3.5" /> Sửa
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10 text-xs text-destructive-text border-destructive/30 hover:bg-destructive/15"
                  onClick={() => onDelete(p)}
                >
                  <Trash2 className="mr-1 size-3.5" /> Xóa
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
