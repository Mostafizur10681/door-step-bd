"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import slidersData from "@/data/sliders.json";
import productsData from "@/data/products.json";
import { 
  Zap, ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, Flame, 
  ChevronRight as ChevronRightIcon
} from "lucide-react";

import { getBanners } from "@/lib/api";

export function HeroSlider() {
  const [slides, setSlides] = useState<any[]>(slidersData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Function to load dynamic banners from API or local storage cache
  const loadDynamicBanners = async () => {
    try {
      const res = await getBanners();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const activeBanners = res.data
          .filter((b) => b.is_active !== false)
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        if (activeBanners.length > 0) {
          const formatted = activeBanners.map((b) => {
            let t1 = b.title_line1 || b.titleLine1 || b.title || "";
            let t2 = b.title_line2 || b.titleLine2 || "";

            const desktopImg = b.desktop_image || b.image || "/hero_honey.png";
            const mobileImg = b.mobile_image || b.desktop_image || b.image || "/hero_honey.png";

            return {
              id: b.id,
              title: b.title || "Special Campaign",
              tagline: b.badge || b.tagline || "",
              titleLine1: t1,
              titleLine2: t2,
              discountText: b.subtitle || b.discount_text || b.discountText || "",
              linkUrl: b.cta_link || b.ctaLink || b.link || "/all-products",
              ctaText: (b.cta_text && b.cta_text.trim()) ? b.cta_text.trim() : (b.ctaText && b.ctaText.trim() ? b.ctaText.trim() : ""),
              bgColor: b.bg_color || "linear-gradient(135deg, #0b2545 0%, #134074 50%, #8d0801 100%)",
              desktopImage: desktopImg,
              mobileImage: mobileImg,
              image: desktopImg,
            };
          });
          setSlides(formatted);
          return;
        }
      }
      setSlides(slidersData);
    } catch (err) {
      console.error("Failed to load banners:", err);
      setSlides(slidersData);
    }
  };

  useEffect(() => {
    loadDynamicBanners();

    // Listen for banner update events dispatched by Admin Panel
    const handleBannerUpdate = () => {
      loadDynamicBanners();
    };

    window.addEventListener("banners_updated", handleBannerUpdate);
    return () => {
      window.removeEventListener("banners_updated", handleBannerUpdate);
    };
  }, []);

  const totalSlides = slides.length;

  // Auto slide advance every 5 seconds when not hovered
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-900 group select-none shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ═══ SSB Leather Style Full-Width Banner Track ═══ */}
      <div 
        className="flex transition-transform duration-700 ease-out will-change-transform w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[1500/570]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const hasText = Boolean(slide.titleLine1 || slide.titleLine2 || slide.discountText || slide.tagline);
          const hasCta = Boolean((slide.ctaText && slide.ctaText.trim()) || (slide.cta_text && slide.cta_text.trim()));
          const hasOverlay = hasText || hasCta;
          const link = slide.linkUrl || "/all-products";

          return (
            <div 
              key={slide.id || idx}
              className="w-full h-full flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-slate-950"
              style={{
                background: slide.bgColor || "#0b2545",
              }}
            >
              <Link 
                href={link} 
                className="absolute inset-0 w-full h-full z-10 block cursor-pointer"
                title={slide.title || "View Campaign"}
              >
                {/* Responsive Banner Artwork Image - Displays 100% Full Picture */}
                <picture className="w-full h-full block">
                  {slide.mobileImage && (
                    <source 
                      media="(max-width: 640px)" 
                      srcSet={slide.mobileImage || slide.desktopImage || slide.image} 
                    />
                  )}
                  {slide.desktopImage && (
                    <source 
                      media="(min-width: 641px)" 
                      srcSet={slide.desktopImage || slide.image} 
                    />
                  )}
                  <img
                    src={slide.desktopImage || slide.image || "/hero_honey.png"}
                    alt={slide.title || "Banner"}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero_honey.png";
                    }}
                  />
                </picture>

                {/* Responsive Gradient Shade for Crystal-Clear Typography on all devices */}
                {hasOverlay && (
                  <div className={`absolute inset-0 flex items-center ${hasText ? "bg-gradient-to-r from-black/60 via-black/25 to-transparent" : "pointer-events-none"}`}>
                    <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 w-full pointer-events-auto">
                      <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl space-y-2 sm:space-y-3.5 md:space-y-4 text-white">
                        {slide.tagline && (
                          <div className="inline-flex items-center gap-1.5 bg-[#FF6600] text-white text-[9px] sm:text-xs font-black uppercase tracking-widest px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-lg">
                            {slide.tagline}
                          </div>
                        )}

                        {(slide.titleLine1 || slide.titleLine2) && (
                          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-lg leading-[1.1] sm:leading-tight">
                            {slide.titleLine1} {slide.titleLine2 && <span className="text-amber-300 block mt-0.5 sm:mt-1">{slide.titleLine2}</span>}
                          </h2>
                        )}

                        {slide.discountText && (
                          <p className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-amber-200 drop-shadow-md tracking-wide">
                            {slide.discountText}
                          </p>
                        )}

                        {hasCta && (
                          <div className="pt-1 sm:pt-2">
                            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FF6600] hover:bg-[#e65a00] text-white text-[11px] sm:text-xs md:text-sm font-extrabold uppercase px-4 sm:px-7 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                              {slide.ctaText || slide.cta_text}
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ═══ Navigation Controls (SSB Leather Style Sleek Circular Buttons) ═══ */}
      {totalSlides > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2.5 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-[#FF6600] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl opacity-90 sm:opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2.5 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-[#FF6600] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl opacity-90 sm:opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Bottom Pagination Dots / Pills */}
          <div className="absolute bottom-3 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx 
                    ? "w-6 sm:w-8 bg-[#FF6600] shadow-sm shadow-[#FF6600]/60" 
                    : "w-1.5 sm:w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function CategoryGrid() {
  const categories = [
    { name: "Organic Food", count: "120+ Items", icon: "🌱", color: "bg-emerald-500/10 text-emerald-600" },
    { name: "Beauty", count: "95+ Items", icon: "✨", color: "bg-rose-500/10 text-rose-600" },
    { name: "Food Supplements", count: "340+ Items", icon: "💊", color: "bg-amber-500/10 text-amber-600" },
    { name: "Health", count: "65+ Items", icon: "🩺", color: "bg-blue-500/10 text-blue-600" },
    { name: "Babies Hub", count: "80+ Items", icon: "👶", color: "bg-purple-500/10 text-purple-600" },
    { name: "Pharma Point", count: "210+ Items", icon: "🏥", color: "bg-cyan-500/10 text-cyan-600" },
  ];

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
          <p className="text-xs text-slate-500">Pure, organic & authentic everyday essentials</p>
        </div>
        <Link href="/categories" className="text-sm font-bold text-[#002B49] hover:text-[#FF6600] flex items-center gap-1">
          See All Categories <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat, idx) => (
          <Link key={idx} href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center hover:shadow-xl hover:border-[#FF6600]/40 transition group cursor-pointer">
            <div className={`w-14 h-14 mx-auto rounded-2xl ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner`}>
              {cat.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#FF6600] transition">{cat.name}</h3>
            <span className="text-[11px] text-slate-400">{cat.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 hover:shadow-xl hover:border-[#FF6600]/30 transition group flex flex-col justify-between relative">
      {/* Badges */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
        {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
          <span className="bg-[#FF6600] text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md">
            -{product.discountPercentage}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="bg-[#002B49] text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-5 right-5 z-10 bg-white/80 hover:bg-white text-slate-400 hover:text-[#FF6600] p-2 rounded-full shadow-md backdrop-blur-md transition">
        <Heart className="w-4 h-4" />
      </button>

      <div>
        {/* Product Image Box */}
        <div className="w-full h-48 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
          <Image 
            src={product.mainImage} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-contain p-2"
          />
        </div>

        {/* Title & Rating */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1 text-amber-500 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold">{product.rating}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-[#002B49] transition leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price & Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          {Boolean(product.originalPrice && product.originalPrice > product.price) && (
            <div className="text-slate-400 line-through text-xs font-semibold">
              ৳{product.originalPrice}
            </div>
          )}
          <div className="text-[#FF6600] font-black text-lg">
            ৳{product.price}
          </div>
        </div>
        <button className="bg-[#002B49] hover:bg-[#FF6600] text-white p-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer">
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function FlashSaleSection() {
  const flashSaleProducts = productsData.filter((p) => p.isFlashSale);

  return (
    <div className="bg-[#002B49] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6600] text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Flash Sale Offers <span className="text-[#FF6600] text-xs font-bold bg-white px-2.5 py-0.5 rounded-full shadow-xs">Limited Time</span>
            </h2>
            <p className="text-xs text-blue-200">Grab pure & healthy organic offers at discounted prices!</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-blue-200">Ends In:</span>
          <div className="flex items-center gap-1">
            <span className="bg-[#FF6600] px-2.5 py-1 rounded-lg text-white">08h</span> :
            <span className="bg-[#FF6600] px-2.5 py-1 rounded-lg text-white">42m</span> :
            <span className="bg-[#FF6600] px-2.5 py-1 rounded-lg text-white">19s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {flashSaleProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

