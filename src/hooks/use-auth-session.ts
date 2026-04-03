"use client";

import * as React from "react";

/** Shape returned by Better Auth `GET /api/auth/get-session` when logged in */
export type AuthSessionPayload = {
  session: Record<string, unknown>;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    emailVerified?: boolean;
  };
};

/**
 * Client-only session via fetch (avoids `authClient.useSession()` invalid hook / duplicate React issues during SSR).
 */
export function useAuthSession() {
  const [data, setData] = React.useState<AuthSessionPayload | null | undefined>(
    undefined
  );

  const load = React.useCallback(() => {
    setData(undefined);
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((res) => res.json())
      .then((body: AuthSessionPayload | null) => {
        if (body && body.user && body.session) {
          setData(body);
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const isPending = data === undefined;
  const session = data ?? null;

  return {
    data: session,
    isPending,
    refetch: load,
  };
}
