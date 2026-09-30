"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Loader2, 
  Newspaper,
  BookOpen,
  Building2,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getBlogs, getBlogCategories, ApiBlog, ApiBlogCategory, getMediaUrl } from "@/lib/api";

function formatBlogDate(dateStr?: string | null) {
  if (!dateStr) return "Recently published";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently published";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function calculateReadTime(content?: string | null) {
  if (!content) return "3 min read";
  const text = content.replace(/<[^>]+>/g, "").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function BlogImage({
  src,
  alt,
  fill = true,
  className,
  sizes
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string>(() => getMediaUrl(src));

  useEffect(() => {
    setImgSrc(getMediaUrl(src));
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => {
        setImgSrc("/prod_maca.png");
      }}
      unoptimized
    />
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [blogPosts, setBlogPosts] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, blogRes] = await Promise.all([
          getBlogCategories(),
          getBlogs()
        ]);

        if (catRes?.success && Array.isArray(catRes.data)) {
          const catNames = catRes.data.map((c: ApiBlogCategory) => c.name);
          setCategories(["All", ...catNames]);
        }

        if (blogRes?.success && Array.isArray(blogRes.data)) {
          setBlogPosts(blogRes.data);
        }
      } catch (err) {
        console.error("Failed to load blog data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredPosts = blogPosts.filter((post) => {
    const postCatName = post.category?.name || "General";
    const matchesCategory = activeCategory === "All" || postCatName.toLowerCase() === activeCategory.toLowerCase();
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchLower) ||
      (post.short_description && post.short_description.toLowerCase().includes(searchLower)) ||
      (post.content && post.content.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-12 pb-24">
      
      {/* 1. Hero Header Section (Consistent with All-Products, Services, Brands & About Us) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Door Step BD News &amp; Technical Insights</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Latest News &amp; Engineering Bulletins
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Stay updated with industrial power engineering articles, corporate announcements, equipment commissioning case studies, and preventive maintenance guides.
          </p>

          {/* Search Box with Deep Navy & Gold Glow */}
          <div className="max-w-md mx-auto pt-3 relative">
            <input
              type="text"
              placeholder="Search news & technical articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 border border-white/20 rounded-full pl-5 pr-11 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#FFB800]/40 shadow-xl placeholder:text-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#122B5A] text-[#FFB800] shadow-md border border-[#FFB800]/40 scale-105"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-[#122B5A] hover:text-[#122B5A]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#122B5A] animate-spin" />
            <p className="text-sm font-bold text-slate-600">Loading articles &amp; news...</p>
          </div>
        ) : (
          <>
            {/* Featured Post Hero Card (Shown when filter is "All" and no search query) */}
            {activeCategory === "All" && !searchQuery && featuredPost && (
              <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#122B5A]/40 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 group">
                
                <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[400px] bg-slate-900 p-6 flex items-center justify-center overflow-hidden">
                  <BlogImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38]/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-4 left-4 bg-[#FFB800] text-[#122B5A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow z-10">
                    Featured Insight
                  </span>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="bg-[#122B5A]/10 text-[#122B5A] px-3 py-1 rounded-full font-black text-[10px] uppercase">
                      {featuredPost.category?.name || "General"}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {calculateReadTime(featuredPost.content)}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-xl sm:text-3xl font-black text-[#122B5A] leading-snug group-hover:text-[#0B1B38] transition">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {featuredPost.short_description || featuredPost.content?.replace(/<[^>]+>/g, "").slice(0, 160)}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#122B5A]" /> {featuredPost.author_name || "Admin"}
                    </span>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="bg-[#122B5A] hover:bg-[#0B1B38] text-[#FFB800] hover:text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* News Post Grid Cards (3 Cards per column on Desktop) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xl sm:text-2xl font-black text-[#122B5A]">
                  Latest News &amp; Articles ({filteredPosts.length})
                </h3>
                <span className="text-xs font-bold text-slate-500">Showing {activeCategory}</span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#122B5A] flex items-center justify-center mx-auto">
                    <Newspaper className="w-6 h-6 text-[#FFB800]" />
                  </div>
                  <h4 className="font-bold text-slate-800">No articles found</h4>
                  <p className="text-xs text-slate-400">Try searching for another topic or select a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#122B5A]/40 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="space-y-4 p-5">
                        {/* Thumbnail Image */}
                        <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                          <BlogImage
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute top-3 left-3 bg-[#122B5A] text-[#FFB800] text-[10px] font-black px-3 py-0.5 rounded-full uppercase border border-[#FFB800]/30 shadow-xs z-10">
                            {post.category?.name || "General"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatBlogDate(post.published_at || post.created_at)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {calculateReadTime(post.content)}
                            </span>
                          </div>

                          <Link href={`/blog/${post.slug}`}>
                            <h4 className="font-black text-[#122B5A] text-base group-hover:text-[#0B1B38] transition leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {post.short_description || post.content?.replace(/<[^>]+>/g, "").slice(0, 120)}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
                        <span className="font-bold text-slate-600 truncate max-w-[140px] flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {post.author_name || "Admin"}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-bold text-[#122B5A] hover:text-[#FFB800] transition flex items-center gap-1"
                        >
                          <span>Read Article</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
