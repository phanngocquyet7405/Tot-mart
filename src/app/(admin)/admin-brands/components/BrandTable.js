"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminEmptyState } from "../../components/shared";
import { stripHtml } from "../../utils/stripHtml";

export function BrandTable({ brands, onDelete }) {
  if (brands.length === 0) {
    return <AdminEmptyState message="Không tìm thấy thương hiệu nào." />;
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Tên thương hiệu</TableHead>
              <TableHead className="hidden md:table-cell">Mô tả</TableHead>
              <TableHead className="hidden sm:table-cell">Địa chỉ</TableHead>
              <TableHead className="w-14 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand._id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="size-10 relative rounded-lg border border-border bg-muted p-1 overflow-hidden shrink-0">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground">
                        {brand.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>{brand.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    /{brand.slug}
                  </div>
                </TableCell>
                <TableCell className="max-w-50 truncate hidden md:table-cell text-muted-foreground">
                  {stripHtml(brand.description) || "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {brand.cityAddress ? (
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin size={12} />
                      {brand.cityAddress}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin-brands/update?id=${brand._id}`}
                          className="cursor-pointer min-h-10"
                        >
                          <Pencil size={14} className="mr-2" /> Sửa thông tin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive-text focus:bg-destructive/15 cursor-pointer min-h-10"
                        onClick={() => onDelete(brand)}
                      >
                        <Trash2 size={14} className="mr-2" /> Xóa thương hiệu
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
        {brands.map((brand) => (
          <article
            key={brand._id}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="size-12 relative rounded-lg border border-border bg-muted p-1 overflow-hidden shrink-0">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted text-xs font-bold text-muted-foreground">
                    {brand.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground">{brand.name}</h3>
                <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                {brand.cityAddress && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin size={12} /> {brand.cityAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border pt-2">
              <Button variant="outline" size="sm" className="flex-1 min-h-10 text-xs" asChild>
                <Link href={`/admin-brands/update?id=${brand._id}`}>
                  <Pencil className="mr-1.5 size-3.5" /> Sửa
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-h-10 text-xs text-destructive-text border-destructive/30 hover:bg-destructive/15"
                onClick={() => onDelete(brand)}
              >
                <Trash2 className="mr-1.5 size-3.5" /> Xóa
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
