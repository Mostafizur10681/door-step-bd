"use client";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" /><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />

<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <meta name="theme-color" content="#002884" />
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


