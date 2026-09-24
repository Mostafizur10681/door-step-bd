"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=orders");
  }, [router]);

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#122B5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-600">Loading your orders in dashboard...</p>
      </div>
    </div>
  );
}
