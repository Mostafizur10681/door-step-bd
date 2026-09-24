"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart, Eye, ShoppingBag, ChevronRight, Tag, SlidersHorizontal, PackageX } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { isProductOutOfStock } from "@/lib/productAdapter";
import { API_V1 } from "@/lib/api";

const defaultDiscountedProducts = [
  {
    id: "disc-1",
    name: "Brazil Player Addition Home Yellow Jersey",
    price: 850.0,
    originalPrice: 1000.0,
    discountPercentage: 15,
    rating: 5,
    isSale: true,
    category: "Sports & Fitness",
    mainImage: "https://smtmartbd.s3.ap-southeast-1.amazonaws.com/products/jersey.png",
  },
  {
    id: "disc-2",
    name: "Upanib 15mg Capsule",
    price: 950.0,
    originalPrice: 1200.0,
    discountPercentage: 21,
    rating: 5,
    isSale: true,
    category: "Medicine & Health",
    mainImage: "https://smtmartbd.s3.ap-southeast-1.amazonaws.com/products/upanib.png",
  },
  {
    id: "disc-3",
    name: "Rutinib Cream 15g Topical Cream",
    price: 1200.0,
    originalPrice: 1350.0,
    discountPercentage: 11,
    rating: 5,
    isSale: true,
    category: "Skin Care",
    mainImage: "https://smtmartbd.s3.ap-southeast-1.amazonaws.com/products/rutinib.png",
  },
  {
    id: "disc-4",
    name: "Naturya Organic Maca Powder (300 gm)",
    price: 1890.0,
    originalPrice: 2600.0,
    discountPercentage: 27,
    rating: 5,
    isSale: true,
    category: "Organic Food",
    mainImage: "/prod_maca.png",
  },
  {
    id: "disc-5",
    name: "Naturya Maca Powder 125 gm",
    price: 1150.0,
    originalPrice: 1590.0,
    discountPercentage: 28,
    rating: 5,
    isSale: true,
    category: "Organic Food",
    mainImage: "/prod_maca.png",
  },
  {
    id: "disc-6",
    name: "Swanson Maca Capsule 500 mg Capsule",
    price: 1450.0,
    originalPrice: 1650.0,
    discountPercentage: 12,
    rating: 5,
    isSale: true,
    category: "Food Supplements",
    mainImage: "/prod_maca.png",
  },
];

interface OrganicFoodSectionProps {
  products?: any[];
}

export function OrganicFoodSection({ products: initialProducts }: OrganicFoodSectionProps) {
  const { addToCart, addToWishlist, isInWishlist, setQuickViewProduct } = useShop();
  const [items, setItems] = useState<any[]>(defaultDiscountedProducts);

  useEffect(() => {
    const processProducts = (rawList: any[]) => {
      if (!Array.isArray(rawList) || rawList.length === 0) return [];

      const normalized = rawList.map((p: any) => {
        const priceVal = typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0)) || 0;
        const saleVal = p.sale_price ? parseFloat(String(p.sale_price)) : 0;
        let origPrice: number | undefined = undefined;

        if (p.originalPrice && parseFloat(String(p.originalPrice)) > priceVal) {
          origPrice = parseFloat(String(p.originalPrice));
        } else if (saleVal > 0 && priceVal > saleVal) {
          origPrice = priceVal;
        }

        let discPercent: number | undefined = undefined;
        if (typeof p.discountPercentage === "number" && !isNaN(p.discountPercentage) && p.discountPercentage > 0) {
          discPercent = p.discountPercentage;
        } else if (origPrice && priceVal > 0 && origPrice > priceVal) {
          const calc = Math.round(((origPrice - priceVal) / origPrice) * 100);
          if (!isNaN(calc) && calc > 0) discPercent = calc;
        }

        const effectivePrice = saleVal > 0 && priceVal > saleVal ? saleVal : priceVal;
        const isDiscounted = Boolean(p.isSale || p.sale_price || (origPrice && origPrice > effectivePrice) || discPercent);

        return {
          id: p.id,
          name: p.name || "",
          slug: p.slug || String(p.id),
          category: typeof p.category === "string" ? p.category : (p.category?.name || "General"),
          price: effectivePrice,
          originalPrice: origPrice,
          discountPercentage: discPercent,
          mainImage: p.main_image || p.image || p.mainImage || (Array.isArray(p.images) && p.images[0]) || "/prod_chia.png",
          rating: p.rating ? parseFloat(String(p.rating)) : 5,
          isSale: isDiscounted,
          attributes: p.attributes,
          has_variants: Boolean(p.has_variants || p.hasVariants || (Array.isArray(p.variants) && p.variants.length > 0)),
          variants: p.variants,
          colors: p.colors,
          sizes: p.sizes,
          options: p.options,
        };
      });

      // Filter and prioritize discounted / on-sale products
      const discounted = normalized.filter((p) => p.isSale || (p.discountPercentage && p.discountPercentage > 0));
      const nonDiscounted = normalized.filter((p) => !p.isSale && (!p.discountPercentage || p.discountPercentage <= 0));
      const combined = [...discounted, ...nonDiscounted];

      return combined.slice(0, 6);
    };

    if (initialProducts && initialProducts.length > 0) {
      const processed = processProducts(initialProducts);
      if (processed.length > 0) {
        setItems(processed);
        return;
      }
    }

    const fetchApiProducts = async () => {
      try {
        const res = await fetch(`${API_V1}/products?per_page=50`);
        if (!res.ok) return;
        const json = await res.json();
        const list = json.data?.data || json.data || [];
        const processed = processProducts(list);
        if (processed.length > 0) {
          setItems(processed);
        }
      } catch {
        // Keep default static items
      }
    };

    fetchApiProducts();
  }, [initialProducts]);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">

        {/* Left Side: Responsive Product Cards Grid (Col 8, 2-cols mobile) */}
        <div className="lg:col-span-8 bg-slate-200 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-px order-2 lg:order-1">
          {items.map((prod, idx) => {
            const isOutOfStock = isProductOutOfStock(prod);
            const hasVariants = Boolean(
              (Array.isArray(prod.attributes) && prod.attributes.length > 0) ||
              (prod.attributes && typeof prod.attributes === "object" && Object.keys(prod.attributes).length > 0) ||
              (typeof prod.attributes === "string" && prod.attributes.length > 2 && prod.attributes !== "[]" && prod.attributes !== "{}") ||
              prod.has_variants ||
              prod.hasVariants ||
              (Array.isArray(prod.variants) && prod.variants.length > 0) ||
              (Array.isArray(prod.sizes) && prod.sizes.length > 0) ||
              (Array.isArray(prod.colors) && prod.colors.length > 0) ||
              (Array.isArray(prod.options) && prod.options.length > 0)
            );

            return (
              <div
                key={`${prod.id}-${idx}`}
                className="p-2.5 sm:p-4 flex flex-col justify-between bg-white hover:shadow-lg transition-all duration-300 relative group/org overflow-hidden"
              >
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
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-200/90 text-slate-600 hover:bg-[#122B5A] hover:text-white hover:border-[#122B5A] hover:scale-105 flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer sm:opacity-0 sm:group-hover/org:opacity-100 opacity-90"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div>
                  {/* Product Image Container */}
                  <div className={`w-full h-32 sm:h-44 bg-white rounded-lg flex items-center justify-center overflow-hidden relative mb-2 sm:mb-3 ${isOutOfStock ? "opacity-75" : ""}`}>
                    {/* Badges (Out of Stock / Discount / Sale) */}
                    <div className="absolute top-0 left-0 z-10 flex flex-col gap-1 pointer-events-none">
                      {isOutOfStock ? (
                        <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <PackageX className="w-3 h-3" /> OUT OF STOCK
                        </span>
                      ) : (
                        <>
                          {Boolean(prod.discountPercentage && prod.discountPercentage > 0) ? (
                            <span className="bg-[#FFB800] text-[#122B5A] font-bold text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              -{prod.discountPercentage}%
                            </span>
                          ) : prod.isSale ? (
                            <span className="bg-[#FFB800] text-[#122B5A] font-bold text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              SALE
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>

                    <Link href={`/product/${prod.slug || prod.id}`} className="relative w-full h-full block">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-contain p-1.5 sm:p-2 group-hover/org:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/prod_chia.png"; }}
                      />
                    </Link>
                  </div>

                  {/* Category Tag */}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1">
                    {prod.category}
                  </span>

                  {/* Product Title */}
                  <Link href={`/product/${prod.slug || prod.id}`}>
                    <h3 className="font-semibold text-slate-800 text-[11px] sm:text-xs line-clamp-2 hover:text-[#122B5A] transition leading-tight sm:leading-snug min-h-[28px] sm:min-h-[32px] mt-0.5 mb-1.5">
                      {prod.name}
                    </h3>
                  </Link>
                </div>

                {/* Price & Rating & Action Footer */}
                <div className="mt-1 sm:mt-2 space-y-2 pt-1.5 sm:pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#122B5A] font-black text-xs sm:text-sm">
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
                      className="w-full bg-[#122B5A] hover:bg-[#0B1B38] text-white font-bold text-[10px] sm:text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
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
                      className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-bold text-[10px] sm:text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
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

        {/* Right Side: Deep Navy Banner Box (Col 4) */}
        <div className="lg:col-span-4 bg-[#122B5A] p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-center relative overflow-hidden order-1 lg:order-2">
          {/* Subtle background circular pattern design */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-white/5 rounded-full pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[11px] font-bold uppercase tracking-wider mx-auto">
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>Mega Discounts</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              Exclusive Deals <br />
              & Big Discounts <br />
              <span className="text-amber-300">On Top Products</span>
            </h2>

            <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Save more on every order with our exclusive discounted deals and limited-time price drops.
            </p>

            <div className="pt-2">
              <Link
                href="/discount"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all duration-300 group/btn cursor-pointer active:scale-95"
              >
                <span>See More</span>
                <ChevronRight className="w-4 h-4 text-[#122B5A] group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Named alias export for clear import semantics
export const DiscountedProductsSection = OrganicFoodSection;

