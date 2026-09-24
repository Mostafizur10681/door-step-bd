"use client";

import React from "react";
import { Wallet, PackageCheck, Truck } from "lucide-react";

export function TrustBadgesBar() {
  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 bg-[#f2f5f8] border border-slate-200/60 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200/80 text-xs font-bold py-3.5 shadow-xs">

        {/* 100% Money back */}
        <div className="flex items-center justify-center gap-3 py-2 px-4">
          <Wallet className="w-5 h-5 text-[#122B5A]" />
          <span className="text-[#122B5A] text-sm font-extrabold">100% Money back</span>
        </div>

        {/* Non-contact shipping */}
        <div className="flex items-center justify-center gap-3 py-2 px-4">
          <PackageCheck className="w-5 h-5 text-[#122B5A]" />
          <span className="text-[#122B5A] text-sm font-extrabold">Non-contact shipping</span>
        </div>

        {/* Fast delivery */}
        <div className="flex items-center justify-center gap-3 py-2 px-4">
          <Truck className="w-5 h-5 text-[#122B5A]" />
          <span className="text-[#122B5A] text-sm font-extrabold">Fast delivery across BD</span>
        </div>

      </div>
    </div>
  );
}
