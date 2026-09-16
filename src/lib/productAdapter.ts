import { ApiProduct } from "./api";

export interface UnifiedProduct {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  sale_price?: number;
  image: string;
  images: string[];
  category: string;
  categoryId?: number;
  subCategory?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOrganic?: boolean;
  stock?: number;
  stockStatus?: string;
  isOutOfStock?: boolean;
  unit?: string;
  brand?: string;
  rating: number;
  reviewsCount: number;
  discountPercentage?: number;
  description?: string;
  shortDescription?: string;
  attributes?: any;
  variants?: any[];
  has_variants?: boolean;
  status?: boolean;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

export function isProductOutOfStock(p: any): boolean {
  if (!p) return false;
  if (p.is_out_of_stock === true || p.isOutOfStock === true) return true;
  if (p.in_stock === false || p.inStock === false || p.is_in_stock === false) return true;
  if (typeof p.stockStatus === "string" && p.stockStatus.toLowerCase().includes("out")) return true;
  if (typeof p.stock_status === "string" && p.stock_status.toLowerCase().includes("out")) return true;
  if (p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock))) {
    return Number(p.stock) <= 0;
  }
  if (p.stockQuantity !== undefined && p.stockQuantity !== null && !isNaN(Number(p.stockQuantity))) {
    return Number(p.stockQuantity) <= 0;
  }
  if (p.stock_quantity !== undefined && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity))) {
    return Number(p.stock_quantity) <= 0;
  }
  return false;
}

export function normalizeProduct(p: any): UnifiedProduct {
  if (!p) {
    return {
      id: 0,
      name: "",
      slug: "",
      price: 0,
      image: PLACEHOLDER_IMG,
      images: [PLACEHOLDER_IMG],
      category: "General",
      rating: 5,
      reviewsCount: 0,
    };
  }

  // Parse raw price values
  const rawPrice = parseFloat(String(p.price || 0)) || 0;
  const rawSalePrice = p.sale_price !== null && p.sale_price !== undefined ? parseFloat(String(p.sale_price)) : null;

  // Determine current active price and original regular price
  let activePrice = rawPrice;
  let originalPrice: number | undefined = undefined;

  if (rawSalePrice !== null && rawSalePrice > 0 && rawSalePrice < rawPrice) {
    activePrice = rawSalePrice;
    originalPrice = rawPrice;
  } else if (p.originalPrice && parseFloat(String(p.originalPrice)) > rawPrice) {
    originalPrice = parseFloat(String(p.originalPrice));
  } else if (p.original_price && parseFloat(String(p.original_price)) > rawPrice) {
    originalPrice = parseFloat(String(p.original_price));
  }

  // Calculate discount percentage if not explicitly provided
  let discountPercentage = p.discount ? parseFloat(String(p.discount)) : undefined;
  if (!discountPercentage && originalPrice && originalPrice > activePrice && activePrice > 0) {
    const calc = Math.round(((originalPrice - activePrice) / originalPrice) * 100);
    if (!isNaN(calc) && calc > 0) {
      discountPercentage = calc;
    }
  }
  if (discountPercentage !== undefined && (isNaN(discountPercentage) || discountPercentage <= 0)) {
    discountPercentage = undefined;
  }

  // Extract images
  let mainImg = p.image || p.main_image || p.mainImage || "";
  let imgList: string[] = [];

  if (Array.isArray(p.images) && p.images.length > 0) {
    imgList = p.images.filter(Boolean);
    if (!mainImg) mainImg = imgList[0];
  } else if (mainImg) {
    imgList = [mainImg];
  } else {
    mainImg = PLACEHOLDER_IMG;
    imgList = [PLACEHOLDER_IMG];
  }

  // Category name extraction
  let categoryName = "General";
  if (typeof p.category === "string") {
    categoryName = p.category;
  } else if (p.category && typeof p.category === "object" && p.category.name) {
    categoryName = p.category.name;
  }

  const outOfStock = isProductOutOfStock(p);
  let stockValue = 50;
  if (p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock))) {
    stockValue = Number(p.stock);
  } else if (p.stockQuantity !== undefined && p.stockQuantity !== null && !isNaN(Number(p.stockQuantity))) {
    stockValue = Number(p.stockQuantity);
  } else if (p.stock_quantity !== undefined && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity))) {
    stockValue = Number(p.stock_quantity);
  }
  if (outOfStock) {
    stockValue = 0;
  }

  return {
    id: p.id,
    name: p.name || "Product",
    slug: p.slug || String(p.id),
    price: activePrice,
    originalPrice: originalPrice,
    sale_price: rawSalePrice || undefined,
    image: mainImg,
    images: imgList,
    category: categoryName,
    categoryId: p.category_id || p.category?.id || undefined,
    subCategory: p.sub_category || (typeof p.sub_category === "object" ? p.sub_category?.name : undefined),
    isBestSeller: Boolean(p.best_seller || p.isBestSeller || p.is_bestseller),
    isFeatured: Boolean(p.featured || p.isFeatured || p.is_featured),
    isNew: Boolean(p.new_arrival || p.isNew || p.is_new),
    isOrganic: Boolean(p.organic || p.isOrganic),
    stock: stockValue,
    stockStatus: stockValue > 0 ? "In Stock" : "Out of Stock",
    isOutOfStock: stockValue <= 0,
    unit: p.unit || "pcs",
    brand: p.brand || "Door Step BD",
    rating: p.rating || 5,
    reviewsCount: p.reviews_count || p.reviewsCount || 12,
    discountPercentage,
    description: p.description || p.short_description || "",
    shortDescription: p.short_description || p.description || "",
    attributes: p.attributes || [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    has_variants: Boolean(
      p.has_variants ||
      (Array.isArray(p.variants) && p.variants.length > 0) ||
      (p.attributes && (
        (typeof p.attributes === "string" && p.attributes.trim() !== "" && p.attributes !== "[]" && p.attributes !== "{}") ||
        (Array.isArray(p.attributes) && p.attributes.length > 0) ||
        (typeof p.attributes === "object" && Object.keys(p.attributes).length > 0)
      ))
    ),
    status: p.status !== undefined ? Boolean(p.status) : true,
  };
}
