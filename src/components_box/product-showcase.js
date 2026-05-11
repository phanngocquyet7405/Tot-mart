"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const productImages = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=800&fit=crop",
];

const productBadges = ["Best Seller", "Limited Edition", "New Arrival"];

export function ProductShowcase() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + productImages.length) % productImages.length,
    );
  };

  // Hàm xử lý cuộn xuống phần ChoosePlan
  const handleScrollToChoosePlan = () => {
    const element = document.getElementById("choose-plan");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Image Slider */}
          <div className="relative">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-card shadow-2xl">
              {productImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentImage ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {productBadges.map((badge, index) => (
                  <span
                    key={index}
                    className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImage ? "bg-primary w-8" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              This Month&apos;s Box
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4 leading-tight text-balance">
              Spring Awakening Collection
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-muted-foreground">(2,847 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-foreground">$49.99</span>
              <span className="text-xl text-muted-foreground line-through">
                $89.99
              </span>
              <span className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded">
                44% OFF
              </span>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Embrace the season of renewal with our Spring Awakening box.
              Featuring 7 handpicked items from artisan makers including
              botanical skincare, organic teas, handcrafted candles, and unique
              home decor pieces.
            </p>

            {/* Product Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Items Included", value: "7 Products" },
                { label: "Retail Value", value: "$150+" },
                { label: "Ships By", value: "April 15th" },
                { label: "Subscription", value: "Cancel Anytime" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-4 border border-border"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-foreground font-semibold mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleScrollToChoosePlan}
                className="w-full md:w-auto bg-[#C85C3C] hover:bg-[#B14B2D] text-white px-10 py-7 rounded-2xl text-lg font-bold transition-all hover:translate-y-0.5 flex items-center justify-center cursor-pointer shadow-lg"
              >
                Subscribe Now <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
