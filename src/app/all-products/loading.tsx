import React from "react";
import { Skeleton, CategoryBarSkeleton, ProductGridSkeleton } from "@/components/common/Skeletons";

export default function Loading() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4 rounded" />
        </div>

        {/* Category Filter Pills */}
        <CategoryBarSkeleton count={8} />

        {/* Filter bar */}
        <div className="flex justify-between items-center bg-[#E2E8F0] p-4 rounded-2xl">
          <Skeleton className="w-48 h-5 rounded bg-slate-300/80" />
          <Skeleton className="w-36 h-9 rounded-xl bg-slate-300/80" />
        </div>

        {/* Product Grid */}
        <ProductGridSkeleton count={10} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
      </div>
    </div>
  );
}
