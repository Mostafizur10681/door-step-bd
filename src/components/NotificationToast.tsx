"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export function NotificationToast() {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-[#002884] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#E50914]/30 animate-in slide-in-from-top-5 duration-300">
      <CheckCircle className="w-5 h-5 text-[#E50914] shrink-0" />
      <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
    </div>
  );
}
