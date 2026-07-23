"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coffee,
  FolderOpen,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Wheat,
} from "lucide-react";
import { toast } from "sonner";

import {
  SaleFormDialog,
  type SaleFormValues,
} from "@/components/sales/sale-form-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSales } from "@/lib/data-provider";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: ReceiptText },
  { title: "Products", url: "/products", icon: Coffee },
  { title: "Ingredients", url: "/ingredients", icon: Wheat },
  { title: "Categories", url: "/categories", icon: FolderOpen },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { add: addSale } = useSales();
  const [saleFormOpen, setSaleFormOpen] = React.useState(false);

  function handleAddSale(values: SaleFormValues) {
    addSale(values);
    toast.success("Sale logged");
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <Coffee className="size-5!" />
              <span className="text-base font-semibold tracking-tight">
                Let Coffee
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Log sales"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  onClick={() => setSaleFormOpen(true)}
                >
                  <Plus />
                  <span>Log sales</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-medium text-sidebar-foreground">
                Built for the remote grind
              </span>
              <span className="font-mono text-[10px] tracking-wide text-sidebar-foreground/60 uppercase">
                v0.1 · Convex
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SaleFormDialog
        open={saleFormOpen}
        onOpenChange={setSaleFormOpen}
        onSubmit={handleAddSale}
      />
    </Sidebar>
  );
}
