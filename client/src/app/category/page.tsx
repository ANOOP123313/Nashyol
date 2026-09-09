"use client";
import { Suspense } from "react";
import { CategoryPage } from "../pages/CategoryPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-muted-foreground">Loading category...</div>}>
      <CategoryPage />
    </Suspense>
  );
}


