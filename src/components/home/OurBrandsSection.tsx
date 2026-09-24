"use client";

import React from "react";
import Link from "next/link";
import { Award, CheckCircle2, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

export interface FeaturedBrand {
  id: string;
  name: string;
  origin: string;
  category: string;
  tagline: string;
  highlight: string;
  link: string;
}

const TOP_6_BRANDS: FeaturedBrand[] = [
  {
    id: "cummins",
    name: "Cummins Power",
    origin: "USA",
    category: "Heavy Diesel Gensets",
    tagline: "World-class heavy-duty continuous & standby generator systems (50kVA - 3000kVA).",
    highlight: "OEM Authorized Partner",
    link: "/all-products?search=cummins",
  },
  {
    id: "perkins",
    name: "Perkins Engines",
    origin: "United Kingdom",
    category: "Industrial Power",
    tagline: "Ultra-reliable British engineered diesel engines with exceptional fuel efficiency.",
    highlight: "100% Genuine Import",
    link: "/all-products?search=perkins",
  },
  {
    id: "schneider",
    name: "Schneider Electric",
    origin: "France",
    category: "HT / LT Switchgear",
    tagline: "Intelligent medium & low voltage switchboards, vacuum breakers, and protection relays.",
    highlight: "Tier-1 Electrical Partner",
    link: "/all-products?search=schneider",
  },
  {
    id: "abb",
    name: "ABB Power Grids",
    origin: "Switzerland",
    category: "Transformers & Drives",
    tagline: "Global benchmark for power distribution transformers, switchgear, and motor drives.",
    highlight: "Certified Partner",
    link: "/all-products?search=abb",
  },
  {
    id: "cat",
    name: "Caterpillar (CAT)",
    origin: "USA",
    category: "Prime Power Equipment",
    tagline: "Robust industrial power generation built for continuous heavy factory & commercial duty.",
    highlight: "Global Leader",
    link: "/all-products?search=caterpillar",
  },
  {
    id: "siemens",
    name: "Siemens Energy",
    origin: "Germany",
    category: "Automation & Grid",
    tagline: "Advanced German engineering in power automation, active filters, and SCADA systems.",
    highlight: "Industrial Standard",
    link: "/all-products?search=siemens",
  },
];

export function OurBrandsSection() {
  return (
    <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
        
        {/* Section Header (Matches Our Services Section: Title Left, View All Button Right) */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#122B5A] uppercase mb-1">
              <Award className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Global OEM Partnerships</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#122B5A] tracking-tight">
              Our Trusted Brands
            </h2>
          </div>

          <Link
            href="/brands"
            className="inline-flex items-center justify-center bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs sm:text-xs tracking-wider px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            View All
          </Link>
        </div>

        {/* 6 Cards in 2 Rows (3 Columns Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TOP_6_BRANDS.map((brand) => (
            <Link
              key={brand.id}
              href={brand.link}
              className="group bg-slate-50/80 hover:bg-[#122B5A] border border-slate-200/90 hover:border-[#122B5A] rounded-xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 block cursor-pointer relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-[#FFB800] transition-colors duration-300" />

              <div className="space-y-4">
                {/* Top Row: Origin Flag & Verified Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-amber-300 uppercase tracking-wider bg-white group-hover:bg-white/10 px-2.5 py-1 rounded-full border border-slate-200/70 group-hover:border-white/10 transition-colors">
                    {brand.origin}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-300 bg-emerald-50 group-hover:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 group-hover:border-emerald-500/30 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 group-hover:text-emerald-400" />
                    <span>{brand.highlight}</span>
                  </span>
                </div>

                {/* Brand Name & Category */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFB800] block">
                    {brand.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-white tracking-tight transition-colors">
                    {brand.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-300 leading-relaxed transition-colors">
                  {brand.tagline}
                </p>
              </div>

              {/* Bottom Row Action */}
              <div className="pt-5 mt-4 border-t border-slate-200/70 group-hover:border-white/10 flex items-center justify-between text-xs font-bold text-[#122B5A] group-hover:text-[#FFB800] transition-colors">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>Explore Equipment</span>
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-200 group-hover:bg-[#FFB800] text-[#122B5A] flex items-center justify-center transition-transform group-hover:rotate-45 shadow-2xs">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
