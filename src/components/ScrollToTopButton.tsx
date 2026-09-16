"use client";

import React, { useState, useEffect } from "react";
import { ChevronsUp } from "lucide-react";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-40 w-12 h-12 sm:w-13 sm:h-13 bg-[#002884] hover:bg-[#E50914] text-white rounded-full shadow-2xl hover:shadow-red-600/35 border-2 border-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
    >
      <ChevronsUp className="w-6 h-6 text-white stroke-[2.8] transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
