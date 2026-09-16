"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ShoppingBag,
  Heart,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Minus,
  Plus,
  X,
  PackageX,
  Star,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { isProductOutOfStock } from "@/lib/productAdapter";

export interface CatalogProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  category: string;
  categoryId?: number | string | null;
  categorySlug?: string;
  subCategory?: string;
  subCategorySlug?: string;
  subCategoryId?: number | string | null;
  rating?: number;
  reviewsCount?: number;
  discountPercentage?: number;
  isBestSeller?: boolean;
  isSale?: boolean;
  isNew?: boolean;
  isOrganic?: boolean;
  isFeatured?: boolean;
  attributes?: any;
  has_variants?: boolean;
  variants?: any[];
}

export interface SubCategoryItem {
  id: number | string;
  name: string;
  slug: string;
  category_id?: number | string;
}

export interface CategoryItem {
  id: number | string;
  name: string;
  slug: string;
  sub_categories?: SubCategoryItem[];
  subcategories?: SubCategoryItem[];
  subCategories?: SubCategoryItem[];
}

interface GhorerBazarCatalogProps {
  pageTitle: string;
  breadcrumbTitle?: string;
  initialProducts?: CatalogProduct[];
  defaultCategorySlug?: string;
  defaultSubCategorySlug?: string;
  defaultSearchQuery?: string;
  defaultFlag?: "bestseller" | "sale" | "new" | "all";
}

export function GhorerBazarCatalog({
  pageTitle,
  breadcrumbTitle,
  initialProducts,
  defaultCategorySlug,
  defaultSubCategorySlug,
  defaultSearchQuery,
  defaultFlag = "all",
}: GhorerBazarCatalogProps) {
  const { addToCart, addToWishlist, isInWishlist, setQuickViewProduct } = useShop();

  // State
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts || []);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);

  // Filters State
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [maxProductPrice, setMaxProductPrice] = useState<number>(5000);
  
  // MULTI-SELECT CATEGORIES & SUBCATEGORIES STATE
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(defaultSearchQuery || "");

  // PRODUCT FLAGS STATE
  const [selectedFlags, setSelectedFlags] = useState<string[]>(
    defaultFlag === "bestseller"
      ? ["Best Selling"]
      : defaultFlag === "sale"
      ? ["Offered Items"]
      : defaultFlag === "new"
      ? ["New Arrival"]
      : []
  );

  const [sortBy, setSortBy] = useState<string>("default");

  // Grid column view options: 2, 3, 4 or list on desktop; 2 (default), 1, or wide scope on mobile
  const [gridCols, setGridCols] = useState<number | "list">(3);
  const [mobileCols, setMobileCols] = useState<1 | 2>(2);

  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState({
    price: true,
    categories: true,
    flags: true,
  });

  // Mobile Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Prevent multiple duplicate fetches with ref
  const fetchedRef = useRef(false);

  // Toggle Accordion Section
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Fetch API products & categories ONCE on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    if (!initialProducts || initialProducts.length === 0) {
      setLoading(true);

      Promise.all([
        fetch(`${apiUrl}/api/v1/categories?all=1`).then((res) => res.json()).catch(() => ({ data: [] })),
        fetch(`${apiUrl}/api/v1/products?per_page=100`).then((res) => res.json()).catch(() => ({ data: [] }))
      ])
        .then(([catsRes, prodsRes]) => {
          const rawCats = catsRes?.data || (Array.isArray(catsRes) ? catsRes : []);
          const catsList: CategoryItem[] = Array.isArray(rawCats) ? rawCats : [];
          setCategories(catsList);

          // Build subcategories map from API categories
          const subMap = new Map<string, { id: number | string; name: string; slug: string }>();
          catsList.forEach((cat) => {
            const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];
            subs.forEach((sub) => {
              if (sub.id) {
                subMap.set(String(sub.id), { id: sub.id, name: sub.name, slug: sub.slug });
              }
            });
          });

          const rawProds = prodsRes?.data?.data || prodsRes?.data || [];
          if (Array.isArray(rawProds) && rawProds.length > 0) {
            const mapped: CatalogProduct[] = rawProds.map((p: any) => {
              const rawPrice = parseFloat(String(p.price || 0)) || 0;
              const rawSale = p.sale_price !== null && p.sale_price !== undefined ? parseFloat(String(p.sale_price)) : null;
              const hasDiscount = rawSale !== null && rawSale > 0 && rawSale < rawPrice;

              let activePrice = rawPrice;
              let originalPrice: number | undefined = undefined;

              if (hasDiscount) {
                activePrice = rawSale!;
                originalPrice = rawPrice;
              } else if (p.originalPrice || p.original_price) {
                originalPrice = parseFloat(String(p.originalPrice || p.original_price));
              }

              const discount = originalPrice && originalPrice > activePrice
                ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
                : (p.discount ? parseFloat(String(p.discount)) : undefined);

              const subId = p.sub_category_id || (p.sub_category && typeof p.sub_category === "object" ? p.sub_category.id : null) || p.subCategoryId || null;
              const subFromMap = subId ? subMap.get(String(subId)) : undefined;

              const subCatName = subFromMap?.name
                || (typeof p.sub_category === "string" ? p.sub_category : (p.sub_category?.name || p.subCategory?.name || (typeof p.subCategory === "string" ? p.subCategory : "") || p.sub_category_name || ""));

              const subCatSlug = subFromMap?.slug
                || (p.sub_category && typeof p.sub_category === "object" && p.sub_category.slug)
                || (p.subCategory && typeof p.subCategory === "object" && p.subCategory.slug)
                || p.sub_category_slug
                || (subCatName ? subCatName.toLowerCase().replace(/\s+/g, "-") : "");

              return {
                id: p.id,
                name: p.name || "Product",
                slug: p.slug || String(p.id),
                category: typeof p.category === "string" ? p.category : (p.category?.name || "General"),
                categoryId: p.category_id || p.category?.id || null,
                categorySlug: p.category?.slug || (typeof p.category === "string" ? p.category.toLowerCase().replace(/\s+/g, "-") : ""),
                subCategory: subCatName,
                subCategorySlug: subCatSlug,
                subCategoryId: subId,
                price: activePrice,
                originalPrice,
                discountPercentage: discount,
                mainImage: p.image || p.main_image || (Array.isArray(p.images) && p.images[0]) || "/prod_honey.png",
                rating: p.rating ? parseFloat(String(p.rating)) : 4.9,
                reviewsCount: p.reviews_count || 16,
                isBestSeller: Boolean(p.best_seller || p.is_bestseller),
                isSale: Boolean(hasDiscount || p.isSale || (originalPrice && originalPrice > activePrice)),
                isNew: Boolean(p.new_arrival || p.is_new),
                isOrganic: Boolean(p.organic || p.is_organic),
                isFeatured: Boolean(p.featured || p.is_featured),
                attributes: p.attributes,
                has_variants: Boolean(p.has_variants || (Array.isArray(p.variants) && p.variants.length > 0)),
                variants: p.variants,
              };
            });

            setProducts(mapped);

            const highest = Math.max(...mapped.map((p) => p.price), 5000);
            const roundedMax = Math.ceil(highest / 500) * 500;
            setMaxProductPrice(roundedMax);
            setMaxPrice(roundedMax);
            setMinPrice(0);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      fetch(`${apiUrl}/api/v1/categories?all=1`)
        .then((res) => res.json())
        .then((data) => {
          const list = data?.data || (Array.isArray(data) ? data : []);
          if (Array.isArray(list) && list.length > 0) {
            setCategories(list);
          }
        })
        .catch(() => {});

      const highest = Math.max(...initialProducts.map((p) => p.price), 5000);
      const roundedMax = Math.ceil(highest / 500) * 500;
      setMaxProductPrice(roundedMax);
      setMaxPrice(roundedMax);
      setMinPrice(0);
      setLoading(false);
    }
  }, []);

  // 2. Sync category & subcategory when default props change
  useEffect(() => {
    if (defaultCategorySlug && defaultCategorySlug !== "All") {
      const matchCat = categories.find(
        (c) =>
          c.slug?.toLowerCase() === defaultCategorySlug.toLowerCase() ||
          c.name?.toLowerCase() === defaultCategorySlug.toLowerCase()
      );

      // Check if defaultCategorySlug actually matches a subcategory
      let matchSub: SubCategoryItem | undefined = undefined;
      for (const cat of categories) {
        const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];
        const found = subs.find(
          (s) =>
            s.slug?.toLowerCase() === defaultCategorySlug.toLowerCase() ||
            s.name?.toLowerCase() === defaultCategorySlug.toLowerCase()
        );
        if (found) {
          matchSub = found;
          break;
        }
      }

      if (matchCat) {
        setSelectedCategories([matchCat.name]);
      } else if (matchSub) {
        setSelectedSubCategories([matchSub.name]);
      } else {
        setSelectedCategories([defaultCategorySlug]);
      }
    } else if (!defaultCategorySlug) {
      setSelectedCategories([]);
    }

    if (defaultSubCategorySlug && defaultSubCategorySlug !== "All") {
      let matchSub: SubCategoryItem | undefined = undefined;
      for (const cat of categories) {
        const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];
        const found = subs.find(
          (s) =>
            s.slug?.toLowerCase() === defaultSubCategorySlug.toLowerCase() ||
            s.name?.toLowerCase() === defaultSubCategorySlug.toLowerCase()
        );
        if (found) {
          matchSub = found;
          break;
        }
      }

      if (matchSub) {
        setSelectedSubCategories([matchSub.name]);
      } else {
        setSelectedSubCategories([defaultSubCategorySlug]);
      }
    } else if (!defaultSubCategorySlug) {
      setSelectedSubCategories([]);
    }

    if (defaultSearchQuery) {
      setSearchQuery(defaultSearchQuery);
    }
  }, [defaultCategorySlug, defaultSubCategorySlug, defaultSearchQuery, categories]);

  // Extract unique category names from products + categories list
  const availableCategories = useMemo(() => {
    const fromApi = categories.map((c) => c.name);
    const fromProds = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromProds])).filter(Boolean);
  }, [categories, products]);

  // Toggle Multiple Categories
  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Toggle Multiple SubCategories
  const toggleSubCategory = (subName: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
    );
  };

  // Toggle Product Flag
  const toggleFlag = (flag: string) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. MULTIPLE CATEGORIES & SUBCATEGORIES FILTER
    if (selectedCategories.length > 0 || selectedSubCategories.length > 0) {
      list = list.filter((p) => {
        // Match Category
        const catMatch = selectedCategories.length > 0 && selectedCategories.some((cat) => {
          const cLower = cat.toLowerCase();
          return (
            (p.category && p.category.toLowerCase() === cLower) ||
            (p.categorySlug && p.categorySlug.toLowerCase() === cLower) ||
            (p.categoryId && String(p.categoryId) === String(cat))
          );
        });

        // Match Subcategory
        const subCatMatch = selectedSubCategories.length > 0 && selectedSubCategories.some((sub) => {
          const sLower = sub.toLowerCase();

          // Check direct subcategory properties on product
          if (p.subCategory && p.subCategory.toLowerCase() === sLower) return true;
          if (p.subCategorySlug && p.subCategorySlug.toLowerCase() === sLower) return true;
          if (p.subCategoryId && String(p.subCategoryId) === String(sub)) return true;

          // Check through categories hierarchy for matching subcategory ID
          for (const cat of categories) {
            const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];
            for (const s of subs) {
              if (
                s.name.toLowerCase() === sLower ||
                s.slug.toLowerCase() === sLower ||
                String(s.id) === String(sub)
              ) {
                if (p.subCategoryId && String(p.subCategoryId) === String(s.id)) return true;
                if (p.subCategory && p.subCategory.toLowerCase() === s.name.toLowerCase()) return true;
                if (p.subCategorySlug && p.subCategorySlug.toLowerCase() === s.slug.toLowerCase()) return true;
              }
            }
          }

          return false;
        });

        if (selectedCategories.length > 0 && selectedSubCategories.length > 0) {
          return catMatch || subCatMatch;
        }
        if (selectedCategories.length > 0) {
          // Fallback if category selection happened to be a subcategory name
          const fallbackSub = selectedCategories.some((cat) => {
            const cLower = cat.toLowerCase();
            return (
              (p.subCategory && p.subCategory.toLowerCase() === cLower) ||
              (p.subCategorySlug && p.subCategorySlug.toLowerCase() === cLower)
            );
          });
          return catMatch || fallbackSub;
        }
        return subCatMatch;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }

    // 2. Price Range Filter (Min Price to Max Price)
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // 3. Product Flag Filter
    if (selectedFlags.length > 0) {
      list = list.filter((p) => {
        let match = false;
        if (selectedFlags.includes("Best Selling") && p.isBestSeller) match = true;
        if (
          selectedFlags.includes("Offered Items") &&
          (p.isSale || (p.discountPercentage && p.discountPercentage > 0))
        )
          match = true;
        if (selectedFlags.includes("New Arrival") && p.isNew) match = true;
        if (selectedFlags.includes("Organic") && p.isOrganic) match = true;
        return match;
      });
    }

    // 4. Sorting
    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case "newest":
        list.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
    }

    return list;
  }, [products, selectedCategories, selectedSubCategories, searchQuery, minPrice, maxPrice, selectedFlags, sortBy]);

  // Clear all filters
  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(maxProductPrice);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedFlags([]);
    setSearchQuery("");
    setSortBy("default");
  };

  const hasActiveFilters =
    minPrice > 0 ||
    maxPrice < maxProductPrice ||
    selectedCategories.length > 0 ||
    selectedSubCategories.length > 0 ||
    selectedFlags.length > 0 ||
    searchQuery.trim() !== "";

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-20 pt-6">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 space-y-6">

        {/* ─── 1. Top Header & Breadcrumb (Ghorer Bazar Style) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {pageTitle}
          </h1>

          {/* Breadcrumbs */}
          <nav className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-[#FF6600] transition">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-800 font-bold">
              {breadcrumbTitle || pageTitle}
            </span>
          </nav>
        </div>

        {/* ─── 2. Top Sorting & View Control Toolbar ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-1">
          
          {/* Left Group: Mobile Filter Button & Sort By Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:border-[#FF6600] transition cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#FF6600]" />
              <span>Filter Products</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#FF6600]"></span>
              )}
            </button>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Sort By :</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] shadow-xs cursor-pointer"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Group: Showing Count + Grid Switcher on the Right Edge */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Showing Count & Clear Filters */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>
                Showing <strong className="text-slate-800 font-bold">{filteredProducts.length}</strong> items
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#FF6600] font-bold hover:underline cursor-pointer ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Desktop Grid Switcher Icons (2, 3, 4 cols & List/Wide Scope) */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
              {/* 2 Cols */}
              <button
                type="button"
                onClick={() => setGridCols(2)}
                title="2 Columns Grid"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols === 2
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="4" cy="4" r="2.5" />
                  <circle cx="12" cy="4" r="2.5" />
                  <circle cx="4" cy="12" r="2.5" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>

              {/* 3 Cols */}
              <button
                type="button"
                onClick={() => setGridCols(3)}
                title="3 Columns Grid"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols === 3
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 18 18" fill="currentColor">
                  <circle cx="3" cy="3" r="2" />
                  <circle cx="9" cy="3" r="2" />
                  <circle cx="15" cy="3" r="2" />
                  <circle cx="3" cy="9" r="2" />
                  <circle cx="9" cy="9" r="2" />
                  <circle cx="15" cy="9" r="2" />
                  <circle cx="3" cy="15" r="2" />
                  <circle cx="9" cy="15" r="2" />
                  <circle cx="15" cy="15" r="2" />
                </svg>
              </button>

              {/* 4 Cols */}
              <button
                type="button"
                onClick={() => setGridCols(4)}
                title="4 Columns Grid"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols === 4
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-4" viewBox="0 0 22 16" fill="currentColor">
                  <circle cx="2.5" cy="3" r="1.6" />
                  <circle cx="7.5" cy="3" r="1.6" />
                  <circle cx="12.5" cy="3" r="1.6" />
                  <circle cx="17.5" cy="3" r="1.6" />
                  <circle cx="2.5" cy="8" r="1.6" />
                  <circle cx="7.5" cy="8" r="1.6" />
                  <circle cx="12.5" cy="8" r="1.6" />
                  <circle cx="17.5" cy="8" r="1.6" />
                  <circle cx="2.5" cy="13" r="1.6" />
                  <circle cx="7.5" cy="13" r="1.6" />
                  <circle cx="12.5" cy="13" r="1.6" />
                  <circle cx="17.5" cy="13" r="1.6" />
                </svg>
              </button>

              {/* List / Wide Scope View */}
              <button
                type="button"
                onClick={() => setGridCols("list")}
                title="Wide Scope / List View"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols === "list"
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="2.5" cy="3" r="1.5" />
                  <rect x="6" y="2" width="9" height="2" rx="1" />
                  <circle cx="2.5" cy="8" r="1.5" />
                  <rect x="6" y="7" width="9" height="2" rx="1" />
                  <circle cx="2.5" cy="13" r="1.5" />
                  <rect x="6" y="12" width="9" height="2" rx="1" />
                </svg>
              </button>
            </div>

            {/* Mobile-Only Switcher (2 Grid, 1 Grid & Wide Scope / List View) */}
            <div className="flex sm:hidden items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
              {/* 2 Grid View */}
              <button
                type="button"
                onClick={() => {
                  setMobileCols(2);
                  if (gridCols === "list") setGridCols(3);
                }}
                title="2 Grid View"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols !== "list" && mobileCols === 2
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1.5" y="2" width="5.5" height="12" rx="1" />
                  <rect x="9" y="2" width="5.5" height="12" rx="1" />
                </svg>
              </button>

              {/* 1 Grid View */}
              <button
                type="button"
                onClick={() => {
                  setMobileCols(1);
                  if (gridCols === "list") setGridCols(3);
                }}
                title="1 Grid View"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols !== "list" && mobileCols === 1
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                </svg>
              </button>

              {/* Wide Scope / List View */}
              <button
                type="button"
                onClick={() => setGridCols("list")}
                title="Wide Scope View"
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  gridCols === "list"
                    ? "text-[#FF6600] bg-orange-50 scale-105 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="2.5" cy="3" r="1.5" />
                  <rect x="6" y="2" width="9" height="2" rx="1" />
                  <circle cx="2.5" cy="8" r="1.5" />
                  <rect x="6" y="7" width="9" height="2" rx="1" />
                  <circle cx="2.5" cy="13" r="1.5" />
                  <rect x="6" y="12" width="9" height="2" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 3. Main 2-Column Catalog Layout (Sidebar + Product Grid) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* ─────────────────────────────────────────────────────────── */}
          {/* LEFT SIDEBAR FILTERS (Desktop)                             */}
          {/* ─────────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6 sticky top-24">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF6600]" /> Filters
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-[#FF6600] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* 1. PRICE RANGE ACCORDION */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 uppercase tracking-wider hover:text-[#FF6600] transition cursor-pointer"
              >
                <span>PRICE RANGE</span>
                {openSections.price ? (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openSections.price && (
                <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                  {/* From & To Price Input Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        From (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={maxPrice}
                          value={minPrice === 0 ? "" : minPrice}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setMinPrice(Math.max(0, val));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6600] focus:bg-white focus:ring-1 focus:ring-[#FF6600] transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        To (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={minPrice}
                          max={maxProductPrice}
                          value={maxPrice === 0 ? "" : maxPrice}
                          placeholder={String(maxProductPrice)}
                          onChange={(e) => {
                            const val = e.target.value === "" ? maxProductPrice : Number(e.target.value);
                            setMaxPrice(Math.max(minPrice, val));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6600] focus:bg-white focus:ring-1 focus:ring-[#FF6600] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Range Slider for Max Price */}
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min={0}
                      max={maxProductPrice}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6600]"
                    />
                  </div>

                  {/* Price Values Display */}
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                    <span className="font-mono text-slate-500">৳{minPrice.toLocaleString()}</span>
                    <span className="font-mono text-[#FF6600] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                      ৳{maxPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. CATEGORIES & SUB-CATEGORIES ACCORDION */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection("categories")}
                className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 uppercase tracking-wider hover:text-[#FF6600] transition cursor-pointer"
              >
                <span>CATEGORIES</span>
                {openSections.categories ? (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openSections.categories && (
                <div className="space-y-3 pt-1 max-h-72 overflow-y-auto pr-1 animate-in fade-in duration-200">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const isCatChecked = selectedCategories.some(
                        (c) => c.toLowerCase() === cat.name.toLowerCase() || c.toLowerCase() === cat.slug.toLowerCase()
                      );
                      const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];
                      const catProdCount = products.filter(
                        (p) =>
                          p.category?.toLowerCase() === cat.name.toLowerCase() ||
                          p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() ||
                          p.categoryId === cat.id
                      ).length;

                      return (
                        <div key={cat.id} className="space-y-1">
                          {/* Parent Category */}
                          <label className="flex items-center justify-between text-xs text-slate-800 font-semibold hover:text-[#FF6600] cursor-pointer group select-none py-0.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isCatChecked}
                                onChange={() => toggleCategory(cat.name)}
                                className="w-4 h-4 rounded-md border-slate-300 text-[#FF6600] focus:ring-[#FF6600] accent-[#FF6600] cursor-pointer"
                              />
                              <span className={`group-hover:translate-x-0.5 transition-transform ${isCatChecked ? "font-bold text-[#FF6600]" : ""}`}>
                                {cat.name}
                              </span>
                            </div>
                            {catProdCount > 0 && (
                              <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-full">
                                {catProdCount}
                              </span>
                            )}
                          </label>

                          {/* Sub-Categories List */}
                          {subs.length > 0 && (
                            <div className="ml-4 space-y-1 border-l-2 border-orange-100 pl-2.5 pt-0.5">
                              {subs.map((sub) => {
                                const isSubChecked = selectedSubCategories.some(
                                  (s) => s.toLowerCase() === sub.name.toLowerCase() || s.toLowerCase() === sub.slug.toLowerCase()
                                );
                                const subProdCount = products.filter(
                                  (p) =>
                                    (p.subCategory && p.subCategory.toLowerCase() === sub.name.toLowerCase()) ||
                                    (p.subCategorySlug && p.subCategorySlug.toLowerCase() === sub.slug.toLowerCase()) ||
                                    p.subCategoryId === sub.id
                                ).length;

                                return (
                                  <label
                                    key={sub.id}
                                    className="flex items-center justify-between text-[11px] text-slate-600 font-medium hover:text-[#FF6600] cursor-pointer group select-none py-0.5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSubChecked}
                                        onChange={() => toggleSubCategory(sub.name)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#FF6600] focus:ring-[#FF6600] accent-[#FF6600] cursor-pointer"
                                      />
                                      <span className={`${isSubChecked ? "font-bold text-[#FF6600]" : ""}`}>
                                        {sub.name}
                                      </span>
                                    </div>
                                    {subProdCount > 0 && (
                                      <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded-full">
                                        {subProdCount}
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    availableCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className="flex items-center justify-between text-xs text-slate-700 font-medium hover:text-[#FF6600] cursor-pointer group select-none py-0.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat)}
                              className="w-4 h-4 rounded-md border-slate-300 text-[#FF6600] focus:ring-[#FF6600] accent-[#FF6600] cursor-pointer"
                            />
                            <span className={`${isChecked ? "font-bold text-slate-900" : ""}`}>
                              {cat}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 3. PRODUCT FLAG ACCORDION (MULTI-SELECT CHECKBOXES) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection("flags")}
                className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 uppercase tracking-wider hover:text-[#FF6600] transition cursor-pointer"
              >
                <span>PRODUCT FLAG</span>
                {openSections.flags ? (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {openSections.flags && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  {[
                    { label: "Best Selling", color: "text-amber-600" },
                    { label: "Offered Items", color: "text-rose-600" },
                    { label: "New Arrival", color: "text-emerald-600" },
                    { label: "Organic", color: "text-green-600" },
                  ].map((flag) => {
                    const isChecked = selectedFlags.includes(flag.label);
                    return (
                      <label
                        key={flag.label}
                        className="flex items-center gap-2.5 text-xs text-slate-700 font-medium hover:text-[#FF6600] cursor-pointer group select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFlag(flag.label)}
                          className="w-4 h-4 rounded-md border-slate-300 text-[#FF6600] focus:ring-[#FF6600] accent-[#FF6600] cursor-pointer"
                        />
                        <span className={`${isChecked ? "font-bold text-slate-900" : ""}`}>
                          {flag.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* RIGHT PRODUCT GRID (Ghorer Bazar Style Cards)               */}
          {/* ─────────────────────────────────────────────────────────── */}
          <main className="lg:col-span-9 space-y-6">

            {/* Loading State */}
            {loading && <ProductGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3" />}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
                <PackageX className="w-14 h-14 mx-auto text-slate-300" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No products match your selected filters</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try checking different categories, adjusting the price slider, or resetting your filter choices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#E65A00] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Products Grid / List View */}
            {!loading && filteredProducts.length > 0 && (
              <div
                className={
                  gridCols === "list"
                    ? "flex flex-col gap-4"
                    : `grid ${mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"} ${
                        gridCols === 2
                          ? "sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
                          : gridCols === 3
                          ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
                          : gridCols === 4
                          ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                          : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      } gap-3 sm:gap-6`
                }
              >
                {filteredProducts.map((prod) => {
                  const hasDiscount = Boolean(
                    (prod.originalPrice && prod.originalPrice > prod.price) ||
                    (prod.discountPercentage && prod.discountPercentage > 0)
                  );

                  const p = prod as any;
                  const isOutOfStock = isProductOutOfStock(p);
                  const hasVariants = Boolean(
                    p.has_variants ||
                    p.hasVariants ||
                    (Array.isArray(p.variants) && p.variants.length > 0) ||
                    (Array.isArray(p.sizes) && p.sizes.length > 0) ||
                    (Array.isArray(p.colors) && p.colors.length > 0) ||
                    (Array.isArray(p.options) && p.options.length > 0) ||
                    (Array.isArray(p.attributes) && p.attributes.length > 0) ||
                    (typeof p.attributes === "object" && p.attributes !== null && Object.keys(p.attributes).length > 0) ||
                    (typeof p.attributes === "string" && p.attributes.trim().length > 2 && p.attributes.trim() !== "[]" && p.attributes.trim() !== "{}")
                  );

                  if (gridCols === "list") {
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-xl border border-slate-200/85 p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-lg hover:border-[#FF6600]/40 transition-all duration-300 relative group/card w-full"
                      >
                        {/* Image Container */}
                        <div className={`w-full sm:w-44 h-44 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden relative shrink-0 ${isOutOfStock ? "opacity-75" : ""}`}>
                          {/* Top Product Flag Badge */}
                          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
                            {isOutOfStock ? (
                              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                <PackageX className="w-3 h-3" /> Out of Stock
                              </span>
                            ) : prod.isBestSeller ? (
                              <span className="bg-[#FF6600] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                Best Selling
                              </span>
                            ) : hasDiscount ? (
                              <span className="bg-[#FF6600] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                Offered Items
                              </span>
                            ) : prod.isNew ? (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                New Arrival
                              </span>
                            ) : null}
                          </div>

                          <Link href={`/product/${prod.slug || prod.id}`} className="relative w-full h-full block">
                            <Image
                              src={prod.mainImage}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 200px"
                              className="object-contain p-2 group-hover/card:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {prod.category}
                          </span>

                          <Link href={`/product/${prod.slug || prod.id}`}>
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base hover:text-[#FF6600] transition leading-snug">
                              {prod.name}
                            </h3>
                          </Link>

                          {/* Price */}
                          <div className="flex items-baseline justify-center sm:justify-start gap-2 pt-1">
                            <span className="text-base sm:text-lg font-black text-[#FF6600]">
                              ৳{prod.price.toLocaleString()}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                ৳{prod.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full sm:w-auto flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          {isOutOfStock ? (
                            <button
                              type="button"
                              disabled
                              className="flex-1 sm:flex-initial bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs sm:text-sm py-2 px-5 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
                            >
                              <PackageX className="w-4 h-4 text-slate-400" />
                              <span>Out of Stock</span>
                            </button>
                          ) : hasVariants ? (
                            <button
                              type="button"
                              onClick={() => setQuickViewProduct(prod)}
                              className="flex-1 sm:flex-initial bg-[#002B49] text-white hover:bg-[#001D33] font-bold text-xs sm:text-sm py-2 px-5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-xs cursor-pointer"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                              <span>Select Options</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(prod, 1)}
                              className="flex-1 sm:flex-initial bg-[#FF6600] text-white hover:bg-[#E65A00] font-bold text-xs sm:text-sm py-2 px-5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-xs cursor-pointer"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add To Cart</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addToWishlist(prod)}
                              className={`p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                                isInWishlist(prod.id)
                                  ? "bg-rose-500 text-white border-rose-500"
                                  : "bg-white text-slate-600 hover:bg-[#FF6600] hover:text-white"
                              }`}
                              title="Add to Wishlist"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setQuickViewProduct(prod)}
                              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-[#002B49] hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={prod.id}
                      className="p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 bg-white rounded-xl border border-slate-200/85 relative group/card overflow-hidden"
                    >
                      {/* OUT OF STOCK or SALE / DISCOUNT or New Badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none flex items-center gap-1">
                          <PackageX className="w-3 h-3" /> OUT OF STOCK
                        </span>
                      ) : Boolean(prod.discountPercentage && prod.discountPercentage > 0) ? (
                        <span className="absolute top-2 left-2 z-10 bg-[#FF6600] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none">
                          -{prod.discountPercentage}%
                        </span>
                      ) : prod.isBestSeller ? (
                        <span className="absolute top-2 left-2 z-10 bg-[#FF6600] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none">
                          BEST SELLER
                        </span>
                      ) : Boolean(prod.originalPrice && prod.originalPrice > prod.price) ? (
                        <span className="absolute top-2 left-2 z-10 bg-[#FF6600] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none">
                          SALE
                        </span>
                      ) : prod.isNew ? (
                        <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none">
                          NEW
                        </span>
                      ) : null}

                      {/* Top-Right Floating Action Stack (Wishlist + Quick View) */}
                      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 items-center">
                        {/* Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToWishlist(prod);
                          }}
                          title={isInWishlist(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          aria-label="Add to Wishlist"
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs border transition-all duration-200 cursor-pointer ${
                            isInWishlist(prod.id)
                              ? "bg-rose-50 border-rose-200 text-rose-600"
                              : "bg-white/95 border-slate-200/90 text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-200 hover:scale-105"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isInWishlist(prod.id) ? "fill-rose-600 text-rose-600" : "text-slate-400"}`} />
                        </button>

                        {/* Quick View Eye Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(prod);
                          }}
                          title="Quick View"
                          aria-label="Quick View"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-200/90 text-slate-600 hover:bg-[#002B49] hover:text-white hover:border-[#002B49] hover:scale-105 flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer sm:opacity-0 sm:group-hover/card:opacity-100 opacity-90"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <div>
                        {/* Image Container */}
                        <div className={`w-full h-36 sm:h-48 bg-white rounded-md flex items-center justify-center overflow-hidden relative mb-2 sm:mb-3 group-hover/card:scale-105 transition-transform duration-300 ${isOutOfStock ? "opacity-75" : ""}`}>
                          <Link href={`/product/${prod.slug || prod.id}`} className="relative w-full h-full block">
                            <Image
                              src={prod.mainImage}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-1.5 sm:p-2"
                            />
                          </Link>
                        </div>

                        {/* Category Subtitle */}
                        {prod.category && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1 block mb-0.5">
                            {prod.category}
                          </span>
                        )}

                        {/* Product Title */}
                        <Link href={`/product/${prod.slug || prod.id}`}>
                          <h3 className="font-semibold text-slate-800 text-[11px] sm:text-xs line-clamp-2 hover:text-[#002B49] transition leading-tight sm:leading-snug mb-1.5 min-h-[28px] sm:min-h-[32px]">
                            {prod.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Price & Rating & Add to Cart Footer */}
                      <div className="mt-1 sm:mt-2 space-y-2 pt-1.5 sm:pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#FF6600] font-black text-xs sm:text-sm">
                              ৳{typeof prod.price === "number" ? prod.price.toFixed(0) : prod.price}
                            </span>
                            {Boolean(prod.originalPrice && prod.originalPrice > prod.price) && (
                              <span className="text-slate-400 line-through text-[10px] sm:text-[11px]">
                                ৳{typeof prod.originalPrice === "number" ? prod.originalPrice.toFixed(0) : prod.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center text-amber-400 gap-0.5 text-[9px] sm:text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        {/* Action Button (Out of Stock vs Variant vs Direct Add) */}
                        {isOutOfStock ? (
                          <button
                            type="button"
                            disabled
                            aria-label={`${prod.name} is Out of Stock`}
                            className="w-full bg-slate-100 text-slate-400 border border-slate-200 text-[10px] sm:text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed shadow-none"
                          >
                            <PackageX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Out of Stock</span>
                          </button>
                        ) : hasVariants ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(prod);
                            }}
                            aria-label={`Select options for ${prod.name}`}
                            className="w-full bg-[#002B49] hover:bg-[#001D33] text-white text-[10px] sm:text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>Select Options</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(prod, 1);
                            }}
                            aria-label={`Add ${prod.name} to Cart`}
                            className="w-full bg-[#FF6600] hover:bg-[#E65A00] text-white text-[10px] sm:text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </main>

        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE FILTER DRAWER                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="p-5 space-y-6 overflow-y-auto">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF6600]" /> Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full border border-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Price Range */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                  PRICE RANGE
                </span>

                {/* From & To Price Input Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      From (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={maxPrice}
                        value={minPrice === 0 ? "" : minPrice}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setMinPrice(Math.max(0, val));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6600] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      To (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={minPrice}
                        max={maxProductPrice}
                        value={maxPrice === 0 ? "" : maxPrice}
                        placeholder={String(maxProductPrice)}
                        onChange={(e) => {
                          const val = e.target.value === "" ? maxProductPrice : Number(e.target.value);
                          setMaxPrice(Math.max(minPrice, val));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6600] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={maxProductPrice}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6600]"
                />
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 font-mono">
                  <span className="text-slate-500">৳{minPrice.toLocaleString()}</span>
                  <span className="text-[#FF6600]">৳{maxPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Mobile Categories & Subcategories (Multi-select) */}
              <div className="space-y-2.5 pb-4 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                  CATEGORIES
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const isCatChecked = selectedCategories.some(
                        (c) => c.toLowerCase() === cat.name.toLowerCase() || c.toLowerCase() === cat.slug.toLowerCase()
                      );
                      const subs = cat.sub_categories || cat.subcategories || cat.subCategories || [];

                      return (
                        <div key={cat.id} className="space-y-1">
                          <label className="flex items-center justify-between text-xs text-slate-800 font-semibold cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isCatChecked}
                                onChange={() => toggleCategory(cat.name)}
                                className="w-4 h-4 rounded text-[#FF6600] accent-[#FF6600]"
                              />
                              <span className={isCatChecked ? "font-bold text-[#FF6600]" : ""}>{cat.name}</span>
                            </div>
                          </label>

                          {subs.length > 0 && (
                            <div className="ml-4 space-y-1 border-l-2 border-orange-100 pl-2">
                              {subs.map((sub) => {
                                const isSubChecked = selectedSubCategories.some(
                                  (s) => s.toLowerCase() === sub.name.toLowerCase() || s.toLowerCase() === sub.slug.toLowerCase()
                                );

                                return (
                                  <label key={sub.id} className="flex items-center justify-between text-[11px] text-slate-600 font-medium cursor-pointer py-0.5">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSubChecked}
                                        onChange={() => toggleSubCategory(sub.name)}
                                        className="w-3.5 h-3.5 rounded text-[#FF6600] accent-[#FF6600]"
                                      />
                                      <span className={isSubChecked ? "font-bold text-[#FF6600]" : ""}>{sub.name}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    availableCategories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 rounded text-[#FF6600] accent-[#FF6600]"
                        />
                        <span>{cat}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Mobile Flags */}
              <div className="space-y-2.5 pb-4 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                  PRODUCT FLAG
                </span>
                <div className="space-y-2">
                  {["Best Selling", "Offered Items", "New Arrival", "Organic"].map((flag) => (
                    <label key={flag} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedFlags.includes(flag)}
                        onChange={() => toggleFlag(flag)}
                        className="w-4 h-4 rounded text-[#FF6600] accent-[#FF6600]"
                      />
                      <span>{flag}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#FF6600] text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
