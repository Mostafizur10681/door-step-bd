"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Zap, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Search, 
  PhoneCall, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Wrench,
  PackageCheck,
  ArrowRight,
  Filter,
  X
} from "lucide-react";
import { API_V1, getCategories, getMediaUrl, getContactSettings, ApiContactSettings } from "@/lib/api";

interface SubCategoryItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  category_id?: number | string;
}

interface CategoryItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  subCategories: SubCategoryItem[];
}

const FALLBACK_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    name: "Inkjet Printer",
    slug: "inkjet-printer",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    description: "High-speed industrial continuous inkjet (CIJ) coding and marking systems for manufacturing and packaging lines.",
    subCategories: [
      {
        id: 101,
        name: "Ink",
        slug: "ink",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
        description: "Fast-drying, high-contrast industrial inks and solvents for diverse substrate coding.",
        category_id: 1
      },
      {
        id: 102,
        name: "Consumables & Solvent",
        slug: "consumables-solvent",
        description: "Specialized make-up fluids, washdown cleaners, and printhead maintenance kits.",
        category_id: 1
      }
    ]
  },
  {
    id: 2,
    name: "Screw Air Compressor",
    slug: "screw-air-compressor",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    description: "Heavy-duty rotary screw air compressors engineered for 24/7 continuous industrial plant uptime.",
    subCategories: [
      {
        id: 201,
        name: "Rotary Screw Compressors",
        slug: "rotary-screw",
        description: "Oil-injected energy-efficient variable speed drive (VSD) screw compressor units.",
        category_id: 2
      },
      {
        id: 202,
        name: "Oil-Free Air Compressors",
        slug: "oil-free",
        description: "100% oil-free ISO Class 0 compressed air for pharmaceutical and food grade operations.",
        category_id: 2
      }
    ]
  },
  {
    id: 3,
    name: "Generator",
    slug: "generator",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    description: "Industrial diesel and gas prime/standby power generation systems ranging from 50 kVA to 3000 kVA.",
    subCategories: [
      {
        id: 301,
        name: "Diesel Generators",
        slug: "diesel-generators",
        description: "Heavy-duty Cummins, Perkins, and Baudouin powered prime power diesel gensets.",
        category_id: 3
      },
      {
        id: 302,
        name: "Gas Generators",
        slug: "gas-generators",
        description: "High-efficiency natural gas and biogas power generation engines for continuous base load.",
        category_id: 3
      }
    ]
  },
  {
    id: 4,
    name: "Lubricant",
    slug: "lubricant",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    description: "High-performance OEM engine oils, hydraulic fluids, and compressor lubricants.",
    subCategories: [
      {
        id: 401,
        name: "Heavy Engine Oil",
        slug: "heavy-engine-oil",
        description: "Extended drain interval synthetic lubricants for heavy diesel and gas generator engines.",
        category_id: 4
      },
      {
        id: 402,
        name: "Hydraulic & Compressor Oil",
        slug: "hydraulic-compressor-oil",
        description: "Anti-wear thermal-stable oils designed for screw compressors and hydraulic machinery.",
        category_id: 4
      }
    ]
  }
];

function CategoryCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryQuery = searchParams.get("category") || "";
  const selectedSubCategoryQuery = searchParams.get("sub_category") || searchParams.get("subcategory") || "";
  const searchParam = searchParams.get("search") || "";

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [contactPhone, setContactPhone] = useState("01734340066");

  // Load dynamic categories & sub-categories from API
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [catsRes, contactRes] = await Promise.allSettled([
          getCategories(true),
          getContactSettings()
        ]);

        if (!isMounted) return;

        // Process Categories
        if (catsRes.status === "fulfilled" && catsRes.value && catsRes.value.success) {
          const rawCats = catsRes.value.data;
          if (Array.isArray(rawCats) && rawCats.length > 0) {
            const mapped: CategoryItem[] = rawCats.map((cat: any, idx: number) => {
              const rawSubs = cat.sub_categories || cat.subcategories || cat.subCategories || cat.children || [];
              const subCategories: SubCategoryItem[] = Array.isArray(rawSubs)
                ? rawSubs.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    slug: s.slug || String(s.id),
                    image: s.image ? (s.image.startsWith("data:") ? s.image : getMediaUrl(s.image)) : null,
                    description: s.description || null,
                    category_id: cat.id
                  }))
                : [];

              const img = cat.image 
                ? (cat.image.startsWith("data:") ? cat.image : getMediaUrl(cat.image))
                : FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];

              return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug || String(cat.id),
                image: img,
                description: cat.description || null,
                subCategories
              };
            });

            if (mapped.length > 0) {
              setCategories(mapped);
            }
          }
        }

        // Process Contact Settings
        if (contactRes.status === "fulfilled" && contactRes.value?.success && contactRes.value.data) {
          const c = contactRes.value.data as ApiContactSettings;
          if (c.phone) setContactPhone(c.phone);
        }
      } catch (err) {
        console.warn("Failed to load dynamic categories:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  // Determine active category & active sub-category
  const activeCategory = useMemo(() => {
    if (!selectedCategoryQuery) return null;
    const term = selectedCategoryQuery.toLowerCase().trim();
    return categories.find((c) => 
      c.slug?.toLowerCase() === term || 
      c.name?.toLowerCase() === term || 
      String(c.id) === term
    ) || null;
  }, [categories, selectedCategoryQuery]);

  const activeSubCategory = useMemo(() => {
    if (!selectedSubCategoryQuery) return null;
    const subTerm = selectedSubCategoryQuery.toLowerCase().trim();

    // Check inside active category first
    if (activeCategory) {
      const found = activeCategory.subCategories.find((s) => 
        s.slug?.toLowerCase() === subTerm || 
        s.name?.toLowerCase() === subTerm || 
        String(s.id) === subTerm
      );
      if (found) return found;
    }

    // Search across all categories
    for (const cat of categories) {
      const found = cat.subCategories.find((s) => 
        s.slug?.toLowerCase() === subTerm || 
        s.name?.toLowerCase() === subTerm || 
        String(s.id) === subTerm
      );
      if (found) return found;
    }

    return null;
  }, [categories, activeCategory, selectedSubCategoryQuery]);

  // Determine parent category if sub-category selected directly
  const parentCategoryOfSub = useMemo(() => {
    if (activeCategory) return activeCategory;
    if (!activeSubCategory) return null;
    return categories.find((c) => 
      c.subCategories.some((s) => s.id === activeSubCategory.id || s.slug === activeSubCategory.slug)
    ) || null;
  }, [categories, activeCategory, activeSubCategory]);

  // Filtered categories when on Overview
  const filteredCategories = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      c.subCategories.some((s) => s.name.toLowerCase().includes(term))
    );
  }, [categories, searchQuery]);

  const cleanPhoneLink = `tel:${contactPhone.replace(/[^0-9+]/g, "")}`;

  // Navigation handlers
  const handleSelectCategory = (catSlug?: string) => {
    if (!catSlug) {
      router.push("/all-products");
    } else {
      router.push(`/all-products?category=${encodeURIComponent(catSlug)}`);
    }
  };

  const handleSelectSubCategory = (catSlug: string, subSlug: string) => {
    router.push(`/all-products?category=${encodeURIComponent(catSlug)}&sub_category=${encodeURIComponent(subSlug)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. HERO BANNER (Matching Industrial Navy & Gold Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-14 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4 z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>
              {activeSubCategory
                ? `Sub-Category: ${parentCategoryOfSub?.name || "Equipment"}`
                : activeCategory
                ? "Equipment Category Portfolio"
                : "Equipment & Industrial Solutions"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {activeSubCategory
              ? activeSubCategory.name
              : activeCategory
              ? activeCategory.name
              : "Equipment & Machinery Categories"}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
            {activeSubCategory?.description
              ? activeSubCategory.description
              : activeCategory?.description
              ? activeCategory.description
              : "Explore our turnkey industrial machinery, generation equipment, compressed air systems, and consumable supplies engineered for zero downtime."}
          </p>

          {/* Hero Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#122B5A]" />
              <span>Request Equipment Proposal / Quote</span>
            </Link>
            <a
              href={cleanPhoneLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#FFB800]" />
              <span>Technical Hotline: {contactPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SELECTOR & SEARCH BAR (Overlapping Hero -mt-12) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Pill Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectCategory()}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                !activeCategory && !activeSubCategory
                  ? "bg-[#122B5A] text-[#FFB800] shadow-md shadow-[#122B5A]/20 scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Categories ({categories.length})
            </button>

            {categories.map((cat) => {
              const isCatActive = (activeCategory?.id === cat.id || parentCategoryOfSub?.id === cat.id) && !activeSubCategory;
              const isSubOfThisActive = parentCategoryOfSub?.id === cat.id && Boolean(activeSubCategory);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug || cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isCatActive || isSubOfThisActive
                      ? "bg-[#122B5A] text-[#FFB800] shadow-md shadow-[#122B5A]/20 scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name} {cat.subCategories.length > 0 ? `(${cat.subCategories.length})` : ""}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or sub-category..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#122B5A] transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        </div>
      </div>

      {/* 3. MAIN CONTENT DISPLAY (3 SCENARIOS: ALL CATEGORIES, SELECTED CATEGORY, OR SELECTED SUB-CATEGORY) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* ── SCENARIO A: SPECIFIC SUB-CATEGORY SELECTED ── */}
        {activeSubCategory ? (
          <div className="space-y-10">
            {/* Breadcrumb strip */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <button onClick={() => handleSelectCategory()} className="hover:text-[#122B5A] transition">Categories</button>
              <ChevronRight className="w-3.5 h-3.5" />
              {parentCategoryOfSub && (
                <>
                  <button onClick={() => handleSelectCategory(parentCategoryOfSub.slug || parentCategoryOfSub.name)} className="hover:text-[#122B5A] transition">
                    {parentCategoryOfSub.name}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
              <span className="text-[#122B5A] font-black">{activeSubCategory.name}</span>
            </div>

            {/* Sub-Category Main Card Showcase */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Visual Box */}
              <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg bg-slate-900 border-4 border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSubCategory.image || parentCategoryOfSub?.image || FALLBACK_CATEGORY_IMAGES[0]}
                  alt={activeSubCategory.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#FFB800] bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full border border-[#FFB800]/40">
                    {parentCategoryOfSub?.name || "Equipment Discipline"}
                  </span>
                </div>
              </div>

              {/* Right Details Box */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#122B5A] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
                    Verified Equipment Sub-Category
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#122B5A] tracking-tight">
                    {activeSubCategory.name}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeSubCategory.description || "Certified equipment, spare parts, and specialized engineering components directly supplied and warranted by Door Step BD."}
                </p>

                {/* Key Engineering Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Genuine OEM Supply</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nationwide Technical SLA</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Turnkey Commissioning</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>24/7 Rapid Emergency Dispatch</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center gap-2 bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Request Quotation for {activeSubCategory.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={cleanPhoneLink}
                    className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Hotline</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Other Sub-Categories in Same Parent Category */}
            {parentCategoryOfSub && parentCategoryOfSub.subCategories.length > 1 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-lg sm:text-xl font-black text-[#122B5A]">
                  Other Sub-Categories in {parentCategoryOfSub.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {parentCategoryOfSub.subCategories
                    .filter((s) => s.id !== activeSubCategory.id)
                    .map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handleSelectSubCategory(parentCategoryOfSub.slug || parentCategoryOfSub.name, sub.slug || sub.name)}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#122B5A] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                            Sub-Category
                          </span>
                          <h4 className="text-base font-black text-[#122B5A] group-hover:text-[#0B1B38] transition">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {sub.description || "Certified industrial equipment and supplies."}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#122B5A]">
                          <span>Explore Sub-Category</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : activeCategory ? (
          
          /* ── SCENARIO B: SPECIFIC CATEGORY SELECTED ── */
          <div className="space-y-10">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <button onClick={() => handleSelectCategory()} className="hover:text-[#122B5A] transition">Categories</button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-[#122B5A] font-black">{activeCategory.name}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#122B5A]">
                  {activeCategory.name} — Sub-Categories &amp; Solutions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Showing all {activeCategory.subCategories.length} certified sub-categories under {activeCategory.name}
                </p>
              </div>

              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs px-5 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <span>Request Category Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Sub-Category Cards Grid */}
            {activeCategory.subCategories.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#122B5A] flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7 text-[#FFB800]" />
                </div>
                <h3 className="text-lg font-black text-[#122B5A]">General Equipment Solutions in {activeCategory.name}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Consult directly with our engineering team for custom panel fabrication, equipment specifications, or site surveys.
                </p>
                <Link
                  href="/contact-us"
                  className="inline-block bg-[#122B5A] text-[#FFB800] text-xs font-bold px-6 py-2.5 rounded-xl transition"
                >
                  Contact Engineering Team
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {activeCategory.subCategories.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#122B5A]/40 p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="space-y-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#122B5A] to-[#0B1B38] text-[#FFB800] flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60">
                          Active Discipline
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-[#122B5A] group-hover:text-[#0B1B38] transition">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {sub.description || `Specialized ${sub.name} equipment and turnkey industrial engineering solutions supplied with warranty.`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSubCategory(activeCategory.slug || activeCategory.name, sub.slug || sub.name)}
                        className="text-xs font-bold text-[#122B5A] hover:text-[#FFB800] transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Sub-Category</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href="/contact-us"
                        className="bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs"
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (

          /* ── SCENARIO C: ALL CATEGORIES OVERVIEW ── */
          <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#122B5A]">
                  All Equipment &amp; Machinery Disciplines
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Showing {filteredCategories.length} core engineering categories and their sub-systems
                </p>
              </div>
            </div>

            {/* Categories Card Grid (Styled like Services with Background Images and Sub-Category Pills) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredCategories.map((cat, idx) => {
                const img = cat.image 
                  ? (cat.image.startsWith("data:") ? cat.image : getMediaUrl(cat.image))
                  : FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];

                return (
                  <div
                    key={cat.id || idx}
                    className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 ease-out border border-slate-200/80 hover:border-[#FFB800]/80 bg-slate-900 flex flex-col justify-between min-h-[380px] sm:min-h-[400px]"
                  >
                    {/* Background Image with Zoom on Hover */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-80"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];
                        }}
                      />
                    </div>

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38] via-[#122B5A]/75 to-transparent opacity-90 group-hover:opacity-95 transition-all duration-500" />

                    {/* Expanding Top Accent Strip */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300 z-20" />

                    {/* Top Status & Count Badge */}
                    <div className="relative p-5 sm:p-6 z-10 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FFB800] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#FFB800]/40 shadow-xs">
                        <Building2 className="w-3 h-3 text-[#FFB800]" />
                        <span>Equipment Category</span>
                      </span>
                      {cat.subCategories.length > 0 && (
                        <span className="text-[10px] font-black uppercase text-white bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                          {cat.subCategories.length} Sub-Categories
                        </span>
                      )}
                    </div>

                    {/* Bottom Content & Sub-Categories Chips */}
                    <div className="relative p-5 sm:p-6 z-10 space-y-4">
                      <div className="space-y-1.5">
                        <h3 
                          onClick={() => handleSelectCategory(cat.slug || cat.name)}
                          className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Sub-Categories Chips */}
                      {cat.subCategories.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {cat.subCategories.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSubCategory(cat.slug || cat.name, sub.slug || sub.name);
                              }}
                              className="text-[11px] font-bold text-white bg-white/10 hover:bg-[#FFB800] hover:text-[#122B5A] border border-white/20 hover:border-[#FFB800] px-3 py-1 rounded-lg transition-all cursor-pointer backdrop-blur-xs flex items-center gap-1"
                            >
                              <span>{sub.name}</span>
                              <ChevronRight className="w-3 h-3 opacity-70" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(cat.slug || cat.name)}
                          className="text-xs font-bold text-amber-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore All in {cat.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href="/contact-us"
                          className="bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] text-xs font-black px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          Request Quote
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TECHNICAL CONSULTATION & HOTLINE CTA BANNER */}
        <section className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Turnkey Equipment Procurement Helpdesk</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Need Customized Machinery or Industrial Panel Fabrication?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Consult with our senior power and electrical engineers for verified equipment specifications, site load calculations, and turnkey factory warranties.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a 
              href={cleanPhoneLink}
              className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#122B5A]" />
              <span>Call Hotline: {contactPhone}</span>
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white text-[#122B5A] hover:bg-slate-100 font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Submit Project Inquiry</span>
              <ArrowRight className="w-4 h-4 text-[#122B5A]" />
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#122B5A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CategoryCatalogContent />
    </Suspense>
  );
}
