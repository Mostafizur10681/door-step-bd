"use client";

import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  User,
  Clock,
  Eye,
  ArrowLeft,
  Share2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getBlogBySlug, ApiBlog, getMediaUrl } from "@/lib/api";

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
  sizes,
  priority
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
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
      priority={priority}
      onError={() => {
        setImgSrc("/prod_maca.png");
      }}
      unoptimized
    />
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<ApiBlog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function loadPost() {
      setLoading(true);
      try {
        const res = await getBlogBySlug(slug);
        if (res?.success && res.data) {
          setPost(res.data);
          setRelatedPosts(res.related_blogs || []);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Failed to load blog detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 py-20">
        <Loader2 className="w-10 h-10 text-[#002884] animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md">
          The blog article you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/blog"
          className="bg-[#002884] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#E50914] transition inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 space-y-10">
      
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-200 hover:text-white transition bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
              {post.category?.name || "General"}
            </span>
            <span className="flex items-center gap-1 text-blue-100">
              <Calendar className="w-3.5 h-3.5" /> {formatBlogDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1 text-blue-100">
              <Clock className="w-3.5 h-3.5" /> {calculateReadTime(post.content)}
            </span>
            <span className="flex items-center gap-1 text-blue-100">
              <Eye className="w-3.5 h-3.5" /> {post.views || 0} Views
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {post.title}
          </h1>

          {post.short_description && (
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
              {post.short_description}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3 text-xs text-blue-200">
            <User className="w-4 h-4 text-amber-300" /> Written by <span className="font-bold text-white">{post.author_name || "Admin"}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 gap-10">
        
        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Featured Image */}
          {post.image && (
            <div className="relative w-full h-[300px] sm:h-[450px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
              <BlogImage
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* HTML Body */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-a:text-[#002884] prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share & Category Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Category:</span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg">
                {post.category?.name || "General"}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Article link copied to clipboard!");
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002884] hover:text-[#E50914] transition bg-blue-50 px-4 py-2 rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Article
            </button>
          </div>

        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6 pt-6">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3">
              Related Articles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden">
                      <BlogImage
                        src={rel.image}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-[#002884] transition">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                  </div>
                  <div className="pt-3 flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{formatBlogDate(rel.published_at || rel.created_at)}</span>
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="font-bold text-[#002884] hover:text-[#E50914]"
                    >
                      Read &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
