"use client";
import { Suspense } from "react";
import { ProductsPage } from "../pages/ProductsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-muted-foreground">Loading products...</div>}>
      <ProductsPage />
    </Suspense>
  );
}


