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
  Search, 
  Sparkles, 
  Building2,
  PhoneCall,
  FileCheck,
  ChevronRight,
  Shield,
  Layers,
  Headphones,
  Check,
  Flame,
  Droplets,
  Factory
} from "lucide-react";
import { getBrands, ApiBrand, getMediaUrl } from "@/lib/api";

interface InHouseBrandItem {
  id: string | number;
  name: string;
  division: string;
  category: string;
  tagline: string;
  badge: string;
  warranty: string;
  specialty: string[];
  metrics: { label: string; value: string };
  logo?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const DEFAULT_IN_HOUSE_BRANDS: InHouseBrandItem[] = [
  {
    id: "doorstep-power",
    name: "Doorstep Power Solutions™",
    division: "Heavy Power Generation",
    category: "Generators & Synchronization",
    tagline: "Heavy-duty continuous & standby industrial diesel generators, custom soundproof acoustic canopies, and automated load-sharing synchronization systems.",
    badge: "Flagship Brand",
    warranty: "Full Factory Warranty & AMC",
    metrics: { label: "Capacity Range", value: "50kVA - 3000kVA" },
    specialty: [
      "Industrial Heavy Diesel Generators",
      "Custom Acoustic Soundproof Canopies",
      "Auto-Synchronizing Multi-Genset Panels",
      "Automatic Main Failure (AMF) Logic"
    ],
    icon: Zap,
    accentColor: "#FFB800",
  },
  {
    id: "doorstep-solar",
    name: "Doorstep Solar & GreenTech™",
    division: "Renewable Energy",
    category: "Commercial Solar & BESS",
    tagline: "Turnkey commercial & industrial rooftop solar PV installations, on-grid smart inverters, and high-efficiency hybrid battery energy storage systems.",
    badge: "Eco-Friendly Line",
    warranty: "25-Year Performance Guarantee",
    metrics: { label: "Solar Lifespan", value: "25+ Years" },
    specialty: [
      "Industrial Rooftop Solar PV Systems",
      "Commercial Hybrid Battery Storage (BESS)",
      "Net Metering & Grid Synchronization",
      "Cloud-Connected Generation Telemetry"
    ],
    icon: Sun,
    accentColor: "#10B981",
  },
  {
    id: "doorstep-voltguard",
    name: "Doorstep VoltGuard™ Switchgear",
    division: "Electrical Engineering",
    category: "HT / LT Panels & Protection",
    tagline: "Custom-engineered HT/LT distribution switchboards, automatic transfer switches (ATS), power factor improvement (PFI), and surge protection systems.",
    badge: "In-House Engineered",
    warranty: "Factory Type-Tested & Certified",
    metrics: { label: "Testing Standard", value: "IEC Type-Tested" },
    specialty: [
      "Custom HT/LT Distribution Boards",
      "Smart ATS Auto-Changeover Panels",
      "PFI Automatic Capacitor Banks",
      "Digital Arc & Overcurrent Relays"
    ],
    icon: ShieldCheck,
    accentColor: "#3B82F6",
  },
  {
    id: "doorstep-cooltech",
    name: "Doorstep CoolTech™ & HVAC",
    division: "Climate & Cooling",
    category: "Industrial Cooling & Ventilation",
    tagline: "Precision industrial chillers, factory duct ventilation systems, and commercial air treatment engineered specifically for high-ambient tropical climates.",
    badge: "Heavy Climate Line",
    warranty: "Doorstep Comprehensive Support",
    metrics: { label: "Ambient Tolerance", value: "Up to 55°C" },
    specialty: [
      "Industrial Water & Air Chillers",
      "Precision Factory Ventilation Ducting",
      "Cleanroom & Data Center HVAC",
      "High-Efficiency Dual Compressors"
    ],
    icon: Wind,
    accentColor: "#06B6D4",
  },
  {
    id: "doorstep-automation",
    name: "Doorstep SmartTech & Security™",
    division: "IoT & Electronics",
    category: "Surveillance & Telemetry",
    tagline: "High-definition IP surveillance cameras, cloud power telemetry, SCADA factory automation, and intelligent RFID biometric access control.",
    badge: "Smart Intelligent Line",
    warranty: "Doorstep Lifetime Support",
    metrics: { label: "Resolution & AI", value: "4K AI Vision" },
    specialty: [
      "Full HD & 4K PTZ IP Surveillance",
      "Industrial Cloud SCADA & App Monitoring",
      "Biometric & RFID Access Control",
      "Automated Power Grid Telemetry"
    ],
    icon: Cpu,
    accentColor: "#8B5CF6",
  },
  {
    id: "doorstep-care",
    name: "Doorstep Care & Maintenance Hub™",
    division: "Field Engineering",
    category: "Technical Care & Spare Parts",
    tagline: "24/7 emergency response engineering, certified engine overhauls, preventative annual maintenance (AMC), and authentic factory spare parts direct to your doorstep.",
    badge: "Certified Support Hub",
    warranty: "100% Genuine Spares Backed",
    metrics: { label: "Emergency Response", value: "24/7 Support" },
    specialty: [
      "24/7 Rapid Emergency Response Team",
      "Major Industrial Engine Overhauling",
      "100% Genuine Direct Factory Spare Parts",
      "Predictive Vibration & Oil Analysis"
    ],
    icon: Wrench,
    accentColor: "#F59E0B",
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

const DEFAULT_CATEGORIES = [
  "All Divisions",
  "Heavy Power Generation",
  "Renewable Energy",
  "Electrical Engineering",
  "Climate & Cooling",
  "IoT & Electronics",
  "Field Engineering"
];

const ADVANTAGES = [
  {
    icon: Shield,
    title: "100% Factory Direct Quality",
    desc: "Every product is built, calibrated, and rigorously tested in-house without third-party intermediary markups."
  },
  {
    icon: Layers,
    title: "Custom Engineering",
    desc: "Tailored to your exact industrial specifications—custom sound attenuation, voltage setups, and panel footprints."
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Support",
    desc: "Direct nationwide field engineers on standby with immediate access to authentic Door Step replacement parts."
  },
  {
    icon: Flame,
    title: "Official Brand Warranty",
    desc: "Comprehensive warranty packages, factory test logs, and guaranteed performance benchmarks on every installation."
  }
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<InHouseBrandItem[]>(DEFAULT_IN_HOUSE_BRANDS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All Divisions");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadAllApiBrands = async () => {
      try {
        const res = await getBrands({ all: 1 });
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: InHouseBrandItem[] = res.data.map((item: ApiBrand, idx: number) => {
            const iconComp = resolveBrandIcon(item.name, item.category_tag || item.sub_title || "");
            
            // Extract specialties / key capabilities
            let specs: string[] = [];
            if (Array.isArray(item.key_capabilities) && item.key_capabilities.length > 0) {
              specs = item.key_capabilities;
            } else if (item.capacity_range || item.warranty_text) {
              if (item.capacity_range) specs.push(`Capacity: ${item.capacity_range}`);
              if (item.warranty_text) specs.push(`Warranty: ${item.warranty_text}`);
            } else {
              specs = DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].specialty;
            }

            return {
              id: item.id || item.slug || idx,
              name: item.name,
              division: item.category_tag || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].division,
              category: item.sub_title || item.category_tag || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].category,
              tagline: item.description || DEFAULT_IN_HOUSE_BRANDS[idx % DEFAULT_IN_HOUSE_BRANDS.length].tagline,
              badge: item.badge || "Verified Line",
              warranty: item.warranty_text || "Full Factory Warranty",
              metrics: {
                label: item.capacity_range ? "Benchmark" : "Standard",
                value: item.capacity_range || "ISO Certified"
              },
              specialty: specs,
              logo: item.logo_url || (item.logo ? getMediaUrl(item.logo) : null),
              icon: iconComp,
              accentColor: "#122B5A"
            };
          });

          if (mapped.length > 0) {
            setBrands(mapped);

            // Derive dynamic categories
            const derivedDivisions = Array.from(new Set(mapped.map((b) => b.division).filter(Boolean)));
            if (derivedDivisions.length > 0) {
              setCategories(["All Divisions", ...derivedDivisions]);
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching brands in /brands:", err);
      }
    };

    loadAllApiBrands();
    return () => { isMounted = false; };
  }, []);

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.specialty.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === "All Divisions") return true;
    return brand.division.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 1. Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#122B5A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#122B5A] font-bold">Ours Brands</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#122B5A] via-[#0C1E40] to-[#122B5A] text-white py-14 sm:py-20 px-4 sm:px-6 md:px-8 border-b border-[#FFB800]/20 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-[1500px] mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800] text-xs font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#FFB800]" />
            <span>Door Step BD Proprietary Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Ours Brands &amp; Specialized Divisions
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Explore Door Step BD&apos;s proprietary in-house brand ecosystem. Every brand line is engineered, manufactured, and supported directly by our specialized divisions across Bangladesh with full factory warranty.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-[#FFB800]">6</div>
              <div className="text-[11px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider">Specialized Divisions</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-[#FFB800]">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider">In-House Quality</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-[#FFB800]">24/7</div>
              <div className="text-[11px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider">Rapid Field AMC</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-[#FFB800]">64</div>
              <div className="text-[11px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider">Districts Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter & Search Controls */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#122B5A] text-[#FFB800] shadow-sm scale-102"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search by brand, division or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#122B5A]/30 focus:border-[#122B5A]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

        </div>
      </section>

      {/* 4. In-House Brands Grid Showcase */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-14">
        {filteredBrands.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">No in-house brands found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All Divisions"); }}
              className="text-xs font-bold text-[#122B5A] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredBrands.map((brand) => {
              const IconComp = brand.icon;
              return (
                <div
                  key={brand.id}
                  className="group relative bg-white border border-slate-200/90 hover:border-[#FFB800]/70 rounded-2xl p-6 sm:p-7 transition-all duration-300 ease-out flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Dynamic Top Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-slate-200/80 group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300" />

                  {/* Subtle Light-Sweep Shine Ray on Hover */}
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Division Tag & Brand Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 group-hover:bg-amber-50/80 text-[#122B5A] text-[11px] font-extrabold rounded-full uppercase tracking-wider border border-slate-200 group-hover:border-amber-300/60 transition-colors duration-300">
                        <Building2 className="w-3.5 h-3.5 text-[#122B5A]" />
                        <span>{brand.division}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#122B5A] bg-[#FFB800] group-hover:bg-amber-400 group-hover:scale-105 px-2.5 py-0.5 rounded-full shadow-2xs transition-transform duration-300">
                        {brand.badge}
                      </span>
                    </div>

                    {/* Brand Emblem & Title */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#122B5A] to-[#0A1D3D] text-[#FFB800] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:shadow-[#FFB800]/20 transition-all duration-300 overflow-hidden relative">
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
                          <IconComp className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block truncate">
                          {brand.category}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-[#122B5A] tracking-tight leading-snug group-hover:text-[#0B1B38] transition-colors duration-200">
                          {brand.name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {brand.tagline}
                    </p>

                    {/* Key Metrics / Benchmark */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group-hover:bg-amber-50/40 border border-slate-200/80 group-hover:border-amber-200 text-xs transition-colors duration-300">
                      <span className="text-slate-500 font-semibold">{brand.metrics.label}:</span>
                      <span className="font-extrabold text-[#122B5A]">{brand.metrics.value}</span>
                    </div>

                    {/* Warranty Tag */}
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{brand.warranty}</span>
                    </div>

                    {/* Key Capabilities / Specs Checklist */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Capabilities:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {brand.specialty.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-6 mt-4 border-t border-slate-100 relative z-10">
                    <Link
                      href="/contact-us"
                      className="w-full bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] font-bold text-xs py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <span>Inquire About {brand.division}</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Why Choose Door Step BD In-House Brands */}
      <section className="bg-white py-14 sm:py-20 border-t border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#122B5A] uppercase bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>The Door Step BD Difference</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#122B5A] tracking-tight">
              Why Rely On Our In-House Brands?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We design, assemble, and support our own equipment—ensuring zero third-party compromise, customized industrial fit, and instant access to spare parts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((adv, idx) => {
              const AdvIcon = adv.icon;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3 hover:border-[#122B5A] hover:bg-white transition-all shadow-2xs">
                  <div className="w-12 h-12 rounded-xl bg-[#122B5A] text-[#FFB800] flex items-center justify-center shadow-xs">
                    <AdvIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#122B5A]">
                    {adv.title}
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {adv.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Direct Engineering Consultation & Quotation CTA Banner */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-12 pb-16">
        <div className="bg-gradient-to-r from-[#122B5A] via-[#0C1E40] to-[#122B5A] text-white rounded-3xl p-8 sm:p-12 border border-[#FFB800]/20 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Factory Consultation</span>
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Need a Custom Engineered Solution for Your Facility?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Speak directly with our senior power, solar, and switchgear engineers for technical site visits, load calculations, and turnkey quotations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto shrink-0">
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-black uppercase text-xs tracking-wider px-7 py-3.5 rounded-xl shadow-md transition whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Request Engineering Quote</span>
            </Link>
            <a
              href="tel:01734340066"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs tracking-wider px-6 py-3.5 rounded-xl border border-white/20 transition whitespace-nowrap cursor-pointer"
            >
              <span>Call: +880 1734-340066</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}


