"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowUpRight,
  ExternalLink,
  Layers,
  PhoneCall,
  Zap,
  PackageCheck,
  Wrench,
  Clock,
  ArrowRight,
  Check
} from "lucide-react";
import { getBrands, getPartners, ApiBrand, ApiPartner, getMediaUrl } from "@/lib/api";

export interface BrandItem {
  id: string | number;
  name: string;
  slug: string;
  logo: string | null;
  link: string;
  isExternal: boolean;
  type: "brand" | "partner";
  category?: string;
  description?: string;
}

export default function BrandsPage() {
  const [items, setItems] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "brand" | "partner">("all");

  useEffect(() => {
    let isMounted = true;
    const fetchAllDynamicData = async () => {
      try {
        setLoading(true);
        const [brandsRes, partnersRes] = await Promise.allSettled([
          getBrands({ all: 1 }),
          getPartners({ all: 1 })
        ]);

        if (!isMounted) return;

        const list: BrandItem[] = [];

        // 1. Process Partners from API
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

            const pName = p.name || p.title || `Partner ${idx + 1}`;
            const targetLink = p.website || p.url || p.link || `/all-products?brand=${encodeURIComponent(pName)}`;

            list.push({
              id: p.id || `partner-${idx}`,
              name: pName,
              slug: p.slug || String(p.id || idx),
              logo: logoUrl,
              link: targetLink,
              isExternal: targetLink.startsWith("http"),
              type: "partner",
              description: p.description || undefined
            });
          });
        }

        // 2. Process Brands from API
        if (brandsRes.status === "fulfilled" && brandsRes.value.success && Array.isArray(brandsRes.value.data)) {
          brandsRes.value.data.forEach((b: ApiBrand, idx: number) => {
            let logoUrl: string | null = null;
            if (b.logo && typeof b.logo === "string" && b.logo.trim()) {
              logoUrl = b.logo.trim().startsWith("data:") ? b.logo.trim() : getMediaUrl(b.logo);
            } else if (b.logo_url) {
              logoUrl = b.logo_url;
            }

            list.push({
              id: b.id || `brand-${idx}`,
              name: b.name,
              slug: b.slug || b.name,
              logo: logoUrl,
              link: `/all-products?brand=${encodeURIComponent(b.slug || b.name)}`,
              isExternal: false,
              type: "brand",
              category: b.category_tag || b.sub_title || undefined,
              description: b.description || undefined
            });
          });
        }

        setItems(list);
      } catch (err) {
        console.warn("Failed to load brands & partners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllDynamicData();
    return () => { isMounted = false; };
  }, []);

  // Filter by Tab and Search Query
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || item.name.toLowerCase().includes(term) || (item.category && item.category.toLowerCase().includes(term));
    return matchesTab && matchesSearch;
  });

  const partnerCount = items.filter(i => i.type === "partner").length;
  const brandCount = items.filter(i => i.type === "brand").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* 1. Hero Header Section (Matching About Us Navy & Gold Gradient) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-5 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Authorized Global OEM &amp; Equipment Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Our Brands &amp; Official Partners
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
            Direct partnerships with world-class power generation, renewable solar, electrical switchgear, and online UPS manufacturers backed by authentic factory warranties and technical field SLA.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#122B5A]" />
              <span>Request Brand Proposal</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#FFB800]" />
              <span>Explore Engineering Services</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Floating Stats Strip (Overlapping Hero) */}
      <section className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                {brandCount > 0 ? `${brandCount}+` : "25+"}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Authorized Brands
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                {partnerCount > 0 ? `${partnerCount}+` : "15+"}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Official Partners
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                100%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Genuine OEM Parts
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                24/7
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Engineering Support
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16">

        {/* 3. Search & Filter Bar */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Tab Selection */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "all"
                  ? "bg-[#122B5A] text-white shadow-md shadow-[#122B5A]/20 scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              All Portfolio ({items.length})
            </button>

            {brandCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("brand")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "brand"
                    ? "bg-[#122B5A] text-white shadow-md shadow-[#122B5A]/20 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                Brands ({brandCount})
              </button>
            )}

            {partnerCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("partner")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "partner"
                    ? "bg-[#122B5A] text-white shadow-md shadow-[#122B5A]/20 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                Official Partners ({partnerCount})
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brand or partner..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#122B5A] focus:border-transparent transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

        </section>

        {/* 4. Brands & Partners Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sk) => (
                <div key={sk} className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-pulse h-48 sm:h-52">
                  <div className="w-full h-24 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200/90 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#122B5A] flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-[#FFB800]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#122B5A]">No Brands or Partners Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                {searchQuery ? `No results matching "${searchQuery}". Try a different search term.` : "No dynamic brands or partners are currently listed in the admin panel."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 bg-[#122B5A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0A1D3D] transition cursor-pointer"
                >
                  Reset Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredItems.map((item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  href={item.link}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  title={item.name}
                  className="group relative bg-white border border-slate-200/90 hover:border-[#122B5A]/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between items-center text-center transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1.5 overflow-hidden block shadow-2xs"
                >
                  {/* Dynamic Top Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#122B5A] group-hover:via-[#FFB800] group-hover:to-[#122B5A] transition-all duration-300" />

                  {/* Badge Tag (Brand vs Partner) */}
                  <div className="w-full flex items-center justify-between gap-1 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.type === "partner"
                        ? "bg-amber-50 text-amber-900 border border-amber-200/60"
                        : "bg-slate-100 text-[#122B5A] border border-slate-200/60"
                      }`}>
                      {item.type === "partner" ? "Partner" : "Brand"}
                    </span>
                    {item.isExternal ? (
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#122B5A] transition" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FFB800] transition" />
                    )}
                  </div>

                  {/* Brand Logo Container */}
                  <div className="w-full h-20 sm:h-24 flex items-center justify-center p-2 relative my-1">
                    {item.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="max-h-full max-w-full w-auto h-auto object-contain filter grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:contrast-100 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#122B5A] to-[#0B1B38] text-[#FFB800] flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name & Subtitle */}
                  <div className="w-full pt-3 border-t border-slate-100 mt-2 space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-[#122B5A] truncate group-hover:text-[#FFB800] transition-colors">
                      {item.name}
                    </h3>
                    {item.category && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.category}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 5. Core Supply Chain Capabilities (Matching About Us 4-Card Section) */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#122B5A]" />
              <span>OEM Assurance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
              Why Partner with Door Step BD
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              End-to-end authorized equipment supply, factory warranty validation, and rapid nationwide engineering SLA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  100% Genuine OEM Equipment
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct factory import with authentic origin certificates, serial tracking, and zero counterfeit risk.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Certified Supply</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  Direct Manufacturer Warranty
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Comprehensive OEM warranty coverage backed by dedicated factory support channels and replacement guarantees.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Warranty Backed</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  On-Site Commissioning
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Expert electrical engineers manage load testing, ATS synchronization, and live handover across all 64 districts.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Turnkey Testing</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  24/7 Field Technical Support
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Emergency rapid dispatch and guaranteed spare parts inventory for zero downtime operation nationwide.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>24/7 On-Call</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Consultation & Quote CTA Banner (Matching About Us Style) */}
        <section className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>OEM Procurement &amp; Spare Parts Helpdesk</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Looking for Specialized Brand Equipment or Spare Parts?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Consult with our senior electrical engineers for verified brand availability, OEM catalog specifications, or custom panel fabrication.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a
              href="tel:01734340066"
              className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#122B5A]" />
              <span>Call Hotline: 01734-340066</span>
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white text-[#122B5A] hover:bg-slate-100 font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Submit Brand Inquiry</span>
              <ArrowRight className="w-4 h-4 text-[#122B5A]" />
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}

