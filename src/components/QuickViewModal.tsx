"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  CheckCircle2,
  Heart,
  Share2,
  PhoneCall,
  Sparkles,
  Loader2,
  Maximize2,
  PackageX,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductImageModal } from "@/components/ProductImageModal";
import { isProductOutOfStock } from "@/lib/productAdapter";
import { API_V1 } from "@/lib/api";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, addToWishlist, isInWishlist, showToast } = useShop();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [detailedProduct, setDetailedProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (quickViewProduct) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewProduct]);

  // Fetch full details & related products when product opens
  useEffect(() => {
    if (!quickViewProduct) {
      setDetailedProduct(null);
      setRelatedProducts([]);
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedAttributes({});
      setIsImageLightboxOpen(false);
      return;
    }

    setQuantity(1);
    setSelectedImageIndex(0);
    const prodIdOrSlug = quickViewProduct.slug || quickViewProduct.id;

    if (!prodIdOrSlug) return;

    setLoadingDetails(true);

    // Fetch full product object
    fetch(`${API_V1}/products/${prodIdOrSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product details");
        return res.json();
      })
      .then((data) => {
        const raw = data?.data || data?.product;
        if (raw) {
          const rawPrice = parseFloat(String(raw.price || 0)) || 0;
          const rawSalePrice = raw.sale_price !== null && raw.sale_price !== undefined ? parseFloat(String(raw.sale_price)) : null;

          let activePrice = rawPrice;
          let origPrice: number | undefined = undefined;

          if (rawSalePrice !== null && rawSalePrice > 0 && rawSalePrice < rawPrice) {
            activePrice = rawSalePrice;
            origPrice = rawPrice;
          } else if (raw.originalPrice || raw.original_price) {
            origPrice = parseFloat(String(raw.originalPrice || raw.original_price));
          }

          const mainImg = raw.image || raw.main_image || (Array.isArray(raw.images) && raw.images[0]) || quickViewProduct.mainImage || "/prod_jersey.png";
          let gallery = Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [mainImg];
          if (gallery.length === 1 && quickViewProduct.images && quickViewProduct.images.length > 1) {
            gallery = quickViewProduct.images;
          }

          // Safely parse attributes
          let parsedAttributes: any = raw.attributes;
          if (typeof raw.attributes === "string") {
            try {
              parsedAttributes = JSON.parse(raw.attributes);
            } catch {
              parsedAttributes = raw.attributes;
            }
          }

          const isRawOutOfStock = isProductOutOfStock(raw) || isProductOutOfStock(quickViewProduct);
          let stockVal = 30;
          if (raw.stock !== undefined && raw.stock !== null && !isNaN(Number(raw.stock))) {
            stockVal = Number(raw.stock);
          } else if (raw.stock_quantity !== undefined && raw.stock_quantity !== null && !isNaN(Number(raw.stock_quantity))) {
            stockVal = Number(raw.stock_quantity);
          } else if (quickViewProduct.stock !== undefined && quickViewProduct.stock !== null && !isNaN(Number(quickViewProduct.stock))) {
            stockVal = Number(quickViewProduct.stock);
          }
          if (isRawOutOfStock) stockVal = 0;

          const fullObj = {
            id: raw.id,
            name: raw.name || quickViewProduct.name,
            slug: raw.slug || quickViewProduct.slug || String(raw.id),
            category: typeof raw.category === "string" ? raw.category : (raw.category?.name || quickViewProduct.category || "MEN"),
            subCategory: raw.sub_category || raw.subCategory || null,
            price: activePrice,
            originalPrice: origPrice || null,
            sku: raw.SKU || raw.sku || quickViewProduct.sku || `SKU-${raw.id}`,
            brand: raw.brand || quickViewProduct.brand || "Nike",
            stock: stockVal,
            stockStatus: stockVal > 0 ? "In Stock" : "Out of Stock",
            isOutOfStock: stockVal <= 0,
            mainImage: mainImg,
            images: gallery,
            description: raw.description || raw.short_description || quickViewProduct.description || "",
            rating: raw.rating ? parseFloat(String(raw.rating)) : (quickViewProduct.rating || 5.0),
            reviewsCount: raw.reviews_count || quickViewProduct.reviewsCount || 3,
            attributes: parsedAttributes || quickViewProduct.attributes || [],
            variants: Array.isArray(raw.variants) ? raw.variants : (quickViewProduct.variants || []),
            has_variants: Boolean(raw.has_variants || quickViewProduct.has_variants),
            isNew: Boolean(raw.new_arrival || raw.is_new || quickViewProduct.isNew),
            discountPercentage: quickViewProduct.discountPercentage,
          };

          setDetailedProduct(fullObj);
        }
      })
      .catch(() => {
        // Fallback to minimal quickViewProduct
      })
      .finally(() => {
        setLoadingDetails(false);
      });

    // Fetch related products for recommendations
    if (quickViewProduct.categoryId || quickViewProduct.category) {
      fetch(`${API_V1}/products?limit=4`)
        .then((res) => res.json())
        .then((data) => {
          if (data && (data.data || data.products)) {
            const list = data.data || data.products;
            if (Array.isArray(list)) {
              setRelatedProducts(
                list
                  .filter((item: any) => String(item.id) !== String(quickViewProduct.id))
                  .slice(0, 3)
              );
            }
          }
        })
        .catch(() => {});
    }
  }, [quickViewProduct]);

  // Extract all attribute and variant groups dynamically
  const groupedAttributes: Record<string, string[]> = React.useMemo(() => {
    const rawAttrs = detailedProduct?.attributes || quickViewProduct?.attributes;
    const rawVariants = detailedProduct?.variants || quickViewProduct?.variants;

    const grouped: Record<string, string[]> = {};

    const addVal = (key: string, val: any) => {
      if (!key || val === null || val === undefined) return;
      const cleanK = String(key).trim();
      const cleanV = String(val).trim();
      if (!cleanK || !cleanV) return;
      if (!grouped[cleanK]) grouped[cleanK] = [];
      if (!grouped[cleanK].includes(cleanV)) {
        grouped[cleanK].push(cleanV);
      }
    };

    // 1. Process attributes (supports JSON string, object, or array)
    if (rawAttrs) {
      let parsed = rawAttrs;
      if (typeof rawAttrs === "string") {
        try {
          parsed = JSON.parse(rawAttrs);
        } catch {
          // not json
        }
      }

      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (typeof item === "string") {
            addVal("Option", item);
          } else if (item && typeof item === "object") {
            if (item.name && item.value) {
              addVal(item.name, item.value);
            } else if (item.name && Array.isArray(item.values)) {
              item.values.forEach((v: any) => addVal(item.name, v));
            } else {
              Object.entries(item).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                  v.forEach((val) => addVal(k, val));
                } else if (v !== null && v !== undefined) {
                  addVal(k, v);
                }
              });
            }
          }
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((val) => addVal(k, val));
          } else if (v !== null && v !== undefined) {
            addVal(k, v);
          }
        });
      }
    }

    // 2. Process variants (if any)
    if (Array.isArray(rawVariants) && rawVariants.length > 0) {
      rawVariants.forEach((v: any) => {
        if (typeof v === "string") {
          addVal("Variant", v);
        } else if (v && typeof v === "object") {
          if (v.attributes) {
            let vAttrs = v.attributes;
            if (typeof vAttrs === "string") {
              try { vAttrs = JSON.parse(vAttrs); } catch {}
            }
            if (typeof vAttrs === "object" && vAttrs !== null) {
              Object.entries(vAttrs).forEach(([attrK, attrV]) => {
                if (Array.isArray(attrV)) {
                  attrV.forEach((val) => addVal(attrK, val));
                } else if (attrV !== null && attrV !== undefined) {
                  addVal(attrK, attrV);
                }
              });
            }
          }
          if (v.color) addVal("Color", v.color);
          if (v.size) addVal("Size", v.size);
          if (v.weight) addVal("Weight", v.weight);
          if (v.flavor) addVal("Flavor", v.flavor);
          if (!v.color && !v.size && !v.weight && !v.flavor && (v.name || v.title || v.variant_name)) {
            addVal("Variant", v.name || v.title || v.variant_name);
          }
        }
      });
    }

    return grouped;
  }, [detailedProduct, quickViewProduct]);

  // Pre-fill selected attributes when groupedAttributes become available
  useEffect(() => {
    if (Object.keys(groupedAttributes).length > 0) {
      setSelectedAttributes((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        Object.entries(groupedAttributes).forEach(([k, vals]) => {
          if (!next[k] && vals.length > 0) {
            next[k] = vals[0];
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [groupedAttributes]);

  if (!quickViewProduct) return null;

  const fallbackStock = isProductOutOfStock(quickViewProduct) ? 0 : (quickViewProduct.stock !== undefined && !isNaN(Number(quickViewProduct.stock)) ? Number(quickViewProduct.stock) : 30);
  const product = detailedProduct || {
    id: quickViewProduct.id,
    name: quickViewProduct.name,
    slug: quickViewProduct.slug || String(quickViewProduct.id),
    category: quickViewProduct.category || "MEN",
    brand: quickViewProduct.brand || "Nike",
    stock: fallbackStock,
    stockStatus: fallbackStock > 0 ? "In Stock" : "Out of Stock",
    isOutOfStock: fallbackStock <= 0,
    sku: quickViewProduct.sku || `BRAZIL-PLAYER-ADDITION-H-Z5FG-DPSD`,
    price: typeof quickViewProduct.price === "number" ? quickViewProduct.price : parseFloat(quickViewProduct.price || "850"),
    originalPrice: quickViewProduct.originalPrice ? (typeof quickViewProduct.originalPrice === "number" ? quickViewProduct.originalPrice : parseFloat(String(quickViewProduct.originalPrice))) : 1000,
    mainImage: quickViewProduct.mainImage || "/prod_jersey.png",
    images: quickViewProduct.images && quickViewProduct.images.length > 0 ? quickViewProduct.images : [quickViewProduct.mainImage],
    rating: quickViewProduct.rating || 5.0,
    reviewsCount: quickViewProduct.reviewsCount || 3,
    description: quickViewProduct.description || quickViewProduct.name,
    attributes: quickViewProduct.attributes || [],
    variants: quickViewProduct.variants || [],
    isNew: quickViewProduct.isNew !== undefined ? quickViewProduct.isNew : true,
    discountPercentage: quickViewProduct.discountPercentage || 15,
  };

  const isOutOfStock = isProductOutOfStock(product) || isProductOutOfStock(detailedProduct) || isProductOutOfStock(quickViewProduct) || (product.stock !== undefined && Number(product.stock) <= 0);

  const price = product.price || 0;
  const originalPriceVal = product.originalPrice && product.originalPrice > price ? product.originalPrice : null;
  const savings = originalPriceVal ? originalPriceVal - price : null;

  const galleryImages: string[] = product.images && product.images.length > 0
    ? product.images
    : [product.mainImage];

  const currentMainImage = galleryImages[selectedImageIndex] || product.mainImage;

  const handleClose = () => {
    setQuickViewProduct(null);
    setQuantity(1);
    setSelectedImageIndex(0);
    setIsImageLightboxOpen(false);
  };

  const handleSelectAttribute = (attrName: string, val: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: val }));

    // Auto-switch gallery thumbnail if an image matches the selected option
    if (galleryImages.length > 1) {
      const lowerVal = val.toLowerCase();
      const matchIndex = galleryImages.findIndex((img) => img.toLowerCase().includes(lowerVal));
      if (matchIndex !== -1) {
        setSelectedImageIndex(matchIndex);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`);
      return;
    }
    addToCart({ ...product, selectedAttributes }, quantity);
    handleClose();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`);
      return;
    }
    addToCart({ ...product, selectedAttributes }, quantity);
    handleClose();
    router.push("/cart");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/product/${product.slug || product.id}`;
      if (navigator.share) {
        navigator.share({ title: product.name, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        showToast("Product link copied to clipboard!");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        {/* Overlay Backdrop Click */}
        <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />

        {/* Main Modal Card Container */}
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden z-10 sm:my-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] flex flex-col">
          
          {/* Mobile Top Drag Indicator */}
          <div className="sm:hidden w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2.5 shrink-0" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
              
              {/* ─── Left Side: Main Product Image & Thumbnails Showcase (5 Cols) ─── */}
              <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                
                {/* Main Image Box - Clicking Image Opens Lightbox Modal */}
                <div
                  onClick={() => setIsImageLightboxOpen(true)}
                  className="relative bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2 sm:p-4 min-h-[220px] sm:min-h-[360px] flex items-center justify-center overflow-hidden group shadow-xs cursor-pointer"
                  title="Click image to open in modal view"
                >
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-1.5 sm:gap-2">
                    {savings !== null && savings > 0 && (
                      <span className="bg-[#FFB800] text-[#122B5A] font-bold font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
                        -{Math.round((savings / originalPriceVal!) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {product.isNew && (
                    <div className="absolute top-3 right-10 sm:top-4 sm:right-4 z-20 bg-[#122B5A] text-white font-black text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
                      NEW ARRIVAL
                    </div>
                  )}

                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-[#122B5A]" />
                      <span className="text-xs font-bold">Loading view...</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-[200px] sm:h-[320px]">
                      <Image
                        src={(currentMainImage && currentMainImage.trim() !== "") ? currentMainImage : "/prod_maca.png"}
                        alt={product.name || "Product"}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                    </div>
                  )}

                  {/* Click to Zoom Icon Overlay */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-black/70 text-white p-2 sm:p-2.5 rounded-full shadow-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3">
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Expand
                  </div>
                </div>

                {/* Gallery Thumbnails Row */}
                {galleryImages.length > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 transition-all cursor-pointer ${
                          selectedImageIndex === idx
                            ? "border-[#FFB800] ring-2 ring-[#FFB800]/20 scale-105"
                            : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={(img && img.trim() !== "") ? img : "/prod_maca.png"}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-contain p-0.5 sm:p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Middle / Right Side: Product Details & Purchase Actions (7 Cols) ─── */}
              <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
                
                {/* Category, Brand, Stock Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-50 text-[#122B5A] font-black text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 rounded-md uppercase tracking-wider border border-amber-200/50">
                      {product.category || "GENERAL"}
                    </span>
                    {product.brand && (
                      <span className="text-slate-600 font-semibold text-[11px] sm:text-xs">
                        Brand: <strong className="text-slate-900">{product.brand}</strong>
                      </span>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wide">
                      <PackageX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wide">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {product.stock > 0 ? `${product.stock} in stock` : "In Stock"}
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>

                {/* Ratings & SKU Code */}
                <div className="flex items-center justify-between text-xs gap-2 border-b border-slate-100 pb-2.5 sm:pb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            i < Math.floor(product.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                      {Number(product.rating || 5).toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-[10px] sm:text-xs">
                      ({product.reviewsCount || 3} reviews)
                    </span>
                  </div>

                  <div className="text-slate-400 font-mono text-[10px] sm:text-[11px]">
                    SKU: <span className="text-slate-700 font-bold">{product.sku}</span>
                  </div>
                </div>

                {/* Pricing Row */}
                <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#122B5A]">
                    ৳ {price.toLocaleString("en-US")}
                  </span>
                  {Boolean(originalPriceVal) && (
                    <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                      ৳ {originalPriceVal?.toLocaleString("en-US")}
                    </span>
                  )}
                  {Boolean(savings) && savings! > 0 && (
                    <span className="bg-amber-50 text-[#122B5A] font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-200">
                      Save : ৳{savings?.toLocaleString("en-US")}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {typeof product.description === "string"
                      ? product.description.replace(/<[^>]*>?/gm, "")
                      : product.name}
                  </p>
                )}

                {/* Dynamic Attributes & Variant Options Selector (e.g. Size, Color, Flavor) */}
                {Object.keys(groupedAttributes).length > 0 && (
                  <div className="space-y-3.5 pt-3 border-t border-slate-100">
                    {Object.entries(groupedAttributes).map(([attrName, values]) => {
                      const activeVal = selectedAttributes[attrName] || values[0];
                      return (
                        <div key={attrName} className="space-y-2">
                          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-800">
                              <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                              <span>Select {attrName}:</span>
                            </span>
                            <span className="text-[#122B5A] font-black bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 text-[11px] sm:text-xs">
                              {activeVal}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {values.map((val) => {
                              const isSelected = activeVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelectAttribute(attrName, val)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    isSelected
                                      ? "bg-[#122B5A] text-white border-[#122B5A] shadow-sm scale-105 ring-2 ring-[#122B5A]/20"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-[#FFB800] hover:text-[#122B5A]"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity Counter + Action Buttons (Responsive for Mobile & Desktop) */}
                <div className="space-y-3 sm:space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3.5 w-full">
                    
                    {/* Quantity + Add to Cart Row on Mobile (or inline on Desktop) */}
                    <div className="flex items-center gap-2 sm:gap-3.5 flex-1">
                      {/* Quantity Controls */}
                      <div className={`flex items-center border border-slate-200 rounded-full bg-slate-50 px-2.5 sm:px-4 py-1.5 sm:py-2 shrink-0 shadow-xs h-[44px] sm:h-[52px] ${isOutOfStock ? "opacity-50" : ""}`}>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <span className="w-6 sm:w-9 text-center font-extrabold text-slate-900 text-xs sm:text-base">
                          {isOutOfStock ? 0 : quantity}
                        </span>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        className={`flex-1 w-full font-extrabold text-xs sm:text-base h-[44px] sm:h-[52px] px-3 sm:px-6 rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                            : "bg-[#122B5A] hover:bg-[#0B1B38] text-white shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                        }`}
                      >
                        {isOutOfStock ? (
                          <>
                            <PackageX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-slate-400" />
                            <span>Out of Stock</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Buy Now Button */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className={`w-full sm:flex-1 font-extrabold text-xs sm:text-base h-[44px] sm:h-[52px] px-3 sm:px-6 rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                        isOutOfStock
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                          : "bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                      }`}
                    >
                      <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
                    </button>
                  </div>

                  {/* Wishlist & Share */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => addToWishlist(product)}
                      className="flex items-center gap-1.5 hover:text-[#122B5A] transition cursor-pointer text-[11px] sm:text-xs"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist(product.id) ? "fill-[#FFB800] text-[#122B5A]" : "text-slate-400"}`} />
                      {isInWishlist(product.id) ? "Saved in Wishlist" : "Add to Wishlist"}
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center gap-1.5 hover:text-[#122B5A] transition cursor-pointer text-[11px] sm:text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#122B5A]" /> Share Product
                    </button>
                  </div>
                </div>

                {/* Direct Phone Order Hotline Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800">Direct Phone Order Hotline</p>
                    <p className="text-[11px] text-slate-500">Call anytime for quick COD booking</p>
                  </div>
                  <a
                    href="tel:01734340066"
                    className="bg-[#122B5A] hover:bg-[#0B1B38] text-white font-black text-xs px-4 py-2 rounded-full flex items-center justify-center gap-1.5 shadow-xs transition shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#122B5A]" /> 01734-340066
                  </a>
                </div>

              </div>

            </div>

            {/* Related Products Preview Section inside Modal */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#122B5A]" /> Related Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center gap-3 border border-slate-100 rounded-2xl p-3 bg-slate-50/50 hover:bg-white hover:shadow-md transition group"
                    >
                      <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <Image
                          src={(rel.mainImage && rel.mainImage.trim() !== "") ? rel.mainImage : (rel.image || "/prod_maca.png")}
                          alt={rel.name || "Related product"}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-[#122B5A]">
                          {rel.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-[#122B5A] font-black text-xs">
                            ৳{rel.price?.toLocaleString()}
                          </span>
                          {Boolean(rel.originalPrice && rel.originalPrice > rel.price) && (
                            <span className="text-slate-400 line-through text-[10px]">
                              ৳{rel.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(rel)}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-[#122B5A] hover:text-white hover:border-[#122B5A] text-[11px] font-bold px-3 py-1.5 rounded-full transition shadow-xs cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Image Lightbox Modal */}
      <ProductImageModal
        isOpen={isImageLightboxOpen}
        onClose={() => setIsImageLightboxOpen(false)}
        images={galleryImages}
        initialIndex={selectedImageIndex}
        productName={product.name}
      />
    </>
  );
}
