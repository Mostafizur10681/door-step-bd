"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { 
  getUserOrders, 
  changeAuthPassword
} from "@/lib/api";
import {
  User,
  Package,
  Truck,
  Edit3,
  Trash2,
  LogOut,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Save,
  AlertTriangle,
  Lock,
  Heart,
  ShoppingCart,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sliders,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Sparkles,
  Layers
} from "lucide-react";

interface OrderProductItem {
  name: string;
  qty: number;
  price: number;
  image: string;
  slug?: string;
  attributes?: Record<string, string> | null;
}

interface DynamicOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  shippingAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderProductItem[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, updateProfile, deleteAccount, cart, wishlist, removeFromWishlist, addToCart, showToast } = useShop();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wishlist" | "profile" | "password" | "delete">("overview");

  // Synchronize tab from URL query if present
  useEffect(() => {
    if (tabParam === "orders" || tabParam === "wishlist" || tabParam === "profile" || tabParam === "password" || tabParam === "delete") {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Dynamic Orders State
  const [orders, setOrders] = useState<DynamicOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Saving and Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) {
      router.push("/account");
    } else {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone);
      setEditAddress(user.address);
    }
  }, [user, router]);

  // Fetch dynamic user-wise orders from Backend API
  const fetchUserOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const res = await getUserOrders(1, 50);

      let rawList: any[] = [];
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (Array.isArray(res.data.data)) {
          rawList = res.data.data;
        }
      }

      if (rawList.length > 0) {
        const formattedOrders: DynamicOrder[] = rawList.map((ord: any) => {
          // Format date
          let dateStr = "Recent";
          if (ord.created_at) {
            try {
              dateStr = new Date(ord.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });
            } catch {
              dateStr = String(ord.created_at).slice(0, 10);
            }
          }

          // Format status
          const rawStatus = (ord.status || "pending").toLowerCase();
          let cleanStatus = "Processing";
          if (rawStatus.includes("deliver")) cleanStatus = "Delivered";
          else if (rawStatus.includes("transit") || rawStatus.includes("ship") || rawStatus.includes("out_for")) cleanStatus = "In Transit";
          else if (rawStatus.includes("cancel")) cleanStatus = "Cancelled";
          else if (rawStatus.includes("pend")) cleanStatus = "Pending";
          else cleanStatus = ord.status ? ord.status.charAt(0).toUpperCase() + ord.status.slice(1) : "Processing";

          // Format address (check if ship_different is selected and shipping address details exist)
          const isShipDiff = Boolean(ord.ship_different) || Boolean(ord.ship_address && ord.ship_address !== ord.address);

          let fullAddress = "";
          if (isShipDiff && ord.ship_address) {
            const shipParts = [
              ord.ship_address,
              ord.ship_town_city,
              ord.ship_district,
              ord.ship_country
            ].filter(Boolean);
            fullAddress = shipParts.join(", ");
          } else {
            const addressParts = [
              ord.address,
              ord.thana,
              ord.district,
              ord.division
            ].filter(Boolean);
            fullAddress = addressParts.length > 0 ? addressParts.join(", ") : (user?.address || "Dhaka, Bangladesh");
          }

          const recipientName = isShipDiff && ord.ship_customer_name ? ord.ship_customer_name : (ord.customer_name || user?.name);
          const recipientPhone = isShipDiff && ord.ship_phone ? ord.ship_phone : (ord.customer_phone || user?.phone);

          // Format items
          const rawItems = Array.isArray(ord.items) ? ord.items : (Array.isArray(ord.order_items) ? ord.order_items : []);
          const items: OrderProductItem[] = rawItems.map((item: any) => {
            const prod = item.product || {};
            let img = prod.image || prod.main_image || (Array.isArray(prod.images) ? prod.images[0] : null) || "/prod_honey.png";
            // Parse attributes from order item
            let itemAttrs: Record<string, string> | null = null;
            if (item.attributes) {
              if (typeof item.attributes === "string") {
                try { itemAttrs = JSON.parse(item.attributes); } catch { itemAttrs = null; }
              } else if (typeof item.attributes === "object" && !Array.isArray(item.attributes)) {
                itemAttrs = item.attributes;
              }
            }
            return {
              name: prod.name || item.name || item.product_name || `Product #${item.product_id || ""}`,
              qty: Number(item.quantity || item.qty) || 1,
              price: Number(item.price || item.unit_price) || 0,
              image: img,
              slug: prod.slug || "",
              attributes: itemAttrs,
            };
          });

          const totalAmt = Number(ord.total || ord.grand_total || ord.total_amount) || 0;
          const shippingAmt = Number(ord.shipping_amount || ord.shipping_charge || ord.shipping_fee) || 0;

          return {
            id: ord.order_number || String(ord.id),
            orderNumber: ord.order_number || String(ord.id),
            date: dateStr,
            total: totalAmt,
            shippingAmount: shippingAmt,
            status: cleanStatus,
            paymentStatus: ord.payment_status ? (ord.payment_status.charAt(0).toUpperCase() + ord.payment_status.slice(1)) : "Pending",
            paymentMethod: ord.payment_method || (ord.payment_status === "paid" ? "Paid Online" : "Cash on Delivery"),
            shippingAddress: fullAddress,
            customerName: recipientName,
            customerPhone: recipientPhone,
            items: items.length > 0 ? items : [
              { name: "Ordered Items Package", qty: 1, price: totalAmt, image: "/prod_honey.png" }
            ],
          };
        });

        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileFieldErrors({});
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress
      });
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      if (err?.errors) {
        setProfileFieldErrors(err.errors);
      }
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordFieldErrors({});

    if (!currentPassword) {
      const msg = "Please enter your current password!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "New password and confirm password do not match!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = "Password must be at least 6 characters long!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changeAuthPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      if (res && res.success) {
        const msg = res.message || "Password changed successfully!";
        setPasswordSuccess(msg);
        showToast(msg);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const msg = res?.message || "Failed to update password.";
        setPasswordError(msg);
        showToast(msg);
      }
    } catch (err: any) {
      if (err?.errors) {
        setPasswordFieldErrors(err.errors);
      }
      const msg = err.message || "Failed to update password. Please verify your current password.";
      setPasswordError(msg);
      showToast(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? All your profile information, wishlists, and saved preferences will be wiped permanently.")) {
      setIsDeletingAccount(true);
      try {
        await deleteAccount();
        router.push("/");
      } catch (err: any) {
        showToast(err.message || "Failed to delete account. Please try again.");
      } finally {
        setIsDeletingAccount(false);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#002B49] via-[#092a5e] to-[#FF6600] rounded-3xl p-6 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center font-black text-2xl text-amber-300 shrink-0 overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                Customer Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xs text-blue-100">{user.email} • {user.phone}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/account");
            }}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs px-6 py-2.5 rounded-full transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Navigation Sidebar (Col 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "overview"
                  ? "bg-[#002B49] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <User className="w-4 h-4" /> Dashboard Overview
            </button>

            {/* My Orders Menu Tab Button (Dynamic in Dashboard, no redirect) */}
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "orders"
                  ? "bg-[#002B49] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" /> My Orders
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "wishlist"
                  ? "bg-[#002B49] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" /> Saved Wishlist
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "wishlist" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600"
                }`}>
                {wishlist.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "profile"
                  ? "bg-[#002B49] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Edit3 className="w-4 h-4" /> Update Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "password"
                  ? "bg-[#002B49] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("delete")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "delete"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-rose-600 hover:bg-rose-50"
                }`}
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>

          {/* Right Tab Content Container (Col 9) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">

            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Account Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Cart Items</span>
                    <div className="text-2xl font-black text-[#002B49]">{cart.length}</div>
                    <Link href="/cart" className="text-xs font-bold text-[#ff8c00] hover:underline block pt-1">Go to Cart &rarr;</Link>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Wishlist Items</span>
                    <div className="text-2xl font-black text-rose-600">{wishlist.length}</div>
                    <button onClick={() => setActiveTab("wishlist")} className="text-xs font-bold text-rose-600 hover:underline block pt-1">Go to Wishlist &rarr;</button>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</span>
                    <div className="text-2xl font-black text-emerald-600">
                      {isLoadingOrders ? "..." : orders.length}
                    </div>
                    <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-emerald-600 hover:underline block pt-1">View Orders &rarr;</button>
                  </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Personal Info &amp; Shipping Address</h3>
                    <button onClick={() => setActiveTab("profile")} className="text-xs font-bold text-[#002B49] hover:underline">Edit Info</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Name:</span>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Email:</span>
                      <span className="font-bold text-slate-800">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Phone:</span>
                      <span className="font-bold text-slate-800">{user.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Address:</span>
                      <span className="font-bold text-slate-800">{user.address || "Not set yet"}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Preview on Overview */}
                {orders.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">Recent Order Activity</h3>
                      <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[#002B49] hover:underline">
                        View All ({orders.length}) &rarr;
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                      {orders.slice(0, 3).map((ord) => (
                        <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">Order #{ord.orderNumber}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ord.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  ord.status === "In Transit" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    ord.status === "Cancelled" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                      "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{ord.date} • {ord.items.length} item(s)</p>
                          </div>

                          <div className="flex items-center gap-4 justify-between sm:justify-end">
                            <span className="text-xs font-black text-[#002B49]">৳{ord.total.toLocaleString()}</span>
                            <Link
                              href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}`}
                              className="text-xs font-bold text-[#002B49] bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-[#002B49] hover:text-white transition shadow-2xs flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" /> Track
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. DYNAMIC ORDER LIST TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">

                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      My Orders
                    </h2>
                    <p className="text-xs text-slate-500">Live dynamic order history linked to your customer account</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchUserOrders}
                      className="text-slate-500 hover:text-[#002B49] bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      title="Refresh orders"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-[#002B49]" : ""}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <span className="bg-[#002B49]/10 text-[#002B49] font-bold text-xs px-3 py-1.5 rounded-full">
                      {orders.length} Total Orders
                    </span>
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingOrders ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-500">Loading your real-time orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  /* Empty State */
                  <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-[#002B49] flex items-center justify-center mx-auto border border-blue-100">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800">
                        No Orders Placed Yet
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Browse our pure, authentic organic products and place your first order today!
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="inline-block bg-[#002B49] hover:bg-[#FF6600] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-xs transition"
                    >
                      Start Shopping Now
                    </Link>
                  </div>
                ) : (
                  /* Dynamic Orders List */
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 hover:border-[#002B49]/40 transition duration-200"
                      >
                        {/* Order Header Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-black text-slate-900 text-sm sm:text-base">
                                Order #{ord.orderNumber}
                              </span>
                              <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${ord.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ord.status === "In Transit"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : ord.status === "Cancelled"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Placed on {ord.date}
                            </p>
                          </div>

                          {/* Quick Track Action Link */}
                          <Link
                            href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}`}
                            className="bg-[#002B49] hover:bg-[#072450] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Package
                          </Link>
                        </div>

                        {/* Purchased Items List */}
                        <div className="space-y-2.5">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 relative overflow-hidden shrink-0 flex items-center justify-center">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="48px"
                                    className="object-contain"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  {item.slug ? (
                                    <Link href={`/product/${item.slug}`} className="font-bold text-slate-800 text-xs hover:text-[#002B49] transition line-clamp-1">
                                      {item.name}
                                    </Link>
                                  ) : (
                                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{item.name}</h4>
                                  )}
                                  <p className="text-[11px] text-slate-400">
                                    Quantity: <span className="font-bold text-slate-700">{item.qty}</span> × ৳{item.price.toLocaleString()}
                                  </p>
                                  {item.attributes && Object.keys(item.attributes).length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                      {Object.entries(item.attributes).map(([k, v]) => (
                                        <span key={k} className="bg-blue-50 text-[#002B49] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-100">
                                          {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className="font-extrabold text-[#002B49] text-xs shrink-0">
                                ৳{(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer Summary */}
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="text-slate-500 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Status</span>
                            <p className="font-semibold text-slate-800">{ord.paymentMethod} ({ord.paymentStatus})</p>
                          </div>

                          <div className="text-slate-500 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Shipping Address</span>
                            <p className="font-semibold text-slate-800 truncate" title={ord.shippingAddress}>
                              {ord.shippingAddress}
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-slate-400 text-[10px] font-bold uppercase block">Grand Total</span>
                            <span className="text-lg font-black text-[#002B49]">
                              ৳{ord.total.toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      My Wishlist
                    </h2>
                    <p className="text-xs text-slate-500">Your saved products for future orders</p>
                  </div>
                  <span className="bg-rose-50 text-rose-600 font-bold text-xs px-3 py-1 rounded-full border border-rose-200">
                    {wishlist.length} Items
                  </span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-400">Save items while browsing to view them here later.</p>
                    <Link
                      href="/"
                      className="inline-block bg-[#002B49] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-xs hover:bg-[#FF6600] transition mt-2"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white text-slate-400 hover:text-rose-600 flex items-center justify-center shadow-xs transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <Link href={`/product/${item.slug || item.id}`} className="block relative w-full h-36 bg-white rounded-xl overflow-hidden p-2 border border-slate-100">
                          <Image
                            src={item.mainImage || item.image || "/prod_honey.png"}
                            alt={item.name}
                            fill
                            sizes="200px"
                            className="object-contain group-hover:scale-105 transition"
                          />
                        </Link>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
                          <Link href={`/product/${item.slug || item.id}`}>
                            <h4 className="font-bold text-slate-800 text-xs line-clamp-2 hover:text-[#002B49] transition leading-snug">
                              {item.name}
                            </h4>
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                          <div className="text-sm font-black text-[#002B49]">
                            ৳{Number(item.price).toLocaleString()}
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(item, 1)}
                            className="bg-[#ff8c00] hover:bg-[#e07b00] text-white p-2 rounded-full shadow-xs transition"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. UPDATE PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Update Account Profile
                </h2>

                {/* Profile Error Banner in Red */}
                {profileError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-800">Update Failed</h4>
                      <p className="mt-0.5 text-rose-600 font-medium">{profileError}</p>
                    </div>
                  </div>
                )}

                {/* Profile Success Banner in Green */}
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-800">Success</h4>
                      <p className="mt-0.5 text-emerald-600 font-medium">{profileSuccess}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5 w-full">

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {profileFieldErrors.name && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.name[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {profileFieldErrors.email && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {profileFieldErrors.phone && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.phone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Default Address</label>
                    <textarea
                      rows={3}
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {profileFieldErrors.address && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.address[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-[#002B49] hover:bg-[#FF6600] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 mt-4"
                  >
                    <Save className={`w-4 h-4 ${isSavingProfile ? "animate-spin" : ""}`} />
                    {isSavingProfile ? "Saving Profile..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {/* 5. CHANGE PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#002B49]" /> Change Password
                </h2>

                {/* Error Banner in Red */}
                {passwordError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-800">Password Update Failed</h4>
                      <p className="mt-0.5 text-rose-600 font-medium">{passwordError}</p>
                    </div>
                  </div>
                )}

                {/* Success Banner in Green */}
                {passwordSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-800">Success</h4>
                      <p className="mt-0.5 text-emerald-600 font-medium">{passwordSuccess}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {passwordFieldErrors.current_password && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.current_password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {passwordFieldErrors.password && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B49]/30"
                    />
                    {passwordFieldErrors.password_confirmation && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.password_confirmation[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="bg-[#002B49] hover:bg-[#FF6600] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 mt-4"
                  >
                    <Save className={`w-4 h-4 ${isSavingPassword ? "animate-spin" : ""}`} />
                    {isSavingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* 6. DELETE ACCOUNT MENU TAB */}
            {activeTab === "delete" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-rose-600 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone: Delete Account
                </h2>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-rose-900 text-sm">Permanent Account Deletion</h3>
                    <p className="text-xs text-rose-700 leading-relaxed mt-1">
                      Deleting your account is permanent and irreversible. Once deleted:
                    </p>
                    <ul className="mt-2 list-disc list-inside text-xs text-rose-700 space-y-1">
                      <li>Your customer profile, name, phone, and saved shipping addresses will be permanently removed.</li>
                      <li>Your saved wishlist items and session tokens will be revoked immediately.</li>
                      <li>You will need to register a new account if you wish to shop again.</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60">
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={handleDeleteAccount}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Trash2 className={`w-4 h-4 ${isDeletingAccount ? "animate-spin" : ""}`} />
                      {isDeletingAccount ? "Deleting Account..." : "Confirm Account Deletion"}
                    </button>
                  </div>
                </div>
              </div>
            )}



          </div>

        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
