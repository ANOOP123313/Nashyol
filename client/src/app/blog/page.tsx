"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, ArrowRight, BookOpen, Tag } from "lucide-react";
import { cmsApi } from "@/services/api";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    cmsApi.getBlogs()
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter for published blogs
          const published = data.filter((b: any) => 
            !b.status || b.status.toLowerCase() === "published" || b.status === "Active"
          );
          setBlogs(published.length > 0 ? published : data);
        }
      })
      .catch((err) => console.error("Error loading blogs:", err))
      .finally(() => setLoading(false));
  }, []);

  // Compute unique categories
  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCat = selectedCategory === "All" || blog.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      blog.title?.toLowerCase().includes(q) ||
      blog.content?.toLowerCase().includes(q) ||
      blog.excerpt?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02gNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-25" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="size-4" />
            <span>Articles & Insights</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            NAASHYOL Stories & Blog
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Discover the latest fashion trends, shopping guides, product reviews, and lifestyle tips curated by our experts.
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles, guides, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-900 placeholder:text-gray-400 shadow-xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat
                  ? "bg-foreground text-background shadow-md scale-105"
                  : "bg-card text-foreground hover:bg-muted border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card rounded-2xl p-4 border border-border space-y-4 animate-pulse">
                <div className="h-48 bg-muted rounded-xl" />
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border mt-8 p-8">
            <div className="size-16 bg-orange-100 dark:bg-orange-950/30 text-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📰
            </div>
            <h3 className="text-xl font-bold text-foreground">No articles found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No articles matched your search "${searchQuery}". Try a different keyword.`
                : "Check back soon for new articles and announcements!"}
            </p>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Clear category filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredBlogs.map((blog) => {
              const slug = blog.slug || blog._id;
              const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent";

              return (
                <article
                  key={blog._id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Cover Image */}
                  <Link href={`/blog/${encodeURIComponent(slug)}`} className="block relative h-52 bg-muted overflow-hidden">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-[var(--primary-color)] flex items-center justify-center text-white text-5xl font-bold">
                        {blog.title?.charAt(0) || "N"}
                      </div>
                    )}
                    {blog.category && (
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                        {blog.category}
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3.5" />
                          {blog.author || "Admin"}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${encodeURIComponent(slug)}`}>
                          {blog.title}
                        </Link>
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {blog.excerpt || (blog.content ? blog.content.slice(0, 150) + "..." : "Read this article on NAASHYOL.")}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${encodeURIComponent(slug)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all pt-2 border-t border-border"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
