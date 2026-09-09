"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { wishlistApi } from "@/services/api";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function mapWishlistItem(item: any): WishlistItem {
  if (!item) return { id: "", name: "", price: 0, image: "" };
  const id = String(item.id || item._id || "");
  const v = item.variants?.[0] || {};
  return {
    id,
    name: item.title || item.name || "Product",
    price: Number(v.sellingPrice || item.offerPrice || item.price || 0),
    originalPrice: item.originalPrice || (item.offerPrice ? v.sellingPrice : undefined),
    image: v.image || (Array.isArray(item.images) ? item.images[0] : item.image) || "https://placehold.co/400x400?text=No+Image",
    category: typeof item.category === "object" ? item.category?.name : item.category || "",
    rating: item.rating || 4.8,
    reviews: item.reviewsCount || (Array.isArray(item.reviews) ? item.reviews.length : 12),
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist on mount
  useEffect(() => {
    // 1. Try to load from localStorage first for instant UI response
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWishlist(parsed.map(mapWishlistItem));
      } catch (error) {
        console.error("Failed to load wishlist from localStorage:", error);
      }
    }

    // 2. If token exists, sync with backend wishlist API
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      wishlistApi
        .list()
        .then((data: any) => {
          if (Array.isArray(data)) {
            const mapped = data.map(mapWishlistItem);
            setWishlist(mapped);
            localStorage.setItem("wishlist", JSON.stringify(mapped));
          }
        })
        .catch((err) => {
          console.warn("Backend wishlist sync skipped/failed:", err.message);
        });
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: any) => {
    const item = mapWishlistItem(product);
    if (!item.id) return;

    setWishlist((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (!exists) {
        toast.success("Added to wishlist", { description: item.name });
        return [...prev, item];
      }
      return prev;
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && item.id.match(/^[0-9a-fA-F]{24}$/)) {
      wishlistApi.add(item.id).catch((err) => console.warn("Wishlist add API error:", err));
    }
  };

  const removeFromWishlist = (productId: string) => {
    if (!productId) return;
    const cleanId = String(productId);

    setWishlist((prev) => {
      const item = prev.find((i) => i.id === cleanId);
      if (item) {
        toast.success("Removed from wishlist", { description: item.name });
      }
      return prev.filter((i) => i.id !== cleanId);
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      wishlistApi.remove(cleanId).catch((err) => console.warn("Wishlist remove API error:", err));
    }
  };

  const toggleWishlist = (product: any) => {
    const item = mapWishlistItem(product);
    if (!item.id) return;

    const exists = wishlist.some((i) => i.id === item.id);
    if (exists) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => {
    if (!productId) return false;
    const cleanId = String(productId);
    return wishlist.some((item) => item.id === cleanId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}



