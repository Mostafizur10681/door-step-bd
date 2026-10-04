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
import { API_V1 } from "@/lib/api";
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
  PackageX,
  Zap,
  Phone,
  MessageCircle,
  FileText,
  Sliders,
  ChevronRight,
  Home,
  BadgePercent,
  Clock,
  ArrowRight,
  FolderTree
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

/**
 * Resolves both the main Category and Subcategory accurately from API data and categories tree
 */
function resolveCategoryAndSubCategory(raw: any, categoriesTree: any[] = []) {
  const subCategoryMap = new Map<string, { subName: string; subSlug: string; catName: string; catSlug: string }>();
  const parentCategoryMap = new Map<string, { catName: string; catSlug: string }>();

  if (Array.isArray(categoriesTree)) {
    categoriesTree.forEach((cat: any) => {
      const cName = cat.name || "";
      const cSlug = cat.slug || (cName ? cName.toLowerCase().replace(/\s+/g, "-") : "");
      if (cName) {
        parentCategoryMap.set(String(cat.id), { catName: cName, catSlug: cSlug });
        parentCategoryMap.set(cName.toLowerCase().trim(), { catName: cName, catSlug: cSlug });
        if (cSlug) parentCategoryMap.set(cSlug.toLowerCase().trim(), { catName: cName, catSlug: cSlug });
      }

      const rawSubs = cat.sub_categories || cat.subcategories || cat.subCategories || cat.children || [];
      if (Array.isArray(rawSubs)) {
        rawSubs.forEach((sub: any) => {
          const sName = typeof sub === "string" ? sub : (sub.name || "");
          const sSlug = typeof sub === "object" ? (sub.slug || (sName ? sName.toLowerCase().replace(/\s+/g, "-") : "")) : (sName ? sName.toLowerCase().replace(/\s+/g, "-") : "");
          const sId = typeof sub === "object" ? sub.id : null;
          if (sName) {
            const entry = { subName: sName, subSlug: sSlug, catName: cName, catSlug: cSlug };
            if (sId) subCategoryMap.set(String(sId), entry);
            subCategoryMap.set(sName.toLowerCase().trim(), entry);
            if (sSlug) subCategoryMap.set(sSlug.toLowerCase().trim(), entry);
          }
        });
      }
    });
  }

  let finalCategory = "";
  let finalCategorySlug = "";
  let finalSubCategory: string | null = null;
  let finalSubCategorySlug: string | null = null;

  // 1. Check if raw has explicit parent_category or raw.category.parent
  if (raw.parent_category || raw.parentCategory) {
    const p = raw.parent_category || raw.parentCategory;
    finalCategory = typeof p === "string" ? p : (p.name || "");
    finalCategorySlug = typeof p === "object" && p.slug ? p.slug : (finalCategory ? finalCategory.toLowerCase().replace(/\s+/g, "-") : "");
  }

  if (raw.category && typeof raw.category === "object") {
    const parentObj = raw.category.parent || raw.category.parent_category || raw.category.parentCategory;
    if (parentObj) {
      finalCategory = typeof parentObj === "string" ? parentObj : (parentObj.name || finalCategory);
      finalCategorySlug = typeof parentObj === "object" && parentObj.slug ? parentObj.slug : (finalCategory ? finalCategory.toLowerCase().replace(/\s+/g, "-") : "");
      finalSubCategory = raw.category.name || null;
      finalSubCategorySlug = raw.category.slug || (finalSubCategory ? finalSubCategory.toLowerCase().replace(/\s+/g, "-") : null);
    }
  }

  // 2. Extract subcategory from raw if explicit
  const rawSub = raw.sub_category || raw.subCategory || raw.subcategory || raw.sub_category_name || raw.subCategoryName;
  if (rawSub && !finalSubCategory) {
    if (typeof rawSub === "string" && rawSub.trim()) {
      finalSubCategory = rawSub.trim();
      finalSubCategorySlug = finalSubCategory.toLowerCase().replace(/\s+/g, "-");
    } else if (typeof rawSub === "object" && rawSub.name) {
      finalSubCategory = rawSub.name.trim();
      finalSubCategorySlug = rawSub.slug || (finalSubCategory ? finalSubCategory.toLowerCase().replace(/\s+/g, "-") : "");
    }
  }

  // 3. Extract raw.category (candidate)
  let rawCatName = "";
  let rawCatSlug = "";
  if (raw.category) {
    if (typeof raw.category === "string" && raw.category.trim()) {
      rawCatName = raw.category.trim();
      rawCatSlug = rawCatName.toLowerCase().replace(/\s+/g, "-");
    } else if (typeof raw.category === "object" && raw.category.name) {
      rawCatName = raw.category.name.trim();
      rawCatSlug = raw.category.slug || (rawCatName ? rawCatName.toLowerCase().replace(/\s+/g, "-") : "");
    }
  }

  // 4. Look up in subCategoryMap:
  // If raw.category matches a subcategory (e.g., "Diesel Generator" which belongs to "Generator")
  if (rawCatName && subCategoryMap.has(rawCatName.toLowerCase().trim())) {
    const match = subCategoryMap.get(rawCatName.toLowerCase().trim())!;
    finalCategory = match.catName;
    finalCategorySlug = match.catSlug;
    if (!finalSubCategory) {
      finalSubCategory = match.subName;
      finalSubCategorySlug = match.subSlug;
    }
  } else if (raw.category_id && subCategoryMap.has(String(raw.category_id))) {
    const match = subCategoryMap.get(String(raw.category_id))!;
    finalCategory = match.catName;
    finalCategorySlug = match.catSlug;
    if (!finalSubCategory) {
      finalSubCategory = match.subName;
      finalSubCategorySlug = match.subSlug;
    }
  } else if (rawCatName && !finalCategory) {
    // rawCatName is a parent category
    finalCategory = rawCatName;
    finalCategorySlug = rawCatSlug || rawCatName.toLowerCase().replace(/\s+/g, "-");
  }

  // 5. If we have subCategory but no parent category, check subCategory in subCategoryMap
  if (finalSubCategory && (!finalCategory || finalCategory === "General")) {
    const subKey = finalSubCategory.toLowerCase().trim();
    if (subCategoryMap.has(subKey)) {
      const match = subCategoryMap.get(subKey)!;
      finalCategory = match.catName;
      finalCategorySlug = match.catSlug;
    }
  }

  // Also check sub_category_id
  const subId = raw.sub_category_id || raw.subCategoryId;
  if (subId && subCategoryMap.has(String(subId))) {
    const match = subCategoryMap.get(String(subId))!;
    if (!finalCategory || finalCategory === "General") {
      finalCategory = match.catName;
      finalCategorySlug = match.catSlug;
    }
    if (!finalSubCategory) {
      finalSubCategory = match.subName;
      finalSubCategorySlug = match.subSlug;
    }
  }

  // Fallbacks
  if (!finalCategory) {
    finalCategory = rawCatName || (finalSubCategory ? finalSubCategory : "General");
    finalCategorySlug = rawCatSlug || finalCategory.toLowerCase().replace(/\s+/g, "-");
  }

  // Prevent duplicate if category and subcategory are identical
  if (finalSubCategory && finalSubCategory.toLowerCase().trim() === finalCategory.toLowerCase().trim()) {
    finalSubCategory = null;
    finalSubCategorySlug = null;
  }

  return {
    category: finalCategory,
    categorySlug: finalCategorySlug,
    subCategory: finalSubCategory,
    subCategorySlug: finalSubCategorySlug,
  };
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

    // Fetch product, categories tree, and related products in parallel
    Promise.allSettled([
      fetch(`${API_V1}/products/${slugParam}`).then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      }),
      fetch(`${API_V1}/categories`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_V1}/products?per_page=8`).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([prodRes, catsRes, relRes]) => {
        let categoriesTree: any[] = [];
        if (catsRes.status === "fulfilled" && catsRes.value) {
          categoriesTree = catsRes.value?.data || (Array.isArray(catsRes.value) ? catsRes.value : []);
        }

        if (prodRes.status === "fulfilled" && prodRes.value) {
          const raw = prodRes.value?.data || prodRes.value?.product;
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
              } catch { }
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

            // Resolve both Category AND Subcategory accurately
            const catInfo = resolveCategoryAndSubCategory(raw, categoriesTree);

            const prodObj = {
              id: raw.id,
              name: raw.name,
              slug: raw.slug || slugParam,
              category: catInfo.category,
              categorySlug: catInfo.categorySlug,
              subCategory: catInfo.subCategory,
              subCategorySlug: catInfo.subCategorySlug,
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
        } else {
          // Fallback matching
          const fallback = productsData.find(
            (p) => p.slug === slugParam || String(p.id) === slugParam
          ) || productsData[0];

          setApiProduct(fallback);
          setSelectedImage(fallback.mainImage || (fallback as any).image);
          setSelectedImageIndex(0);
        }

        // Process Related Products
        if (relRes.status === "fulfilled" && relRes.value) {
          const list = relRes.value?.data?.data || relRes.value?.data || [];
          if (Array.isArray(list)) {
            setApiRelated(
              list
                .filter((p: any) => p.slug !== slugParam && String(p.id) !== slugParam)
                .map((rp: any) => {
                  const rpRawPrice = parseFloat(String(rp.price || 0)) || 0;
                  const rpSalePrice = rp.sale_price ? parseFloat(String(rp.sale_price)) : null;
                  const rpCatInfo = resolveCategoryAndSubCategory(rp, categoriesTree);
                  return {
                    id: rp.id,
                    name: rp.name,
                    slug: rp.slug || String(rp.id),
                    category: rpCatInfo.category,
                    subCategory: rpCatInfo.subCategory,
                    price: rpSalePrice && rpSalePrice > 0 ? rpSalePrice : rpRawPrice,
                    originalPrice: rpSalePrice && rpSalePrice > 0 ? rpRawPrice : null,
                    mainImage: rp.image || rp.main_image || (Array.isArray(rp.images) && rp.images[0]) || "/prod_maca.png",
                    rating: rp.rating ? parseFloat(String(rp.rating)) : 4.9,
                    reviewsCount: rp.reviews_count || 18,
                  };
                })
            );
          }
        }
      })
      .catch(() => {
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
  }, [slugParam]);

  const fetchReviews = async (productId: number | string) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_V1}/reviews?product_id=${productId}`);
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

    const payload = {
      product_id: product.id,
      user_id: 1,
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

      const res = await fetch(`${API_V1}/reviews`, {
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

  // Group attributes by name (e.g. Size: [40, 41, 42], Color: [Grey, Navy], Power: [15kW, 22kW])
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
    : (product.rating ? Number(product.rating).toFixed(1) : "5.0");

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

  const encodedProductName = encodeURIComponent(product.name || "Product inquiry");
  const whatsappUrl = `https://wa.me/8801734340066?text=Hello%20Door%20Step%20BD%2C%20I%20want%20to%20know%20more%20or%20order%3A%20${encodedProductName}`;

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/90 py-3 px-4 shadow-2xs sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-[1500px] mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-[#122B5A] text-slate-600 transition font-semibold">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/all-products" className="hover:text-[#122B5A] transition text-slate-600 font-semibold">
            All Products
          </Link>

          {/* Parent Category Link */}
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <Link
                href={`/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}`}
                className="hover:text-[#122B5A] transition text-[#122B5A] font-bold bg-blue-50/90 px-2.5 py-1 rounded-md border border-blue-150 inline-flex items-center gap-1 shadow-2xs"
                title={`Browse all ${product.category}`}
              >
                <Tag className="w-3 h-3 text-[#122B5A]" />
                <span>{product.category}</span>
              </Link>
            </>
          )}

          {/* Sub Category Link */}
          {product.subCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <Link
                href={`/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}&sub_category=${encodeURIComponent(product.subCategorySlug || product.subCategory)}`}
                className="hover:text-[#122B5A] transition text-slate-700 font-bold bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1 shadow-2xs"
                title={`Browse subcategory: ${product.subCategory}`}
              >
                <Layers className="w-3 h-3 text-slate-500" />
                <span>{product.subCategory}</span>
              </Link>
            </>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 pt-6 sm:pt-8 space-y-10">

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Main Product Box (Col 9) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">

            {/* Left Image Showcase (Col 5) */}
            <div className="md:col-span-5 space-y-4">
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="relative w-full h-[340px] sm:h-[420px] bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden group cursor-pointer shadow-inner"
                title="Click image to zoom full view"
              >
                {isOutOfStock ? (
                  <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5 animate-pulse">
                    <PackageX className="w-3.5 h-3.5" /> OUT OF STOCK
                  </div>
                ) : discountPercent > 0 ? (
                  <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                    <BadgePercent className="w-3.5 h-3.5" /> -{discountPercent}% OFF
                  </div>
                ) : null}

                {product.isNew && !isOutOfStock && (
                  <div className="absolute top-4 right-4 z-10 bg-[#122B5A] text-[#FFB800] font-black text-[11px] px-3 py-1 rounded-full shadow-md tracking-wide flex items-center gap-1 border border-white/20">
                    <Sparkles className="w-3 h-3 text-[#FFB800]" /> NEW ARRIVAL
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
                  className="object-contain p-4 group-hover:scale-108 transition-transform duration-500 ease-out"
                />

                <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-2 rounded-xl shadow-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-xs font-bold px-3 border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-[#FFB800]" /> Click to Zoom
                </div>
              </div>

              {/* Gallery Thumbnails Carousel Row */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setSelectedImage(img);
                      }}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 transition-all duration-200 cursor-pointer ${selectedImageIndex === idx
                          ? "border-[#122B5A] ring-3 ring-[#122B5A]/20 scale-105 shadow-md opacity-100"
                          : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-contain p-1.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Features Below Image */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600 text-[11px] font-semibold">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#122B5A] shrink-0" />
                  <span>Fast BD Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Product Purchase Details (Col 7) */}
            <div className="md:col-span-7 space-y-5 flex flex-col justify-between">

              <div className="space-y-4">

                {/* Both Category, Sub-Category, Brand, Stock Badges */}
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">

                    {/* Category & Subcategory Tags */}
                    <div className="flex items-center gap-2 flex-wrap">

                      {/* Main Category Badge */}
                      <Link
                        href={`/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}`}
                        className="font-extrabold text-[#122B5A] uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-[11px] px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1.5 transition shadow-2xs"
                        title={`View category: ${product.category}`}
                      >
                        <Tag className="w-3 h-3 text-[#122B5A]" />
                        <span>Category: {product.category}</span>
                      </Link>

                      {/* Sub-Category Badge (if available) */}
                      {product.subCategory && (
                        <Link
                          href={`/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}&sub_category=${encodeURIComponent(product.subCategorySlug || product.subCategory)}`}
                          className="font-bold text-slate-700 uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-[11px] px-3 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1.5 transition shadow-2xs"
                          title={`View subcategory: ${product.subCategory}`}
                        >
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span>Sub-Category: {product.subCategory}</span>
                        </Link>
                      )}

                      {/* Brand Tag */}
                      {product.brand && (
                        <span className="text-slate-500 font-medium text-xs bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/80">
                          Brand: <strong className="text-slate-800">{product.brand}</strong>
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full border text-xs text-rose-700 bg-rose-50 border-rose-200 shadow-2xs">
                        <PackageX className="w-3.5 h-3.5 text-rose-600" /> Out of Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full border text-xs text-emerald-700 bg-emerald-50 border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> {product.stock > 0 ? `${product.stock} Units In Stock` : "In Stock"}
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug pt-1">
                    {product.name}
                  </h1>

                  {/* Rating & SKU */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                    >
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold text-slate-800">{averageRating}</span>
                      <span className="text-slate-500 underline font-medium">({totalReviewsCount} customer {totalReviewsCount === 1 ? "review" : "reviews"})</span>
                    </button>

                    <div className="text-slate-500 font-mono text-xs bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      SKU: <span className="text-slate-800 font-bold">{product.sku}</span>
                    </div>
                  </div>
                </div>

                {/* Highlighted Price Card */}
                <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-amber-50/40 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-baseline flex-wrap gap-3">
                    <div className="text-3xl sm:text-4xl font-black text-[#122B5A] tracking-tight">
                      ৳ {product.price?.toLocaleString()}
                    </div>
                    {Boolean(product.originalPrice && product.originalPrice > product.price) && (
                      <div className="text-lg sm:text-xl text-slate-400 line-through font-semibold">
                        ৳ {product.originalPrice?.toLocaleString()}
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        Save ৳ {(product.originalPrice - product.price).toLocaleString()} ({discountPercent}% OFF)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/60 flex-wrap">
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cash on Delivery Eligible
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>VAT / Tax Included</span>
                  </div>
                </div>

                {/* Short Summary Description */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {product.shortDescription || product.description || `High performance ${product.name} designed with authentic industrial standard quality, tested durability, and nationwide door-step delivery.`}
                </p>

                {/* Dynamic Attributes (e.g. Size, Power, Model, Color) */}
                {Object.keys(groupedAttributes).length > 0 && (
                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    {Object.entries(groupedAttributes).map(([attrName, values]) => (
                      <div key={attrName} className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="uppercase tracking-wider text-[11px] text-slate-500 font-extrabold">{attrName}:</span>
                          <span className="text-[#122B5A] font-black bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">{selectedAttributes[attrName]}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {values.map((val) => {
                            const isSelected = selectedAttributes[attrName] === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrName]: val }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${isSelected
                                    ? "bg-[#122B5A] text-white border-[#122B5A] shadow-md ring-2 ring-[#122B5A]/25 scale-102"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
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
              </div>

              {/* ─── Redesigned Action Buttons Section ─── */}
              <div className="space-y-4 pt-4 border-t border-slate-200">

                {/* Quantity & CTA Buttons Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">

                  {/* Quantity Counter */}
                  <div className={`inline-flex items-center justify-between border-2 border-slate-200 rounded-2xl bg-slate-50 px-3 py-2 shrink-0 shadow-xs h-[52px] ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 transition active:scale-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 font-bold" />
                    </button>
                    <span className="w-9 text-center font-black text-slate-900 text-base">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 transition active:scale-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>

                  {/* Add to Cart (Navy Primary Button) */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`flex-1 font-black text-sm sm:text-base h-[52px] px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 whitespace-nowrap shadow-md ${isOutOfStock
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        : "bg-[#122B5A] hover:bg-[#0A1D40] text-white hover:shadow-xl cursor-pointer active:scale-98"
                      }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <PackageX className="w-5 h-5 shrink-0 text-slate-400" />
                        <span>Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 shrink-0" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now (Amber / Gold Instant Action Button) */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={`flex-1 font-black text-sm sm:text-base h-[52px] px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 whitespace-nowrap shadow-md ${isOutOfStock
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        : "bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] hover:shadow-xl cursor-pointer active:scale-98 border border-amber-300"
                      }`}
                  >
                    {isOutOfStock ? (
                      <span>Unavailable</span>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 shrink-0 fill-[#122B5A] text-[#122B5A]" />
                        <span>Buy Now (COD)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Wishlist & Share Quick Bar */}
                <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => addToWishlist(product)}
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3.5 py-2 rounded-xl transition font-bold cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                      <span>{isInWishlist(product.id) ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                    </button>

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
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#122B5A] border border-slate-200 hover:border-blue-200 px-3.5 py-2 rounded-xl transition font-bold cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-[#122B5A]" />
                      <span>Share Product</span>
                    </button>
                  </div>
                </div>

                {/* Direct Phone & WhatsApp Order Help Box */}
                <div className="bg-gradient-to-r from-slate-900 via-[#122B5A] to-[#0A1D40] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-black text-[#FFB800] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Instant Hotline & WhatsApp Order
                    </p>
                    <p className="text-xs text-slate-200">
                      Need custom specifications or instant phone booking?
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {/* Call Button */}
                    <a
                      href="tel:01734340066"
                      className="flex-1 sm:flex-none bg-white text-[#122B5A] hover:bg-slate-100 font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#122B5A]" />
                      <span>01734-340066</span>
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Right Column Sidebar: Related Products (Col 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h2 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
              <span>Related Products</span>
            </h2>

            <div className="space-y-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="border border-slate-100 hover:border-slate-300 rounded-2xl p-3 hover:shadow-md transition-all duration-300 bg-white space-y-2 group"
                >
                  {/* Thumbnail Image */}
                  <Link href={`/product/${rel.slug || rel.id}`} className="block relative w-full h-32 bg-slate-50 rounded-xl overflow-hidden p-2">
                    <Image
                      src={rel.mainImage}
                      alt={rel.name}
                      fill
                      sizes="200px"
                      className="object-contain group-hover:scale-108 transition-transform duration-300"
                    />
                  </Link>

                  {/* Title & Price */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase text-[#122B5A] bg-blue-50 px-2 py-0.5 rounded">
                        {rel.category}
                      </span>
                      {rel.subCategory && (
                        <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {rel.subCategory}
                        </span>
                      )}
                    </div>
                    <Link href={`/product/${rel.slug || rel.id}`} className="block">
                      <h3 className="font-bold text-slate-800 text-xs line-clamp-2 group-hover:text-[#122B5A] transition leading-snug">
                        {rel.name}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[#122B5A] font-black text-sm">
                        ৳ {rel.price?.toLocaleString()}
                      </span>
                      {Boolean(rel.originalPrice && rel.originalPrice > rel.price) && (
                        <span className="text-slate-400 line-through text-[11px]">
                          ৳ {rel.originalPrice?.toLocaleString()}
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

            <Link
              href={product.subCategory ? `/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}&sub_category=${encodeURIComponent(product.subCategorySlug || product.subCategory)}` : `/all-products?category=${encodeURIComponent(product.categorySlug || product.category)}`}
              className="w-full bg-slate-50 hover:bg-[#122B5A] text-slate-700 hover:text-white border border-slate-200 hover:border-[#122B5A] font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 mt-2"
            >
              <span>View All in {product.subCategory || product.category}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* ─── Product Details Tabs Section ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">

          {/* Tab Header Pills */}
          <div className="flex items-center gap-3 border-b border-slate-200 text-sm font-bold pb-4 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "description"
                  ? "bg-[#122B5A] text-white shadow-md"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Full Description</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("additional")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "additional"
                  ? "bg-[#122B5A] text-white shadow-md"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Specifications & Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-xs sm:text-sm whitespace-nowrap ${activeTab === "reviews"
                  ? "bg-[#122B5A] text-white shadow-md"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
            >
              <Star className="w-4 h-4" />
              <span>Customer Reviews ({totalReviewsCount})</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">

            {/* 1. Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg mb-3">Product Overview & Features</h3>
                  {product.description || product.shortDescription ? (
                    <div
                      className="text-slate-700 leading-relaxed space-y-3 text-xs sm:text-sm prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || "" }}
                    />
                  ) : (
                    <p className="text-slate-500 italic leading-relaxed">
                      Detailed specifications and industrial description for this item are provided in the specifications tab.
                    </p>
                  )}
                </div>

                {/* Dynamic Key Highlights Box */}
                <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Features & Guaranteed Highlights:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="w-2 h-2 rounded-full bg-[#122B5A] shrink-0" />
                      <span>Item Name: <strong className="text-slate-900">{product.name}</strong></span>
                    </li>
                    {product.brand && (
                      <li className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
                        <span className="w-2 h-2 rounded-full bg-[#122B5A] shrink-0" />
                        <span>Brand / Manufacturer: <strong className="text-slate-900">{product.brand}</strong></span>
                      </li>
                    )}
                    <li className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="w-2 h-2 rounded-full bg-[#122B5A] shrink-0" />
                      <span>Category: <strong className="text-slate-900">{product.category}</strong></span>
                    </li>
                    {product.subCategory && (
                      <li className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
                        <span className="w-2 h-2 rounded-full bg-[#FFB800] shrink-0" />
                        <span>Sub-Category: <strong className="text-slate-900">{product.subCategory}</strong></span>
                      </li>
                    )}
                    <li className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="w-2 h-2 rounded-full bg-[#122B5A] shrink-0" />
                      <span>Stock Status: <strong className="text-emerald-700">{product.stock > 0 ? `${product.stock} units available` : "Out of stock"}</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Additional Information Tab */}
            {activeTab === "additional" && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">Technical Specifications</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-800 w-1/3">Product Name</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">{product.name}</td>
                      </tr>
                      {product.sku && (
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-slate-800">SKU / Model Code</td>
                          <td className="py-3 px-4 text-slate-700 font-mono font-bold text-[#122B5A]">{product.sku}</td>
                        </tr>
                      )}
                      {product.brand && (
                        <tr className="bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-800">Brand</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{product.brand}</td>
                        </tr>
                      )}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-bold text-slate-800">Category</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold text-[#122B5A]">{product.category}</td>
                      </tr>
                      {product.subCategory && (
                        <tr className="bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-800">Sub-Category</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{product.subCategory}</td>
                        </tr>
                      )}
                      {product.unit && (
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-slate-800">Unit of Measurement</td>
                          <td className="py-3 px-4 text-slate-700">{product.unit}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-800">Availability</td>
                        <td className="py-3 px-4 text-slate-700 font-bold text-emerald-600">
                          {product.stock > 0 ? `${product.stock} units in stock (Ready for dispatch)` : "Out of stock"}
                        </td>
                      </tr>

                      {/* Dynamic Database Attributes */}
                      {Object.entries(groupedAttributes).map(([name, vals], idx) => (
                        <tr key={name} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="py-3 px-4 font-bold text-slate-800">{name}</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{vals.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">

                {/* Rating Overview Box */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-r from-blue-50/40 via-slate-50 to-amber-50/30 p-6 sm:p-8 rounded-3xl border border-slate-200/90 items-center">
                  <div className="md:col-span-4 text-center md:text-left space-y-1.5">
                    <div className="text-4xl sm:text-5xl font-black text-[#122B5A]">
                      {averageRating} <span className="text-lg text-slate-400 font-normal">/ 5.0</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Based on {totalReviewsCount} customer rating{totalReviewsCount === 1 ? "" : "s"}</p>
                  </div>

                  <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-8 space-y-2.5 text-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
                      const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-12 font-bold text-slate-700">{star} Star</span>
                          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-10 text-right text-slate-500 font-bold">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 text-base">Customer Feedback</h4>
                  {reviews.length === 0 ? (
                    <div className="border border-slate-200/80 rounded-2xl p-8 bg-white text-center space-y-2">
                      <p className="text-slate-700 text-sm font-bold">No customer reviews yet for this product.</p>
                      <p className="text-slate-400 text-xs">Be the first to share your experience with other customers!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-white space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {rev.user?.name || rev.user_name || "Verified Customer"}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                              </span>
                            </div>
                            <span className="text-slate-400">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                          </div>
                          <div className="flex items-center text-amber-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add a Review Form or Login Prompt */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#122B5A]" /> Write a Customer Review
                    </h4>

                    {/* Rating Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Your Overall Rating:</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-400 hover:scale-125 transition cursor-pointer"
                          >
                            <Star className={`w-7 h-7 ${star <= newRating ? "fill-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-800 ml-2 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                          {newRating} out of 5 Stars
                        </span>
                      </div>
                    </div>

                    {/* Name Input (Read Only) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Name</label>
                      <input
                        type="text"
                        readOnly
                        value={user?.name || reviewerName || "Logged In Customer"}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>

                    {/* Review Textarea */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Review</label>
                      <textarea
                        rows={3}
                        placeholder="Share your experience with this product (e.g. build quality, performance, packaging)..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#122B5A]/30"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#122B5A] hover:bg-[#0A1D40] text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                    >
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Submit Product Review</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 text-[#122B5A] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">Want to share your feedback?</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please log in to your customer account to rate this item and submit your verified review.
                      </p>
                    </div>
                    <div>
                      <Link
                        href="/account?mode=login"
                        className="inline-flex items-center gap-2 bg-[#122B5A] hover:bg-[#0A1D40] text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow transition cursor-pointer active:scale-98"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Log In to Write a Review</span>
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
