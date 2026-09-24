"use client";

import React from "react";
import Link from "next/link";

interface DoorStepLogoProps {
  className?: string;
  isLink?: boolean;
  href?: string;
  onClick?: () => void;
  variant?: "dark" | "light"; // 'dark' (navy on white) or 'light' (white/gold on navy)
  subtitle?: string;
}

export function DoorStepLogo({
  className = "h-10 sm:h-12 md:h-14 w-auto",
  isLink = false,
  href = "/",
  onClick,
  variant = "dark",
  subtitle = "POWER SOLUTION",
}: DoorStepLogoProps) {
  const isLight = variant === "light";
  const primaryColor = isLight ? "#FFFFFF" : "#122B5A";
  const accentColor = "#FFB800";
  const subtitleColor = isLight ? "#94A3B8" : "#64748B";
  const cloud1Color = isLight ? "#64748B" : "#94A3B8";
  const cloud2Color = isLight ? "#475569" : "#CBD5E1";

  const content = (
    <div className="inline-flex items-center select-none group">
      <svg
        viewBox="0 0 310 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-transform duration-200`}
        aria-label="Doorstep Power Solution"
      >
        {/* ── 1. Steam Clouds Above Chimneys ── */}
        <path
          d="M13 14 C13 9 18 7 22 9 C25 6 29 6 32 9 C35 9 38 12 38 15 C38 18 35 20 32 20 H16 C13 20 11 18 11 16 C11 15 12 14 13 14 Z"
          fill={cloud1Color}
          opacity="0.85"
        />
        <path
          d="M26 9 C26 6 29 4 33 6 C35 4 38 4 41 6 C43 6 45 8 45 11 C45 13 43 15 40 15 H30 C27 15 25 13 25 11 C25 10 26 9 26 9 Z"
          fill={cloud2Color}
          opacity="0.65"
        />

        {/* ── 2. Chimney / Smokestack with Yellow Top Cap ── */}
        <path
          d="M14 50 L17 23 H25 L27 50 Z"
          fill={primaryColor}
        />
        <rect
          x="15.5"
          y="21"
          width="11"
          height="3"
          rx="1"
          fill={accentColor}
        />

        {/* ── 3. Industrial Power Station Factory with Sawtooth Roofs ── */}
        <path
          d="M25 50 V31 L37 20 V31 L49 20 V31 L61 20 V50 H25 Z"
          fill={primaryColor}
        />

        {/* ── 4. High-Tech Windows / Power Grid Accents ── */}
        <rect x="31" y="37" width="4.5" height="7" rx="0.5" fill={accentColor} />
        <rect x="40" y="37" width="4.5" height="7" rx="0.5" fill={accentColor} />
        <rect x="49" y="37" width="4.5" height="7" rx="0.5" fill={accentColor} />

        {/* ── 5. Foundation Base Line ── */}
        <rect
          x="10"
          y="50"
          width="54"
          height="4"
          rx="1.5"
          fill={primaryColor}
        />

        {/* ── 6. 'DOORSTEP' Brand Name ── */}
        <text
          x="74"
          y="37"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Poppins', sans-serif"
          fontSize="35"
          fontWeight="900"
          letterSpacing="-0.5px"
          fill={primaryColor}
        >
          DOORSTEP
        </text>

        {/* ── 7. 'POWER SOLUTION' Subtitle ── */}
        <text
          x="75"
          y="52"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Poppins', sans-serif"
          fontSize="12.5"
          fontWeight="700"
          letterSpacing="2.5px"
          fill={subtitleColor}
        >
          {subtitle}
        </text>
      </svg>
    </div>
  );

  if (isLink) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
