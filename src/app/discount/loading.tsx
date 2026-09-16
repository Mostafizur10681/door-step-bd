import React from "react";
import { Skeleton, CategoryBarSkeleton, ProductGridSkeleton } from "@/components/common/Skeletons";

export default function Loading() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-72 h-4 rounded" />
        </div>
        <CategoryBarSkeleton count={6} />
        <ProductGridSkeleton count={10} />
      </div>
    </div>
  );
}
