"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Package,
  AlertCircle,
  PhoneCall,
  MapPin,
  User,
  CreditCard,
  ArrowRight,
  Loader2,
  Calendar,
  XCircle,
  RotateCcw,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { Skeleton } from "@/components/common/Skeletons";
import { API_V1 } from "@/lib/api";

interface StatusStep {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
}

interface TrackedOrderItem {
  id: number | string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  sku?: string;
  attributes?: Record<string, string> | null;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  statusSlug: string;
  paymentStatus: string;
  total: number;
  shippingAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  courier: string;
  estimatedDelivery: string;
  items: TrackedOrderItem[];
}

// Default standard statuses fallback if API list is empty
const DEFAULT_ORDER_STATUSES: StatusStep[] = [
  { id: 1, name: "Order Placed", slug: "pending", description: "Order received & waiting for confirmation" },
  { id: 2, name: "Confirmed", slug: "confirmed", description: "Order confirmed by our customer care" },
  { id: 3, name: "Processing", slug: "processing", description: "Packed & verified at warehouse" },
  { id: 4, name: "Shipped", slug: "shipped", description: "Handed over to courier service" },
  { id: 5, name: "Out for Delivery", slug: "out-for-delivery", description: "With local delivery rider" },
  { id: 6, name: "Delivered", slug: "delivered", description: "Delivered to destination" },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNo = searchParams.get("order_number") || "";

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNo);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [dbStatuses, setDbStatuses] = useState<StatusStep[]>(DEFAULT_ORDER_STATUSES);

  // 1. Fetch live order statuses from order_statuses table
  useEffect(() => {
    fetch(`${API_V1}/order-statuses/active`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped: StatusStep[] = list
            .filter((s: any) => !["cancelled", "returned"].includes(s.slug?.toLowerCase()))
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              slug: s.slug?.toLowerCase() || s.name.toLowerCase().replace(/\s+/g, "-"),
              description: s.description || "",
            }));
          if (mapped.length > 0) {
            setDbStatuses(mapped);
          }
        }
      })
      .catch(() => { });
  }, []);

  // 2. Fetch order tracking by order number
  const fetchTracking = async (numberToTrack: string) => {
    const cleanNo = numberToTrack.trim();
    if (!cleanNo) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_V1}/orders/track/${encodeURIComponent(cleanNo)}`);
      const json = await res.json();

      if (res.ok && json.data) {
        const o = json.data;
        const rawStatus = (o.status || "pending").toString().toLowerCase().trim();

        // Estimated delivery based on status
        let estDelivery = "Within 2-3 business days";
        if (rawStatus === "delivered") {
          estDelivery = "Delivered";
        } else if (rawStatus === "shipped" || rawStatus === "out-for-delivery") {
          estDelivery = "Expected within 24-48 Hours";
        }

        const itemsList: TrackedOrderItem[] = Array.isArray(o.items) && o.items.length > 0
          ? o.items.map((it: any) => {
            const p = it.product || {};
            const img = p.image || p.main_image || (Array.isArray(p.images) && p.images[0]) || "/prod_honey.png";
            // Parse attributes from order item
            let itemAttrs: Record<string, string> | null = null;
            if (it.attributes) {
              if (typeof it.attributes === "string") {
                try { itemAttrs = JSON.parse(it.attributes); } catch { itemAttrs = null; }
              } else if (typeof it.attributes === "object" && !Array.isArray(it.attributes)) {
                itemAttrs = it.attributes;
              }
            }
            return {
              id: it.id,
              productName: p.name || it.product_name || "Purchased Product",
              productImage: img,
              quantity: it.quantity || 1,
              price: parseFloat(String(it.price || p.sale_price || p.price || 0)),
              sku: p.SKU || p.sku || "",
              attributes: itemAttrs,
            };
          })
          : [
            {
              id: 1,
              productName: "Confirmed Order Package #" + cleanNo,
              productImage: "/prod_honey.png",
              quantity: 1,
              price: parseFloat(String(o.total || 0)),
            }
          ];

        // Format full address (handling ship_different if selected)
        const isShipDiff = Boolean(o.ship_different) || Boolean(o.ship_address && o.ship_address !== o.address);
        let fullAddress = "";
        if (isShipDiff && o.ship_address) {
          fullAddress = [
            o.ship_address,
            o.ship_town_city,
            o.ship_district,
            o.ship_country
          ].filter(Boolean).join(", ");
        } else {
          fullAddress = [
            o.address,
            o.thana,
            o.district,
            o.division
          ].filter(Boolean).join(", ") || "Delivery address on file";
        }

        const recipientName = isShipDiff && o.ship_customer_name ? o.ship_customer_name : (o.customer_name || "Valued Customer");
        const recipientPhone = isShipDiff && o.ship_phone ? o.ship_phone : (o.customer_phone || "N/A");

        setTrackedOrder({
          id: String(o.id || cleanNo),
          orderNumber: o.order_number || cleanNo,
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "Recent",
          status: o.status ? o.status.replace(/-/g, " ").toUpperCase() : "PENDING",
          statusSlug: rawStatus,
          paymentStatus: (o.payment_status || "pending").toUpperCase(),
          total: parseFloat(String(o.total || 0)),
          shippingAmount: parseFloat(String(o.shipping_amount || 80)),
          customerName: recipientName,
          customerPhone: recipientPhone,
          customerEmail: o.customer_email || "",
          shippingAddress: fullAddress,
          courier: o.courier || "Steadfast / Pathao Express Courier",
          estimatedDelivery: estDelivery,
          items: itemsList,
        });
      } else {
        setErrorMsg(`No order found matching "${cleanNo}". Please double check your order number or phone number.`);
        setTrackedOrder(null);
      }
    } catch {
      setErrorMsg("Unable to connect to order tracking service. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNo) {
      fetchTracking(initialOrderNo);
    }
  }, [initialOrderNo]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      fetchTracking(orderNumberInput.trim());
    }
  };

  // Helper to determine active step progression index
  const getActiveStepIndex = (currentSlug: string, statusesList: StatusStep[]) => {
    const slug = currentSlug.toLowerCase().trim();
    if (slug === "cancelled" || slug === "returned") return -1;

    // Direct match
    const idx = statusesList.findIndex((s) => s.slug === slug || s.name.toLowerCase() === slug);
    if (idx !== -1) return idx;

    // Semantic aliases
    if (slug.includes("pend") || slug.includes("place")) return 0;
    if (slug.includes("confirm") || slug.includes("accept")) return 1;
    if (slug.includes("process") || slug.includes("pack")) return 2;
    if (slug.includes("ship") || slug.includes("transit")) return 3;
    if (slug.includes("out") || slug.includes("deliver")) return 4;
    if (slug.includes("delivered") || slug.includes("complete")) return statusesList.length - 1;

    return 0;
  };

  const activeIndex = trackedOrder ? getActiveStepIndex(trackedOrder.statusSlug, dbStatuses) : 0;
  const isCancelled = trackedOrder?.statusSlug === "cancelled";
  const isReturned = trackedOrder?.statusSlug === "returned";

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 space-y-10">

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0B1B38] to-[#E50914] text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-3 relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 text-blue-100 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Truck className="w-4 h-4 text-amber-300 animate-pulse" /> Live Order Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Track Your Package
          </h1>
          <p className="max-w-xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Enter your order number to see real-time updates from our fulfillment center and courier logistics partner.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* Tracking Search Input Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleTrackSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Order Tracking Number
              </label>
              <span className="text-[11px] text-slate-400">e.g. ORD-20260811-PJRLS1</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Enter Order No. (e.g. ORD-20260811-PJRLS1)"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#122B5A] hover:bg-[#0B1B38] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track Order
              </button>
            </div>
          </form>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3 text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">Order Not Found</p>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <Skeleton className="w-44 h-5 rounded-lg" />
                <Skeleton className="w-28 h-3.5 rounded" />
              </div>
              <Skeleton className="w-28 h-8 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        )}

        {/* Live Track Result Display */}
        {trackedOrder && !loading && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">

            {/* Top Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Order Number:
                  </span>
                  <span className="font-mono font-extrabold text-[#122B5A] text-sm">
                    {trackedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Placed on: <strong className="text-slate-800">{trackedOrder.date}</strong></span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-2xl text-xs font-extrabold">
                    <XCircle className="w-4 h-4 text-rose-600" /> Cancelled
                  </span>
                ) : isReturned ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-extrabold">
                    <RotateCcw className="w-4 h-4 text-amber-600" /> Returned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-blue-50 text-[#122B5A] border border-blue-200 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-2xs">
                    <Truck className="w-4 h-4 text-[#122B5A] animate-pulse" />
                    <span>Status: {trackedOrder.status}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Progress Stepper (Configured from order_statuses table) */}
            {!isCancelled && !isReturned && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#122B5A]" /> Fulfillment Progression
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    Est. Delivery: <strong className="text-emerald-700">{trackedOrder.estimatedDelivery}</strong>
                  </span>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative">
                    {dbStatuses.map((step, idx) => {
                      const isCompleted = idx < activeIndex;
                      const isCurrent = idx === activeIndex;
                      const isPending = idx > activeIndex;

                      return (
                        <div key={step.id} className="text-center space-y-2 relative">

                          {/* Step Icon Badge */}
                          <div className={`w-11 h-11 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 shadow-sm ${isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                                ? "bg-[#122B5A] text-white ring-4 ring-[#122B5A]/20 scale-110"
                                : "bg-white text-slate-300 border border-slate-200"
                            }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isCurrent ? (
                              <Truck className="w-5 h-5 animate-pulse" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>

                          {/* Step Name & Description */}
                          <div>
                            <p className={`text-xs font-bold ${isCompleted
                                ? "text-emerald-800"
                                : isCurrent
                                  ? "text-[#122B5A] font-black"
                                  : "text-slate-400"
                              }`}>
                              {step.name}
                            </p>
                            {step.description && (
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                                {step.description}
                              </p>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Special Alert for Cancelled/Returned Orders */}
            {isCancelled && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-800 text-xs space-y-1">
                <p className="font-bold text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" /> Order Cancelled
                </p>
                <p className="text-rose-700 leading-relaxed">
                  This order has been cancelled. If this was a mistake or you have questions about refund/exchange, please reach out to our hotline.
                </p>
              </div>
            )}

            {/* Customer & Shipping Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <User className="w-3.5 h-3.5 text-[#122B5A]" /> Customer Info
                </span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 text-xs">{trackedOrder.customerName}</p>
                  <p className="text-slate-600">{trackedOrder.customerPhone}</p>
                  {trackedOrder.customerEmail && (
                    <p className="text-slate-500 text-[11px] truncate">{trackedOrder.customerEmail}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#122B5A]" /> Delivery Address
                </span>
                <p className="font-medium text-slate-700 leading-relaxed">
                  {trackedOrder.shippingAddress}
                </p>
              </div>

              {/* Logistics & Payment Status */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <CreditCard className="w-3.5 h-3.5 text-[#122B5A]" /> Payment &amp; Courier
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${trackedOrder.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                      {trackedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Logistics:</span>
                    <span className="font-bold text-slate-800">{trackedOrder.courier}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ordered Products Itemized List */}
            <div className="space-y-4 pt-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#122B5A]" /> Ordered Items ({trackedOrder.items.length})
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {trackedOrder.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 bg-white hover:bg-slate-50/50 transition">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 relative shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.productName}
                      </h4>
                      {item.sku && (
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Qty: <strong className="text-slate-800">{item.quantity}</strong> × ৳{item.price.toLocaleString()}
                      </p>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {Object.entries(item.attributes).map(([k, v]) => (
                            <span key={k} className="bg-blue-50 text-[#122B5A] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-100">
                              {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-black text-[#122B5A] shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Subtotal & Total Calculation */}
                <div className="p-4 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      ৳{trackedOrder.items.reduce((acc, it) => acc + (it.price * it.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Shipping Fee:</span>
                    <span className="font-semibold text-slate-800">
                      ৳{trackedOrder.shippingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-[#122B5A] pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-base">
                      ৳{trackedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline / Support Footer */}
            <div className="bg-[#122B5A]/5 border border-[#122B5A]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900">Need Assistance with your order?</p>
                <p className="text-[11px] text-slate-500">Our customer happiness team is available 24/7</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:01734340066"
                  className="bg-[#122B5A] text-white font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-[#072450] transition shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Hotline
                </a>
                <Link
                  href="/all-products"
                  className="border border-[#122B5A] text-[#122B5A] hover:bg-[#122B5A] hover:text-white font-bold text-xs px-4 py-2 rounded-full transition shrink-0"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#122B5A]" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
