"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, Share2, HelpCircle } from "lucide-react";
import { cmsApi } from "@/services/api";
import { toast } from "sonner";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cmsApi.getBlog(slug)
      .then((data) => {
        if (data) {
          setBlog(data);
        } else {
          setError("Blog post not found");
        }
      })
      .catch((err) => {
        console.error("Error loading blog:", err);
        setError("Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-3">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <div className="bg-card p-8 rounded-2xl border border-border text-center max-w-md w-full shadow-lg space-y-4">
          <div className="size-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-foreground">Article Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The article you are looking for might have been moved or removed.
          </p>
          <button
            onClick={() => router.push("/blog")}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            ← Back to All Articles
          </button>
        </div>
      </div>
    );
  }

  const dateStr = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently published";

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Articles</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Share article"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {/* Cover Image */}
          {blog.image && (
            <div className="w-full h-64 sm:h-96 relative overflow-hidden bg-muted">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {blog.category && (
                <span className="bg-orange-100 dark:bg-orange-950/40 text-[var(--primary-color)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-orange-200 dark:border-orange-800">
                  {blog.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                {dateStr}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="size-3.5" />
                {blog.author || "NAASHYOL Editorial"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Excerpt callout */}
            {blog.excerpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border-l-4 border-[var(--primary-color)] text-foreground/90 font-medium text-base sm:text-lg italic mb-8">
                {blog.excerpt}
              </div>
            )}

            {/* Article Content */}
            <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base sm:text-lg space-y-4 whitespace-pre-wrap">
              {blog.content}
            </div>

            {/* FAQ Callout Box */}
            <div className="mt-12 p-6 rounded-2xl bg-muted/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0">
                  <HelpCircle className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm sm:text-base">
                    Have more questions?
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Check our Help Center FAQs for instant answers regarding orders, returns, and shipping.
                  </p>
                </div>
              </div>
              <Link
                href="/help-center"
                className="whitespace-nowrap px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                Browse FAQs
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
