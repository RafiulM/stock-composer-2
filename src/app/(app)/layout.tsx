import { ClientAppShell } from "./client-app-shell";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAppShell>{children}</ClientAppShell>;
}
