"use client";
import { Suspense } from "react";
import { TrackOrderPage } from "../pages/TrackOrderPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrackOrderPage />
    </Suspense>
  );
}
