"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  ExternalLink,
} from "lucide-react";
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
import { AdminEmptyState } from "@/app/(admin)/components/shared";

export function BrandTable({ brands, onDelete }) {
  if (brands.length === 0) {
    return <AdminEmptyState message="Không tìm thấy thương hiệu nào." />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Logo</TableHead>
            <TableHead>
              <div className="flex items-center gap-1 cursor-pointer">
                Tên thương hiệu <ArrowUpDown size={14} />
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell">Mô tả</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand._id}>
              <TableCell>
                <div className="h-10 w-10 relative rounded-lg border bg-white p-1 overflow-hidden">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs font-bold text-zinc-500">
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
                {brand.description || "—"}
              </TableCell>
              <TableCell>
                {brand.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-500 hover:underline text-xs"
                  >
                    <Globe size={12} />
                    <span className="max-w-30 truncate">
                      {brand.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/admin-brands/update?id=${brand._id}`}
                        className="cursor-pointer"
                      >
                        <Pencil size={14} className="mr-2" /> Sửa thông tin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
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
  );
}
