"use client";

import React, { createContext, useContext, useState } from "react";
import { validateAndApplyCoupon, ApiCouponResult } from "@/lib/api";
import { isProductOutOfStock } from "@/lib/productAdapter";

export interface UserProfile {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

interface ShopContextType {
  cart: any[];
  wishlist: any[];
  user: UserProfile | null;
  appliedCoupon: ApiCouponResult | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  login: (userData: UserProfile, token?: string) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  deleteAccount: () => void;
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (productId: number | string, delta: number) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: (silent?: boolean) => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number | string) => void;
  isInWishlist: (productId: number | string) => boolean;
  quickViewProduct: any | null;
  setQuickViewProduct: (product: any | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCouponResult | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore cart, wishlist, coupon, and user from localStorage on mount
  React.useEffect(() => {
    try {
      const savedCart = localStorage.getItem("shopia_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item, idx) => ({
            ...item,
            cartItemId: item.cartItemId || `${item.id}_${JSON.stringify(item.selectedAttributes || {})}_${idx}`,
          }));
          setCart(normalized);
        }
      }

      const savedWishlist = localStorage.getItem("shopia_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedUser = localStorage.getItem("shopia_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedCoupon = localStorage.getItem("shopia_applied_coupon");
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));

      // Check API profile if token exists
      const token = localStorage.getItem("shopia_token");
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        })
        .then(r => r.json())
        .then(data => {
          if (data && (data.data || data.user)) {
            const u = data.data || data.user;
            const profile: UserProfile = {
              id: u.id,
              name: u.name || "Customer",
              email: u.email || "",
              phone: u.phone || "",
              address: u.address || "",
              avatar: u.avatar || undefined,
            };
            setUser(profile);
            localStorage.setItem("shopia_user", JSON.stringify(profile));
          }
        })
        .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart & wishlist changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("shopia_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  React.useEffect(() => {
    try {
      localStorage.setItem("shopia_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Calculate current subtotal
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  // Dynamically calculate coupon discount from subtotal
  const couponDiscount = React.useMemo(() => {
    if (!appliedCoupon || cart.length === 0) return 0;
    
    // Check minimum order requirement
    if (appliedCoupon.minimum_order_amount && subtotal < appliedCoupon.minimum_order_amount) {
      return 0;
    }

    if (appliedCoupon.discount_type === "percentage") {
      let discount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.maximum_discount && discount > appliedCoupon.maximum_discount) {
        discount = appliedCoupon.maximum_discount;
      }
      return Math.min(discount, subtotal);
    } else {
      return Math.min(Number(appliedCoupon.discount_value || 0), subtotal);
    }
  }, [appliedCoupon, subtotal, cart.length]);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.trim()) {
      return { success: false, message: "Please enter a coupon code." };
    }

    if (subtotal <= 0) {
      return { success: false, message: "Your cart is empty." };
    }

    try {
      const res = await validateAndApplyCoupon(code.trim().toUpperCase(), subtotal, (user?.id as number) || null);
      if (res && res.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem("shopia_applied_coupon", JSON.stringify(res.data));
        showToast(res.message || "Coupon applied successfully!");
        return { success: true, message: res.message || "Coupon applied successfully!" };
      } else {
        return { success: false, message: res.message || "Failed to apply coupon." };
      }
    } catch (err: any) {
      return { success: false, message: err.message || "Network error applying coupon." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("shopia_applied_coupon");
    } catch {}
    showToast("Coupon removed.");
  };

  const login = (userData: UserProfile, token?: string) => {
    setUser(userData);
    try {
      localStorage.setItem("shopia_user", JSON.stringify(userData));
      if (token) localStorage.setItem("shopia_token", token);
    } catch {}
    showToast(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    try {
      const token = localStorage.getItem("shopia_token");
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        }).catch(() => {});
      }
      localStorage.removeItem("shopia_token");
      localStorage.removeItem("shopia_user");
    } catch {}
    showToast("Logged out successfully.");
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedData } : (updatedData as UserProfile);
      if (updated) {
        localStorage.setItem("shopia_user", JSON.stringify(updated));
      }
      return updated;
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("shopia_token") : null;
    if (token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/profile`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(updatedData)
        });
        const data = await res.json();
        if (data && (data.data?.user || data.data || data.user)) {
          const u = data.data?.user || data.data || data.user;
          const profile: UserProfile = {
            name: u.name || updatedData.name || "Customer",
            email: u.email || updatedData.email || "",
            phone: u.phone || updatedData.phone || "",
            address: u.address || updatedData.address || "",
            avatar: u.avatar || u.profile_pic || updatedData.avatar || undefined,
          };
          setUser(profile);
          localStorage.setItem("shopia_user", JSON.stringify(profile));
        }
      } catch {}
    }
    showToast("Profile updated successfully!");
  };

  const deleteAccount = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("shopia_token") : null;
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/delete-account`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      } catch {}
    }
    setUser(null);
    setCart([]);
    setWishlist([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("shopia_token");
      localStorage.removeItem("shopia_user");
      localStorage.removeItem("shopia_applied_coupon");
    } catch {}
    showToast("Your account has been permanently deleted.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const addToCart = (product: any, quantity: number = 1) => {
    if (!product) return;

    if (isProductOutOfStock(product)) {
      showToast(`Sorry, "${product.name || "This item"}" is currently out of stock.`);
      return;
    }

    setCart((prev) => {
      let selectedAttrs = product.selectedAttributes || product.selected_attributes;
      if (!selectedAttrs && product.attributes) {
        if (Array.isArray(product.attributes) && product.attributes.length > 0) {
          selectedAttrs = {};
          product.attributes.forEach((attr: any) => {
            if (attr && attr.name && !selectedAttrs[attr.name]) {
              selectedAttrs[attr.name] = attr.value;
            }
          });
        } else if (typeof product.attributes === "object") {
          selectedAttrs = {};
          Object.entries(product.attributes).forEach(([k, v]) => {
            if (Array.isArray(v) && v.length > 0) {
              selectedAttrs[k] = String(v[0]);
            } else if (typeof v === "string" || typeof v === "number") {
              selectedAttrs[k] = String(v);
            }
          });
        }
      }

      const cartItemId = `${product.id}_${JSON.stringify(selectedAttrs || {})}`;

      const productWithAttrs = {
        ...product,
        cartItemId,
        selectedAttributes: selectedAttrs || null,
      };

      const existingIndex = prev.findIndex((item) => {
        const itemKey = item.cartItemId || `${item.id}_${JSON.stringify(item.selectedAttributes || {})}`;
        return itemKey === cartItemId;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          selectedAttributes: selectedAttrs || updated[existingIndex].selectedAttributes,
          cartItemId: updated[existingIndex].cartItemId || cartItemId,
        };
        return updated;
      }
      return [...prev, { ...productWithAttrs, quantity }];
    });
    showToast(`"${product.name}" added to cart successfully!`);
  };

  const updateQuantity = (keyOrId: number | string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const itemKey = item.cartItemId || `${item.id}_${JSON.stringify(item.selectedAttributes || {})}`;
          if (itemKey === String(keyOrId) || item.cartItemId === keyOrId || String(item.id) === String(keyOrId)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (keyOrId: number | string) => {
    setCart((prev) =>
      prev.filter((item) => {
        const itemKey = item.cartItemId || `${item.id}_${JSON.stringify(item.selectedAttributes || {})}`;
        return itemKey !== String(keyOrId) && item.cartItemId !== keyOrId && String(item.id) !== String(keyOrId);
      })
    );
    showToast("Item removed from cart!");
  };

  const clearCart = (silent?: boolean) => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("shopia_applied_coupon");
    } catch {}
    if (!silent) {
      showToast("Cart cleared!");
    }
  };

  const addToWishlist = (product: any) => {
    setWishlist((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        showToast(`"${product.name}" removed from wishlist!`);
        return prev.filter((item) => item.id !== product.id);
      }
      showToast(`"${product.name}" added to wishlist!`);
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: number | string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: number | string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        user,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        login,
        logout,
        updateProfile,
        deleteAccount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        quickViewProduct,
        setQuickViewProduct,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
