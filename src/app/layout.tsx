"use client";

import React, { useEffect } from "react";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShopProvider } from "@/context/ShopContext";
import { QuickViewModal } from "@/components/QuickViewModal";
import { NotificationToast } from "@/components/NotificationToast";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { AIChatbot } from "@/components/common/AIChatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg =
        (event instanceof ErrorEvent ? event.message : event.reason?.message || event.reason || "") + "";
      if (
        errorMsg.includes("ChunkLoadError") ||
        errorMsg.includes("Failed to load chunk") ||
        errorMsg.includes("Loading chunk")
      ) {
        const storageKey = "chunk_load_retry";
        const lastRetry = parseInt(sessionStorage.getItem(storageKey) || "0", 10);
        const now = Date.now();
        // Prevent infinite loops, reload at most once every 10 seconds
        if (now - lastRetry > 10000) {
          sessionStorage.setItem(storageKey, now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);
    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <meta name="theme-color" content="#122B5A" />
        <title>Door Step BD | Best Online Shopping in Bangladesh</title>
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 antialiased w-full" suppressHydrationWarning>
        <ShopProvider>
          <Header />
          <main className="flex-1 bg-slate-50 w-full">
            {children}
          </main>
          <Footer />
          <QuickViewModal />
          <NotificationToast />
          <AIChatbot />
          <ScrollToTopButton />
        </ShopProvider>
      </body>
    </html>
  );
}


