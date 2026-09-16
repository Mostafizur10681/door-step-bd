"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { X, Check, Heart, ArrowRight, PackageX } from "lucide-react";
import { isProductOutOfStock } from "@/lib/productAdapter";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  return (
    <div className="bg-white min-h-screen font-sans py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-[#002B49] tracking-tight">
          My wishlist
        </h1>

        {wishlist.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your Wishlist is Empty</h2>
            <p className="text-slate-500 text-xs">
              Explore products and add items to your wishlist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#002B49] hover:bg-[#FF6600] text-white font-bold text-xs px-6 py-3 rounded-full transition"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Table Container matching reference screenshot */
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                
                {/* Table Header */}
                <thead className="bg-[#f2f5f8] border-b border-slate-200 text-[#002B49] font-bold text-xs">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center"></th>
                    <th className="py-3.5 px-4 w-24"></th>
                    <th className="py-3.5 px-6">Product name</th>
                    <th className="py-3.5 px-6 text-[#002B49]">Unit price</th>
                    <th className="py-3.5 px-6 text-[#002B49]">Stock status</th>
                    <th className="py-3.5 px-6 text-right"></th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                  {wishlist.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                      
                      {/* Delete X icon */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition font-bold text-base p-1"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Product Thumbnail */}
                      <td className="py-4 px-4">
                        <Link href={`/product/${item.slug || item.id}`} className="block relative w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden p-1">
                          <Image
                            src={item.mainImage}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </Link>
                      </td>

                      {/* Product Name */}
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        <Link href={`/product/${item.slug || item.id}`} className="hover:text-[#002B49] transition">
                          {item.name}
                        </Link>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          {Boolean(item.originalPrice && item.originalPrice > item.price) && (
                            <div className="text-slate-400 line-through text-xs">
                              ৳ {item.originalPrice.toLocaleString()}
                            </div>
                          )}
                          <div className="text-[#ff8c00] font-bold text-sm">
                            ৳ {item.price.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-6">
                        {isProductOutOfStock(item) ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-xs">
                            <PackageX className="w-4 h-4 text-rose-600" /> Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                            <Check className="w-4 h-4" /> In Stock
                          </span>
                        )}
                      </td>

                      {/* Add to Cart CTA */}
                      <td className="py-4 px-6 text-right">
                        {isProductOutOfStock(item) ? (
                          <button
                            type="button"
                            disabled
                            className="border border-slate-200 text-slate-400 bg-slate-100 font-bold text-xs py-2 px-4 rounded-full cursor-not-allowed inline-flex items-center gap-1.5"
                          >
                            <PackageX className="w-3.5 h-3.5 text-slate-400" />
                            Out of stock
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item, 1)}
                            className="border border-[#002B49] text-[#002B49] hover:bg-[#002B49] hover:text-white font-bold text-xs py-2 px-5 rounded-full transition-all duration-200 cursor-pointer"
                          >
                            Add to cart
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Social Share Bar at Bottom */}
            <div className="flex items-center gap-3 pt-2 text-xs font-bold text-slate-700">
              <span>Share on:</span>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a href="#" className="w-7 h-7 rounded-full bg-[#3b5998] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition">
                  f
                </a>
                {/* Twitter / X */}
                <a href="#" className="w-7 h-7 rounded-full bg-[#1da1f2] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition">
                  X
                </a>
                {/* Pinterest */}
                <a href="#" className="w-7 h-7 rounded-full bg-[#cb2027] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition">
                  P
                </a>
                {/* Email */}
                <a href="#" className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition">
                  ✉
                </a>
                {/* WhatsApp */}
                <a href="#" className="w-7 h-7 rounded-full bg-[#25d366] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition">
                  💬
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
