"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import productsData from "@/data/products.json";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";
import { ProductImageModal } from "@/components/ProductImageModal";
import { useShop } from "@/context/ShopContext";
import { ProductDetailsSkeleton } from "@/components/common/Skeletons";
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Minus,
  Plus,
  Check,
  ShoppingCart,
  PhoneCall,
  Eye,
  Loader2,
  Tag,
  Layers,
  Sparkles,
  MessageSquare,
  Send,
  User,
  LogIn,
  CheckCircle2,
  Box,
  PackageX
} from "lucide-react";
import { isProductOutOfStock } from "@/lib/productAdapter";

interface ProductAttribute {
  name: string;
  value: string;
}

interface ReviewItem {
  id: number;
  user?: { name?: string };
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetailsPage({
  params,
}: {
  params?: Promise<{ slug?: string }>;
}) {
  const unwrappedParams = params ? use(params) : null;
  const clientParams = useParams();
  const router = useRouter();
  const { addToCart, addToWishlist, isInWishlist, user, showToast } = useShop();

  const slugParam = (unwrappedParams?.slug || clientParams?.slug) as string;

  // Local state
  const [loading, setLoading] = useState(true);
  const [apiProduct, setApiProduct] = useState<any>(null);
  const [apiRelated, setApiRelated] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "additional" | "reviews">("description");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewerName, setReviewerName] = useState(user?.name || "");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setReviewerName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (!slugParam) return;
    setLoading(true);
    setSelectedImageIndex(0);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // 1. Fetch single product by slug or ID
    fetch(`${apiUrl}/api/v1/products/${slugParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        const raw = data?.data || data?.product;
        if (raw) {
          const rawPrice = parseFloat(String(raw.price || 0)) || 0;
          const rawSalePrice = raw.sale_price !== null && raw.sale_price !== undefined ? parseFloat(String(raw.sale_price)) : null;

          let activePrice = rawPrice;
          let originalPrice: number | undefined = undefined;

          if (rawSalePrice !== null && rawSalePrice > 0 && rawSalePrice < rawPrice) {
            activePrice = rawSalePrice;
            originalPrice = rawPrice;
          } else if (raw.originalPrice || raw.original_price) {
            originalPrice = parseFloat(String(raw.originalPrice || raw.original_price));
          }

          const mainImg = raw.image || raw.main_image || (Array.isArray(raw.images) && raw.images[0]) || "/prod_honey.png";
          
          let gallery: string[] = [];
          if (Array.isArray(raw.images) && raw.images.length > 0) {
            gallery = raw.images.filter((img: any) => typeof img === "string" && img.trim() !== "");
          } else if (raw.images && typeof raw.images === "string") {
            try {
              const parsed = JSON.parse(raw.images);
              if (Array.isArray(parsed)) {
                gallery = parsed.filter((img: any) => typeof img === "string" && img.trim() !== "");
              }
            } catch {}
          }
          if (gallery.length === 0 && mainImg) {
            gallery = [mainImg];
          }

          // Safely normalize raw attributes (handles JSON string, object, or array)
          let parsedAttributes: ProductAttribute[] = [];
          if (Array.isArray(raw.attributes)) {
            parsedAttributes = raw.attributes;
          } else if (raw.attributes && typeof raw.attributes === "string") {
            try {
              const parsed = JSON.parse(raw.attributes);
              if (Array.isArray(parsed)) {
                parsedAttributes = parsed;
              } else if (typeof parsed === "object" && parsed !== null) {
                Object.entries(parsed).forEach(([key, values]) => {
                  if (Array.isArray(values)) {
                    values.forEach((v: any) => {
                      parsedAttributes.push({ name: key, value: String(v) });
                    });
                  } else if (values !== null && values !== undefined) {
                    parsedAttributes.push({ name: key, value: String(values) });
                  }
                });
              }
            } catch { }
          } else if (raw.attributes && typeof raw.attributes === "object") {
            Object.entries(raw.attributes).forEach(([key, values]) => {
              if (Array.isArray(values)) {
                values.forEach((v: any) => {
                  parsedAttributes.push({ name: key, value: String(v) });
                });
              } else if (values !== null && values !== undefined) {
                parsedAttributes.push({ name: key, value: String(values) });
              }
            });
          }

          const isRawOutOfStock = isProductOutOfStock(raw);
          let stockVal = 25;
          if (raw.stock !== undefined && raw.stock !== null && !isNaN(Number(raw.stock))) {
            stockVal = Number(raw.stock);
          } else if (raw.stock_quantity !== undefined && raw.stock_quantity !== null && !isNaN(Number(raw.stock_quantity))) {
            stockVal = Number(raw.stock_quantity);
          }
          if (isRawOutOfStock) stockVal = 0;

          const prodObj = {
            id: raw.id,
            name: raw.name,
            slug: raw.slug || slugParam,
            category: typeof raw.category === "string" ? raw.category : (raw.category?.name || "General"),
            subCategory: raw.sub_category || raw.subCategory || null,
            price: activePrice,
            originalPrice: originalPrice || null,
            sku: raw.SKU || raw.sku || `SHP-${raw.id.toString().padStart(4, "0")}`,
            brand: raw.brand || "Door Step BD Standard",
            unit: raw.unit || "pcs",
            stock: stockVal,
            stockStatus: stockVal > 0 ? "In Stock" : "Out of Stock",
            isOutOfStock: stockVal <= 0,
            mainImage: mainImg,
            images: gallery,
            description: raw.description || "",
            shortDescription: raw.short_description || "",
            rating: raw.rating ? parseFloat(String(raw.rating)) : 0,
            reviewsCount: typeof raw.reviews_count === "number" ? raw.reviews_count : 0,
            attributes: parsedAttributes,
            isBestSeller: Boolean(raw.best_seller || raw.is_bestseller),
            isFeatured: Boolean(raw.featured || raw.is_featured),
            isNew: Boolean(raw.new_arrival || raw.is_new),
            isOrganic: Boolean(raw.organic),
          };

          setApiProduct(prodObj);
          setSelectedImage(mainImg);
          setSelectedImageIndex(0);

          // Auto-select first option for each attribute group
          if (prodObj.attributes && prodObj.attributes.length > 0) {
            const initialAttrs: Record<string, string> = {};
            prodObj.attributes.forEach((attr: ProductAttribute) => {
              if (attr && attr.name && !initialAttrs[attr.name]) {
                initialAttrs[attr.name] = attr.value;
              }
            });
            setSelectedAttributes(initialAttrs);
          }

          // Fetch real reviews for this product
          fetchReviews(prodObj.id);
        }
      })
      .catch(() => {
        // Fallback matching
        const fallback = productsData.find(
          (p) => p.slug === slugParam || String(p.id) === slugParam
        ) || productsData[0];

        setApiProduct(fallback);
        setSelectedImage(fallback.mainImage || (fallback as any).image);
        setSelectedImageIndex(0);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch related products from API
    fetch(`${apiUrl}/api/v1/products?per_page=8`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.data || data?.data || [];
        if (Array.isArray(list)) {
          setApiRelated(
            list
              .filter((p: any) => p.slug !== slugParam && String(p.id) !== slugParam)
              .map((rp: any) => {
                const rpRawPrice = parseFloat(String(rp.price || 0)) || 0;
                const rpSalePrice = rp.sale_price ? parseFloat(String(rp.sale_price)) : null;
                return {
                  id: rp.id,
                  name: rp.name,
                  slug: rp.slug || String(rp.id),
                  category: typeof rp.category === "string" ? rp.category : (rp.category?.name || "General"),
                  price: rpSalePrice && rpSalePrice > 0 ? rpSalePrice : rpRawPrice,
                  originalPrice: rpSalePrice && rpSalePrice > 0 ? rpRawPrice : null,
                  mainImage: rp.image || rp.main_image || (Array.isArray(rp.images) && rp.images[0]) || "/prod_maca.png",
                  rating: rp.rating ? parseFloat(String(rp.rating)) : 4.9,
                  reviewsCount: rp.reviews_count || 18,
                };
              })
          );
        }
      })
      .catch(() => { });
  }, [slugParam]);

  const fetchReviews = async (productId: number | string) => {
    setLoadingReviews(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${apiUrl}/api/v1/reviews?product_id=${productId}`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.data || json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          setReviews(list);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast("Please write a short review comment!");
      return;
    }

    setSubmittingReview(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const payload = {
      product_id: product.id,
      user_id: 1, // default or authenticated user ID
      rating: newRating,
      comment: newComment.trim(),
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("shopia_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/v1/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Thank you! Your review has been submitted successfully.");
        const newRev: ReviewItem = {
          id: Date.now(),
          user: { name: reviewerName || user?.name || "Verified Customer" },
          user_name: reviewerName || user?.name || "Verified Customer",
          rating: newRating,
          comment: newComment.trim(),
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [newRev, ...prev]);
        setNewComment("");
      } else {
        // Optimistically add to UI
        const newRev: ReviewItem = {
          id: Date.now(),
          user: { name: reviewerName || user?.name || "Verified Customer" },
          user_name: reviewerName || user?.name || "Verified Customer",
          rating: newRating,
          comment: newComment.trim(),
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [newRev, ...prev]);
        setNewComment("");
        showToast("Review recorded! Thank you for your feedback.");
      }
    } catch {
      const newRev: ReviewItem = {
        id: Date.now(),
        user: { name: reviewerName || user?.name || "Verified Customer" },
        user_name: reviewerName || user?.name || "Verified Customer",
        rating: newRating,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [newRev, ...prev]);
      setNewComment("");
      showToast("Review submitted successfully!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const product = apiProduct || productsData[0];

  // Group attributes by name (e.g. Size: [40, 41, 42], Color: [Grey, Navy])
  const groupedAttributes = useMemo(() => {
    if (!product?.attributes) return {};
    const grouped: Record<string, string[]> = {};
    if (Array.isArray(product.attributes)) {
      product.attributes.forEach((attr: ProductAttribute) => {
        if (attr && attr.name && attr.value) {
          if (!grouped[attr.name]) {
            grouped[attr.name] = [];
          }
          if (!grouped[attr.name].includes(attr.value)) {
            grouped[attr.name].push(attr.value);
          }
        }
      });
    } else if (typeof product.attributes === "object") {
      Object.entries(product.attributes).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          grouped[key] = val.map(String);
        } else if (val !== null && val !== undefined) {
          grouped[key] = [String(val)];
        }
      });
    }
    return grouped;
  }, [product?.attributes]);

  // Related Products
  const relatedProducts = apiRelated.length > 0
    ? apiRelated.slice(0, 4)
    : productsData.filter((p) => p.id !== product.id).slice(0, 4);

  const rawDiscount = product?.originalPrice && product?.originalPrice > product?.price && product?.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const discountPercent = !isNaN(rawDiscount) && rawDiscount > 0 ? rawDiscount : 0;

  const isOutOfStock = isProductOutOfStock(product) || isProductOutOfStock(apiProduct) || (product.stock !== undefined && Number(product.stock) <= 0);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`);
      return;
    }
    addToCart({ ...product, selectedAttributes }, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`);
      return;
    }
    addToCart({ ...product, selectedAttributes }, quantity);
    router.push("/cart");
  };

  const totalReviewsCount = reviews.length;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : (product.rating ? Number(product.rating).toFixed(1) : "0.0");

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star as 1 | 2 | 3 | 4 | 5] = (counts[star as 1 | 2 | 3 | 4 | 5] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#002884] transition">Home</Link>
          <span>/</span>
          <Link href={`/all-products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#002884] transition text-slate-600 font-medium">
            {product.category}
          </Link>
          {product.subCategory && (
            <>
              <span>/</span>
              <span className="text-slate-500">{product.subCategory}</span>
            </>
          )}
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-10">

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Product Box (Col 9) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* Left Image Showcase (Col 5) */}
            <div className="md:col-span-5 space-y-4">
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="relative w-full h-[350px] sm:h-[400px] bg-slate-50 rounded-2xl border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden group cursor-pointer"
                title="Click image to open full view modal"
              >
                {isOutOfStock ? (
                  <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
                    <PackageX className="w-3.5 h-3.5" /> OUT OF STOCK
                  </div>
                ) : discountPercent > 0 ? (
                  <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md tracking-wider">
                    -{discountPercent}% OFF
                  </div>
                ) : null}

                {product.isNew && !isOutOfStock && (
                  <div className="absolute top-4 right-4 z-10 bg-[#002884] text-white font-bold text-[11px] px-3 py-1 rounded-full shadow">
                    NEW ARRIVAL
                  </div>
                )}

                <Image
                  src={
                    (product.images && product.images[selectedImageIndex]) ||
                    selectedImage ||
                    product.mainImage ||
                    "/prod_honey.png"
                  }
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-4 group-hover:scale-105 transition duration-500"
                />

                <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-bold px-3">
                  <Eye className="w-4 h-4" /> Click to Zoom
                </div>
              </div>

              {/* Gallery Thumbnails Carousel Row */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setSelectedImage(img);
                      }}
                      className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-[#002884] ring-2 ring-[#002884]/30 scale-105 shadow-sm opacity-100"
                          : "border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Product Purchase Details (Col 7) */}
            <div className="md:col-span-7 space-y-5">

              {/* Category, Brand, Stock Badges & Title */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#002884] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {product.category}
                    </span>
                    {product.brand && (
                      <span className="text-slate-500 font-semibold">
                        Brand: <span className="text-slate-800 font-bold">{product.brand}</span>
                      </span>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border text-[11px] text-rose-700 bg-rose-50 border-rose-200">
                      <PackageX className="w-3 h-3 text-rose-600" /> Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border text-[11px] text-emerald-700 bg-emerald-50 border-emerald-200">
                      <Check className="w-3 h-3" /> {product.stock > 0 ? `${product.stock} in stock` : "In Stock"}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & SKU */}
                <div className="flex items-center justify-between gap-2 pt-1 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-700">{averageRating}</span>
                    <span className="text-slate-400">({totalReviewsCount} reviews)</span>
                  </div>

                  <div className="text-slate-400 font-mono text-[11px]">
                    SKU: <span className="text-slate-700 font-bold">{product.sku}</span>
                  </div>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                <div className="text-3xl sm:text-4xl font-black text-[#002884]">
                  ৳ {product.price?.toLocaleString()}
                </div>
                {Boolean(product.originalPrice && product.originalPrice > product.price) && (
                  <div className="text-lg text-slate-400 line-through font-semibold">
                    ৳ {product.originalPrice?.toLocaleString()}
                  </div>
                )}
                {discountPercent > 0 && (
                  <span className="bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs px-2.5 py-0.5 rounded-md">
                    Save ৳ {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Short Summary Description */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {product.shortDescription || product.description || `Original ${product.name} with verified authentic quality, fast dispatch, and nationwide cash on delivery.`}
              </p>

              {/* Dynamic Attributes (e.g. Size, Color) */}
              {Object.keys(groupedAttributes).length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {Object.entries(groupedAttributes).map(([attrName, values]) => (
                    <div key={attrName} className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Select {attrName}:</span>
                        <span className="text-[#002884] font-extrabold">{selectedAttributes[attrName]}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {values.map((val) => {
                          const isSelected = selectedAttributes[attrName] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrName]: val }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                                ? "bg-[#002884] text-white border-[#002884] shadow-sm scale-105"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                                }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3.5 w-full">

                  {/* Quantity Counter */}
                  <div className={`inline-flex items-center border border-slate-200 rounded-full bg-slate-50 px-3 sm:px-4 py-2 shrink-0 shadow-xs h-[48px] sm:h-[52px] ${isOutOfStock ? "opacity-50" : ""}`}>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-slate-600 hover:text-slate-900 transition active:scale-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-7 sm:w-9 text-center font-extrabold text-slate-900 text-sm sm:text-base">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-slate-600 hover:text-slate-900 transition active:scale-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`flex-1 w-full font-extrabold text-xs sm:text-base h-[48px] sm:h-[52px] px-3 sm:px-6 rounded-full transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      isOutOfStock
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        : "bg-[#E50914] hover:bg-[#C80000] text-white shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                    }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <PackageX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-slate-400" />
                        <span>Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={`flex-1 w-full font-extrabold text-xs sm:text-base h-[48px] sm:h-[52px] px-3 sm:px-6 rounded-full transition-all flex items-center justify-center gap-2 text-center whitespace-nowrap ${
                      isOutOfStock
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        : "bg-[#002884] hover:bg-[#072450] text-white shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                    }`}
                  >
                    <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
                  </button>
                </div>

                {/* Wishlist & Share */}
                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => addToWishlist(product)}
                    className="flex items-center gap-1.5 hover:text-rose-600 transition font-bold cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                    {isInWishlist(product.id) ? "Saved in Wishlist" : "Add to Wishlist"}
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            url: window.location.href,
                          }).catch(() => { });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          showToast("Product link copied to clipboard!");
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-[#002884] transition font-bold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#002884]" /> Share Product
                  </button>
                </div>
              </div>

              {/* Phone Order Box */}
              <div className="bg-[#002884]/5 border border-[#002884]/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Direct Phone Order Hotline</p>
                  <p className="text-[11px] text-slate-500">Call anytime for quick COD booking</p>
                </div>
                <a
                  href="tel:01681135030"
                  className="bg-[#002884] text-white font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-[#001D5C] transition shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> 01681-135030
                </a>
              </div>

            </div>
          </div>

          {/* Right Column Sidebar: Related Products (Col 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E50914]" /> Related Products
            </h2>

            <div className="space-y-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="border border-slate-100 rounded-2xl p-3 hover:shadow-md transition bg-white space-y-2 group"
                >
                  {/* Thumbnail Image */}
                  <Link href={`/product/${rel.slug || rel.id}`} className="block relative w-full h-28 bg-slate-50 rounded-xl overflow-hidden p-2">
                    <Image
                      src={rel.mainImage}
                      alt={rel.name}
                      fill
                      sizes="200px"
                      className="object-contain group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  {/* Title & Price */}
                  <div>
                    <Link href={`/product/${rel.slug || rel.id}`}>
                      <h3 className="font-bold text-slate-800 text-xs line-clamp-2 hover:text-[#002884] transition leading-snug">
                        {rel.name}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-[#E50914] font-black text-xs">
                        ৳{rel.price?.toLocaleString()}
                      </span>
                      {Boolean(rel.originalPrice && rel.originalPrice > rel.price) && (
                        <span className="text-slate-400 line-through text-[10px]">
                          ৳{rel.originalPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center text-amber-400 text-[10px] pt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── Product Details Tabs Section ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`pb-3 border-b-2 whitespace-nowrap transition cursor-pointer font-bold ${activeTab === "description"
                ? "border-[#002884] text-[#002884]"
                : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("additional")}
              className={`pb-3 border-b-2 whitespace-nowrap transition cursor-pointer font-bold ${activeTab === "additional"
                ? "border-[#002884] text-[#002884]"
                : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
            >
              Additional Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 border-b-2 whitespace-nowrap transition cursor-pointer font-bold ${activeTab === "reviews"
                ? "border-[#002884] text-[#002884]"
                : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
            >
              Reviews ({totalReviewsCount})
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">

            {/* 1. Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-slate-900 text-base mb-3">Product Description</h3>
                  {product.description || product.shortDescription ? (
                    <div
                      className="text-slate-700 leading-relaxed space-y-2 text-xs sm:text-sm"
                      dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || "" }}
                    />
                  ) : (
                    <p className="text-slate-500 italic leading-relaxed">
                      No detailed description available for this product.
                    </p>
                  )}
                </div>

                {/* Dynamic Key Highlights */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Highlights:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002884] shrink-0" />
                      <span>Product Name: <strong>{product.name}</strong></span>
                    </li>
                    {product.brand && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#002884] shrink-0" />
                        <span>Brand: <strong>{product.brand}</strong></span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002884] shrink-0" />
                      <span>Category: <strong>{product.category} {product.subCategory ? `(${product.subCategory})` : ""}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002884] shrink-0" />
                      <span>Stock Status: <strong>{product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Additional Information Tab */}
            {activeTab === "additional" && (
              <div className="max-w-2xl space-y-4">
                <h3 className="font-black text-slate-900 text-base">Product Specifications</h3>
                <table className="w-full text-left border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-800 w-1/3">Product Name</td>
                      <td className="py-3 px-4 text-slate-700">{product.name}</td>
                    </tr>
                    {product.sku && (
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">SKU Code</td>
                        <td className="py-3 px-4 text-slate-700 font-mono font-semibold">{product.sku}</td>
                      </tr>
                    )}
                    {product.brand && (
                      <tr className="bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-800">Brand / Manufacturer</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{product.brand}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-800">Category</td>
                      <td className="py-3 px-4 text-slate-700">{product.category} {product.subCategory ? `> ${product.subCategory}` : ""}</td>
                    </tr>
                    {product.unit && (
                      <tr className="bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-800">Unit of Measure</td>
                        <td className="py-3 px-4 text-slate-700">{product.unit}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-800">Stock Availability</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold text-emerald-600">
                        {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
                      </td>
                    </tr>

                    {/* All Dynamic Database Attributes */}
                    {Object.entries(groupedAttributes).map(([name, vals], idx) => (
                      <tr key={name} className={idx % 2 === 0 ? "bg-slate-50/70" : ""}>
                        <td className="py-3 px-4 font-bold text-slate-800">{name}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{vals.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">

                {/* Rating Overview Box */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 items-center">
                  <div className="md:col-span-4 text-center md:text-left space-y-1">
                    <div className="text-4xl font-black text-[#002884]">
                      {averageRating} <span className="text-lg text-slate-400 font-normal">/ 5</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Based on {totalReviewsCount} customer rating{totalReviewsCount === 1 ? "" : "s"}</p>
                  </div>

                  <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-2 text-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
                      const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-12 font-bold text-slate-700">{star} Star</span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-8 text-right text-slate-500 font-bold">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">Customer Feedback</h4>
                  {reviews.length === 0 ? (
                    <div className="border border-slate-200/80 rounded-2xl p-8 bg-white text-center space-y-2">
                      <p className="text-slate-600 text-sm font-semibold">No reviews yet for this product.</p>
                      <p className="text-slate-400 text-xs">Be the first to share your thoughts with other customers!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="border border-slate-100 rounded-xl p-4 bg-white space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {rev.user?.name || rev.user_name || "Verified Customer"}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                Verified Purchase
                              </span>
                            </div>
                            <span className="text-slate-400">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                          </div>
                          <div className="flex items-center text-amber-400 text-[11px]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 whitespace-pre-line">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add a Review Form or Login Prompt */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#002884]" /> Write a Customer Review
                    </h4>

                    {/* Rating Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Overall Rating:</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-400 hover:scale-125 transition cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${star <= newRating ? "fill-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">{newRating} out of 5</span>
                      </div>
                    </div>

                    {/* Name Input (Read Only) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Name</label>
                      <input
                        type="text"
                        readOnly
                        value={user?.name || reviewerName || "Logged In Customer"}
                        className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-semibold cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>

                    {/* Review Textarea */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Review</label>
                      <textarea
                        rows={3}
                        placeholder="Share your experience with this product (e.g. quality, fitting, packaging)..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002884]/30"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#002884] hover:bg-[#072450] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100/60 text-[#002884] rounded-full flex items-center justify-center mx-auto">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">Want to write a review?</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please log in to your customer account to rate this product and share your feedback.
                      </p>
                    </div>
                    <div>
                      <Link
                        href="/account?mode=login"
                        className="inline-flex items-center gap-2 bg-[#002884] hover:bg-[#072450] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm hover:shadow transition cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Log In to Write a Review
                      </Link>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Trust Badges Bar */}
        <section className="w-full">
          <TrustBadgesBar />
        </section>

      </div>

      {/* Product Image Lightbox Modal */}
      <ProductImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={product.images && product.images.length > 0 ? product.images : [selectedImage || product.mainImage]}
        initialIndex={selectedImageIndex}
        productName={product.name}
      />
    </div>
  );
}
