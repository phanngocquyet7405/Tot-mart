"use client";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "./productDetailService";
export function ProductGallery({ images = [], productName, selectedImage, onSelectImage, discountPercent = 0, compact = false }) {
  const gallery = (Array.isArray(images) ? images : []).filter(image => image?.url);
  const current = selectedImage || gallery[0]?.url || PLACEHOLDER_IMAGE;
  return <div className={`tm-gallery ${compact ? 'tm-gallery--compact' : 'lg:col-span-7'}`}>
    <div className="tm-gallery__image">
      <Image src={current} alt={productName || "Ảnh sản phẩm"} fill
        sizes={compact ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 1024px) 100vw, 55vw'}
        className="object-contain p-4 sm:p-6" preload={!compact} unoptimized={current.startsWith('data:')}
        onError={event => { event.currentTarget.srcset = ''; event.currentTarget.src = PLACEHOLDER_IMAGE; }} />
      {discountPercent > 0 && <span className="tm-gallery__discount">Giảm {discountPercent}%</span>}
    </div>
    {gallery.length > 1 && <div className="tm-gallery__thumbnails" role="group" aria-label="Chọn ảnh sản phẩm">
      {gallery.map((image, index) => <button key={`${image.url}-${index}`} type="button"
        onClick={() => onSelectImage(image.url)} aria-label={`Xem ảnh ${index + 1} của ${productName || 'sản phẩm'}`}
        aria-pressed={current === image.url} className="tm-gallery__thumbnail transition-all motion-reduce:transition-none">
        <Image src={image.url} alt="" fill sizes="72px" className="object-contain p-1" />
      </button>)}
    </div>}
  </div>;
}
