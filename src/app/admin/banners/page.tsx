"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBannersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=banners");
  }, [router]);

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-20">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#002884] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-600">Redirecting to Banners Management Controller...</p>
      </div>
    </div>
  );
}
