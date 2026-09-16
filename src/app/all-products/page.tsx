"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GhorerBazarCatalog } from "@/components/GhorerBazarCatalog";
import { ProductGridSkeleton } from "@/components/common/Skeletons";

function AllProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const subCategoryParam = searchParams.get("sub_category") || searchParams.get("subcategory") || "";
  const searchParam = searchParams.get("search") || "";

  let title = "All Products";
  if (subCategoryParam) {
    title = `Sub Category: ${subCategoryParam.charAt(0).toUpperCase() + subCategoryParam.slice(1)}`;
  } else if (categoryParam) {
    title = `Category: ${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}`;
  } else if (searchParam) {
    title = `Search: "${searchParam}"`;
  }

  return (
    <GhorerBazarCatalog
      pageTitle={title}
      breadcrumbTitle={subCategoryParam || categoryParam || (searchParam ? `Search: ${searchParam}` : "All Products")}
      defaultCategorySlug={categoryParam}
      defaultSubCategorySlug={subCategoryParam}
      defaultSearchQuery={searchParam}
      defaultFlag="all"
    />
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} cols="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3" />}>
      <AllProductsContent />
    </Suspense>
  );
}
