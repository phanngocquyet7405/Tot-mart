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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

export function BoxTable({ boxes, isLoading, onEditClick, onDeleteClick }) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-muted animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-b-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Ảnh</TableHead>
            <TableHead>Tên Box</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Thời hạn</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boxes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center h-32 text-muted-foreground"
              >
                <Package size={32} className="mx-auto mb-2 opacity-20" />
                Không tìm thấy box nào.
              </TableCell>
            </TableRow>
          ) : (
            boxes.map((box) => (
              <TableRow key={box._id} className="group hover:bg-muted/20">
                <TableCell>
                  <div className="h-10 w-10 relative rounded border overflow-hidden">
                    <Image
                      src={box.images?.[0]?.url || "/placeholder.png"}
                      alt="box"
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {box.name}
                  {box.isGift && (
                    <Badge className="ml-2 bg-pink-100 text-pink-700">
                      Quà tặng
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{box.stock}</TableCell>
                <TableCell className="text-orange-600 font-bold">
                  {box.discountPercent}%
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(box.validFrom)} - {formatDate(box.validTo)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEditClick(box)}
                      >
                        <Pencil size={14} className="mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => onDeleteClick(box)}
                      >
                        <Trash2 size={14} className="mr-2" /> Xóa box
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {boxes.length > 0 && (
        <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground">
          <span>
            Hiển thị <strong className="text-foreground">{boxes.length}</strong>{" "}
            box
          </span>
        </div>
      )}
    </div>
  );
}
