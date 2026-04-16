"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

import { DeleteProductDialog } from "../components/products/delete_product_dialog";
import { AdvancedFilterDrawer } from "../components/products/advanced_filter_drawer";
import { BulkActionsBar } from "../components/products/bulk_action_bar";

import {
  getAllProductsApi,
  getAllBrandsApi,
  getAllCategoriesApi,
  deleteProductApi,
} from "@/app/services/api/productServices";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    category: "all",
    brand: "all",
    minPrice: 0,
    maxPrice: Infinity,
  });

  // 1. Hàm lấy dữ liệu
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        getAllProductsApi(),
        getAllCategoriesApi(),
        getAllBrandsApi(),
      ]);

      const prodData = prodRes.data?.data || prodRes.data || [];
      const catData = catRes.data?.data || catRes.data || [];
      const brandData = brandRes.data?.data || brandRes.data || [];

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. QUAN TRỌNG: Thêm useEffect này để kích hoạt load dữ liệu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchSearch = p.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const pCatId = p.category?._id || p.category;
      const pBrandId = p.brand?._id || p.brand;

      const matchCategory =
        activeFilters.category === "all" ||
        String(pCatId) === activeFilters.category;
      const matchBrand =
        activeFilters.brand === "all" ||
        String(pBrandId) === activeFilters.brand;
      const price = Number(p.price ?? 0);
      const matchPrice =
        price >= activeFilters.minPrice && price <= activeFilters.maxPrice;

      return matchSearch && matchCategory && matchBrand && matchPrice;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aValue === "string")
        return aValue.localeCompare(bValue) * modifier;
      return ((aValue ?? 0) - (bValue ?? 0)) * modifier;
    });

    return filtered;
  }, [products, searchQuery, sortField, sortDirection, activeFilters]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (productToDelete) {
        await deleteProductApi(productToDelete._id);
        toast.success(`Đã xóa "${productToDelete.name}"`);
      } else {
        await Promise.all(selectedIds.map((id) => deleteProductApi(id)));
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
      }
      setSelectedIds([]);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const getStatusBadge = (qty) => {
    if (qty <= 0) return <Badge variant="destructive">Hết hàng</Badge>;
    if (qty <= 10)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Sắp hết
        </Badge>
      );
    return <Badge className="bg-green-100 text-green-700">Còn hàng</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Sản phẩm</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý kho hàng trên Cloudinary
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin-products/create">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setFilterOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Lọc
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center py-20 italic text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Đang tải dữ liệu từ máy chủ...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
              <p>{error}</p>
              <Button onClick={fetchData} className="mt-4">
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedIds.length ===
                            filteredAndSortedProducts.length &&
                          filteredAndSortedProducts.length > 0
                        }
                        onCheckedChange={() =>
                          setSelectedIds(
                            selectedIds.length ===
                              filteredAndSortedProducts.length
                              ? []
                              : filteredAndSortedProducts.map((p) => p._id),
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Ảnh</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => setSortField("name")}
                    >
                      Tên sản phẩm <ArrowUpDown className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer"
                      onClick={() => setSortField("price")}
                    >
                      Giá <ArrowUpDown className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead className="text-right">Kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(p._id)}
                          onCheckedChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(p._id)
                                ? prev.filter((id) => id !== p._id)
                                : [...prev, p._id],
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative w-11 h-11">
                          <Image
                            src={
                              p.images && p.images[0]?.url
                                ? p.images[0].url
                                : "/placeholder.svg"
                            }
                            alt={p.name || "product"}
                            fill
                            sizes="44px"
                            className="rounded-md object-cover border"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        ${Number(p.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.quantity || 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(p.quantity || 0)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin-products/update?id=${p._id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAndSortedProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        Không tìm thấy sản phẩm nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={() => {
          setProductToDelete(null);
          setDeleteDialogOpen(true);
        }}
      />
      <AdvancedFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        categories={categories}
        brands={brands}
        onApplyFilters={(f) =>
          setActiveFilters({
            category: f.category || "all",
            brand: f.brand || "all",
            minPrice: f.minPrice ?? 0,
            maxPrice: f.maxPrice ?? Infinity,
          })
        }
      />
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}
        productName={productToDelete?.name}
        isBulk={!productToDelete}
        bulkCount={selectedIds.length}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
