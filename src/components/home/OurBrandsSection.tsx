"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Zap, 
  Sun, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  Wind, 
  ArrowUpRight, 
  Sparkles,
  Building2,
  Droplets,
  Factory
} from "lucide-react";
import { getBrands, ApiBrand, getMediaUrl } from "@/lib/api";

export interface InHouseBrand {
  id: string | number;
  name: string;
  division: string;
  category: string;
  tagline: string;
  badge: string;
  features: string[];
  logo?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

const DEFAULT_IN_HOUSE_BRANDS: InHouseBrand[] = [
  {
    id: "doorstep-power",
    name: "Doorstep Power Solutions™",
    division: "Industrial Power Division",
    category: "Generators & Synchronization",
    tagline: "Heavy-duty continuous & standby industrial diesel generators, custom acoustic canopies, and automated load sharing systems.",
    badge: "Flagship Brand",
    features: ["50 kVA - 3000 kVA", "Soundproof Canopies", "Factory Direct Testing"],
    icon: Zap,
    link: "/all-products?category=generators",
  },
  {
    id: "doorstep-solar",
    name: "Doorstep Solar & GreenTech™",
    division: "Renewable Energy Division",
    category: "Commercial Solar & BESS",
    tagline: "Turnkey rooftop solar PV installations, industrial on-grid inverters, and high-efficiency hybrid battery energy storage.",
    badge: "Eco-Friendly Line",
    features: ["Industrial Rooftops", "Hybrid BESS Storage", "Net Metering Ready"],
    icon: Sun,
    link: "/all-products?category=solar",
  },
  {
    id: "doorstep-voltguard",
    name: "Doorstep VoltGuard™ Switchgear",
    division: "Electrical Engineering Division",
    category: "HT / LT Panels & Protection",
    tagline: "Custom-engineered HT/LT distribution switchboards, automatic transfer switches (ATS), and power factor improvement (PFI) plants.",
    badge: "In-House Engineered",
    features: ["Custom HT/LT Boards", "Smart ATS Changeover", "PFI Capacitor Banks"],
    icon: ShieldCheck,
    link: "/all-products?category=switchgear",
  },
  {
    id: "doorstep-cooltech",
    name: "Doorstep CoolTech™ & HVAC",
    division: "Climate & Cooling Division",
    category: "Industrial Cooling & Air Systems",
    tagline: "Precision industrial chillers, heavy factory ventilation systems, and commercial air treatment built for high-ambient climates.",
    badge: "Heavy Climate Line",
    features: ["Industrial Chillers", "Precision Air Systems", "Duct Ventilation"],
    icon: Wind,
    link: "/all-products?category=cooling",
  },
  {
    id: "doorstep-automation",
    name: "Doorstep SmartTech & Security™",
    division: "IoT & Electronics Division",
    category: "Surveillance & Automation",
    tagline: "High-definition IP surveillance cameras, smart power telemetry, factory SCADA monitoring, and automated access control.",
    badge: "Smart Intelligent Line",
    features: ["Full HD IP Cameras", "Cloud Power Telemetry", "SCADA Integration"],
    icon: Cpu,
    link: "/all-products?category=electronics",
  },
  {
    id: "doorstep-care",
    name: "Doorstep Care & Maintenance Hub™",
    division: "Field Engineering Division",
    category: "Technical Care & Spare Parts",
    tagline: "24/7 emergency response engineering, certified engine overhauls, preventative maintenance (AMC), and authentic spare parts.",
    badge: "Certified Support Hub",
    features: ["24/7 Rapid Response", "Genuine Spares Direct", "Annual Maintenance AMC"],
    icon: Wrench,
    link: "/solutions#maintenance",
  },
];

function resolveBrandIcon(name: string, category: string): React.ComponentType<{ className?: string }> {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes("solar") || text.includes("green") || text.includes("renewable")) return Sun;
  if (text.includes("gen") || text.includes("power") || text.includes("engine")) return Zap;
  if (text.includes("substation") || text.includes("switchgear") || text.includes("volt") || text.includes("panel")) return ShieldCheck;
  if (text.includes("hvac") || text.includes("cool") || text.includes("climate") || text.includes("chiller") || text.includes("ventilat")) return Wind;
  if (text.includes("water") || text.includes("etp") || text.includes("stp") || text.includes("ro") || text.includes("filter")) return Droplets;
  if (text.includes("auto") || text.includes("scada") || text.includes("plc") || text.includes("smart") || text.includes("tech") || text.includes("cctv") || text.includes("security")) return Cpu;
  if (text.includes("care") || text.includes("repair") || text.includes("maintenance") || text.includes("service") || text.includes("overhaul")) return Wrench;
  return Building2;
}

export function OurBrandsSection() {
  const [brands, setBrands] = useState<InHouseBrand[]>(DEFAULT_IN_HOUSE_BRANDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadApiBrands = async () => {
      try {
        const res = await getBrands({ per_page: 6 });
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: InHouseBrand[] = res.data.slice(0, 6).map((item: ApiBrand, idx: number) => {
            const iconComp = resolveBrandIcon(item.name, item.category_tag || item.sub_title || "");
            
            // Extract features / key capabilities
            let feats: string[] = [];
            if (Array.isArray(item.key_capabilities) && item.key_capabilities.length > 0) {
              feats = item.key_capabilities.slice(0, 3);
            } else if (item.capacity_range || item.warranty_text) {
              if (item.capacity_range) feats.push(item.capacity_range);
              if (item.warranty_text) feats.push(item.warranty_text);
            } else {
              feats = DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].features;
            }

            return {
              id: item.id || item.slug || idx,
              name: item.name,
              division: item.category_tag || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].division,
              category: item.sub_title || item.category_tag || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].category,
              tagline: item.description || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].tagline,
              badge: item.badge || "Verified Line",
              features: feats,
              logo: item.logo_url || (item.logo ? getMediaUrl(item.logo) : null),
              icon: iconComp,
              link: `/all-products?brand=${encodeURIComponent(item.slug || item.name)}`,
            };
          });

          if (mapped.length > 0) {
            setBrands(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load brands from API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadApiBrands();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="w-full bg-slate-50/70 py-10 sm:py-16 md:py-20 border-b border-slate-200/80 relative overflow-hidden" suppressHydrationWarning>
      {/* Subtle ambient gradient lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#122B5A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest text-[#122B5A] uppercase bg-amber-100/80 border border-amber-300/80 px-3 py-1 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800] animate-pulse" />
              <span>Door Step BD In-House Portfolio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#122B5A] tracking-tight">
              Ours Brands
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Explore Door Step&apos;s exclusive in-house brand lines and specialized engineering divisions built to deliver industrial-grade performance and direct factory warranty.
            </p>
          </div>

          <Link
            href="/brands"
            className="group/btn inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-black uppercase text-xs tracking-wider px-5 sm:px-7 py-3 rounded-lg shadow-xs hover:shadow-md transition-all whitespace-nowrap cursor-pointer self-start sm:self-auto touch-manipulation"
          >
            <span>View ALL</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* In-House Brands Grid (Mobile 1 col -> Tablet 2 col -> Desktop 3 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {brands.map((brand) => {
            const IconComponent = brand.icon;
            return (
              <div
                key={brand.id}
                className="group relative bg-white border border-slate-200/90 hover:border-[#FFB800]/70 rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300 ease-out flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Dynamic Top Accent Strip with Gradient expansion on Hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-slate-200/80 group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300" />

                {/* Subtle Light-Sweep Shine Ray on Hover */}
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Top Row: Division Tag & Brand Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 group-hover:bg-amber-50/80 group-hover:text-[#122B5A] border border-slate-200/80 group-hover:border-amber-300/60 px-2.5 py-1 rounded-full transition-colors duration-300">
                      <Building2 className="w-3 h-3 text-[#122B5A]" />
                      <span className="truncate max-w-[180px]">{brand.division}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#122B5A] bg-[#FFB800] group-hover:bg-amber-400 group-hover:scale-105 px-2.5 py-0.5 rounded-full shadow-2xs transition-transform duration-300">
                      {brand.badge}
                    </span>
                  </div>

                  {/* Brand Emblem & Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#122B5A] to-[#0A1D3D] text-[#FFB800] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:shadow-[#FFB800]/20 transition-all duration-300 overflow-hidden relative">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-1.5 bg-white transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block truncate">
                        {brand.category}
                      </span>
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-[#122B5A] tracking-tight group-hover:text-[#0B1B38] leading-snug transition-colors duration-200">
                        {brand.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {brand.tagline}
                  </p>

                  {/* Feature Tags with Micro-interaction */}
                  {brand.features && brand.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {brand.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] sm:text-[11px] font-semibold text-slate-600 group-hover:text-slate-800 bg-slate-100 group-hover:bg-amber-50/70 border border-slate-200/70 group-hover:border-amber-200 px-2 py-0.5 rounded-md transition-colors duration-300"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}


