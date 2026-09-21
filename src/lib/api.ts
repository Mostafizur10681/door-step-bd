export function resolveApiBaseUrl(): string {
  // 1. In browser: If running on production domain, always point to admin.doorstepbd.org
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
    if (!isLocal) {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!envUrl || envUrl.includes("127.0.0.1") || envUrl.includes("localhost")) {
        return "https://admin.doorstepbd.org";
      }
      return envUrl.replace(/\/+$/, "");
    }
  }

  // 2. In production Node.js / SSR server environment
  if (process.env.NODE_ENV === "production") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envUrl || envUrl.includes("127.0.0.1") || envUrl.includes("localhost")) {
      return "https://admin.doorstepbd.org";
    }
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Local development fallback
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return rawUrl.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;

export function getMediaUrl(image?: string | null, fallback: string = "/prod_maca.png"): string {
  if (!image || typeof image !== "string" || !image.trim()) {
    return fallback;
  }
  const trimmed = image.trim();
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  const baseUrl = resolveApiBaseUrl();
  if (trimmed.startsWith("storage/")) {
    return `${baseUrl}/${trimmed}`;
  }
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 100) {
    return `data:image/png;base64,${trimmed}`;
  }
  return `${baseUrl}/storage/${trimmed}`;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: string | number;
  sale_price?: string | number | null;
  SKU?: string;
  brand?: string;
  unit?: string;
  stock?: number;
  featured?: boolean;
  best_seller?: boolean;
  organic?: boolean;
  new_arrival?: boolean;
  image?: string | null;
  images?: string[];
  status?: boolean;
  category_id?: number;
  sub_category_id?: number | null;
  sub_category?: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  attributes?: { name: string; value: string }[];
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status?: boolean | number;
  sub_categories?: {
    id: number;
    name: string;
    slug: string;
    category_id?: number;
  }[];
}

export interface ApiBanner {
  id: number;
  title?: string;
  title_line1?: string;
  title_line2?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  discount_text?: string;
  discountText?: string;
  badge?: string;
  tagline?: string;
  image?: string;
  desktop_image?: string;
  mobile_image?: string;
  left_image?: string;
  bg_color?: string;
  right_bg_color?: string;
  cta_text?: string;
  cta_link?: string;
  ctaText?: string;
  ctaLink?: string;
  link?: string;
  order?: number;
  is_active?: boolean;
  menu_location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiFaq {
  id: number;
  question: string;
  answer: string;
  category?: string;
  faq_category_id?: number;
}

export interface ApiDivision {
  id: number;
  name: string;
  bn_name?: string;
}

export interface ApiDistrict {
  id: number;
  division_id?: number;
  name?: string;
  district_name?: string;
  bn_name?: string;
  district_name_bn?: string;
}

export interface ApiThana {
  id: number;
  district_id: number;
  name: string;
  bn_name?: string;
}

export interface ApiFooterSettings {
  id?: number;
  store_name?: string;
  logo_image?: string | null;
  address?: string;
  contact_address?: string;
  map_url?: string;
  copyright_text?: string;
  contact_phone?: string;
  contact_email?: string;
  working_hours_1?: string;
  working_hours_2?: string;
  contact_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  pinterest_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  column_1_title?: string;
  column_1_links?: { label: string; url: string }[];
  column_2_title?: string;
  column_2_links?: { label: string; url: string }[];
  column_3_title?: string;
  column_3_links?: { label: string; url: string }[];
  payment_methods?: string[];
}

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  attributes?: Record<string, string>;
}

export interface CreateOrderPayload {
  customer_name: string;
  company_name?: string;
  customer_phone: string;
  customer_email?: string;
  country?: string;
  division?: string;
  district: string;
  thana?: string;
  address: string;
  town_city?: string;
  postcode?: string;
  order_notes?: string;
  payment_method?: string;
  ship_different?: boolean;
  ship_customer_name?: string;
  ship_company_name?: string;
  ship_country?: string;
  ship_address?: string;
  ship_town_city?: string;
  ship_postcode?: string;
  ship_district?: string;
  ship_phone?: string;
  shipping_amount?: number;
  coupon_code?: string;
  coupon_discount?: number;
  user_id?: number;
  items: OrderItemPayload[];
}

export interface FetchOptions extends RequestInit {
  suppressThrow?: boolean;
}

export async function fetchFromApi<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const base = resolveApiBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${base}/api/v1${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Attach Sanctum token if available in localStorage
  let headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shopia_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (options?.headers) {
    headers = { ...headers, ...(options.headers as Record<string, string>) };
  }

  let res: Response;
  try {
    const signal = options?.signal || (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined);
    res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
      signal,
    });
  } catch (err: any) {
    if (options?.suppressThrow) {
      return { success: false, data: null } as unknown as T;
    }
    const isNetworkError = err instanceof TypeError || err?.name === "TypeError" || err?.message?.includes("fetch");
    const msg = isNetworkError
      ? `Failed to connect to API server at ${url}. Please ensure the backend server is running.`
      : (err?.message || "Network request failed");
    const error: any = new Error(msg);
    error.cause = err;
    throw error;
  }

  if (!res.ok) {
    if (options?.suppressThrow) {
      return { success: false, data: null } as unknown as T;
    }
    let errMessage = `HTTP error ${res.status}`;
    let validationErrors: Record<string, string[]> | undefined = undefined;
    try {
      const errData = await res.json();
      if (errData.errors && typeof errData.errors === "object" && !Array.isArray(errData.errors) && Object.keys(errData.errors).length > 0) {
        validationErrors = errData.errors;
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey && Array.isArray(errData.errors[firstKey]) && errData.errors[firstKey][0]) {
          errMessage = errData.errors[firstKey][0];
        } else if (errData.message) {
          errMessage = errData.message;
        }
      } else if (errData.message) {
        errMessage = errData.message;
      }
    } catch {
      // ignore
    }
    const error: any = new Error(errMessage);
    if (validationErrors) {
      error.errors = validationErrors;
    }
    throw error;
  }

  return res.json();
}

// ── Orders ──
export async function placeOrder(payload: CreateOrderPayload) {
  return fetchFromApi<{
    success: boolean;
    message: string;
    data: any;
  }>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createOrder(payload: CreateOrderPayload) {
  return placeOrder(payload);
}

// ── Products ──
export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: string | number;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.category) searchParams.set("category", String(params.category));
  if (params?.search) searchParams.set("search", String(params.search));

  const query = searchParams.toString();
  const endpoint = `/products${query ? `?${query}` : ""}`;
  try {
    return await fetchFromApi<{ success: boolean; data: { data: ApiProduct[]; meta?: any; links?: any } }>(endpoint, { suppressThrow: true });
  } catch (err) {
    console.warn(`API ${endpoint} request failed:`, err);
    return { success: false, data: { data: [] } };
  }
}

export async function getProductBySlugOrId(idOrSlug: string | number) {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiProduct }>(`/products/${idOrSlug}`, { suppressThrow: true });
  } catch {
    return { success: false, data: null as any };
  }
}

// ── Categories ──
export async function getCategories(all: boolean = true) {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiCategory[] }>(`/categories${all ? "?all=1" : ""}`, { suppressThrow: true });
  } catch (err) {
    console.warn("API /categories request failed:", err);
    return { success: false, data: [] };
  }
}

// ── Banners ──
const LOCAL_BANNERS_STORAGE_KEY = "shopia_dynamic_banners";

export async function getBanners(): Promise<{ success: boolean; data: ApiBanner[] }> {
  try {
    const res = await fetchFromApi<any>("/banners", { suppressThrow: true });
    let list: any[] = [];
    if (res) {
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }
    }

    if (list.length > 0) {
      const normalized: ApiBanner[] = list.map((b: any) => ({
        id: b.id,
        title: b.title || b.name || "",
        title_line1: b.title_line1 || "",
        title_line2: b.title_line2 || "",
        subtitle: b.subtitle || b.description || b.short_description || "",
        badge: b.badge || b.tagline || b.tag || "",
        tagline: b.tagline || b.badge || "",
        image: getMediaUrl(b.desktop_image || b.image || b.banner_image || b.banner || b.photo, "/hero_honey.png"),
        desktop_image: getMediaUrl(b.desktop_image || b.image || b.banner_image || b.banner || b.photo, "/hero_honey.png"),
        mobile_image: b.mobile_image ? getMediaUrl(b.mobile_image, "/hero_honey.png") : undefined,
        cta_text: (b.cta_text !== undefined && b.cta_text !== null) ? b.cta_text : (b.button_text || b.btn_text || ""),
        cta_link: b.cta_link || b.link || b.url || b.link_url || "/all-products",
        bg_color: b.bg_color || b.background_color || "linear-gradient(135deg, #0b2545 0%, #134074 50%, #8d0801 100%)",
        order: Number(b.order || b.serial || b.position || b.sort_order) || 1,
        is_active: b.is_active !== undefined ? (b.is_active === true || b.is_active === 1 || b.is_active === "1" || b.status === 1 || b.status === true || b.status === "active") : (b.status !== undefined ? (b.status === 1 || b.status === true || b.status === "active" || b.status === "1") : true),
        created_at: b.created_at,
        updated_at: b.updated_at,
      }));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_BANNERS_STORAGE_KEY, JSON.stringify(normalized));
        } catch { }
      }
      return { success: true, data: normalized };
    }
  } catch (err) {
    console.warn("API /banners request failed:", err);
  }

  // Fallback to local storage if API is not running or returned empty
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_BANNERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, data: parsed };
        }
      }
    } catch { }
  }

  return { success: false, data: [] };
}

export async function createBanner(bannerData: Partial<ApiBanner>): Promise<{ success: boolean; message: string; data?: ApiBanner }> {
  try {
    const res = await fetchFromApi<{ success: boolean; message: string; data: ApiBanner }>("/banners", {
      method: "POST",
      body: JSON.stringify(bannerData),
      suppressThrow: true,
    });
    if (res && res.success) {
      return res;
    }
  } catch (err) {
    console.warn("API createBanner failed, saving locally:", err);
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_BANNERS_STORAGE_KEY);
      const existing: ApiBanner[] = saved ? JSON.parse(saved) : [];
      const newBanner: ApiBanner = {
        id: Date.now(),
        title: bannerData.title || "New Campaign",
        subtitle: bannerData.subtitle || "",
        badge: bannerData.badge || "",
        tagline: bannerData.tagline || "",
        image: bannerData.image || "/hero_honey.png",
        desktop_image: bannerData.desktop_image || bannerData.image || "/hero_honey.png",
        mobile_image: bannerData.mobile_image || bannerData.desktop_image || bannerData.image || "/hero_honey.png",
        cta_text: bannerData.cta_text || "",
        cta_link: bannerData.cta_link || "/all-products",
        bg_color: bannerData.bg_color || "#ffffff",
        order: Number(bannerData.order) || existing.length + 1,
        is_active: bannerData.is_active !== undefined ? bannerData.is_active : true,
        created_at: new Date().toISOString(),
      };
      existing.push(newBanner);
      localStorage.setItem(LOCAL_BANNERS_STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new Event("banners_updated"));
      return { success: true, message: "Banner created successfully!", data: newBanner };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to create banner" };
    }
  }

  return { success: false, message: "Failed to create banner" };
}

export async function updateBanner(id: number, bannerData: Partial<ApiBanner>): Promise<{ success: boolean; message: string; data?: ApiBanner }> {
  try {
    const res = await fetchFromApi<{ success: boolean; message: string; data: ApiBanner }>(`/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(bannerData),
      suppressThrow: true,
    });
    if (res && res.success) {
      return res;
    }
  } catch (err) {
    console.warn(`API updateBanner /banners/${id} failed, saving locally:`, err);
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_BANNERS_STORAGE_KEY);
      let list: ApiBanner[] = saved ? JSON.parse(saved) : [];
      const index = list.findIndex((b) => Number(b.id) === Number(id));
      if (index !== -1) {
        list[index] = { ...list[index], ...bannerData, updated_at: new Date().toISOString() };
      } else {
        list.push({ id, ...bannerData } as ApiBanner);
      }
      localStorage.setItem(LOCAL_BANNERS_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("banners_updated"));
      return { success: true, message: "Banner updated successfully!", data: list[index] };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to update banner" };
    }
  }

  return { success: false, message: "Failed to update banner" };
}

export async function deleteBanner(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetchFromApi<{ success: boolean; message: string }>(`/banners/${id}`, {
      method: "DELETE",
      suppressThrow: true,
    });
    if (res && res.success) {
      return res;
    }
  } catch (err) {
    console.warn(`API deleteBanner /banners/${id} failed, deleting locally:`, err);
  }

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_BANNERS_STORAGE_KEY);
      if (saved) {
        let list: ApiBanner[] = JSON.parse(saved);
        list = list.filter((b) => Number(b.id) !== Number(id));
        localStorage.setItem(LOCAL_BANNERS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("banners_updated"));
      }
      return { success: true, message: "Banner deleted successfully!" };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to delete banner" };
    }
  }

  return { success: false, message: "Failed to delete banner" };
}

export async function toggleBannerStatus(id: number, is_active: boolean): Promise<{ success: boolean; message: string }> {
  return updateBanner(id, { is_active });
}

// ── Locations ──
export async function getDivisions() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiDivision[] }>("/divisions", { suppressThrow: true });
  } catch (err) {
    console.warn("API /divisions request failed:", err);
    return { success: false, data: [] };
  }
}

export async function getDistricts(divisionId?: number | string) {
  const query = new URLSearchParams();
  query.set("per_page", "100");
  if (divisionId) query.set("division_id", String(divisionId));
  const endpoint = `/districts?${query.toString()}`;
  try {
    const res = await fetchFromApi<{ success: boolean; data: any }>(endpoint, { suppressThrow: true });
    const list = res?.data?.data || res?.data || [];
    const normalized: ApiDistrict[] = Array.isArray(list)
      ? list.map((item: any) => ({
          id: item.id,
          division_id: item.division_id,
          name: item.district_name || item.name || "",
          district_name: item.district_name || item.name || "",
          bn_name: item.district_name_bn || item.bn_name || "",
          district_name_bn: item.district_name_bn || item.bn_name || "",
        }))
      : [];
    return { success: true, data: normalized };
  } catch (err) {
    console.warn(`API ${endpoint} request failed:`, err);
    return { success: false, data: [] };
  }
}

export async function getThanas(districtId?: number | string) {
  const endpoint = districtId ? `/thanas?district_id=${districtId}` : "/thanas";
  try {
    return await fetchFromApi<{ success: boolean; data: ApiThana[] }>(endpoint, { suppressThrow: true });
  } catch (err) {
    console.warn(`API ${endpoint} request failed:`, err);
    return { success: false, data: [] };
  }
}

// ── FAQs ──
export async function getFaqs() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiFaq[] }>("/faqs", { suppressThrow: true });
  } catch (err) {
    console.warn("API /faqs request failed:", err);
    return { success: false, data: [] };
  }
}

// ── Partners ──
export async function getPartners() {
  try {
    return await fetchFromApi<{ success: boolean; data: any[] }>("/partners", { suppressThrow: true });
  } catch (err) {
    console.warn("API /partners request failed:", err);
    return { success: false, data: [] };
  }
}

// ── About Page ──
export async function getAboutPage() {
  try {
    return await fetchFromApi<{ success: boolean; data: any }>("/about", { suppressThrow: true });
  } catch (err) {
    console.warn("API /about request failed:", err);
    return { success: false, data: null };
  }
}

export async function updateAboutPage(payload: any) {
  return fetchFromApi<{ success: boolean; message: string; data: any }>("/about", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserOrders(page: number = 1, perPage: number = 20) {
  try {
    const res = await fetchFromApi<{ success: boolean; data: any; message?: string }>(`/auth/orders?page=${page}&per_page=${perPage}`, { suppressThrow: true });
    if (res && (res.data || res.success)) {
      return res;
    }
  } catch { }
  try {
    return await fetchFromApi<{ success: boolean; data: any; message?: string }>(`${API_BASE_URL}/api/customer/orders?page=${page}&per_page=${perPage}`, { suppressThrow: true });
  } catch { }
  return { success: false, data: [] };
}

export async function trackOrder(orderNumber: string) {
  return fetchFromApi<{ success: boolean; data: any }>(`/orders/track/${orderNumber}`);
}

// ── Subscriptions ──
export async function subscribeNewsletter(email: string) {
  return fetchFromApi<{ success: boolean; message: string }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ── Contact Messages ──
export async function sendContactMessage(payload: {
  name: string;
  email?: string;
  phone: string;
  subject?: string;
  message: string;
}) {
  return fetchFromApi<{ success: boolean; message: string }>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Auth ──
export async function loginCustomer(credentials: { email?: string; phone?: string; password?: string }) {
  return fetchFromApi<{ success: boolean; message: string; data: { token: string; user: any } }>("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerCustomer(data: { name: string; email?: string; phone: string; password?: string }) {
  return fetchFromApi<{ success: boolean; message: string; data: { token: string; user: any } }>("/auth/customer/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAuthProfile() {
  return fetchFromApi<{ success: boolean; data: any }>("/auth/profile", { suppressThrow: true });
}

export async function updateAuthProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  profile_pic?: string;
}) {
  return fetchFromApi<{ success: boolean; message: string; data: any }>("/auth/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changeAuthPassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return fetchFromApi<{ success: boolean; message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAuthAccount() {
  return fetchFromApi<{ success: boolean; message: string }>("/auth/delete-account", {
    method: "POST",
  });
}

export async function getFooterSettings() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiFooterSettings }>("/footer-settings", { suppressThrow: true });
  } catch (err) {
    console.warn("API /footer-settings request failed:", err);
    return { success: false, data: null as any };
  }
}

export async function logoutCustomer() {
  return fetchFromApi<{ success: boolean; message: string }>("/auth/logout", {
    method: "POST",
  });
}

export interface ApiContactSettings {
  id?: string | number;
  badge_text?: string;
  hero_title?: string;
  hero_subtitle?: string;
  phone?: string;
  secondary_phone?: string;
  email?: string;
  secondary_email?: string;
  whatsapp_number?: string;
  address?: string;
  business_hours_weekday?: string;
  business_hours_weekend?: string;
  response_time_note?: string;
  map_title?: string;
  map_subtitle?: string;
  map_url?: string;
  location_directions?: string;
  form_title?: string;
  form_subtitle?: string;
  form_topics?: string[];
  emergency_notice?: string;
  features?: { icon?: string; title?: string; desc?: string }[];
  support_title?: string;
  support_desc?: string;
  support_phone?: string;
  support_image?: string;
}

export async function getContactSettings() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiContactSettings }>("/contact-settings", { suppressThrow: true });
  } catch (err) {
    console.warn("API /contact-settings request failed:", err);
    return { success: false, data: null as any };
  }
}

export interface ApiBlog {
  id: number;
  title: string;
  slug: string;
  blog_category_id?: number | null;
  author_name: string;
  image?: string | null;
  short_description?: string | null;
  content: string;
  views: number;
  status: string;
  featured: boolean;
  published_at?: string | null;
  created_at?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  approved_comments?: {
    id: number;
    name: string;
    comment: string;
    created_at: string;
  }[];
}

export interface ApiBlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  blogs_count?: number;
}

export async function getBlogs(params?: { search?: string; category?: string; featured?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.featured) query.append("featured", "1");

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await fetchFromApi<{ success: boolean; data: ApiBlog[]; pagination: any }>(`/blogs${queryString}`, { suppressThrow: true });
  } catch (err) {
    console.warn("API /blogs request failed:", err);
    return { success: false, data: [] };
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiBlog; related_blogs: ApiBlog[] }>(`/blogs/${slug}`, { suppressThrow: true });
  } catch (err) {
    console.warn(`API /blogs/${slug} request failed:`, err);
    return { success: false, data: null as any, related_blogs: [] };
  }
}

export async function getBlogCategories() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiBlogCategory[] }>("/blog-categories", { suppressThrow: true });
  } catch (err) {
    console.warn("API /blog-categories request failed:", err);
    return { success: false, data: [] };
  }
}

export async function postBlogComment(slug: string, payload: { name: string; email: string; comment: string }) {
  try {
    const res = await fetch(`${API_V1}/blogs/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.warn(`API /blogs/${slug}/comments failed:`, err);
    return { success: false, message: "Network error submitting comment." };
  }
}

export interface ApiWhatsAppSettings {
  whatsapp_number?: string;
  default_message?: string;
  enabled?: boolean;
  position?: "right" | "left";
}

export async function getWhatsAppSettings() {
  try {
    return await fetchFromApi<{ success: boolean; data: ApiWhatsAppSettings }>("/whatsapp-settings", { suppressThrow: true });
  } catch (err) {
    return { success: false, data: null as any };
  }
}

export interface ApiCouponResult {
  id: number;
  code: string;
  name?: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
  formatted_discount: string;
  discount_label: string;
  subtotal: number;
  new_subtotal: number;
  minimum_order_amount?: number | null;
  maximum_discount?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
}

export async function validateAndApplyCoupon(code: string, subtotal: number, userId?: number | null): Promise<{ success: boolean; message: string; data?: ApiCouponResult }> {
  try {
    const res = await fetch(`${API_V1}/coupons/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        code,
        subtotal,
        user_id: userId || undefined
      })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to validate coupon"
    };
  }
}
