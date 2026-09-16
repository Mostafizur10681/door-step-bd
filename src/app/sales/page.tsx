"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GhorerBazarCatalog } from "@/components/GhorerBazarCatalog";
import { ProductGridSkeleton } from "@/components/common/Skeletons";

function SalesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  return (
    <GhorerBazarCatalog
      pageTitle="Special Sale Offers"
      breadcrumbTitle="Sales"
      defaultCategorySlug={categoryParam}
      defaultFlag="sale"
    />
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3" />}>
      <SalesContent />
    </Suspense>
  );
}
