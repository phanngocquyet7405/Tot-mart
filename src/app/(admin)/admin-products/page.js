"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProductDialog } from "../components/products/delete_product_dialog";
import { AdvancedFilterDrawer } from "../components/products/advanced_filter_drawer";
import { BulkActionsBar } from "../components/products/bulk_action_bar";

// Mock product data
const initialProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    image: "/placeholder.svg?height=60&width=60",
    category: "Electronics",
    brand: "AudioMax",
    price: 149.99,
    quantity: 45,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Smart Watch Pro Series",
    image: "/placeholder.svg?height=60&width=60",
    category: "Electronics",
    brand: "TechWear",
    price: 299.99,
    quantity: 23,
    status: "In Stock",
  },
  {
    id: 3,
    name: "Ergonomic Laptop Stand",
    image: "/placeholder.svg?height=60&width=60",
    category: "Accessories",
    brand: "DeskPro",
    price: 79.99,
    quantity: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "USB-C Multiport Hub",
    image: "/placeholder.svg?height=60&width=60",
    category: "Accessories",
    brand: "ConnectX",
    price: 45.99,
    quantity: 156,
    status: "In Stock",
  },
  {
    id: 5,
    name: "Mechanical Gaming Keyboard",
    image: "/placeholder.svg?height=60&width=60",
    category: "Gaming",
    brand: "GameZone",
    price: 189.99,
    quantity: 12,
    status: "Low Stock",
  },
  {
    id: 6,
    name: "4K Webcam HD",
    image: "/placeholder.svg?height=60&width=60",
    category: "Electronics",
    brand: "VisionTech",
    price: 129.99,
    quantity: 67,
    status: "In Stock",
  },
  {
    id: 7,
    name: "Wireless Mouse Ergonomic",
    image: "/placeholder.svg?height=60&width=60",
    category: "Accessories",
    brand: "ClickMaster",
    price: 59.99,
    quantity: 89,
    status: "In Stock",
  },
  {
    id: 8,
    name: "Portable SSD 1TB",
    image: "/placeholder.svg?height=60&width=60",
    category: "Storage",
    brand: "DataVault",
    price: 119.99,
    quantity: 34,
    status: "In Stock",
  },
];

export default function ProductsListPage() {
  const [products] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue - bValue) * modifier;
    });

    return filtered;
  }, [products, searchQuery, sortField, sortDirection]);

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredAndSortedProducts.map((p) => p.id));
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(true);
  };

  const handleExportCSV = () => {
    console.log("Exporting selected products:", selectedProducts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin-products/add">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Product List</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterDrawerOpen(true)}
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Advanced Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedProducts.length ===
                        filteredAndSortedProducts.length &&
                      filteredAndSortedProducts.length > 0
                    }
                    onCheckedChange={toggleAllProducts}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    ID
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Product Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Price
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Qty
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onDoubleClick={() =>
                    (window.location.href = `/admin-products/update?id=${product.id}`)
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="max-w-50 truncate font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.quantity}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "In Stock"
                          ? "default"
                          : product.status === "Low Stock"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        product.status === "In Stock"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : ""
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin-products/update?id=${product.id}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkActionsBar
        selectedCount={selectedProducts.length}
        onDelete={handleBulkDelete}
        onExport={handleExportCSV}
        onClearSelection={() => setSelectedProducts([])}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productName={productToDelete?.name}
        isBulk={!productToDelete && selectedProducts.length > 0}
        bulkCount={selectedProducts.length}
      />

      <AdvancedFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
      />
    </div>
  );
}
