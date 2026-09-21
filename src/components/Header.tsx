"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Truck, X, ChevronDown, ChevronRight, Plus, Minus, Menu, Phone } from "lucide-react";
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
  const [showTopNotice, setShowTopNotice] = useState(true);
  const [showCategoryBar, setShowCategoryBar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<number | null>(null);
  const { wishlist, cart, user, updateQuantity, removeFromCart, setQuickViewProduct } = useShop();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Smoothly hide category bar when scrolling down, show when scrolling up or at top
  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show when near the top of the page
          if (currentScrollY <= 40) {
            setShowCategoryBar(true);
          } else if (currentScrollY > lastScrollY + 12) {
            // Scrolling down by more than 12px -> hide category bar
            setShowCategoryBar(false);
          } else if (currentScrollY < lastScrollY - 12) {
            // Scrolling up by more than 12px -> show category bar
            setShowCategoryBar(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWishlistCount = wishlist.length;

  const [allProducts, setAllProducts] = useState<any[]>([]);

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
        // Silently fail if API is starting up
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
        // Fallback to static data
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
    <>
      {/* 1. Top Announcement Bar (scrolls away naturally when scrolling down, visible when at top) */}
      {showTopNotice && (
        <div className="bg-[#002884] text-amber-300 text-[11px] sm:text-xs py-1.5 px-4 flex items-center justify-between text-center relative transition-all">
          <div className="w-full text-center">
            <span>Fastest delivery across Bangladesh! Inside Dhaka <span className="font-bold text-[#E50914]">৳80</span> | Outside Dhaka <span className="font-bold text-[#E50914]">৳120</span></span>
          </div>
          <button
            onClick={() => setShowTopNotice(false)}
            className="text-white/80 hover:text-white absolute right-4 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Sticky Header Navigation */}
      <header className="w-full bg-white font-sans border-b border-slate-200 sticky top-0 z-50 shadow-xs">

      {/* 2. Main Middle Bar */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6">

        {/* Left: Mobile Hamburger Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-[#E50914] transition rounded-lg border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo (Pure Vector/Text) */}
          <DoorStepLogo
            isLink
            href="/"
            className="h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[210px] lg:max-w-[230px] xl:max-w-[260px]"
          />
        </div>

        {/* Center Search Input with Instant Dropdown Results (Desktop / Tablet) */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-auto relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for products (e.g. Maca, Chia, VWash...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200 rounded-full pl-5 pr-11 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E50914]/40 transition-all placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-[#E50914] transition-colors cursor-pointer" title="Search">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </form>

          {/* Instant Search Results Dropdown */}
          {searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-200">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No products found matching &quot;<span className="font-semibold text-slate-700">{searchQuery}</span>&quot;
                </div>
              ) : (
                <>
                  {searchResults.slice(0, 8).map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug || prod.id}`}
                      onClick={() => setSearchQuery("")}
                      className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition block"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-lg relative overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/hero_honey.png"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate hover:text-[#002884]">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{prod.category}</p>
                      </div>
                      <div className="text-sm font-black text-[#E50914] shrink-0">
                        ৳{typeof prod.price === "number" ? prod.price.toFixed(2) : prod.price}
                      </div>
                    </Link>
                  ))}

                  <div
                    onClick={() => {
                      handleSearchSubmit();
                      setSearchQuery("");
                    }}
                    className="p-3 bg-slate-50 hover:bg-red-50 text-center text-xs font-bold text-[#002884] hover:text-[#E50914] cursor-pointer border-t border-slate-100 flex items-center justify-center gap-1 transition"
                  >
                    <span>View all {searchResults.length} results for &quot;{searchQuery}&quot;</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* Order Tracking Icon */}
          <Link href="/track-order" className="text-slate-700 hover:text-[#E50914] transition flex items-center gap-1 text-xs font-bold" title="Track Your Order">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8] text-[#002884]" />
            <span className="hidden lg:inline">Track Order</span>
          </Link>

          {/* User Icon / Profile Badge */}
          <Link href="/account" className="text-slate-700 hover:text-[#E50914] transition flex items-center gap-1.5" title={user ? `Logged in as ${user.name}` : "Sign In / Register"}>
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
                <span className="w-8 h-8 rounded-full bg-[#002884] text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>
              )
            ) : (
              <User className="w-6 h-6 stroke-[1.8]" />
            )}
          </Link>

          {/* Wishlist Icon with Badge */}
          <Link href="/wishlist" className="relative text-[#002884] hover:text-[#E50914] transition">
            <Heart className="w-6 h-6 stroke-[1.8]" />
            {totalWishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E50914] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200 shadow-xs">
                {totalWishlistCount}
              </span>
            )}
            {totalWishlistCount === 0 && (
              <span className="absolute -top-2 -right-2 bg-[#002884] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            )}
          </Link>

          {/* Cart Icon with Badge & Hover Dropdown Window */}
          <div className="relative group py-2">
            <Link href="/cart" className="relative text-[#E50914] hover:text-[#002884] transition flex items-center">
              <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
              <span className="absolute -top-2 -right-2 bg-[#002884] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            </Link>

            {/* Hover Cart Popup Window */}
            <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 w-80 sm:w-96">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <ShoppingCart className="w-10 h-10 mx-auto opacity-30 text-[#002884]" />
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
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl relative shrink-0 overflow-hidden flex items-center justify-center p-1">
                              <Image
                                src={(item.mainImage && item.mainImage.trim() !== "") ? item.mainImage : (item.image || "/prod_maca.png")}
                                alt={item.name || "Product"}
                                fill
                                sizes="64px"
                                className="object-contain"
                              />
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0 pr-6 space-y-1.5">
                              <h4 className="text-xs font-semibold text-[#002884] truncate leading-tight">
                                {item.name}
                              </h4>

                              {/* Selected Variant Attributes */}
                              {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                <div className="text-[10px] text-slate-500 flex flex-wrap gap-1">
                                  {Object.entries(item.selectedAttributes).map(([k, v]) => (
                                    <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-medium text-slate-600">
                                      {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Quantity Controls */}
                              <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-100/80 px-2 py-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(item.cartItemId || item.id, -1);
                                  }}
                                  className="w-5 h-5 rounded-full text-slate-600 hover:bg-white flex items-center justify-center text-xs transition cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(item.cartItemId || item.id, 1);
                                  }}
                                  className="w-5 h-5 rounded-full text-slate-600 hover:bg-white flex items-center justify-center text-xs transition cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-sm font-bold text-[#E50914]">
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
                      <span className="text-[#002884] text-base font-extrabold">
                        ৳{cartSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-1">
                      <Link
                        href="/cart"
                        className="w-full border-2 border-[#002884] text-[#002884] hover:bg-[#002884] hover:text-white font-bold text-xs py-2.5 rounded-full transition-all duration-200 text-center block"
                      >
                        View Cart
                      </Link>

                      <Link
                        href="/checkout"
                        className="w-full bg-[#E50914] hover:bg-[#C80000] text-white font-bold text-xs py-2.5 rounded-full transition-all duration-200 shadow-md text-center block"
                      >
                        Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Row (Always visible on mobile & small screens) */}
      <div className="md:hidden px-4 pb-2 pt-1 bg-white border-t border-slate-100 relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products (e.g. Maca, Chia, VWash...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/90 border border-slate-200 rounded-full pl-4 pr-10 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E50914]/40 transition"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 cursor-pointer" title="Search">
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </form>

        {/* Mobile Instant Search Results Dropdown */}
        {searchQuery.trim() !== "" && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">No products found matching &quot;{searchQuery}&quot;</div>
            ) : (
              <>
                {searchResults.slice(0, 6).map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug || prod.id}`}
                    onClick={() => setSearchQuery("")}
                    className="p-2.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer block"
                  >
                    <div className="w-9 h-9 relative shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-0.5">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/hero_honey.png"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400">{prod.category}</p>
                    </div>
                    <div className="text-xs font-black text-[#E50914] shrink-0">৳{prod.price}</div>
                  </Link>
                ))}

                <div
                  onClick={() => {
                    handleSearchSubmit();
                    setSearchQuery("");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-red-50 text-center text-xs font-bold text-[#002884] hover:text-[#E50914] cursor-pointer border-t border-slate-100 flex items-center justify-center gap-1"
                >
                  <span>View all {searchResults.length} results</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Desktop Category Navigation Bar */}
      <div
        className={`hidden lg:block border-slate-100 bg-white text-[#002884] font-semibold text-xs lg:text-sm transition-all duration-300 ease-in-out ${
          showCategoryBar
            ? "max-h-16 opacity-100 border-t overflow-visible"
            : "max-h-0 opacity-0 border-t-0 pointer-events-none overflow-hidden"
        }`}
      >
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 flex items-center justify-center py-1.5 sm:py-2">
          <nav className="flex items-center justify-center flex-wrap gap-x-5 xl:gap-x-7 gap-y-1 text-center">
            {/* Home — always first */}
            <Link href="/" className="font-bold text-[#002884] hover:text-[#E50914] transition whitespace-nowrap py-1">
              Home
            </Link>
            {/* Shop (All Products) */}
            <Link href="/shop" className="font-bold text-[#002884] hover:text-[#E50914] transition whitespace-nowrap py-1">
              Shop
            </Link>
            {/* Dynamic Categories */}
            {categories.map(cat => (
              <div key={cat.id} className="relative group py-1">
                <Link
                  href={`/all-products?category=${cat.slug}`}
                  className="flex items-center gap-1 hover:text-[#E50914] transition whitespace-nowrap"
                >
                  {cat.name}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E50914] group-hover:rotate-180 transition-transform duration-200" />
                  )}
                </Link>

                {/* Sub-category dropdown on hover */}
                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-50 min-w-[200px]">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 py-1.5 text-left animate-in fade-in zoom-in-95 duration-150">
                      <Link
                        href={`/all-products?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2 text-xs font-bold text-[#002884] hover:text-[#E50914] hover:bg-red-50/70 transition border-b border-slate-100"
                      >
                        <span>All {cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#E50914]" />
                      </Link>
                      {cat.subCategories.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/all-products?sub_category=${sub.slug}`}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#E50914] hover:bg-red-50/70 transition whitespace-nowrap"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* 4. Mobile Side Navigation Drawer (Toggled by Hamburger button) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="p-5 space-y-6 overflow-y-auto">

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <DoorStepLogo
                  isLink
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px]"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full border border-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Nav Links — Dynamic Categories */}
              <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-700">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-[#E50914] transition"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-[#E50914] transition"
                >
                  Shop
                </Link>
                {categories.map(cat => (
                  <div key={cat.id}>
                    {/* Category with sub-categories */}
                    {cat.subCategories && cat.subCategories.length > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setExpandedMobileCategory(expandedMobileCategory === cat.id ? null : cat.id)}
                          className="w-full px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-[#E50914] transition flex items-center justify-between text-left"
                        >
                          <span>{cat.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobileCategory === cat.id ? 'rotate-180 text-[#E50914]' : ''}`} />
                        </button>
                        {expandedMobileCategory === cat.id && (
                          <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-[#E50914]/30 pl-3">
                            <Link
                              href={`/all-products?category=${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-2 py-1.5 rounded-lg text-xs font-semibold text-[#002884] hover:text-[#E50914] hover:bg-red-50 transition"
                            >
                              All {cat.name}
                            </Link>
                            {cat.subCategories.map(sub => (
                              <Link
                                key={sub.id}
                                href={`/all-products?sub_category=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#E50914] hover:bg-red-50 transition"
                              >
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Category without sub-categories */
                      <Link
                        href={`/all-products?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-[#E50914] transition"
                      >
                        {cat.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer Hotline */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-400 font-bold">Order Hotline Support</p>
              <a
                href="tel:01734340066"
                className="bg-[#002884] hover:bg-[#001D5C] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#E50914]" /> 01734-340066
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
