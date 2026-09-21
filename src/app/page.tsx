import React from "react";
import productsData from "@/data/products.json";
import { BestSellingSlider } from "@/components/BestSellingSlider";
import { LatestProductsSlider } from "@/components/LatestProductsSlider";
import { HeroSlider } from "@/components/HomePageSections";
import { SkinCareSection } from "@/components/SkinCareSection";
import { SecureDeliveryBanner } from "@/components/SecureDeliveryBanner";
import { OrganicFoodSection } from "@/components/OrganicFoodSection";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";
import { API_V1 } from "@/lib/api";

export const metadata = {
  title: "Door Step BD - Online Shopping in Bangladesh | Organic Food, Beauty & Health",
  description: "Shop authentic organic food, beauty products, food supplements and health products at best prices in Bangladesh with nationwide cash on delivery from Door Step BD.",
};

async function getHomeProducts() {
  try {
    const res = await fetch(`${API_V1}/products?per_page=50`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return productsData;
    const json = await res.json();
    const list = json.data?.data || json.data || [];
    return Array.isArray(list) && list.length > 0 ? list : productsData;
  } catch {
    return productsData;
  }
}

export default async function Home() {
  const products = await getHomeProducts();

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-12">
      {/* 1. Hero Banner Slider Section (100% Full Width) */}
      <section className="w-full">
        <HeroSlider />
      </section>

      {/* 2. Best Selling Products Carousel Slider */}
      <section className="w-full">
        <BestSellingSlider products={products} />
      </section>

      {/* 3. Latest Products Carousel Slider */}
      <section className="w-full">
        <LatestProductsSlider products={products} />
      </section>

      {/* 4. Skin Care Product Section (Custom Banner Grid) */}
      <section className="w-full">
        <SkinCareSection products={products} />
      </section>

      {/* 5. 100% Secure Delivery Notice Banner */}
      <section className="w-full">
        <SecureDeliveryBanner />
      </section>

      {/* 6. Organic Food Product Section (Right-Side Navy Banner Grid) */}
      <section className="w-full">
        <OrganicFoodSection products={products} />
      </section>

      {/* 7. Trust Badges Bar (100% Money back | Non-contact shipping | Fast delivery) */}
      <section className="w-full">
        <TrustBadgesBar />
      </section>
    </div>
  );
}
