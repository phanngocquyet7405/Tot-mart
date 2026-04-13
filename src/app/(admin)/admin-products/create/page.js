"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const categories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Accessories" },
  { id: "3", name: "Gaming" },
  { id: "4", name: "Storage" },
  { id: "5", name: "Audio" },
];

const brands = [
  { id: "1", name: "AudioMax" },
  { id: "2", name: "TechWear" },
  { id: "3", name: "DeskPro" },
  { id: "4", name: "ConnectX" },
  { id: "5", name: "GameZone" },
];

export default function AddProductPage() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Mô phỏng upload file
    const newImages = [
      {
        id: `img-${Date.now()}`,
        url: "/placeholder.svg?height=100&width=100",
        isMain: images.length === 0,
      },
    ];
    setImages([...images, ...newImages]);
  };

  const handleFileInput = () => {
    // Mô phỏng chọn file
    const newImage = {
      id: `img-${Date.now()}`,
      url: "/placeholder.svg?height=100&width=100",
      isMain: images.length === 0,
    };
    setImages([...images, newImage]);
  };

  const setMainImage = (imageId) => {
    setImages(
      images.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      })),
    );
  };

  const removeImage = (imageId) => {
    const filtered = images.filter((img) => img.id !== imageId);
    if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
      filtered[0].isMain = true;
    }
    setImages(filtered);
  };

  const selectedCategory = categories.find((c) => c.id === category);
  const selectedBrand = brands.find((b) => b.id === brand);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Add New Product
          </h1>
          <p className="text-muted-foreground">Create a new product listing</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Form - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload product images. Click on an image to set it as the main
                image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">
                  Drag and drop images here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleFileInput}
                >
                  Select Images
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={cn(
                        "group relative aspect-square cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
                        image.isMain
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-transparent hover:border-muted-foreground/50",
                      )}
                      onClick={() => setMainImage(image.id)}
                    >
                      <Image
                        src={image.url}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                      {image.isMain && (
                        <div className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Main
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
              <CardDescription>Write a detailed description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/50 p-1">
                <Toggle size="sm" aria-label="Bold">
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Italic">
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Toggle size="sm" aria-label="Bullet List">
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Numbered List">
                  <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Toggle size="sm" aria-label="Insert Link">
                  <LinkIcon className="h-4 w-4" />
                </Toggle>
              </div>
              <Textarea
                placeholder="Enter product description..."
                className="min-h-50 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
            <Button>Create Product</Button>
          </div>
        </div>

        {/* Preview - Right Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your product will appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square relative rounded-lg border bg-muted overflow-hidden">
                {images.length > 0 ? (
                  <Image
                    src={images.find((img) => img.isMain)?.url || images[0].url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {productName || "Product Name"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedBrand && <span>{selectedBrand.name}</span>}
                  {selectedBrand && selectedCategory && <span>•</span>}
                  {selectedCategory && <span>{selectedCategory.name}</span>}
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${price || "0.00"}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      parseInt(quantity || "0") > 0
                        ? "text-primary"
                        : "text-destructive",
                    )}
                  >
                    {parseInt(quantity || "0") > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                  {parseInt(quantity || "0") > 0 && (
                    <span className="text-muted-foreground">
                      ({quantity} units)
                    </span>
                  )}
                </div>
                {description && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {description}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
