"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  ShoppingBag,
  RotateCcw,
  Loader2,
  PackageX,
  AlertCircle
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { placeOrder, getDistricts, ApiDistrict, CreateOrderPayload } from "@/lib/api";
import { isProductOutOfStock } from "@/lib/productAdapter";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, clearCart, showToast, appliedCoupon, couponDiscount } = useShop();

  // Dynamic Districts State from Database
  const [districtsList, setDistrictsList] = useState<ApiDistrict[]>([]);

  useEffect(() => {
    async function loadDistricts() {
      const res = await getDistricts();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const list = [...res.data];
        list.sort((a, b) => {
          const nameA = a.district_name || a.name || "";
          const nameB = b.district_name || b.name || "";
          if (nameA.toLowerCase() === "dhaka") return -1;
          if (nameB.toLowerCase() === "dhaka") return 1;
          return nameA.localeCompare(nameB);
        });
        setDistrictsList(list);
      }
    }
    loadDistricts();
  }, []);

  // Billing Details Form State
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Mohammadpur");
  const [streetAddress1, setStreetAddress1] = useState(user?.address || "");
  const [streetAddress2, setStreetAddress2] = useState("");
  const [townCity, setTownCity] = useState("Dhaka");
  const [postcode, setPostcode] = useState("1207");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Ship to a different address toggle & state
  const [shipDifferent, setShipDifferent] = useState(false);
  const [shipFirstName, setShipFirstName] = useState("");
  const [shipLastName, setShipLastName] = useState("");
  const [shipCompanyName, setShipCompanyName] = useState("");
  const [shipCountry, setShipCountry] = useState("Bangladesh");
  const [shipStreetAddress1, setShipStreetAddress1] = useState("");
  const [shipStreetAddress2, setShipStreetAddress2] = useState("");
  const [shipTownCity, setShipTownCity] = useState("");
  const [shipPostcode, setShipPostcode] = useState("");
  const [shipDistrict, setShipDistrict] = useState("Dhaka");
  const [shipPhone, setShipPhone] = useState("");

  const [orderNotes, setOrderNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");

  const activeDistrict = shipDifferent ? (shipDistrict || "Dhaka") : (district || "Dhaka");

  // Automatically sync shipping method when district changes
  useEffect(() => {
    if (activeDistrict && activeDistrict.toLowerCase().includes("dhaka")) {
      setShippingMethod("inside_dhaka");
    } else {
      setShippingMethod("outside_dhaka");
    }
  }, [activeDistrict]);

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const shippingFee = shippingMethod === "inside_dhaka" ? 80 : 120;
  const grandTotal = Math.max(0, (subtotal - couponDiscount) + shippingFee);

  const hasOutOfStockItems = cart.some((item) => isProductOutOfStock(item) || (item.stock !== undefined && Number(item.stock) <= 0));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    if (hasOutOfStockItems) {
      showToast("One or more items in your cart are currently out of stock. Please remove them before placing your order.");
      return;
    }

    if (!firstName || !streetAddress1 || !phone) {
      showToast("Please fill in your name, street address, and phone number!");
      return;
    }

    if (shipDifferent && (!shipFirstName || !shipStreetAddress1 || !shipPhone)) {
      showToast("Please fill in the shipping name, street address, and phone number!");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload: CreateOrderPayload = {
        customer_name: `${firstName} ${lastName}`.trim(),
        company_name: companyName || undefined,
        customer_phone: phone,
        customer_email: email || undefined,
        country: country || "Bangladesh",
        division: division || district || "Dhaka",
        district: district || "Dhaka",
        thana: thana || townCity || "Dhaka Sadar",
        address: streetAddress1 + (streetAddress2 ? `, ${streetAddress2}` : ""),
        town_city: townCity || undefined,
        postcode: postcode || undefined,
        order_notes: orderNotes || undefined,
        payment_method: "cod",
        ship_different: shipDifferent,
        ship_customer_name: shipDifferent ? `${shipFirstName} ${shipLastName}`.trim() : undefined,
        ship_company_name: shipDifferent ? (shipCompanyName || undefined) : undefined,
        ship_country: shipDifferent ? (shipCountry || "Bangladesh") : undefined,
        ship_address: shipDifferent ? (shipStreetAddress1 + (shipStreetAddress2 ? `, ${shipStreetAddress2}` : "")) : undefined,
        ship_town_city: shipDifferent ? (shipTownCity || undefined) : undefined,
        ship_postcode: shipDifferent ? (shipPostcode || undefined) : undefined,
        ship_district: shipDifferent ? (shipDistrict || undefined) : undefined,
        ship_phone: shipDifferent ? (shipPhone || undefined) : undefined,
        shipping_amount: shippingFee,
        coupon_code: (appliedCoupon && couponDiscount > 0) ? appliedCoupon.code : undefined,
        coupon_discount: couponDiscount > 0 ? couponDiscount : undefined,
        user_id: user?.id ? Number(user.id) : undefined,
        items: cart.map((item) => {
          let pid = Number(item.id);
          if (isNaN(pid) || pid <= 0) {
            pid = Number((item as any).product_id || (item as any).productId) || 40;
          }
          return {
            product_id: pid,
            quantity: Math.max(1, Number(item.quantity) || 1),
            attributes: (item as any).selectedAttributes || (item as any).selected_attributes || undefined,
          };
        }),
      };

      const res = await placeOrder(orderPayload);

      if (res && (res.success || res.data)) {
        const orderData = res.data || {};
        const orderNum = orderData.order_number || orderData.id || "CONFIRMED";
        showToast(`Order #${orderNum} placed successfully!`);
        clearCart(true);
        router.push(`/track-order?order=${orderNum}`);
      } else {
        showToast(res?.message || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
      const errorMsg = err?.message || "Error placing order. Please check your connection and try again.";
      showToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Top Coupon Notification Header Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-1 shadow-xs">
          <span>Have a coupon?</span>
          <button type="button" className="text-[#002B49] font-bold underline hover:text-[#FF6600] cursor-pointer">
            Click here to enter your code
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Your Cart is Empty</h2>
            <p className="text-xs text-slate-400">Add products to your cart before proceeding to checkout.</p>
            <Link
              href="/"
              className="inline-block bg-[#ff8c00] text-white font-bold text-xs px-6 py-3 rounded-full shadow transition hover:bg-[#e07b00]"
            >
              Return to Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: Billing Details Form (Col 8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 sm:p-10 shadow-sm space-y-6">
              
              <h2 className="text-2xl font-bold text-[#002B49] border-b border-slate-100 pb-4">
                Billing details
              </h2>

              <div className="space-y-4 text-xs text-slate-700">
                
                {/* Email address * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Email address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                  {fieldErrors.customer_email && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.customer_email[0]}</p>
                  )}
                </div>

                {/* First name * & Last name * */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      First name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>
 
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Last name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>
                </div>
                {fieldErrors.customer_name && (
                  <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.customer_name[0]}</p>
                )}

                {/* Company name (optional) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Company name (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                {/* Country / Region * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Country / Region <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-100/70 border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49]"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                  </select>
                </div>

                {/* Street address * */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">
                    Street address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House number and street name"
                    value={streetAddress1}
                    onChange={(e) => setStreetAddress1(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    value={streetAddress2}
                    onChange={(e) => setStreetAddress2(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                  {fieldErrors.address && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.address[0]}</p>
                  )}
                </div>

                {/* Town / City * & Postcode / ZIP (optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Town / City <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={townCity}
                      onChange={(e) => setTownCity(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Postcode / ZIP (optional)
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>
                </div>

                {/* District * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    District <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-100/70 border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49]"
                  >
                    {districtsList.length > 0 ? (
                      districtsList.map((d) => {
                        const dName = d.district_name || d.name || "";
                        return (
                          <option key={d.id} value={dName}>
                            {dName}
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Gazipur">Gazipur</option>
                        <option value="Narayanganj">Narayanganj</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barisal">Barisal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                        <option value="Other">Other District</option>
                      </>
                    )}
                  </select>
                  {fieldErrors.district && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.district[0]}</p>
                  )}
                </div>

                {/* Phone * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Phone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                  {fieldErrors.customer_phone && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.customer_phone[0]}</p>
                  )}
                </div>

                {/* Checkbox: Ship to a different address? */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={shipDifferent}
                      onChange={(e) => setShipDifferent(e.target.checked)}
                      className="rounded border-slate-300 text-[#002B49] focus:ring-[#002B49] w-4 h-4"
                    />
                    <span>Ship to a different address?</span>
                  </label>
                </div>

                {/* Secondary Shipping Address Fields (Conditioned on Checkbox) */}
                {shipDifferent && (
                  <div className="pt-3 space-y-4 border-t border-dashed border-slate-200 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">First name *</label>
                        <input
                          type="text"
                          value={shipFirstName}
                          onChange={(e) => setShipFirstName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Last name *</label>
                        <input
                          type="text"
                          value={shipLastName}
                          onChange={(e) => setShipLastName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                    {fieldErrors.ship_customer_name && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.ship_customer_name[0]}</p>
                    )}

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Company name (optional)</label>
                      <input
                        type="text"
                        value={shipCompanyName}
                        onChange={(e) => setShipCompanyName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Country / Region *</label>
                      <select
                        value={shipCountry}
                        onChange={(e) => setShipCountry(e.target.value)}
                        className="w-full bg-slate-100/70 border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      >
                        <option value="Bangladesh">Bangladesh</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-slate-700 block">Street address *</label>
                      <input
                        type="text"
                        placeholder="House number and street name"
                        value={shipStreetAddress1}
                        onChange={(e) => setShipStreetAddress1(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        value={shipStreetAddress2}
                        onChange={(e) => setShipStreetAddress2(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      />
                      {fieldErrors.ship_address && (
                        <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.ship_address[0]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Town / City *</label>
                        <input
                          type="text"
                          value={shipTownCity}
                          onChange={(e) => setShipTownCity(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Postcode / ZIP (optional)</label>
                        <input
                          type="text"
                          value={shipPostcode}
                          onChange={(e) => setShipPostcode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">District *</label>
                      <select
                        value={shipDistrict}
                        onChange={(e) => setShipDistrict(e.target.value)}
                        className="w-full bg-slate-100/70 border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      >
                        {districtsList.length > 0 ? (
                          districtsList.map((d) => {
                            const dName = d.district_name || d.name || "";
                            return (
                              <option key={d.id} value={dName}>
                                {dName}
                              </option>
                            );
                          })
                        ) : (
                          <>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Gazipur">Gazipur</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Other">Other District</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Phone *</label>
                      <input
                        type="tel"
                        value={shipPhone}
                        onChange={(e) => setShipPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800"
                      />
                      {fieldErrors.ship_phone && (
                        <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.ship_phone[0]}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order notes (optional) */}
                <div className="space-y-1 pt-2">
                  <label className="font-bold text-slate-700 block">
                    Order notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

              </div>

            </div>

            {/* RIGHT SIDE: Your Order Box (Col 4) */}
            <div className="lg:col-span-4 bg-white border-2 border-[#ff8c00] rounded-xl p-6 shadow-md space-y-6">
              
              <h2 className="text-xl font-extrabold text-[#002B49] border-b border-slate-100 pb-3">
                Your order
              </h2>

              <div className="space-y-3 text-xs">
                
                {/* Table Header */}
                {(() => {
                  const hasOutOfStockItems = cart.some((item) => isProductOutOfStock(item) || (item.stock !== undefined && Number(item.stock) <= 0));
                  return (
                    <>
                      {/* Table Header */}
                      <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-2">
                        <span>Product</span>
                        <span>Subtotal</span>
                      </div>

                      {/* Item List Rows */}
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                        {cart.map((item, index) => {
                          const isItemOutOfStock = isProductOutOfStock(item) || (item.stock !== undefined && Number(item.stock) <= 0);

                          return (
                            <div key={item.cartItemId || `${item.id}-${index}`} className={`py-2.5 flex justify-between gap-3 text-slate-700 ${isItemOutOfStock ? "bg-rose-50/60 p-2 rounded-lg" : ""}`}>
                              <div>
                                <span className="font-medium truncate max-w-[200px] block">
                                  {item.name} <span className="text-slate-400 font-bold">× {item.quantity}</span>
                                </span>
                                {isItemOutOfStock && (
                                  <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                                    <PackageX className="w-3 h-3" /> Out of Stock (Please remove)
                                  </span>
                                )}
                                {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">
                                ৳{(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Subtotal */}
                      <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                        <span>Subtotal</span>
                        <span>৳{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>

                      {/* Shipment */}
                      <div className="py-3 border-t border-b border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-800">
                          <span className="font-bold">Shipment</span>
                          <span className="text-xs font-black text-[#FF6600]">৳{shippingFee.toFixed(2)}</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label 
                            onClick={() => {
                              setShippingMethod("inside_dhaka");
                              if (!shipDifferent && district !== "Dhaka") setDistrict("Dhaka");
                              if (shipDifferent && shipDistrict !== "Dhaka") setShipDistrict("Dhaka");
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${shippingMethod === "inside_dhaka" ? "bg-orange-50/80 border-[#FF6600] text-[#002B49] font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shipping_method_radio"
                                checked={shippingMethod === "inside_dhaka"}
                                onChange={() => {
                                  setShippingMethod("inside_dhaka");
                                  if (!shipDifferent && district !== "Dhaka") setDistrict("Dhaka");
                                  if (shipDifferent && shipDistrict !== "Dhaka") setShipDistrict("Dhaka");
                                }}
                                className="accent-[#FF6600] cursor-pointer"
                              />
                              <span>Inside Dhaka</span>
                            </div>
                            <span className="font-extrabold text-[#002B49]">৳80.00</span>
                          </label>

                          <label 
                            onClick={() => {
                              setShippingMethod("outside_dhaka");
                              if (!shipDifferent && district === "Dhaka") setDistrict("Gazipur");
                              if (shipDifferent && shipDistrict === "Dhaka") setShipDistrict("Gazipur");
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${shippingMethod === "outside_dhaka" ? "bg-orange-50/80 border-[#FF6600] text-[#002B49] font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shipping_method_radio"
                                checked={shippingMethod === "outside_dhaka"}
                                onChange={() => {
                                  setShippingMethod("outside_dhaka");
                                  if (!shipDifferent && district === "Dhaka") setDistrict("Gazipur");
                                  if (shipDifferent && shipDistrict === "Dhaka") setShipDistrict("Gazipur");
                                }}
                                className="accent-[#FF6600] cursor-pointer"
                              />
                              <span>Outside Dhaka</span>
                            </div>
                            <span className="font-extrabold text-[#002B49]">৳120.00</span>
                          </label>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="py-2 flex justify-between items-baseline text-slate-900 font-black">
                        <span className="text-sm">Total</span>
                        <span className="text-xl text-[#002B49]">
                          ৳{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Payment Option: Cash on delivery */}
                      <div className="space-y-2 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2.5 font-bold text-slate-800">
                          <span className="w-3.5 h-3.5 rounded-full border-4 border-[#002B49] bg-white inline-block"></span>
                          <span>Cash on delivery</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed border-l-4 border-l-[#002B49]">
                          Pay with cash upon delivery to your doorstep anywhere in Bangladesh.
                        </div>
                      </div>

                      {/* Place order Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || hasOutOfStockItems || cart.length === 0}
                        className="w-full bg-[#002B49] hover:bg-[#FF6600] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-sm py-3.5 px-6 rounded-full shadow-md transition duration-200 cursor-pointer text-center flex items-center justify-center gap-2 mt-4"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Placing order...</span>
                          </>
                        ) : hasOutOfStockItems ? (
                          <span>Cannot Place Order (Out of Stock Items)</span>
                        ) : (
                          <span>Place order</span>
                        )}
                      </button>

                      {hasOutOfStockItems && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 mt-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Please remove out-of-stock items from your cart before placing the order.</span>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>

            </div>

          </form>
        )}

        {/* Bottom Trust Badges Bar (100% Money back | Non-contact shipping | Fast delivery) */}
        <div className="mt-12 bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs font-bold text-slate-700">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#002B49]" />
            <span>100% Money back</span>
          </div>
          <div className="flex items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0">
            <Truck className="w-4 h-4 text-[#002B49]" />
            <span>Non-contact shipping</span>
          </div>
          <div className="flex items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0">
            <RotateCcw className="w-4 h-4 text-[#002B49]" />
            <span>Fast delivery</span>
          </div>
        </div>

      </div>
    </div>
  );
}
