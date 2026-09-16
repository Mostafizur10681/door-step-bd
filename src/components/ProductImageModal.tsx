"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName?: string;
}

export function ProductImageModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName = "Product Image",
}: ProductImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images]);

  if (!isOpen || !images || images.length === 0) return null;

  const activeImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Top Controls Bar */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between text-white py-2">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-100 truncate max-w-xs sm:max-w-md">
            {productName}
          </h3>
          {images.length > 1 && (
            <p className="text-xs text-slate-400 font-medium">
              Image {currentIndex + 1} of {images.length}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
            aria-label="Toggle zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
            title="Close image modal"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Main Image Container */}
      <div className="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center my-2 overflow-hidden select-none">
        
        {/* Prev Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-white text-white hover:text-slate-900 transition-all shadow-lg border border-white/20 cursor-pointer"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Image Display */}
        <div
          className={`relative w-full h-full max-h-[75vh] flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={activeImage}
            alt={`${productName} full preview`}
            fill
            sizes="(max-width: 1280px) 100vw, 80vw"
            className="object-contain p-2"
            priority
          />
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-white text-white hover:text-slate-900 transition-all shadow-lg border border-white/20 cursor-pointer"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="relative z-10 max-w-4xl w-full flex items-center justify-center gap-3 overflow-x-auto py-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white ${
                currentIndex === idx
                  ? "border-[#ff8c00] ring-4 ring-[#ff8c00]/30 scale-105"
                  : "border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
