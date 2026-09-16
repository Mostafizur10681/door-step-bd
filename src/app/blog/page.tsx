"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight, Tag, Search, Sparkles, Loader2 } from "lucide-react";
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
    <div className="bg-slate-50 min-h-screen font-sans space-y-12 pb-20">
      
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#002B49] via-[#092a5e] to-[#FF6600] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3 relative z-10">
          <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> SMT Mart BD Health &amp; Tech Journal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight">
            Our Official Blog
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Expert articles, tech guides, wellness tips, and special store announcements from our specialists.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-2 relative">
            <input
              type="text"
              placeholder="Search blog articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 border border-white/20 rounded-full pl-5 pr-11 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/30 shadow-lg placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-[#002B49] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#002B49] animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading blog posts from database...</p>
          </div>
        ) : (
          <>
            {/* Featured Post Hero Card (Shown when filter is "All" and no search query) */}
            {activeCategory === "All" && !searchQuery && featuredPost && (
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0 group">
                
                <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[400px] bg-slate-100 p-6 flex items-center justify-center">
                  <BlogImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-amber-400 text-slate-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow z-10">
                    Featured Article
                  </span>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="bg-[#002B49]/10 text-[#002B49] px-3 py-1 rounded-full">
                      {featuredPost.category?.name || "General"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {calculateReadTime(featuredPost.content)}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug hover:text-[#002B49] transition">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {featuredPost.short_description || featuredPost.content?.replace(/<[^>]+>/g, "").slice(0, 160)}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#002B49]" /> {featuredPost.author_name || "Admin"}
                    </span>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="bg-[#002B49] hover:bg-[#FF6600] text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      Read Full Post <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* Blog Post Grid Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xl font-black text-slate-900">
                  Latest Articles ({filteredPosts.length})
                </h3>
                <span className="text-xs text-slate-400">Showing posts for {activeCategory}</span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                  <h4 className="font-bold text-slate-800">No articles found</h4>
                  <p className="text-xs text-slate-400">Try searching for another topic or select a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between group"
                    >
                      <div className="space-y-4 p-5">
                        {/* Thumbnail Image */}
                        <div className="relative w-full h-48 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 flex items-center justify-center">
                          <BlogImage
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-[#002B49] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase z-10">
                            {post.category?.name || "General"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatBlogDate(post.published_at || post.created_at)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {calculateReadTime(post.content)}
                            </span>
                          </div>

                          <Link href={`/blog/${post.slug}`}>
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 hover:text-[#002B49] transition leading-snug">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {post.short_description || post.content?.replace(/<[^>]+>/g, "").slice(0, 120)}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
                        <span className="font-semibold text-slate-600 truncate max-w-[150px]">
                          By {post.author_name || "Admin"}
                        </span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-bold text-[#002B49] group-hover:text-[#FF6600] transition flex items-center gap-1"
                        >
                          Read Article <ArrowRight className="w-3.5 h-3.5" />
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

