"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GhorerBazarCatalog } from "@/components/GhorerBazarCatalog";
import { ProductGridSkeleton } from "@/components/common/Skeletons";

function OfferZoneContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  return (
    <GhorerBazarCatalog
      pageTitle="Offer Zone"
      breadcrumbTitle="Offer Zone"
      defaultCategorySlug={categoryParam}
      defaultFlag="sale"
    />
  );
}

export default function OfferZonePage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3" />}>
      <OfferZoneContent />
    </Suspense>
  );
}
