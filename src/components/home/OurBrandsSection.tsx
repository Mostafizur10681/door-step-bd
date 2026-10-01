"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Building2
} from "lucide-react";
import { getBrands, getPartners, ApiBrand, ApiPartner, getMediaUrl } from "@/lib/api";

export interface BrandSlideItem {
  id: string | number;
  name: string;
  logo: string | null;
  link: string;
  type?: "brand" | "partner";
}

export function OurBrandsSection() {
  const [items, setItems] = useState<BrandSlideItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDynamicBrandsAndPartners = async () => {
      try {
        setLoading(true);
        const [partnersRes, brandsRes] = await Promise.allSettled([
          getPartners({ per_page: 50, all: 1 }),
          getBrands({ per_page: 50, all: 1 })
        ]);

        if (!isMounted) return;

        const partnerItems: BrandSlideItem[] = [];
        const brandItems: BrandSlideItem[] = [];

        // 1. Process Dynamic Partners API
        if (partnersRes.status === "fulfilled" && partnersRes.value.success && Array.isArray(partnersRes.value.data)) {
          partnersRes.value.data.forEach((p: ApiPartner, idx: number) => {
            let logoUrl: string | null = null;
            if (p.logo && typeof p.logo === "string" && p.logo.trim()) {
              logoUrl = p.logo.trim().startsWith("data:") ? p.logo.trim() : getMediaUrl(p.logo);
            } else if (p.logo_url) {
              logoUrl = p.logo_url;
            } else if (p.image && typeof p.image === "string" && p.image.trim()) {
              logoUrl = p.image.trim().startsWith("data:") ? p.image.trim() : getMediaUrl(p.image);
            } else if (p.image_url) {
              logoUrl = p.image_url;
            }

            const partnerName = p.name || p.title || `Partner ${idx + 1}`;
            const targetLink = p.website || p.url || p.link || `/all-products?brand=${encodeURIComponent(partnerName)}`;
            
            partnerItems.push({
              id: p.id || `partner-${idx}`,
              name: partnerName,
              logo: logoUrl,
              link: targetLink,
              type: "partner"
            });
          });
        }

        // 2. Process Dynamic Brands API
        if (brandsRes.status === "fulfilled" && brandsRes.value.success && Array.isArray(brandsRes.value.data)) {
          brandsRes.value.data.forEach((b: ApiBrand, idx: number) => {
            let logoUrl: string | null = null;
            if (b.logo && typeof b.logo === "string" && b.logo.trim()) {
              logoUrl = b.logo.trim().startsWith("data:") ? b.logo.trim() : getMediaUrl(b.logo);
            } else if (b.logo_url) {
              logoUrl = b.logo_url;
            }

            brandItems.push({
              id: b.id || `brand-${idx}`,
              name: b.name,
              logo: logoUrl,
              link: `/all-products?brand=${encodeURIComponent(b.slug || b.name)}`,
              type: "brand"
            });
          });
        }

        // Strictly combine only the dynamic items from database
        const combined = [...partnerItems, ...brandItems];
        setItems(combined);
      } catch (err) {
        console.warn("Failed to load dynamic brands & partners:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDynamicBrandsAndPartners();
    return () => { isMounted = false; };
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // If no dynamic data and done loading, don't show static data
  if (!loading && items.length === 0) {
    return null;
  }

  // Duplicate dynamic items so the infinite marquee flows continuously
  const displayItems = items.length > 0
    ? (items.length < 6 
        ? [...items, ...items, ...items, ...items, ...items, ...items] 
        : [...items, ...items, ...items])
    : [];

  return (
    <section 
      className="w-full bg-[#f8fafc] py-12 sm:py-16 md:py-20 border-b border-slate-200/80 relative overflow-hidden" 
      suppressHydrationWarning
    >
      {/* Background Architectural Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(#122B5A 1px, transparent 1px), linear-gradient(to right, #122B5A 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }}
      />

      {/* Ambient Radial Lighting Spheres */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#FFB800]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#122B5A]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header: Title, Subtitle & Interactive Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black tracking-widest text-[#122B5A] uppercase bg-white border border-[#122B5A]/15 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800] animate-pulse" />
              <span>Our Own Brand & Official Partners</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#122B5A] tracking-tight uppercase">
              OURS BRANDS
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Authorized supply chain, certified engineering components, and turnkey industrial energy systems backed by direct warranty.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Slider Manual Left / Right Arrows */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Previous Brand"
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-[#122B5A] hover:text-white text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Next Brand"
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-[#122B5A] hover:text-white text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* View All Button matching the theme */}
            <Link
              href="/brands"
              className="group/btn inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-black uppercase text-xs tracking-wider px-6 sm:px-7 py-3 rounded-xl shadow-xs hover:shadow-md transition-all whitespace-nowrap cursor-pointer touch-manipulation"
            >
              <span>View ALL</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        {/* Dynamic Brand Image Slider Track */}
        <div 
          className="relative w-full overflow-hidden rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/90 py-6 sm:py-8 px-2 sm:px-4 shadow-sm hover:shadow-md transition-all duration-300 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Left & Right Gradient Fog Mask */}
          <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

          {loading ? (
            /* Loading Skeleton */
            <div className="flex items-center gap-4 sm:gap-6 overflow-hidden px-2">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div 
                  key={sk}
                  className="shrink-0 w-44 sm:w-56 md:w-64 h-24 sm:h-28 md:h-32 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : (
            /* Dynamic Marquee Track with Smooth Infinite Momentum */
            <div 
              ref={sliderRef}
              className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth relative z-10"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              <div 
                className={`flex items-center gap-4 sm:gap-6 shrink-0 ${isPaused ? "animate-none" : "animate-[brandMarquee_30s_linear_infinite]"}`}
              >
                {displayItems.map((item, idx) => (
                  <Link
                    key={`${item.id}-${idx}`}
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    title={item.name}
                    className="group/item relative shrink-0 w-44 sm:w-56 md:w-64 h-24 sm:h-28 md:h-32 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#FFB800] rounded-2xl p-4 flex items-center justify-center transition-all duration-500 ease-out hover:shadow-xl hover:shadow-[#122B5A]/8 hover:-translate-y-1.5 cursor-pointer overflow-hidden block"
                  >
                    {/* Dynamic Top Gold Accent Strip on Hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover/item:bg-gradient-to-r group-hover/item:from-[#122B5A] group-hover/item:via-[#FFB800] group-hover/item:to-[#122B5A] transition-all duration-300" />

                    {/* Logo Container: Direct Crisp Rendering with Grayscale to Color Transition */}
                    {item.logo ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="max-h-full max-w-full w-auto h-auto object-contain filter grayscale contrast-125 opacity-80 group-hover/item:grayscale-0 group-hover/item:contrast-100 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-slate-700 group-hover/item:text-[#122B5A] font-extrabold text-xs sm:text-sm text-center px-2">
                        <Building2 className="w-5 h-5 text-[#FFB800] shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes brandMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}
