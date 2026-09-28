"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Factory, 
  Zap, 
  Sun, 
  ShieldCheck, 
  BatteryCharging, 
  Sliders, 
  Cpu, 
  Wrench, 
  ArrowRight, 
  Sparkles,
  Layers,
  Search,
  ChevronRight,
  Home,
  CheckCircle2,
  PhoneCall,
  Gauge,
  Building2
} from "lucide-react";
import { getCategories, ApiCategory } from "@/lib/api";

interface CategoryDetail {
  id: string | number;
  name: string;
  slug: string;
  count?: string;
  spec?: string;
  desc?: string;
  iconName?: string;
  subItems?: string[];
  features?: string[];
}

const ALL_POWER_CATEGORIES: CategoryDetail[] = [
  {
    id: 1,
    name: "Diesel & Gas Generators",
    slug: "generators",
    spec: "50 kVA - 3000 kVA",
    count: "Heavy Industrial",
    desc: "Cummins, Perkins, and Baudouin powered soundproof diesel & gas generator sets engineered for continuous factory and standby loads.",
    iconName: "factory",
    subItems: ["Soundproof Canopies", "Auto Synchronizing Panels", "AMF/ATS Changeover", "Fuel Storage Systems"],
    features: ["Acoustic Sound Attenuation", "DeepSea / ComAp Smart Controllers", "Direct OEM Factory Testing"],
  },
  {
    id: 2,
    name: "Substations & Transformers",
    slug: "substations",
    spec: "11kV / 0.415kV",
    count: "Turnkey EPC",
    desc: "Complete turnkey electrical substations, oil-immersed & dry-type cast resin transformers, and high-tension vacuum circuit breakers.",
    iconName: "zap",
    subItems: ["Distribution Transformers", "HT VCB 11kV Panels", "Substation Earthing & Lighting", "Drop Out Fuses & LA"],
    features: ["Turnkey Installation & Approval", "Low Loss High Efficiency", "Routine Insulation Testing"],
  },
  {
    id: 3,
    name: "Solar & Hybrid Energy Systems",
    slug: "solar-energy",
    spec: "Tier-1 Solar PV",
    count: "Net-Metering",
    desc: "Commercial rooftop solar power plants, on-grid string inverters, hybrid BESS battery storage, and turnkey government net metering approvals.",
    iconName: "sun",
    subItems: ["Rooftop Solar EPC", "On-Grid String Inverters", "Hybrid Battery Storage (BESS)", "Net-Metering Approvals"],
    features: ["Tier-1 Monocrystalline Modules", "Cloud Generation Monitoring", "25-Year Performance Warranty"],
  },
  {
    id: 4,
    name: "HT / LT Switchgear Panels",
    slug: "switchgear",
    spec: "Custom Fabricated",
    count: "IEC Standard",
    desc: "Custom-engineered low-tension distribution boards, motor control centers (MCC), variable frequency drives (VFD), and busbar trunking systems.",
    iconName: "shield",
    subItems: ["LT Distribution Boards", "MCC & VFD Panels", "Custom Copper Busbars", "Air Circuit Breakers (ACB)"],
    features: ["Form 2/3/4 Segregation", "Type-Tested Enclosures", "Complete Protection Relays"],
  },
  {
    id: 5,
    name: "Online UPS & Battery Systems",
    slug: "ups-systems",
    spec: "Zero Transfer Time",
    count: "Medical & IT",
    desc: "High-frequency double-conversion true online UPS and high-density Lithium-ion energy storage systems for medical diagnostic and data center loads.",
    iconName: "battery",
    subItems: ["3-Phase Modular Online UPS", "LiFePO4 Lithium Batteries", "Tubular Industrial Batteries", "SNMP Remote Telemetry"],
    features: ["0ms Pure Sine Wave Backup", "N+X Redundant Architecture", "Smart Battery Health Monitoring"],
  },
  {
    id: 6,
    name: "Automatic Transfer Switches (ATS)",
    slug: "ats-panels",
    spec: "AMF Synchronized",
    count: "Automated",
    desc: "Automatic mains failure (AMF) changeover panels, motorized bypass switches, and PLC-controlled multi-generator synchronization boards.",
    iconName: "sliders",
    subItems: ["Dual Power ATS Boards", "Motorized Changeovers", "Generator Load Sharing", "Phase Sequence Monitors"],
    features: ["Rapid Auto Transfer", "Mechanical & Electrical Interlocks", "Manual Emergency Bypass"],
  },
  {
    id: 7,
    name: "PFI & Power Factor Plants",
    slug: "pfi-plants",
    spec: "Power Factor >0.98",
    count: "Harmonic Filter",
    desc: "Microprocessor-controlled capacitor banks, active harmonic filters (AHF), and transient surge suppressors to avoid utility penalties.",
    iconName: "cpu",
    subItems: ["Auto Capacitor Banks", "Detuned Harmonic Reactors", "Active Harmonic Filters", "Thyristor Switched PFI"],
    features: ["Eliminates Low PF Fines", "Reduces System THD Harmonics", "Self-Healing Heavy Duty Capacitors"],
  },
  {
    id: 8,
    name: "Industrial Voltage Stabilizers",
    slug: "stabilizers",
    spec: "Servo Controlled",
    count: "3-Phase Precision",
    desc: "High-capacity 3-phase servo voltage regulators and isolation transformers protecting sensitive CNC, textile, and medical machinery.",
    iconName: "gauge",
    subItems: ["3-Phase Servo Stabilizers", "Ultra-Isolation Transformers", "Static Voltage Regulators", "Over/Under Voltage Cutoff"],
    features: ["±1% Precise Regulation", "Fast Response Speed", "No Waveform Distortion"],
  },
  {
    id: 9,
    name: "Generator Spare Parts & AMC",
    slug: "spare-parts",
    spec: "100% Genuine OEM",
    count: "24/7 Field Dispatch",
    desc: "Direct OEM replacement filters, automatic voltage regulators (AVR), digital controllers, sensors, and full annual maintenance contracts (AMC).",
    iconName: "wrench",
    subItems: ["OEM Fleetguard/Donaldson Filters", "Digital Controllers (DeepSea/ComAp)", "Electronic AVR Modules", "Scheduled AMC Contracts"],
    features: ["100% Genuine Certified Spares", "24/7 Emergency Field Engineers", "Fast Nationwide Delivery"],
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
  if (t.includes("ats") || t.includes("transfer") || t.includes("switch") || t.includes("changeover")) return Sliders;
  if (t.includes("pfi") || t.includes("filter") || t.includes("capacitor") || t.includes("harmonic")) return Cpu;
  if (t.includes("stabilizer") || t.includes("voltage") || t.includes("regulat")) return Gauge;
  if (t.includes("spare") || t.includes("repair") || t.includes("maintenance") || t.includes("tool")) return Wrench;
  return Zap;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDetail[]>(ALL_POWER_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function loadApiCategories() {
      try {
        const res = await getCategories(true);
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiMap: Record<string, ApiCategory> = {};
          res.data.forEach((c) => {
            apiMap[c.slug] = c;
            apiMap[c.name.toLowerCase()] = c;
          });

          const enriched = ALL_POWER_CATEGORIES.map((def) => {
            const apiMatch = apiMap[def.slug] || apiMap[def.name.toLowerCase()];
            if (apiMatch) {
              const subs = apiMatch.sub_categories?.map(s => s.name) || def.subItems;
              return {
                ...def,
                id: apiMatch.id,
                name: apiMatch.name || def.name,
                slug: apiMatch.slug || def.slug,
                desc: apiMatch.description || def.desc,
                subItems: subs,
              };
            }
            return def;
          });

          // Add any new categories from API not in default list
          res.data.forEach((apiCat) => {
            const exists = enriched.some(
              (c) => c.slug === apiCat.slug || c.name.toLowerCase() === apiCat.name.toLowerCase()
            );
            if (!exists) {
              enriched.push({
                id: apiCat.id,
                name: apiCat.name,
                slug: apiCat.slug,
                spec: "Custom Power Line",
                count: `${apiCat.sub_categories?.length || 4}+ Items`,
                desc: apiCat.description || "High-performance power equipment built to international safety standards.",
                iconName: "zap",
                subItems: apiCat.sub_categories?.map(s => s.name) || ["Industrial Grade", "Factory Warranty"],
                features: ["Certified Quality", "Nationwide Support"],
              });
            }
          });

          setCategories(enriched);
        }
      } catch (err) {
        console.warn("Failed to load categories from API:", err);
      }
    }

    loadApiCategories();
    return () => { isMounted = false; };
  }, []);

  // Filter categories by search query and tag
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        !searchQuery.trim() ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.spec?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subItems?.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedTag === "all") return true;
      if (selectedTag === "generation") return cat.slug.includes("gen") || cat.name.toLowerCase().includes("generator");
      if (selectedTag === "substation") return cat.slug.includes("substation") || cat.slug.includes("switchgear") || cat.slug.includes("ats");
      if (selectedTag === "solar") return cat.slug.includes("solar") || cat.name.toLowerCase().includes("solar");
      if (selectedTag === "backup") return cat.slug.includes("ups") || cat.slug.includes("pfi") || cat.slug.includes("stabilizer");
      if (selectedTag === "service") return cat.slug.includes("spare") || cat.name.toLowerCase().includes("spare");

      return true;
    });
  }, [categories, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Hero Breadcrumb & Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1500px] mx-auto z-10 space-y-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-blue-200/80">
            <Link href="/" className="hover:text-[#FFB800] transition flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-300/50" />
            <span className="text-[#FFB800] font-semibold">Categories</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-black uppercase tracking-wider shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Industrial Power Equipment Directory</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                All Power Solution Categories
              </h1>
              
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
                Explore our complete portfolio of heavy-duty industrial diesel generators, turnkey 11kV substations, commercial rooftop solar power plants, and critical power engineering systems.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment, capacity, or category..."
                  className="w-full px-4 py-3.5 pl-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-blue-200/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/30 transition-all font-medium"
                />
                <Search className="w-4 h-4 text-[#FFB800] absolute left-4 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-blue-200 hover:text-white bg-white/10 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none text-xs">
            {[
              { id: "all", label: "All Categories" },
              { id: "generation", label: "Generators & Power" },
              { id: "substation", label: "Substations & Switchgear" },
              { id: "solar", label: "Solar & Renewables" },
              { id: "backup", label: "UPS & Power Quality" },
              { id: "service", label: "Spares & AMC" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTag(tab.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTag === tab.id
                    ? "bg-[#FFB800] text-[#122B5A] shadow-md shadow-[#FFB800]/20"
                    : "bg-white/10 hover:bg-white/20 text-white/90"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Key Stats Strip */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-200/90 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#122B5A]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#122B5A] block">9+ Divisions</span>
              <span className="text-[11px] text-slate-500 font-medium">Turnkey Architecture</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#122B5A]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#122B5A] block">50kVA - 3000kVA</span>
              <span className="text-[11px] text-slate-500 font-medium">Heavy Generator Range</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#122B5A] block">100% Genuine</span>
              <span className="text-[11px] text-slate-500 font-medium">OEM Certified Equipment</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-[#FFB800]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#122B5A] block">24/7 Support</span>
              <span className="text-[11px] text-slate-500 font-medium">Nationwide Field Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main 3-Column Categories Grid */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#FFB800] mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No categories found</h3>
            <p className="text-xs text-slate-500">
              No categories match your search term &ldquo;{searchQuery}&rdquo;. Try another keyword or reset the filter.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedTag("all"); }}
              className="px-5 py-2.5 bg-[#122B5A] text-white text-xs font-bold rounded-xl hover:bg-[#0B1B38] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCategories.map((cat, idx) => {
              const IconComp = (cat.iconName && iconMap[cat.iconName]) || resolveCategoryIcon(cat.name);

              return (
                <div
                  key={cat.id || idx}
                  className="group relative bg-white border border-slate-200/90 hover:border-[#FFB800]/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:shadow-[#122B5A]/10 hover:-translate-y-2 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Top Accent Strip with Gradient expansion on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-slate-200/70 group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300" />

                  {/* Subtle Light-Sweep Shine Ray on Hover */}
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    
                    {/* Top Row: Spec Badge & Category Count */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {cat.spec && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A] bg-slate-100 group-hover:bg-amber-50/90 group-hover:text-[#122B5A] border border-slate-200/80 group-hover:border-amber-300/70 px-3 py-1 rounded-full transition-colors duration-300">
                          <Layers className="w-3 h-3 text-[#FFB800]" />
                          <span className="truncate">{cat.spec}</span>
                        </span>
                      )}
                      {cat.count && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#122B5A] bg-[#FFB800] group-hover:bg-amber-400 px-2.5 py-0.5 rounded-full shadow-2xs transition-all duration-300">
                          {cat.count}
                        </span>
                      )}
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#122B5A] to-[#0A1D3D] text-[#FFB800] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:shadow-[#FFB800]/25 transition-all duration-300">
                        <IconComp className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                          Division {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-[#122B5A] tracking-tight group-hover:text-[#0B1B38] leading-snug transition-colors duration-200">
                          {cat.name}
                        </h2>
                      </div>
                    </div>

                    {/* Description */}
                    {cat.desc && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {cat.desc}
                      </p>
                    )}

                    {/* Subcategories / Product Types */}
                    {cat.subItems && cat.subItems.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Key Equipment & Scope:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subItems.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={`/all-products?category=${encodeURIComponent(cat.slug)}&sub_category=${encodeURIComponent(sub)}`}
                              className="text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:text-[#122B5A] bg-slate-100 hover:bg-[#FFB800]/20 border border-slate-200/70 hover:border-[#FFB800]/60 px-2 py-0.5 rounded-md transition-all duration-200"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Engineering Features Highlights */}
                    {cat.features && cat.features.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        {cat.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-5 mt-4 border-t border-slate-100 group-hover:border-amber-100 flex items-center justify-between">
                    <Link
                      href={`/all-products?category=${encodeURIComponent(cat.slug)}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#122B5A] hover:bg-[#0B1B38] text-white group-hover:bg-[#FFB800] group-hover:text-[#122B5A] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all duration-300"
                    >
                      <span>Explore All {cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* 4. Consultation & Custom Project CTA */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] rounded-3xl p-8 sm:p-12 text-white shadow-2xl shadow-[#122B5A]/20 border border-white/10 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="space-y-3 text-center lg:text-left relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800]/20 text-[#FFB800] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Tailored Turnkey Engineering</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Need Multi-Megawatt Plant Sizing or Custom Substation Design?
            </h3>
            
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Our lead electrical engineers perform on-site load assessments, power quality harmonic audits, and turnkey civil & electrical commissioning across Bangladesh.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto">
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <span>Request Technical Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="tel:+8801800000000"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#FFB800]" />
              <span>Call Hotline</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
