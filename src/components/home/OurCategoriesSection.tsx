"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Factory, Zap, Sun, Shield, BatteryMedium, Sliders, 
  Cpu, Wrench, ArrowRight, Grid3X3
} from "lucide-react";
import { API_V1 } from "@/lib/api";

interface CategoryCard {
  id: string | number;
  name: string;
  slug: string;
  count?: string;
  iconName?: string;
  desc?: string;
}

const DEFAULT_CATEGORIES: CategoryCard[] = [
  {
    id: 1,
    name: "Diesel & Gas Generators",
    slug: "generators",
    count: "50 kVA - 3000 kVA",
    desc: "Cummins, Perkins, and Ricardo powered soundproof generator sets.",
    iconName: "factory",
  },
  {
    id: 2,
    name: "Substations & Transformers",
    slug: "substations",
    count: "11kV / 0.415kV",
    desc: "Complete turnkey substation equipment, transformers & HT panels.",
    iconName: "zap",
  },
  {
    id: 3,
    name: "Solar & Hybrid Inverters",
    slug: "solar-energy",
    count: "Tier-1 Panels",
    desc: "On-grid, off-grid and hybrid industrial rooftop solar systems.",
    iconName: "sun",
  },
  {
    id: 4,
    name: "HT / LT Switchgear Panels",
    slug: "switchgear",
    count: "Custom Built",
    desc: "Low voltage distribution boards and high-tension vacuum breakers.",
    iconName: "shield",
  },
  {
    id: 5,
    name: "Online UPS & Battery Banks",
    slug: "ups-systems",
    count: "Zero Millisecond",
    desc: "High-frequency true online double-conversion power backup.",
    iconName: "battery",
  },
  {
    id: 6,
    name: "Automatic Transfer Switches",
    slug: "ats-panels",
    count: "Automated",
    desc: "Automatic mains failure (AMF) and synchronized changeover boards.",
    iconName: "sliders",
  },
  {
    id: 7,
    name: "PFI & Power Quality Plants",
    slug: "pfi-plants",
    count: "Power Factor",
    desc: "Automatic power factor improvement and harmonic active filters.",
    iconName: "cpu",
  },
  {
    id: 8,
    name: "Generator Spare Parts",
    slug: "spare-parts",
    count: "100% Genuine",
    desc: "OEM filters, AVRs, electronic controllers, and engine spares.",
    iconName: "wrench",
  },
];

const iconMap: Record<string, any> = {
  factory: Factory,
  zap: Zap,
  sun: Sun,
  shield: Shield,
  battery: BatteryMedium,
  sliders: Sliders,
  cpu: Cpu,
  wrench: Wrench,
};

export function OurCategoriesSection() {
  const [categories, setCategories] = useState<CategoryCard[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchApiCategories = async () => {
      try {
        const res = await fetch(`${API_V1}/categories?all=1`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CategoryCard[] = data.slice(0, 8).map((cat: any, idx: number) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug || String(cat.id),
            count: `${cat.products_count || cat.productsCount || 10}+ Items`,
            desc: cat.description || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].desc,
            iconName: DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].iconName,
          }));
          if (mapped.length >= 4) {
            setCategories(mapped);
          }
        }
      } catch {
        // Keep default curated power solution categories
      }
    };

    fetchApiCategories();
  }, []);

  return (
    <section className="w-full bg-white py-14 sm:py-20">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#122B5A] uppercase">
              <Grid3X3 className="w-4 h-4 text-[#FFB800]" />
              <span>Product Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#122B5A] tracking-tight">
              Our Categories
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
              Engineered electrical and industrial equipment meeting international quality standards.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#122B5A] hover:text-[#FFB800] transition group shrink-0"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8-Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = (cat.iconName && iconMap[cat.iconName]) || Zap;
            return (
              <Link
                key={cat.id || idx}
                href={`/all-products?category=${encodeURIComponent(cat.slug)}`}
                className="group bg-slate-50/70 hover:bg-[#122B5A] border border-slate-200/90 hover:border-[#122B5A] rounded-xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 block cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-white/10 text-[#122B5A] group-hover:text-[#FFB800] flex items-center justify-center shadow-xs transition-colors border border-slate-200/60 group-hover:border-white/10">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-amber-200/90 bg-white group-hover:bg-white/10 px-2.5 py-1 rounded-full border border-slate-200/60 group-hover:border-white/10 transition-colors">
                      {cat.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    {cat.desc && (
                      <p className="text-xs text-slate-500 group-hover:text-slate-300 mt-1 line-clamp-2 leading-relaxed transition-colors">
                        {cat.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200/60 group-hover:border-white/10 flex items-center justify-between text-xs font-bold text-[#122B5A] group-hover:text-[#FFB800] transition-colors">
                  <span>View Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
