"use client";

import { useState } from "react";
import Image from "next/image";
import type { WPImage } from "@flavor/core/lib/wordpress/types";

interface ProductGalleryProps {
  mainImage?: WPImage | null;
  galleryImages?: WPImage[];
}

export function ProductGallery({
  mainImage,
  galleryImages = [],
}: ProductGalleryProps) {
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...galleryImages,
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const selected = allImages[selectedIndex];

  return (
    <div>
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        <Image
          src={selected.sourceUrl}
          alt={selected.altText || "Product image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Product images">
          {allImages.map((img, index) => (
            <button
              key={img.sourceUrl}
              type="button"
              role="radio"
              aria-checked={index === selectedIndex}
              aria-label={img.altText || `Product image ${index + 1}`}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={img.sourceUrl}
                alt={img.altText || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
