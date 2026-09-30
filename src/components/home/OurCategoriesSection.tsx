"use client";

import React, { useState, useEffect } from "react";
import { Activity, Layers, Zap } from "lucide-react";
import { getCategories, ApiCategory, getMediaUrl } from "@/lib/api";

const FALLBACK_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
];

export function OurCategoriesSection() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDynamicCategories = async () => {
      try {
        setLoading(true);
        const res = await getCategories(true);
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const activeList = res.data.filter((c) => c.status !== false && c.status !== 0);
          setCategories(activeList.length > 0 ? activeList : res.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.warn("Error fetching categories:", err);
        setCategories([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDynamicCategories();
    return () => { isMounted = false; };
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section 
      className="w-full bg-[#f8fafc] py-12 sm:py-16 md:py-20 border-b border-slate-200/80 relative overflow-hidden" 
      suppressHydrationWarning
    >
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(#122B5A 1px, transparent 1px), linear-gradient(to right, #122B5A 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Subtle Glow Spheres */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#122B5A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-2 mb-8 sm:mb-12 text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest text-[#122B5A] uppercase bg-amber-100/80 border border-amber-300/80 px-3 py-1 rounded-full shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800] animate-pulse" />
            <span>Equipment Categories</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#122B5A] tracking-tight">
            Our Categories
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Engineered electrical, generation, and renewable power infrastructure built to international safety standards with turnkey commissioning.
          </p>
        </div>

        {/* Categories Grid (Styled like Service Cards with Full Background Images, Gradient Overlay, Title, and Description - No Redirect) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="h-72 sm:h-80 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-pulse flex flex-col justify-end">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categories.map((cat, idx) => {
              const imageSrc = cat.image 
                ? (cat.image.startsWith("data:") ? cat.image : getMediaUrl(cat.image)) 
                : FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];

              return (
                <div
                  key={cat.id || idx}
                  className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out border border-slate-200/80 hover:border-[#FFB800]/80 block"
                >
                  {/* Background Image with Zoom on Hover */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];
                      }}
                    />
                  </div>

                  {/* Dynamic Dark Navy Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38] via-[#122B5A]/70 to-transparent opacity-85 group-hover:opacity-95 transition-all duration-500" />

                  {/* Subtle Light-Sweep Shine Ray on Hover */}
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none z-20" />

                  {/* Expanding Top Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300 z-20" />

                  {/* Bottom Content (Badge, Title, and Description - No Redirect Button) */}
                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end gap-2.5 z-10 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                    <span className="inline-block self-start text-[10px] font-bold uppercase tracking-widest text-[#FFB800] bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-sm border border-[#FFB800]/30 group-hover:bg-[#FFB800] group-hover:text-[#122B5A] group-hover:border-[#FFB800] transition-colors duration-300 drop-shadow-xs">
                      Equipment Portfolio
                    </span>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-200 transition-colors duration-300">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="text-xs sm:text-xs text-blue-100/90 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
