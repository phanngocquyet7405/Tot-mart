"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  RefreshCw,
  Tag,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Services
import {
  getAllBrandsApi,
  deleteBrandApi,
} from "@/app/services/api/productServices";

// Components local
import DeleteBrandModal from "../components/brands/DeleteBrandModal";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch dữ liệu
  const fetchBrands = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await getAllBrandsApi();
      const data = res?.brands || res?.data || res || [];
      setBrands(data);
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Logic lọc dữ liệu tối ưu
  const filteredBrands = useMemo(() => {
    const q = search.toLowerCase();
    return brands.filter((b) => b.name?.toLowerCase().includes(q));
  }, [search, brands]);

  // Xử lý xóa
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await deleteBrandApi(id);
      setBrands((prev) => prev.filter((b) => b._id !== id));
      setDeleteTarget(null);
      // Bạn có thể thêm Toast ở đây
    } catch {
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* GIỮ LẠI PHẦN NÀY THEO YÊU CẦU */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Tag size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Thương hiệu
            </h1>
            <p className="text-sm text-muted-foreground">
              {brands.length} thương hiệu trong hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchBrands(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Button>
          <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/admin-brands/create">
              <Plus size={16} />
              Thêm thương hiệu
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Danh sách thương hiệu</CardTitle>
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm thương hiệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
              <p className="text-sm text-muted-foreground font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-destructive/5 border-destructive/20">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={() => fetchBrands()}>
                Thử lại
              </Button>
            </div>
          ) : (
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
                    <TableHead className="hidden md:table-cell">
                      Mô tả
                    </TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Không tìm thấy thương hiệu nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrands.map((brand) => (
                      <TableRow key={brand._id}>
                        <TableCell>
                          <div className="h-10 w-10 relative rounded-lg border bg-white p-1 overflow-hidden">
                            {brand.logo ? (
                              <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
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
                                  <Pencil size={14} className="mr-2" /> Sửa
                                  thông tin
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => setDeleteTarget(brand)}
                              >
                                <Trash2 size={14} className="mr-2" /> Xóa thương
                                hiệu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteBrandModal
        brand={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
