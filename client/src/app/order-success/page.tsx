"use client";
import { Suspense } from "react";
import { OrderSuccessPage } from "../pages/OrderSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading order...</div>}>
      <OrderSuccessPage />
    </Suspense>
  );
}
