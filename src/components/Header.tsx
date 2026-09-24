"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, Heart, ShoppingCart, User, Truck, X, ChevronDown, ChevronRight, 
  Plus, Minus, Menu, Phone, MapPin, Mail, PhoneCall, CheckCircle2 
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import productsData from "@/data/products.json";
import { DoorStepLogo } from "@/components/common/DoorStepLogo";
import { API_V1 } from "@/lib/api";

type SubCategory = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category?: { id: number; name: string; slug: string };
};

type Category = {
  id: number;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
};

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | number | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const { wishlist, cart, user, updateQuantity, removeFromCart } = useShop();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWishlistCount = wishlist.length;

  // Fetch dynamic categories + sub-categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_V1}/categories?all=1`);
        if (!res.ok) return;
        const json = await res.json();
        const catsData = json.data || json;
        if (Array.isArray(catsData)) {
          const mapped = catsData.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subCategories: (cat.sub_categories || cat.subcategories || cat.subCategories || cat.children || []).map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              category_id: cat.id,
            })),
          }));
          setCategories(mapped);
        }
      } catch {
        // Fallback silently if API is booting
      }
    };

    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_V1}/products?per_page=100`);
        if (!res.ok) throw new Error("API not ready");
        const json = await res.json();
        const prods = json.data?.data || json.data || [];
        if (Array.isArray(prods) && prods.length > 0) {
          const mapped = prods.map((p: any) => ({
            id: p.id,
            name: p.name || "",
            slug: p.slug || String(p.id),
            price: parseFloat(String(p.price || 0)) || 0,
            category: typeof p.category === "string" ? p.category : (p.category?.name || "General"),
            mainImage: p.main_image || p.image || p.mainImage || (Array.isArray(p.images) && p.images[0]) || "/hero_honey.png",
          }));
          setAllProducts(mapped);
          return;
        }
      } catch {
        // Fallback to static dataset
      }

      const staticMapped = (productsData as any[]).map((p: any) => ({
        id: p.id,
        name: p.name || "",
        slug: p.slug || String(p.id),
        price: parseFloat(String(p.price || 0)) || 0,
        category: typeof p.category === "string" ? p.category : (p.category?.name || "General"),
        mainImage: p.mainImage || p.image || "/hero_honey.png",
      }));
      setAllProducts(staticMapped);
    };

    loadCategories();
    loadProducts();
  }, []);

  const searchResults = searchQuery.trim()
    ? allProducts.filter((p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="w-full font-sans bg-white selection:bg-[#FFB800] selection:text-[#122B5A]">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP UTILITY BAR (Very light gray, subtle and elegant)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#f8fafc] border-b border-slate-200/80 text-[11px] sm:text-xs text-slate-600 py-1.5 px-4 sm:px-8">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 text-center sm:text-left">
          {/* Left Text */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              Welcome to Leader of power solution since 2020
            </span>
          </div>

          {/* Right Text / Certificate */}
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span className="hidden md:inline">
              Global Certificate: <strong className="text-slate-700 font-bold">ISO 9001:2016</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN MIDDLE HEADER (Logo, Info Badges, Yellow CTA & Cart)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#122B5A] transition rounded-lg border border-slate-200 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <DoorStepLogo
            isLink
            href="/"
            className="h-10 sm:h-12 md:h-13 lg:h-14 w-auto max-w-[220px] sm:max-w-[260px] md:max-w-[300px] lg:max-w-[340px]"
          />
        </div>

        {/* Middle & Right: Info Badges & Actions */}
        <div className="flex items-center gap-5 lg:gap-8">
          
          {/* Badge 1: Location / Address (Desktop) */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-slate-200/90 flex items-center justify-center text-[#122B5A] bg-slate-50/80 shadow-2xs shrink-0">
              <MapPin className="w-4 h-4 text-[#122B5A]" />
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-slate-800">41/1, Sher-E-Bangla Rd</p>
              <p className="text-[11px] text-slate-500">Mohammadpur, Dhaka 1207</p>
            </div>
          </div>

          {/* Badge 2: Phone & Email Contact (Desktop / Tablet) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-slate-200/90 flex items-center justify-center text-[#122B5A] bg-slate-50/80 shadow-2xs shrink-0">
              <PhoneCall className="w-4 h-4 text-[#122B5A]" />
            </div>
            <div className="text-xs leading-tight">
              <a href="tel:01734340066" className="font-bold text-slate-800 hover:text-[#122B5A] transition block">
                +880 1734-340066
              </a>
              <a href="mailto:info@doorstepbd.com" className="text-[11px] text-slate-500 hover:underline block">
                info@doorstepbd.com
              </a>
            </div>
          </div>

          {/* User Profile / Account */}
          <Link 
            href="/account" 
            className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-[#122B5A] transition"
            title={user ? `Logged in as ${user.name}` : "Sign In / Register"}
          >
            {user ? (
              user.avatar && user.avatar.trim() !== "" ? (
                <span className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 flex items-center justify-center shadow-xs bg-slate-100">
                  <Image
                    src={user.avatar}
                    alt={user.name || "Profile"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="w-8 h-8 rounded-full bg-[#122B5A] text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>
              )
            ) : (
              <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#122B5A] hover:text-[#122B5A] transition">
                <User className="w-4 h-4" />
              </div>
            )}
          </Link>

          {/* Wishlist Link with Badge */}
          <Link 
            href="/wishlist" 
            className="relative text-slate-700 hover:text-[#122B5A] transition flex items-center"
            title="Wishlist"
          >
            <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#122B5A] hover:text-[#122B5A] transition">
              <Heart className="w-4 h-4" />
            </div>
            {totalWishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FFB800] text-[#122B5A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalWishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Badge & Dropdown Window */}
          <div className="relative group py-1">
            <Link 
              href="/cart" 
              className="relative text-slate-700 hover:text-[#122B5A] transition flex items-center"
              title="Shopping Cart"
            >
              <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#122B5A] hover:text-[#122B5A] transition">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 bg-[#FFB800] text-[#122B5A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            </Link>

            {/* Hover Cart Popup Window */}
            <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 w-80 sm:w-96">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <ShoppingCart className="w-10 h-10 mx-auto opacity-30 text-[#122B5A]" />
                    <p className="text-sm font-semibold">Your cart is currently empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
                      {cart.map((item, index) => {
                        const itemKey = item.cartItemId || `${item.id}-${index}`;
                        return (
                          <div key={itemKey} className="pt-3 first:pt-0 flex items-start gap-3 relative">
                            {/* Item Thumbnail */}
                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg relative shrink-0 overflow-hidden flex items-center justify-center p-1">
                              <Image
                                src={(item.mainImage && item.mainImage.trim() !== "") ? item.mainImage : (item.image || "/prod_maca.png")}
                                alt={item.name || "Product"}
                                fill
                                sizes="56px"
                                className="object-contain"
                              />
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0 pr-6 space-y-1">
                              <h4 className="text-xs font-semibold text-[#122B5A] truncate leading-tight">
                                {item.name}
                              </h4>

                              {/* Quantity Controls */}
                              <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-100/80 px-2 py-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(item.cartItemId || item.id, -1);
                                  }}
                                  className="w-4 h-4 rounded-full text-slate-600 hover:bg-white flex items-center justify-center text-xs transition cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(item.cartItemId || item.id, 1);
                                  }}
                                  className="w-4 h-4 rounded-full text-slate-600 hover:bg-white flex items-center justify-center text-xs transition cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-xs font-bold text-[#122B5A]">
                                ৳{item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </div>
                            </div>

                            {/* Remove Item Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeFromCart(item.cartItemId || item.id);
                              }}
                              className="absolute top-2 right-0 text-slate-400 hover:text-rose-600 text-sm font-bold p-1 transition cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Subtotal Section */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-sm">
                      <span className="text-slate-600">Subtotal :</span>
                      <span className="text-[#122B5A] text-base font-extrabold">
                        ৳{cartSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/cart"
                        className="w-full border-2 border-[#122B5A] text-[#122B5A] hover:bg-[#122B5A] hover:text-white font-bold text-xs py-2 rounded-lg transition-all text-center block"
                      >
                        View Cart
                      </Link>

                      <Link
                        href="/checkout"
                        className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs py-2 rounded-lg transition-all shadow-sm text-center block"
                      >
                        Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Yellow Action Button: REQUEST A QUOTE / ORDER NOW */}
          <Link
            href="/all-products"
            className="hidden sm:inline-flex items-center justify-center bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs sm:text-xs tracking-wider px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            REQUEST A QUOTE
          </Link>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SOLID NAVY BOTTOM NAVIGATION BAR (Links + Embedded Search)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#122B5A] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* Left Menu Items (Desktop / Tablet) */}
          <nav className="hidden lg:flex items-center flex-wrap divide-x divide-white/15 text-xs font-bold uppercase tracking-wider">
            
            {/* HOME */}
            <Link 
              href="/" 
              className="py-3.5 pr-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              HOME
            </Link>

            {/* ABOUT US */}
            <Link 
              href="/about" 
              className="py-3.5 px-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              ABOUT US
            </Link>

            {/* SOLUTIONS (with Dropdown & Direct Link) */}
            <div className="relative group py-3.5 px-4">
              <Link 
                href="/solutions" 
                className="flex items-center gap-1.5 hover:text-[#FFB800] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>SOLUTIONS</span>
                {categories && categories.length > 0 && (
                  <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-[#FFB800] group-hover:rotate-180 transition-transform duration-200" />
                )}
              </Link>

              {/* Dynamic Categories Dropdown Menu */}
              {categories && categories.length > 0 && (
                <div className="absolute left-0 top-full pt-1 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-50 min-w-[220px]">
                  <div className="bg-white text-slate-800 rounded-sm shadow-2xl border border-slate-200 py-2 text-left animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <div key={cat.id} className="relative group/sub">
                        <Link
                          href={`/all-products?category=${cat.slug}`}
                          className="flex items-center justify-between px-4 py-2.5 text-xs font-bold hover:text-[#122B5A] hover:bg-amber-50/70 transition"
                        >
                          <span>{cat.name}</span>
                          {cat.subCategories && cat.subCategories.length > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </Link>

                        {/* Nested Sub-categories on hover */}
                        {cat.subCategories && cat.subCategories.length > 0 && (
                          <div className="absolute left-full top-0 pl-1 opacity-0 invisible pointer-events-none group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:pointer-events-auto transition-all duration-150 min-w-[190px]">
                            <div className="bg-white rounded-sm shadow-2xl border border-slate-200 py-1.5 text-left">
                              {cat.subCategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/all-products?sub_category=${sub.slug}`}
                                  className="block px-4 py-2 text-xs font-medium text-slate-600 hover:text-[#122B5A] hover:bg-amber-50/70 transition"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROJECTS */}
            <Link 
              href="/projects" 
              className="py-3.5 px-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              PROJECTS
            </Link>

            {/* NEWS */}
            <Link 
              href="/news" 
              className="py-3.5 px-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              NEWS
            </Link>

            {/* SHOP */}
            <Link 
              href="/shop" 
              className="py-3.5 px-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              SHOP
            </Link>

            {/* CONTACT US */}
            <Link 
              href="/contact-us" 
              className="py-3.5 px-4 hover:text-[#FFB800] transition-colors whitespace-nowrap"
            >
              CONTACT US
            </Link>

          </nav>

          {/* Search Input: Full-width on Mobile & Tablet, Right-aligned on Desktop */}
          <div ref={searchContainerRef} className="w-full lg:w-auto relative py-2 sm:py-2.5">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <div className="w-full lg:w-72 bg-[#0B1B38] border border-white/20 focus-within:border-[#FFB800] rounded-sm flex items-center pr-2.5 pl-3 py-2 lg:py-1.5 transition-colors">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button type="submit" className="text-slate-400 hover:text-[#FFB800] p-0.5 transition cursor-pointer" title="Search">
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Dropdown Search Results */}
            {searchQuery.trim() !== "" && (
              <div className="absolute left-0 right-0 lg:left-auto lg:right-0 top-full mt-1 w-full lg:w-96 bg-white text-slate-800 rounded-sm shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                {searchResults.length === 0 ? (
                  <div className="p-5 text-center text-slate-400 text-xs">
                    No products found matching &quot;<span className="font-semibold text-slate-700">{searchQuery}</span>&quot;
                  </div>
                ) : (
                  <>
                    {searchResults.slice(0, 7).map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug || prod.id}`}
                        onClick={() => setSearchQuery("")}
                        className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition block"
                      >
                        <div className="w-11 h-11 bg-slate-50 rounded-sm relative overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/hero_honey.png"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate hover:text-[#122B5A]">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-slate-400">{prod.category}</p>
                        </div>
                        <div className="text-xs font-black text-[#122B5A] shrink-0">
                          ৳{typeof prod.price === "number" ? prod.price.toFixed(2) : prod.price}
                        </div>
                      </Link>
                    ))}

                    <div
                      onClick={() => {
                        handleSearchSubmit();
                        setSearchQuery("");
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 text-center text-xs font-bold text-[#122B5A] cursor-pointer border-t border-slate-100 flex items-center justify-center gap-1 transition"
                    >
                      <span>View all {searchResults.length} results</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FFB800]" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MOBILE SIDE NAVIGATION DRAWER                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="p-5 space-y-5 overflow-y-auto">

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <DoorStepLogo
                  isLink
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-auto max-w-[140px]"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full border border-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Quick CTA */}
              <Link
                href="/all-products"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs py-2.5 px-4 rounded-sm text-center block shadow-xs"
              >
                REQUEST A QUOTE / SHOP
              </Link>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  HOME
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  ABOUT US
                </Link>

                {/* SOLUTIONS (Collapsible Categories Tree) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedMobileCategory(expandedMobileCategory === "solutions" ? null : "solutions")}
                    className="w-full px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition flex items-center justify-between text-left cursor-pointer"
                  >
                    <span>SOLUTIONS</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMobileCategory === "solutions" ? 'rotate-180 text-[#FFB800]' : ''}`} />
                  </button>
                  {expandedMobileCategory === "solutions" && (
                    <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-[#FFB800]/50 pl-3">
                      <Link
                        href="/solutions"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2 py-1.5 rounded-md text-xs font-bold text-[#122B5A] hover:bg-amber-50 transition"
                      >
                        All Solutions Overview
                      </Link>
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <Link
                            href={`/all-products?category=${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-2 py-1 rounded-md text-xs font-semibold text-slate-700 hover:text-[#122B5A] hover:bg-amber-50 transition"
                          >
                            {cat.name}
                          </Link>
                          {cat.subCategories && cat.subCategories.length > 0 && (
                            <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-2 my-0.5">
                              {cat.subCategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/all-products?sub_category=${sub.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-[#122B5A] transition"
                                >
                                  <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  PROJECTS
                </Link>

                <Link
                  href="/news"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  NEWS
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  SHOP
                </Link>

                <Link
                  href="/contact-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-[#122B5A] transition"
                >
                  CONTACT US
                </Link>
              </nav>
            </div>

            {/* Mobile Drawer Footer Hotline */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Order Hotline Support</p>
              <a
                href="tel:01734340066"
                className="bg-[#122B5A] text-white font-bold text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFB800]" /> +880 1734-340066
              </a>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
