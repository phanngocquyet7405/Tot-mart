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
    return (
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-600 border-amber-200"
      >
        {status.label}
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-emerald-50 text-emerald-600 border-emerald-200 font-normal"
    >
      {status.label}
    </Badge>
  );
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === products.length && products.length > 0}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>Ảnh</TableHead>
            <TableHead
              className="cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => onSort("name")}
            >
              Tên sản phẩm <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => onSort("price")}
            >
              Giá <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead className="text-right">Tồn kho</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-12"></TableHead>
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
                <div className="relative w-12 h-12">
                  <Image
                    src={
                      p.images && p.images[0]?.url
                        ? p.images[0].url
                        : "/placeholder.svg"
                    }
                    alt={p.name}
                    fill
                    unoptimized
                    className="rounded-lg object-cover border bg-white"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-50 truncate">
                {p.name}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatProductPrice(p.price)}
              </TableCell>
              <TableCell className="text-right">{p.stock ?? 0}</TableCell>
              <TableCell>
                <StockBadge stock={p.stock ?? 0} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/admin-products/update?id=${p._id}`}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Sửa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 cursor-pointer"
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
  );
}
