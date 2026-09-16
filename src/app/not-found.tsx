"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Home, Compass, ShoppingBag, Sparkles, HelpCircle } from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { title: "Organic Foods", href: "/", icon: "🍯" },
    { title: "Skin Care", href: "/", icon: "✨" },
    { title: "Special Sales", href: "/sales", icon: "🔥" },
    { title: "Delivery Info", href: "/delivery", icon: "🚚" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex items-center justify-center py-16 px-4 relative overflow-hidden">
      
      {/* Decorative Glow Background Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#002884]/10 via-[#E50914]/10 to-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center space-y-8 shadow-xl relative z-10">
        
        {/* Floating Creative 404 Visual Indicator */}
        <div className="relative inline-block">
          <span className="text-7xl sm:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#002884] via-[#E50914] to-[#e60000] drop-shadow-sm select-none">
            404
          </span>
          <div className="absolute -bottom-2 right-0 bg-[#E50914] text-white font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-md rotate-6">
            Lost in Space?
          </div>
        </div>

        {/* Hero Message */}
        <div className="space-y-3 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Looks like this page took a wrong turn!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            The page you are looking for might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        {/* Creative Quick Category Navigation */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Popular Destinations
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="bg-slate-50 hover:bg-[#002884] hover:text-white text-slate-700 font-bold text-xs p-3 rounded-2xl border border-slate-100 transition-all duration-300 flex flex-col items-center gap-1.5 shadow-2xs group"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#002884] hover:bg-[#E50914] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="w-4 h-4" /> Back to Homepage
          </Link>
          <Link
            href="/sales"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#C80000] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> View Special Sales
          </Link>
        </div>

      </div>
    </div>
  );
}
