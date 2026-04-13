"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  LayoutGrid,
  Loader2,
} from "lucide-react";
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
import DeleteCategory from "./DeleteCategory"; // Giả sử file Component của bạn ở cùng thư mục
import { getAllCategoriesApi } from "@/app/services/api/productServices";
import { toast } from "sonner";
import Image from "next/image";

export default function DeleteCategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy danh sách danh mục (Phương thức tương tự DeleteProductPage)
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCategoriesApi();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Logic tìm kiếm (Kế thừa từ DeleteProductPage)
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Xóa Danh Mục</h1>
          <p className="text-muted-foreground">
            Quản lý và loại bỏ các danh mục không còn sử dụng
          </p>
        </div>
      </div>

      {/* Warning Banner (Kế thừa từ Danger Zone của sản phẩm) */}
      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-destructive">Khu vực nguy hiểm</p>
          <p className="text-sm text-muted-foreground">
            Việc xóa danh mục là hành động vĩnh viễn. Nếu danh mục đang chứa sản
            phẩm, hãy đảm bảo bạn đã chuyển sản phẩm sang danh mục khác trước
            khi thực hiện.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Danh sách danh mục</CardTitle>
              <CardDescription>
                Nhấn vào biểu tượng thùng rác để tiến hành xóa
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow
                    key={cat._id}
                    className="hover:bg-destructive/5 transition-colors"
                  >
                    <TableCell>
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {cat.icon ? (
                          <Image
                            src={cat.icon}
                            alt={cat.name}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <LayoutGrid className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {cat.description || "Không có mô tả"}
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Gọi Component DeleteCategory đã có của bạn */}
                      <DeleteCategory
                        categoryId={cat._id}
                        onSuccess={() => {
                          toast.success(`Đã xóa danh mục ${cat.name}`);
                          fetchCategories(); // Refresh danh sách sau khi xóa thành công
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p>Không tìm thấy danh mục nào phù hợp</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
