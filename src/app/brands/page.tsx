"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, ArrowRight, ArrowUpRight, Search, ShieldCheck, Zap, Globe, Factory } from "lucide-react";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";

interface FullBrandItem {
  id: string;
  name: string;
  origin: string;
  category: string;
  tagline: string;
  highlight: string;
  specialty: string[];
  link: string;
}

const ALL_BRANDS: FullBrandItem[] = [
  {
    id: "cummins",
    name: "Cummins Power Generation",
    origin: "USA",
    category: "Heavy Diesel Gensets",
    tagline: "World-renowned heavy-duty continuous & standby generator sets with automated digital controls.",
    highlight: "OEM Authorized",
    specialty: ["50 kVA - 3000 kVA", "Soundproof Canopies", "PowerCommand Controller"],
    link: "/all-products?search=cummins",
  },
  {
    id: "perkins",
    name: "Perkins Engines",
    origin: "United Kingdom",
    category: "Industrial Engines",
    tagline: "Ultra-reliable British engineered diesel engines known for low emissions and long overhaul intervals.",
    highlight: "100% Genuine",
    specialty: ["UK Manufacturing", "Eco-friendly Emission", "High Fuel Economy"],
    link: "/all-products?search=perkins",
  },
  {
    id: "schneider",
    name: "Schneider Electric",
    origin: "France",
    category: "HT / LT Switchgear",
    tagline: "Global leader in intelligent energy management, circuit breakers, contactors, and protection relays.",
    highlight: "Tier-1 Partner",
    specialty: ["Masterpact ACB", "EasyPact MCCB", "Smart Distribution"],
    link: "/all-products?search=schneider",
  },
  {
    id: "abb",
    name: "ABB Power Grids",
    origin: "Switzerland",
    category: "Transformers & Drives",
    tagline: "Pioneering technology in high voltage transformers, variable frequency drives, and grid switchgear.",
    highlight: "Certified Leader",
    specialty: ["Oil & Dry Transformers", "VFD Drives", "Grid Synchronization"],
    link: "/all-products?search=abb",
  },
  {
    id: "cat",
    name: "Caterpillar (CAT)",
    origin: "USA",
    category: "Prime Power Equipment",
    tagline: "Unmatched rugged durability for continuous power in industrial manufacturing and infrastructure.",
    highlight: "Global Standard",
    specialty: ["Heavy Industrial", "Dual Fuel Ready", "High Ambient Rating"],
    link: "/all-products?search=caterpillar",
  },
  {
    id: "siemens",
    name: "Siemens Energy",
    origin: "Germany",
    category: "Automation & Grid",
    tagline: "Cutting-edge German electrical architecture, active harmonic filtration, and automation.",
    highlight: "Engineered in Germany",
    specialty: ["SENTRON Protection", "SIRIUS Controls", "Power Monitoring"],
    link: "/all-products?search=siemens",
  },
  {
    id: "volvo",
    name: "Volvo Penta",
    origin: "Sweden",
    category: "Commercial Power Systems",
    tagline: "Fuel-optimized, fast-load-step European diesel engines for mission critical backup power.",
    highlight: "Premium European",
    specialty: ["Electronic Fuel Injection", "Fast Step Load", "Low Acoustic Output"],
    link: "/all-products?search=volvo",
  },
  {
    id: "huawei",
    name: "Huawei FusionSolar",
    origin: "Global",
    category: "Solar & Energy Storage",
    tagline: "Smart string commercial inverters and commercial battery energy storage systems (BESS).",
    highlight: "Tier-1 Solar",
    specialty: ["Smart String Inverters", "AI Arc Protection", "Cloud Telemetry"],
    link: "/all-products?search=huawei",
  },
  {
    id: "dse",
    name: "Deep Sea Electronics (DSE)",
    origin: "United Kingdom",
    category: "Generator Controllers",
    tagline: "Industry-standard automated transfer switch (ATS) and load-sharing synchronizing modules.",
    highlight: "Original DSE UK",
    specialty: ["DSE 7320 AMF", "DSE 8610 Sync", "Remote Web Telemetry"],
    link: "/all-products?search=dse",
  },
  {
    id: "stamford",
    name: "Stamford Alternators",
    origin: "United Kingdom",
    category: "Alternators & Dynamos",
    tagline: "World-class brushless AC alternators with auxiliary winding protection for continuous excitation.",
    highlight: "Cummins Generator Tech",
    specialty: ["Brushless AC", "PMG System", "Class H Insulation"],
    link: "/all-products?search=stamford",
  },
  {
    id: "leroy",
    name: "Leroy-Somer",
    origin: "France",
    category: "Industrial Alternators",
    tagline: "High-efficiency alternators designed for harsh industrial and tropical ambient environments.",
    highlight: "Nidec Group France",
    specialty: ["AREP Excitation", "Digital Voltage Regulators", "Marine Certified"],
    link: "/all-products?search=leroy",
  },
  {
    id: "mitsubishi",
    name: "Mitsubishi Heavy Industries",
    origin: "Japan",
    category: "Heavy Duty Gensets",
    tagline: "Japanese precision engineering providing heavy mechanical reliability for utility and factories.",
    highlight: "Japanese Quality",
    specialty: ["Heavy Displacement", "Low Wear & Tear", "Continuous Duty"],
    link: "/all-products?search=mitsubishi",
  },
];

const CATEGORIES = ["All Brands", "Generators", "Engines", "Switchgear", "Alternators & Control", "Solar"];

export default function BrandsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Brands");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = ALL_BRANDS.filter((brand) => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === "All Brands") return true;
    if (selectedCategory === "Generators") return brand.category.includes("Genset") || brand.category.includes("Prime");
    if (selectedCategory === "Engines") return brand.category.includes("Engine") || brand.category.includes("Commercial");
    if (selectedCategory === "Switchgear") return brand.category.includes("Switchgear") || brand.category.includes("Transformer") || brand.category.includes("Automation");
    if (selectedCategory === "Alternators & Control") return brand.category.includes("Alternator") || brand.category.includes("Controller");
    if (selectedCategory === "Solar") return brand.category.includes("Solar");
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0D2247] to-[#122B5A] text-white py-14 sm:py-20 px-4 sm:px-8 border-b border-[#FFB800]/20">
        <div className="max-w-[1500px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Official OEM Brands</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Our Trusted Global Brands
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Doorstep Power Solution partners directly with world-class manufacturers to provide 100% authentic equipment, spare parts, and certified engineering support across Bangladesh.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#122B5A] text-[#FFB800] shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search brand, origin, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#122B5A]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>
      </section>

      {/* Brands Grid (All Brands) */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-8 py-6 pb-16">
        {filteredBrands.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">No brands found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All Brands"); }}
              className="text-xs font-bold text-[#122B5A] underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#122B5A]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="p-6 sm:p-8 space-y-4">
                  {/* Origin & Verification */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-[#122B5A]/10 text-[#122B5A] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                      {brand.origin}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{brand.highlight}</span>
                    </span>
                  </div>

                  {/* Category & Title */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#122B5A]">
                      {brand.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#122B5A] tracking-tight group-hover:text-[#FFB800] transition-colors">
                      {brand.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {brand.tagline}
                  </p>

                  {/* Key Features / Specs */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    {brand.specialty.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 sm:px-8 pb-6 pt-2">
                  <Link
                    href={brand.link}
                    className="w-full bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] font-bold text-xs py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <span>View {brand.name} Equipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OEM Authenticity Notice */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#122B5A] text-[#FFB800] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-[#122B5A] text-base sm:text-lg">
                100% Genuine Guaranteed with Factory Certification
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm">
                Every unit supplied by Doorstep Power Solution includes original manufacturer warranty, test run reports, and full after-sales support.
              </p>
            </div>
          </div>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs px-6 py-3 rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <span>Request Technical Quotation</span>
          </Link>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="pb-12">
        <TrustBadgesBar />
      </div>

    </div>
  );
}
