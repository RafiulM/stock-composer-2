"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  History,
  LayoutDashboard,
  LogOut,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { useStockStore } from "@/lib/stock-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const nav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/products",
    label: "Produk",
    icon: Package,
  },
  {
    href: "/inbound",
    label: "Stok masuk",
    icon: ArrowDownToLine,
  },
  {
    href: "/outbound",
    label: "Stok keluar",
    icon: ArrowUpFromLine,
  },
  {
    href: "/movements",
    label: "Riwayat",
    icon: History,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    useStockStore.setState({
      user: null,
      products: [],
      batches: [],
      movements: [],
      hydrated: false,
    });
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-sidebar-border border-b px-4 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:items-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
            <Boxes className="size-4 shrink-0" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sidebar-foreground text-sm font-medium">
              Stock Composer
            </span>
            <span className="text-muted-foreground text-xs">Gudang</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                    }
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t p-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1 group-data-[collapsible=icon]:pl-1 group-data-[collapsible=icon]:pr-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Keluar">
              <LogOut className="size-4" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="my-2" />
        <p className="text-muted-foreground px-2 text-xs group-data-[collapsible=icon]:hidden">
          Data inventaris di PostgreSQL · sesi Better Auth.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
