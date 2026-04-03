"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { useAuthSession } from "@/hooks/use-auth-session";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useAuthSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="bg-background flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground text-sm">Memuat…</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
