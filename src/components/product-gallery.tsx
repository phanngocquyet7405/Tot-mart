'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: Array<{
    url: string;
    alt?: string;
  }>;
  productName: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
  initialFavorite?: boolean;
}

export function ProductGallery({
  images = [],
  productName,
  onFavoriteChange,
  initialFavorite = false,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const validImages = useMemo(() => {
    return images.filter((img) => img?.url).slice(0, 12);
  }, [images]);

  const selectedImage = validImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteToggle = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    onFavoriteChange?.(newValue);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  if (!validImages.length) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-xl aspect-square">
        <div className="text-center space-y-2">
          <div className="text-slate-400">
            <Image 
              width={48} 
              height={48} 
              src="/placeholder-product.png" 
              alt="No image"
              className="mx-auto opacity-50"
            />
          </div>
          <p className="text-sm text-slate-500">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 group">
        {isLoadingMain && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
          </div>
        )}

        {selectedImage && !imageErrors[selectedIndex] ? (
          <Image
            src={selectedImage.url}
            alt={selectedImage.alt || productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setIsLoadingMain(false)}
            onError={() => handleImageError(selectedIndex)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-500">Image failed to load</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute right-4 top-4 rounded-full bg-white shadow-lg p-2.5 hover:shadow-xl transition-all hover:scale-110 z-20"
          aria-label="Add to favorites"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              isFavorite
                ? 'fill-red-500 stroke-red-500'
                : 'stroke-slate-400 hover:stroke-red-500'
            }`}
          />
        </button>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-indigo-600 ring-2 ring-indigo-300/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              {!imageErrors[idx] ? (
                <Image
                  src={img.url}
                  alt={`${productName} view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xs text-slate-400">Failed</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
