import React from "react";

/**
 * Base atomic Skeleton box with shimmer animation
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl bg-[#E2E8F0] ${className}`}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton (Solid #E2E8F0)
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden h-[330px] animate-pulse">
      {/* Discount badge placeholder */}
      <div className="w-12 h-4 rounded-full bg-slate-300/80 absolute top-3 left-3" />

      {/* Product Image Box */}
      <div className="w-full h-36 rounded-xl bg-slate-300/60 flex items-center justify-center p-3" />

      {/* Category line */}
      <div className="w-16 h-2.5 rounded bg-slate-300/70" />

      {/* Product Title (2 lines) */}
      <div className="space-y-1.5">
        <div className="w-full h-3.5 rounded bg-slate-300/80" />
        <div className="w-3/4 h-3.5 rounded bg-slate-300/80" />
      </div>

      {/* Rating stars & reviews */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="w-20 h-3 rounded bg-slate-300/70" />
        <div className="w-8 h-3 rounded bg-slate-300/70" />
      </div>

      {/* Price & Cart button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-300/40">
        <div className="space-y-1">
          <div className="w-20 h-4 rounded bg-slate-300/90" />
          <div className="w-14 h-2.5 rounded bg-slate-300/60" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-300/80" />
      </div>
    </div>
  );
}

/**
 * Grid of Product Card Skeletons
 */
export function ProductGridSkeleton({
  count = 10,
  cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Product Section / Carousel Slider Skeleton
 */
export function ProductSliderSkeleton({ title = "" }: { title?: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="space-y-1">
          {title ? (
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          ) : (
            <Skeleton className="w-48 h-6 rounded-lg" />
          )}
          <Skeleton className="w-32 h-3 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Horizontal Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

/**
 * Hero Banner Slider Skeleton
 */
export function HeroBannerSkeleton() {
  return (
    <div className="w-full mx-auto">
      <Skeleton className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[1500/570]" />
    </div>
  );
}

/**
 * Category Filter Pill Bar Skeleton
 */
export function CategoryBarSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} className="h-9 w-24 sm:w-28 rounded-full shrink-0" />
      ))}
    </div>
  );
}

/**
 * Homepage Full Skeleton (Hero + Badges + Product Carousels + Banners)
 */
export function HomePageSkeleton() {
  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. Hero Banner */}
      <HeroBannerSkeleton />

      {/* 2. Best Selling Carousel */}
      <ProductSliderSkeleton />

      {/* 3. Latest Products Carousel */}
      <ProductSliderSkeleton />

      {/* 4. Skin Care Section Banner & Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 lg:h-auto rounded-2xl" />
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Delivery Notice Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="w-full h-20 rounded-2xl" />
      </div>

      {/* 6. Organic Food Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
          <Skeleton className="h-80 lg:h-auto rounded-2xl" />
        </div>
      </div>

      {/* 7. Trust Badges */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Single Product Details Page Skeleton
 */
export function ProductDetailsSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Skeleton className="w-16 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <Skeleton className="w-24 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <Skeleton className="w-40 h-3.5 rounded" />
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Image Gallery Skeleton */}
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="w-full h-80 sm:h-[420px] rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>

            {/* Right: Product Info Skeleton */}
            <div className="lg:col-span-6 space-y-5">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-4 rounded-full" />
                <Skeleton className="w-28 h-4 rounded-full" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="w-full h-7 rounded-lg" />
                <Skeleton className="w-3/4 h-7 rounded-lg" />
              </div>

              {/* Price Box */}
              <div className="p-4 bg-[#E2E8F0] rounded-2xl flex items-baseline gap-3">
                <div className="w-32 h-8 rounded-lg bg-slate-300/80" />
                <div className="w-20 h-5 rounded-md bg-slate-300/60" />
                <div className="w-16 h-5 rounded-full bg-slate-300/60" />
              </div>

              {/* Short description */}
              <div className="space-y-2 py-2">
                <Skeleton className="w-full h-3.5 rounded" />
                <Skeleton className="w-full h-3.5 rounded" />
                <Skeleton className="w-2/3 h-3.5 rounded" />
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-32 h-12 rounded-xl" />
                  <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex gap-4 border-b border-slate-100 pb-3">
            <Skeleton className="w-28 h-8 rounded-xl" />
            <Skeleton className="w-28 h-8 rounded-xl" />
            <Skeleton className="w-28 h-8 rounded-xl" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-4/5 h-4 rounded" />
            <Skeleton className="w-3/5 h-4 rounded" />
          </div>
        </div>

        {/* Related Products Carousel */}
        <ProductSliderSkeleton title="Related Products" />
      </div>
    </div>
  );
}

/**
 * Shopping Cart Page Skeleton
 */
export function CartTableSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-3 rounded" />
          <span className="text-slate-300">&gt;</span>
          <Skeleton className="w-24 h-3 rounded" />
        </div>

        {/* Title */}
        <Skeleton className="w-56 h-8 rounded-lg" />

        {/* Grid: Cart Table & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Products Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <Skeleton className="w-full h-10 rounded-xl" />
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="w-40 h-4 rounded" />
                      <Skeleton className="w-20 h-3 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-6 rounded" />
                  <Skeleton className="w-24 h-8 rounded-xl" />
                  <Skeleton className="w-16 h-6 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Cart Totals Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <Skeleton className="w-32 h-6 rounded-lg" />
            <div className="space-y-3 py-3 border-y border-slate-100">
              <div className="flex justify-between">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
              <div className="flex justify-between pt-2">
                <Skeleton className="w-28 h-6 rounded" />
                <Skeleton className="w-24 h-6 rounded" />
              </div>
            </div>
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Checkout Page Skeleton
 */
export function CheckoutSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Skeleton className="w-48 h-8 rounded-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Billing Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
            <Skeleton className="w-36 h-6 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <Skeleton className="h-24 rounded-xl" />
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
            <Skeleton className="w-32 h-6 rounded-lg" />
            <div className="space-y-3 divide-y divide-slate-100">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Order Tracking Page Skeleton
 */
export function OrderTrackingSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <Skeleton className="w-48 h-8 rounded-lg mx-auto" />
          <Skeleton className="w-72 h-4 rounded mx-auto" />
        </div>

        {/* Search Bar Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="w-32 h-12 rounded-xl" />
          </div>
        </div>

        {/* Order Details Card Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Skeleton className="w-40 h-5 rounded" />
              <Skeleton className="w-28 h-3 rounded" />
            </div>
            <Skeleton className="w-28 h-8 rounded-full" />
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-4 gap-3 py-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>

          {/* Ordered items */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FAQ List Skeleton
 */
export function FaqListSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <Skeleton className="w-64 h-8 rounded-lg mx-auto" />
          <Skeleton className="w-80 h-4 rounded mx-auto" />
        </div>

        {/* Categories / Search */}
        <CategoryBarSkeleton count={5} />

        {/* FAQ Accordion Items */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-2xs">
              <Skeleton className="w-3/4 h-5 rounded" />
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-2/3 h-3.5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Account / Dashboard Skeleton
 */
export function AccountDashboardSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Skeleton className="w-48 h-8 rounded-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-sm">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <Skeleton className="w-40 h-6 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="w-full h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic Content Page Skeleton (About, Privacy, Terms, Shipping, Returns)
 */
export function GenericPageSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Skeleton className="w-64 h-9 rounded-xl" />
        <Skeleton className="w-40 h-4 rounded" />

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <Skeleton className="w-full h-40 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-5/6 h-4 rounded" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="w-48 h-6 rounded-lg" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
