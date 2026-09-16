"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck, RefreshCw, Tag, CheckCircle2, AlertCircle, Loader2, X, PackageX } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { isProductOutOfStock } from "@/lib/productAdapter";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, appliedCoupon, couponDiscount, applyCoupon, removeCoupon } = useShop();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const totalItemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
  const flatRateShipment = cart.length > 0 ? 80.00 : 0;
  const grandTotal = Math.max(0, (subtotal - couponDiscount) + flatRateShipment);

  const hasOutOfStockItems = cart.some((item) => isProductOutOfStock(item) || (item.stock !== undefined && Number(item.stock) <= 0));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setIsApplying(true);
    try {
      const res = await applyCoupon(couponInput);
      if (res.success) {
        setCouponSuccess(res.message);
        setCouponInput("");
      } else {
        setCouponError(res.message);
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#002B49] transition">Home</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">Shopping cart</span>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight flex items-baseline gap-2">
            Shopping cart <span className="text-[#002B49]/70 text-lg font-semibold">({totalItemsCount})</span>
          </h1>
        </div>

        {/* Main Grid: Products Table & Cart Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Products List & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Table Container */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
              {/* Header Row */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Product Rows */}
              {cart.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-[#002B49]" />
                  <p className="text-base font-semibold text-slate-600">Your shopping cart is empty</p>
                  <Link href="/" className="inline-block text-xs font-bold bg-[#002B49] text-white px-5 py-2.5 rounded-full hover:bg-[#FF6600] transition">
                    Explore Products
                  </Link>
                </div>
              ) : (
                cart.map((item, index) => {
                  const itemKey = item.cartItemId || `${item.id}-${index}`;
                  const isItemOutOfStock = isProductOutOfStock(item) || (item.stock !== undefined && Number(item.stock) <= 0);

                  return (
                    <div key={itemKey} className={`p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center transition ${isItemOutOfStock ? "bg-rose-50/40 border-l-4 border-l-rose-500" : "hover:bg-slate-50/30"}`}>
                      
                      {/* Product Details (Col 6) */}
                      <div className="sm:col-span-6 flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId || item.id)}
                          className="text-slate-400 hover:text-red-600 font-bold text-lg px-1 transition cursor-pointer"
                          title="Remove product"
                        >
                          ×
                        </button>

                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center p-1">
                          <Image 
                            src={(item.mainImage && item.mainImage.trim() !== "") ? item.mainImage : (item.image || "/prod_maca.png")} 
                            alt={item.name || "Cart Product"} 
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>

                        <div>
                          <Link href={`/product/${item.slug || item.id}`} className="font-semibold text-slate-800 text-sm hover:text-[#002B49] transition line-clamp-2">
                            {item.name}
                          </Link>
                          {isItemOutOfStock && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full mt-1">
                              <PackageX className="w-3 h-3" /> Out of Stock - Please remove
                            </span>
                          )}
                          {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.selectedAttributes).map(([k, v]) => (
                                <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                  {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price (Col 2) */}
                      <div className="sm:col-span-2 text-left sm:text-center text-sm font-semibold text-slate-700">
                        <span className="sm:hidden text-xs text-slate-400 font-normal mr-2">Price:</span>
                        ৳{Number(item.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>

                      {/* Quantity (Col 2) */}
                      <div className="sm:col-span-2 flex justify-start sm:justify-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-100/70 px-2 py-1">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId || item.id, -1)}
                            className="w-6 h-6 rounded-full text-slate-500 hover:bg-white hover:text-slate-800 flex items-center justify-center text-xs transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId || item.id, 1)}
                            className="w-6 h-6 rounded-full text-slate-500 hover:bg-white hover:text-slate-800 flex items-center justify-center text-xs transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal (Col 2) */}
                      <div className="sm:col-span-2 text-left sm:text-right font-bold text-sm text-[#002B49]">
                        <span className="sm:hidden text-xs text-slate-400 font-normal mr-2">Subtotal:</span>
                        ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Action Bar: Coupon & Clear Cart */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                
                {/* Left: Coupon Code Input Form */}
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <input 
                      type="text" 
                      placeholder="Enter coupon code..." 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={isApplying || Boolean(appliedCoupon)}
                      className="bg-slate-100 border border-slate-200 rounded-full px-5 py-2.5 text-sm text-slate-800 uppercase font-mono font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30 w-full disabled:opacity-60"
                    />
                  </div>
                  
                  {appliedCoupon ? (
                    <button 
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs px-5 py-2.5 rounded-full transition shadow-xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="bg-[#002B49] hover:bg-[#001C30] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-2.5 rounded-full transition shadow-md whitespace-nowrap flex items-center gap-2 cursor-pointer"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Apply coupon</span>
                      )}
                    </button>
                  )}
                </form>

                {/* Right: Clear All & Continue Shopping */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    type="button"
                    onClick={() => clearCart()}
                    className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold text-xs px-5 py-2.5 rounded-full transition border border-slate-200 cursor-pointer"
                  >
                    Clear All
                  </button>
                  <Link 
                    href="/all-products"
                    className="bg-[#002B49] hover:bg-[#001C30] text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md cursor-pointer"
                  >
                    Update Cart
                  </Link>
                </div>
              </div>

              {/* Coupon Feedback Messages */}
              {couponSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              {couponError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 font-mono tracking-wider">{appliedCoupon.code}</span>
                      {appliedCoupon.name && <span className="text-slate-600 ml-1.5 font-medium">({appliedCoupon.name})</span>}
                      <span className="ml-2 inline-block px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full">
                        {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}% OFF` : `৳${appliedCoupon.discount_value} OFF`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-700">-৳{couponDiscount.toFixed(2)}</span>
                    <button 
                      type="button" 
                      onClick={handleRemoveCoupon} 
                      className="text-slate-400 hover:text-rose-600 font-bold p-1 transition cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Cart Totals Summary Box */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#002B49] pb-3 border-b border-slate-100">
              Cart totals
            </h2>

            <div className="space-y-4 text-sm">
              {/* Subtotal */}
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Subtotal</span>
                <span className="text-[#002B49] font-extrabold text-base">
                  ৳{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Coupon Discount if applied */}
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Discount ({appliedCoupon.code})</span>
                  </div>
                  <span>-৳{couponDiscount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* Shipment */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Shipment</span>
                  <span className="text-slate-800">
                    ৳{flatRateShipment.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  Inside Dhaka: ৳80 | Outside Dhaka: ৳120
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-lg font-black text-[#002B49]">
                <span>Total</span>
                <span className="text-[#002B49] text-xl">
                  ৳{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              {hasOutOfStockItems ? (
                <div className="space-y-2">
                  <button 
                    type="button" 
                    disabled
                    className="w-full bg-slate-300 text-slate-500 font-bold text-sm py-3.5 px-4 rounded-full cursor-not-allowed text-center block shadow-none"
                  >
                    Proceed to checkout
                  </button>
                  <p className="text-[11px] text-rose-600 text-center font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Please remove out-of-stock items before checkout.
                  </p>
                </div>
              ) : (
                <Link 
                  href="/checkout" 
                  className="w-full bg-[#002B49] hover:bg-[#FF6600] text-white font-bold text-sm py-3.5 px-4 rounded-full shadow-lg hover:shadow-xl transition-all text-center block cursor-pointer"
                >
                  Proceed to checkout
                </Link>
              )}
              
              <Link 
                href="/all-products" 
                className="w-full text-center block text-xs font-bold text-[#002B49] hover:underline pt-1 cursor-pointer"
              >
                Continue To Shopping
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Feature Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs divide-y md:divide-y-0 md:divide-x divide-slate-100 text-slate-700 text-xs font-bold py-4">
          <div className="flex items-center justify-center gap-3 py-2 px-4">
            <ShieldCheck className="w-5 h-5 text-[#002B49]" />
            <span>100% Money back</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-2 px-4">
            <Truck className="w-5 h-5 text-[#002B49]" />
            <span>Non-contact shipping</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-2 px-4">
            <RefreshCw className="w-5 h-5 text-[#002B49]" />
            <span>Fast delivery</span>
          </div>
        </div>

      </div>
    </div>
  );
}
