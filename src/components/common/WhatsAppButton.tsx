"use client";

import React, { useState, useEffect } from "react";
import { getWhatsAppSettings, getContactSettings } from "@/lib/api";

export function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState("8801685594315");
  const [defaultMessage, setDefaultMessage] = useState("Hello! I have an inquiry regarding your products on SMT Mart BD.");
  const [isEnabled, setIsEnabled] = useState(true);
  const [position, setPosition] = useState<"right" | "left">("right");
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      // 1. Try whatsapp-settings endpoint
      const waRes = await getWhatsAppSettings();
      if (waRes?.success && waRes?.data) {
        const d = waRes.data as any;
        const num = d.whatsapp_number || d.whatsapp || d.phone_number;
        const msg = d.default_message || d.whatsapp_default_message;
        const en = typeof d.enabled === "boolean" ? d.enabled : (typeof d.whatsapp_is_enabled === "boolean" ? d.whatsapp_is_enabled : true);
        const pos = (d.position || d.whatsapp_position || "right").includes("left") ? "left" : "right";

        if (num) setPhoneNumber(num);
        if (msg) setDefaultMessage(msg);
        if (typeof en === "boolean") setIsEnabled(en);
        setPosition(pos as "left" | "right");
        return;
      }

      // 2. Fallback to contact-settings endpoint
      const contactRes = await getContactSettings();
      if (contactRes?.success && contactRes?.data) {
        const d = contactRes.data as any;
        const num = d.whatsapp_number || d.whatsapp || d.phone;
        const msg = d.whatsapp_default_message || d.default_message;
        const en = typeof d.whatsapp_is_enabled === "boolean" ? d.whatsapp_is_enabled : true;

        if (num) setPhoneNumber(num);
        if (msg) setDefaultMessage(msg);
        if (typeof en === "boolean") setIsEnabled(en);
      }
    }
    loadSettings();
  }, []);

  // Periodic subtle bounce animation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 1500);
      return () => clearTimeout(timer);
    }, 10000);

    return () => clearTimeout(interval);
  }, []);

  if (!isEnabled) return null;

  // Clean phone number (strip spaces, +, hyphens)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(defaultMessage);

  // Responsive WhatsApp Link (App on mobile, Web on Desktop)
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const whatsappUrl = isMobile
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;

  const positionClasses =
    position === "left" ? "left-5 sm:left-6" : "right-5 sm:right-6";

  return (
    <div
      className={`fixed bottom-20 sm:bottom-22 ${positionClasses} z-50 flex items-center group`}
    >
      {/* Hover Tooltip */}
      <div
        className={`absolute whitespace-nowrap bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-xs border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:translate-x-0 ${position === "left"
            ? "left-full ml-3 translate-x-1"
            : "right-full mr-3 -translate-x-1"
          }`}
      >
        Chat with us on WhatsApp
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent ${position === "left"
              ? "-left-1 border-r-4 border-r-slate-900/90"
              : "-right-1 border-l-4 border-l-slate-900/90"
            }`}
        />
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target={isMobile ? "_self" : "_blank"}
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-110 active:scale-95 border border-white/20 ${isBouncing ? "animate-bounce" : ""
          }`}
      >
        {/* SVG WhatsApp Icon */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.104 4.032 4.147-1.085zm12.351-4.708c-.287-.144-1.696-.837-1.958-.933-.263-.096-.454-.144-.645.144-.191.288-.742.933-.91 1.125-.168.192-.336.216-.623.072-.287-.144-1.214-.447-2.313-1.427-.855-.763-1.433-1.705-1.601-1.993-.168-.288-.018-.444.126-.587.13-.13.287-.336.431-.504.144-.168.192-.288.288-.48.096-.192.048-.36-.024-.504-.072-.144-.645-1.559-.884-2.135-.233-.561-.47-.484-.645-.493-.168-.009-.36-.009-.552-.009-.192 0-.504.072-.767.36-.264.288-1.008.985-1.008 2.401 0 1.416 1.032 2.784 1.176 2.976.144.192 2.035 3.107 4.931 4.358.689.298 1.228.476 1.648.609.692.22 1.322.189 1.82.115.556-.083 1.696-.693 1.935-1.364.239-.672.239-1.248.168-1.364-.072-.116-.264-.192-.551-.336z" />
        </svg>

        {/* Small Online Badge (Green Dot) */}
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
}
