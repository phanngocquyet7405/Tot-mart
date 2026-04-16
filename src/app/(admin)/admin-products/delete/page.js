"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Shadcn UI & Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { DeleteProductDialog } from "../../components/products/delete_product_dialog";
import { BulkActionsBar } from "../../components/products/bulk_action_bar";
import { AdvancedFilterDrawer } from "../../components/products/advanced_filter_drawer";

// API Services
import {
  getAllProductsApi,
  getAllCategoriesApi,
  getAllBrandsApi,
  deleteProductApi,
} from "@/app/services/api/productServices";

export default function DeleteProductPage() {
  // States dữ liệu
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // States tương tác
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    category: "all",
    brand: "all",
    minPrice: 0,
    maxPrice: Infinity,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        getAllProductsApi(),
        getAllCategoriesApi(),
        getAllBrandsApi(),
      ]);
      const data = prodRes.data?.data ?? prodRes.data ?? [];
      setProducts(Array.isArray(data) ? data : []);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory =
        activeFilters.category === "all" ||
        String(p.categoryId ?? p.category?._id ?? p.category) ===
          activeFilters.category;
      const matchBrand =
        activeFilters.brand === "all" ||
        String(p.brandId ?? p.brand?._id ?? p.brand) === activeFilters.brand;
      const price = Number(p.price ?? 0);
      const matchPrice =
        price >= activeFilters.minPrice && price <= activeFilters.maxPrice;

      return matchSearch && matchCategory && matchBrand && matchPrice;
    });
  }, [products, searchQuery, activeFilters]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id || p.id));
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (productToDelete) {
        await deleteProductApi(productToDelete._id || productToDelete.id);
        toast.success(`Đã xóa "${productToDelete.name}"`);
      } else {
        await Promise.all(selectedIds.map((id) => deleteProductApi(id)));
        toast.success(`Đã xóa thành công các sản phẩm đã chọn`);
      }
      setSelectedIds([]);
      setProductToDelete(null);
      setDeleteDialogOpen(false);
      await fetchProducts();
    } catch (err) {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dọn dẹp kho hàng
            </h1>
            <p className="text-sm text-muted-foreground">
              Xóa các sản phẩm không còn kinh doanh.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setFilterOpen(true)}>
          <Filter className="mr-2 h-4 w-4" /> Bộ lọc
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-destructive">
            Danger Zone (Vùng nguy hiểm)
          </p>
          <p className="text-xs text-muted-foreground">
            Hành động xóa là vĩnh viễn và không thể hoàn tác. Mọi dữ liệu liên
            quan đến hình ảnh và kho của sản phẩm sẽ bị xóa khỏi hệ thống.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>
                Chọn một hoặc nhiều sản phẩm để thực hiện thao tác xóa.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm tên sản phẩm..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="link" onClick={fetchProducts}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tải lại
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredProducts.length > 0 &&
                          selectedIds.length === filteredProducts.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <TableRow
                        key={p._id || p.id}
                        className="hover:bg-destructive/5 group"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(p._id || p.id)}
                            onCheckedChange={() => toggleSelect(p._id || p.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {/* PHẦN HIỂN THỊ ẢNH ĐÃ SỬA THEO PRODUCTLIST */}
                            <div className="relative w-11 h-11 shrink-0">
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
                            <span className="font-medium max-w-50 truncate">
                              {p.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {p.category?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${Number(p.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.stock || p.quantity || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Không tìm thấy sản phẩm phù hợp.
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

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}
        productName={productToDelete?.name}
        isBulk={!productToDelete}
        bulkCount={selectedIds.length}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
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
    </div>
  );
}
