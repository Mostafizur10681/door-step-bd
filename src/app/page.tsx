import React from "react";
import { HeroSlider } from "@/components/HomePageSections";
import { OurBrandsSection } from "@/components/home/OurBrandsSection";
import { AboutHeritageSection } from "@/components/home/AboutHeritageSection";
import { OurServicesSection } from "@/components/home/OurServicesSection";
import { OurCategoriesSection } from "@/components/home/OurCategoriesSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Doorstep Power Solution - Industrial Generators, Substations & Solar Energy in Bangladesh",
  description:
    "Leader in industrial power solutions since 2020. Providing heavy diesel & gas generators, substation engineering, solar power, and 24/7 maintenance across Bangladesh.",
};

export default function Home() {
  return (
    <div className="w-full space-y-0 pb-0">
      {/* 1. Hero Banner Slider Section (100% Full Width) */}
      <section className="w-full">
        <HeroSlider />
      </section>

      {/* 2. Our Categories Section (Directly under Banner) */}
      <section className="w-full">
        <OurCategoriesSection />
      </section>

      {/* 3. Our Services Section */}
      <section className="w-full">
        <OurServicesSection />
      </section>

      {/* 4. Ours Brands Section */}
      <section className="w-full">
        <OurBrandsSection />
      </section>

      {/* 5. Engineering Heritage & About Us Section */}
      <section className="w-full">
        <AboutHeritageSection />
      </section>
    </div>
  );
}
