"use client";

import React from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateCategory from "./update_category.js";
import DeleteCategory from "./delete_category.js";
import Image from "next/image";

export default function GetAllCategories({ categories, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">ID</TableHead>
            <TableHead>Hình ảnh</TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-mono text-xs">
                {item._id.slice(-6)}
              </TableCell>
              <TableCell>
                <Image
                  src={
                    item.icon && item.icon.trim() !== ""
                      ? item.icon
                      : "/placeholder.png"
                  }
                  alt={item.name || "category icon"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded object-cover"
                  unoptimized
                />
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="max-w-50 truncate text-muted-foreground">
                {item.description || item.desc || "không có mô tả"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <UpdateCategory category={item} onSuccess={onRefresh} />
                <DeleteCategory categoryId={item._id} onSuccess={onRefresh} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
