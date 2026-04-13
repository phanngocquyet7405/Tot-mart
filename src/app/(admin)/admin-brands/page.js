"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {
  getAllBrandsApi,
  deleteBrandApi,
} from "@/app/services/api/productServices";
import BrandModal from "../components/brands/BrandModal";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBrandsApi();
      const data = response.brands || response.data || response || [];
      setBrands(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thương hiệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await deleteBrandApi(id);
        fetchBrands();
      } catch (error) {
        console.error("Lỗi khi xóa thương hiệu:", error);
        alert("Có lỗi xảy ra khi xóa thương hiệu.");
      }
    }
  };

  const handleOpenEdit = (brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Quản lý Thương hiệu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem, thêm, sửa và xóa các thương hiệu sản phẩm.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Thêm thương hiệu
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-4 text-muted/50" />
              <p>Chưa có thương hiệu nào. Hãy tạo mới!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Logo</TableHead>
                  <TableHead>Tên thương hiệu</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand._id}>
                    <TableCell>
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain rounded-md border bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center border">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {brand.description || "—"}
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          Truy cập
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(brand)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(brand._id)}
                          title="Xóa"
                          className="hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Render Modal */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedBrand}
        onSuccess={fetchBrands}
      />
    </div>
  );
}
