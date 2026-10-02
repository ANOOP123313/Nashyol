"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "register");
    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center space-y-2">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting to registration...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterRedirect />
    </Suspense>
  );
}
