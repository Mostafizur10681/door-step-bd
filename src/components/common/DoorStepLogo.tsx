"use client";

import React from "react";
import Link from "next/link";

interface DoorStepLogoProps {
  className?: string;
  isLink?: boolean;
  href?: string;
  onClick?: () => void;
}

export function DoorStepLogo({
  className = "h-8 sm:h-9 md:h-10 w-auto",
  isLink = false,
  href = "/",
  onClick,
}: DoorStepLogoProps) {
  const content = (
    <svg
      viewBox="0 0 310 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-200 select-none`}
      aria-label="Door Step BD"
    >
      {/* ── Letter 'D' Outer Silhouette ── */}
      <path
        d="M 4 8 H 28 C 42 8 50 17 50 32 C 50 47 42 56 28 56 H 4 V 8 Z"
        fill="#002884"
      />
      {/* ── Open Door Cutout inside 'D' ── */}
      <polygon
        points="14,14 36,19 36,45 14,50"
        fill="#FFFFFF"
      />
      {/* ── Door Knob on open door ── */}
      <circle cx="31" cy="32" r="2.4" fill="#002884" />

      {/* ── 'oor Step' in Deep Royal Blue ── */}
      <text
        x="55"
        y="47"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Poppins', sans-serif"
        fontSize="43"
        fontWeight="900"
        letterSpacing="-1px"
        fill="#002884"
      >
        oor Step
      </text>

      {/* ── 'BD' in Bold Crimson Red ── */}
      <text
        x="238"
        y="47"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Poppins', sans-serif"
        fontSize="43"
        fontWeight="900"
        letterSpacing="-0.5px"
        fill="#E50914"
      >
        BD
      </text>
    </svg>
  );

  if (isLink) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
