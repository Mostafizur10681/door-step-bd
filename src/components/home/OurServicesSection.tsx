"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import { getServices, ApiService, getMediaUrl } from "@/lib/api";

export interface ServiceItem {
  id: string | number;
  slug: string;
  title: string;
  category: string;
  image: string;
  desc?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "solar",
    slug: "solar-power-solutions",
    title: "Solar Power Solutions",
    category: "Renewable Energy",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    desc: "Turnkey commercial & industrial rooftop solar PV installations.",
  },
  {
    id: "maintenance",
    slug: "maintenance-overhaul",
    title: "Maintenance & Overhaul",
    category: "Field Services",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    desc: "24/7 emergency response, major engine overhaul, and diagnostic checks.",
  },
  {
    id: "electricity",
    slug: "electricity-substation",
    title: "Electricity & Substation",
    category: "Power Grid",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    desc: "11kV/0.415kV substation engineering, HT/LT panels, and transformers.",
  },
  {
    id: "construction",
    slug: "construction-erection",
    title: "Construction & Erection",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    desc: "Heavy generator foundation, acoustic canopy room, and exhaust piping.",
  },
  {
    id: "engineering",
    slug: "engineering-energy-audits",
    title: "Engineering & Energy Audits",
    category: "Consultancy",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
    desc: "Harmonic analysis, load calculations, and power factor improvement.",
  },
  {
    id: "automation",
    slug: "automated-systems-sync",
    title: "Automated Systems & Sync",
    category: "Automation",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    desc: "Multi-genset load sharing, automated transfer switches (ATS), and SCADA.",
  },
];

const FALLBACK_SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
];

export function OurServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  useEffect(() => {
    let isMounted = true;
    const loadApiServices = async () => {
      try {
        const res = await getServices({ per_page: 6 });
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ServiceItem[] = res.data.slice(0, 6).map((item: ApiService, idx: number) => {
            const fallback = DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length];
            const cleanImage = item.image 
              ? (item.image.startsWith("data:") ? item.image : getMediaUrl(item.image)) 
              : FALLBACK_SERVICE_IMAGES[idx % FALLBACK_SERVICE_IMAGES.length];

            return {
              id: item.id || item.slug || idx,
              slug: item.slug || String(item.id || idx),
              title: item.title,
              category: fallback.category,
              image: cleanImage,
              desc: item.short_description || item.description?.replace(/<[^>]+>/g, '') || fallback.desc,
            };
          });
          if (mapped.length > 0) {
            setServices(mapped);
          }
        }
      } catch (err) {
        console.warn("Error fetching services:", err);
      }
    };

    loadApiServices();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="w-full bg-[#f8fafc] py-12 sm:py-16 md:py-20 border-y border-slate-200/80 relative overflow-hidden" suppressHydrationWarning>
      {/* Subtle ambient background glow lights */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#122B5A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest text-[#122B5A] uppercase bg-amber-100/80 border border-amber-300/80 px-3 py-1 rounded-full shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800] animate-pulse" />
              <span>What We Offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#122B5A] tracking-tight uppercase">
              OUR SERVICES
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Certified doorstep diagnostic, industrial engineering repair, and turnkey emergency field support delivered across Bangladesh.
            </p>
          </div>

          <Link
            href="/services"
            className="group/btn inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs sm:text-xs tracking-wider px-6 sm:px-8 py-3 rounded-lg shadow-xs hover:shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer self-start sm:self-auto touch-manipulation"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* 6-Card Grid with Service Redirect Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((item, idx) => (
            <Link
              key={item.id || idx}
              href={`/services/${item.slug || item.id}`}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out border border-slate-200/80 hover:border-[#FFB800]/80 block cursor-pointer"
            >
              {/* Background Image with Zoom on Hover */}
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Dynamic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38] via-[#122B5A]/70 to-transparent opacity-85 group-hover:opacity-95 transition-all duration-500" />

              {/* Subtle Light-Sweep Shine Ray on Hover */}
              <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none z-20" />

              {/* Expanding Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300 z-20" />

              {/* Bottom Content & Redirect Action Button */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end gap-3 z-10 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                <div className="space-y-1.5">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#FFB800] bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-sm border border-[#FFB800]/30 group-hover:bg-[#FFB800] group-hover:text-[#122B5A] group-hover:border-[#FFB800] transition-colors duration-300 drop-shadow-xs">
                    {item.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-200 transition-colors duration-300">
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="text-xs text-slate-200/90 line-clamp-2 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>

                {/* Redirect Button inside Card */}
                <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-1">
                  <span className="text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                    Explore Service Details
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/15 group-hover:bg-[#FFB800] group-hover:text-[#122B5A] text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
