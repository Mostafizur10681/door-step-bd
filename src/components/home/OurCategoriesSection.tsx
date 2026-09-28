"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Factory, 
  Zap, 
  Sun, 
  ShieldCheck, 
  BatteryCharging, 
  Cpu, 
  Wrench, 
  ArrowRight, 
  Sparkles,
  Layers,
  ArrowUpRight,
  Gauge,
  Sliders,
  Activity,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { getCategories, ApiCategory } from "@/lib/api";

export interface CategoryCard {
  id: string | number;
  name: string;
  slug: string;
  count?: string;
  spec?: string;
  desc?: string;
  iconName?: string;
  subItems?: string[];
  status?: string;
  code?: string;
}

const DEFAULT_CATEGORIES: CategoryCard[] = [
  {
    id: 1,
    code: "DIV-01",
    name: "Diesel & Gas Generators",
    slug: "generators",
    spec: "50 kVA - 3000 kVA",
    status: "Active Line",
    desc: "Heavy-duty soundproof diesel & gas generator sets engineered for continuous factory and standby loads.",
    iconName: "factory",
    subItems: ["Acoustic Canopies", "Auto-Synchronizing", "ATS Panels"],
  },
  {
    id: 2,
    code: "DIV-02",
    name: "Substations & Transformers",
    slug: "substations",
    spec: "11kV / 0.415kV",
    status: "Turnkey EPC",
    desc: "Turnkey electrical substations, oil-immersed & dry cast-resin transformers, and vacuum circuit breakers.",
    iconName: "zap",
    subItems: ["11kV VCB Switchgear", "Distribution Transformers", "Earthing Grid"],
  },
  {
    id: 3,
    code: "DIV-03",
    name: "Solar & Hybrid Energy",
    slug: "solar-energy",
    spec: "Tier-1 Solar PV",
    status: "Net-Metering",
    desc: "Commercial rooftop solar power plants, on-grid string inverters, and hybrid BESS battery storage.",
    iconName: "sun",
    subItems: ["Rooftop Solar EPC", "Hybrid Inverters", "Government Approvals"],
  },
  {
    id: 4,
    code: "DIV-04",
    name: "HT / LT Switchgear Panels",
    slug: "switchgear",
    spec: "Custom Fabricated",
    status: "IEC Standard",
    desc: "Custom low-tension distribution boards, motor control centers (MCC), and high-capacity copper busbars.",
    iconName: "shield",
    subItems: ["LT Distribution", "MCC / VFD Boards", "Custom Busbar Trunking"],
  },
  {
    id: 5,
    code: "DIV-05",
    name: "Online UPS & Battery Systems",
    slug: "ups-systems",
    spec: "0ms Transfer Time",
    status: "Medical & IT",
    desc: "Double-conversion true online UPS and high-density Lithium-ion energy storage systems for critical loads.",
    iconName: "battery",
    subItems: ["True Online 3-Phase", "LiFePO4 Storage", "SNMP Telemetry"],
  },
  {
    id: 6,
    code: "DIV-06",
    name: "PFI & Power Factor Plants",
    slug: "pfi-plants",
    spec: "Power Factor >0.98",
    status: "Harmonic Filter",
    desc: "Microprocessor-controlled capacitor banks, active harmonic filters (AHF), and transient surge suppressors.",
    iconName: "cpu",
    subItems: ["Auto Capacitor Banks", "Detuned Reactors", "Harmonic Audits"],
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  factory: Factory,
  zap: Zap,
  sun: Sun,
  shield: ShieldCheck,
  battery: BatteryCharging,
  sliders: Sliders,
  cpu: Cpu,
  wrench: Wrench,
  gauge: Gauge,
};

function resolveCategoryIcon(name: string): React.ComponentType<{ className?: string }> {
  const t = name.toLowerCase();
  if (t.includes("solar") || t.includes("sun") || t.includes("green") || t.includes("renew")) return Sun;
  if (t.includes("substation") || t.includes("transformer") || t.includes("power") || t.includes("electric")) return Zap;
  if (t.includes("generator") || t.includes("diesel") || t.includes("gas") || t.includes("engine")) return Factory;
  if (t.includes("switchgear") || t.includes("panel") || t.includes("shield") || t.includes("breaker")) return ShieldCheck;
  if (t.includes("ups") || t.includes("battery") || t.includes("ips") || t.includes("charge")) return BatteryCharging;
  if (t.includes("pfi") || t.includes("filter") || t.includes("capacitor") || t.includes("harmonic")) return Cpu;
  if (t.includes("spare") || t.includes("repair") || t.includes("maintenance") || t.includes("tool")) return Wrench;
  return Zap;
}

export function OurCategoriesSection() {
  const [categories, setCategories] = useState<CategoryCard[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const fetchApiCategories = async () => {
      try {
        const res = await getCategories(true);
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: CategoryCard[] = res.data.slice(0, 6).map((cat: ApiCategory, idx: number) => {
            const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];
            const subs = cat.sub_categories?.map(s => s.name).slice(0, 3) || fallback.subItems;
            return {
              id: cat.id,
              code: `DIV-0${idx + 1}`,
              name: cat.name,
              slug: cat.slug || String(cat.id),
              spec: fallback.spec,
              status: fallback.status,
              desc: cat.description || fallback.desc,
              iconName: fallback.iconName,
              subItems: subs,
            };
          });
          if (mapped.length >= 3) {
            setCategories(mapped);
          }
        }
      } catch {
        // Fallback silently
      }
    };

    fetchApiCategories();
    return () => { isMounted = false; };
  }, []);

  return (
    <section 
      className="w-full bg-[#f8fafc] py-14 sm:py-18 md:py-24 border-b border-slate-200/80 relative overflow-hidden" 
      suppressHydrationWarning
    >
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(#122B5A 1px, transparent 1px), linear-gradient(to right, #122B5A 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Subtle Glow Spheres */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[#122B5A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black tracking-widest text-[#122B5A] uppercase bg-white border border-[#122B5A]/15 px-3.5 py-1.5 rounded-lg shadow-xs">
              <Activity className="w-3.5 h-3.5 text-[#FFB800] animate-pulse" />
              <span>Turnkey Equipment Architecture</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#122B5A] tracking-tight">
              Our Categories
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Engineered electrical, generation, and renewable power infrastructure built to international safety standards with turnkey commissioning.
            </p>
          </div>

          <Link
            href="/categories"
            className="group/btn inline-flex items-center justify-center gap-2.5 bg-[#122B5A] hover:bg-[#0B1B38] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider px-6 sm:px-8 py-3.5 rounded-xl shadow-md shadow-[#122B5A]/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span className="text-[#FFB800]">View All Categories</span>
            <div className="w-5 h-5 rounded-full bg-white/10 group-hover/btn:bg-[#FFB800] text-white group-hover/btn:text-[#122B5A] flex items-center justify-center transition-all duration-300 group-hover/btn:translate-x-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* 3-Cards Per Row Layout (Unique Architectural Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, idx) => {
            const IconComp = (cat.iconName && iconMap[cat.iconName]) || resolveCategoryIcon(cat.name);

            return (
              <Link
                key={cat.id || idx}
                href={`/all-products?category=${encodeURIComponent(cat.slug)}`}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#FFB800] p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-[#122B5A]/12 hover:-translate-y-2 cursor-pointer overflow-hidden block"
              >
                {/* Background Blueprint Grid Watermark on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(#122B5A 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                  }}
                />

                {/* Animated Top Golden Glow Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#122B5A] group-hover:via-[#FFB800] group-hover:to-[#122B5A] transition-all duration-500" />

                <div className="space-y-5 relative z-10">
                  
                  {/* Card Header: Division Tag & Live Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#122B5A] bg-[#122B5A]/8 px-2.5 py-1 rounded-md">
                        {cat.code || `DIV-${String(idx + 1).padStart(2, "0")}`}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{cat.status || "Verified"}</span>
                      </div>
                    </div>

                    {cat.spec && (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-md">
                        {cat.spec}
                      </span>
                    )}
                  </div>

                  {/* Main Emblem & Title Row */}
                  <div className="flex items-start gap-4 pt-1">
                    {/* High-Tech Animated Icon Hub */}
                    <div className="relative shrink-0">
                      {/* Outer Dashed Rotating Ring Effect on Hover */}
                      <div className="absolute -inset-1.5 rounded-2xl border border-dashed border-[#FFB800]/0 group-hover:border-[#FFB800]/70 group-hover:rotate-45 transition-all duration-700 pointer-events-none" />
                      
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#122B5A] via-[#16356E] to-[#0A1D3D] text-[#FFB800] flex items-center justify-center shadow-md shadow-[#122B5A]/20 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#FFB800]/25 transition-all duration-300">
                        <IconComp className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-[#122B5A] tracking-tight group-hover:text-[#0B1B38] leading-snug transition-colors duration-200">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  {/* Equipment Scope Chips (Interactive Pill Showcase) */}
                  {cat.subItems && cat.subItems.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <Layers className="w-3 h-3 text-[#FFB800]" />
                        <span>Included Scope & Sub-Types</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subItems.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] sm:text-[11px] font-semibold text-slate-600 group-hover:text-[#122B5A] bg-slate-50 group-hover:bg-[#FFB800]/15 border border-slate-200/70 group-hover:border-[#FFB800]/50 px-2.5 py-1 rounded-lg transition-all duration-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Animated High-Tech Bottom Action Bar */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#122B5A] group-hover:text-amber-800 transition-colors">
                    <span>Direct Catalog & Specs</span>
                  </div>

                  {/* High-Contrast Interactive Launcher Button */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#FFB800] text-[#122B5A] flex items-center justify-center shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Comprehensive Engineering Directory Strip */}
        <div className="mt-12 sm:mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/15 text-[#122B5A] flex items-center justify-center shrink-0 hidden sm:flex">
              <Sparkles className="w-6 h-6 text-[#FFB800]" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#122B5A]">
                Need Custom Capacities or Turnkey Project Engineering?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Browse our complete category directory with real-time specs filter or consult directly with lead engineers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/categories"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Explore All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
