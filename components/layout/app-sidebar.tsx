"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  Scale,
  Ruler,
  Utensils,
  TrendingUp,
  ChevronUp,
  LogOut,
  User,
  Smartphone,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { usePwaInstall } from "@/components/pwa-install-context";
import { createClient } from "@/lib/supabase/client";

export const trainerBottomNav = [
  { title: "Dashboard", url: "/trainer", icon: LayoutDashboard },
  { title: "Klienti", url: "/trainer/clients", icon: Users },
  { title: "Jedálničky", url: "/trainer/plans/meal", icon: ClipboardList },
  { title: "Tréningy", url: "/trainer/plans/training", icon: Dumbbell },
];

export const trainerHamburgerNav = [
  { title: "Zoznam jedál", url: "/trainer/plans/meal-templates", icon: Utensils },
];

const trainerNav = [...trainerBottomNav, ...trainerHamburgerNav];

export const clientBottomNav = [
  { title: "Dashboard", url: "/client", icon: LayoutDashboard },
  { title: "Jedálniček", url: "/client/meal-plan", icon: ClipboardList },
  { title: "Strava", url: "/client/food", icon: Utensils },
  { title: "Tréning", url: "/client/workout", icon: Dumbbell },
  { title: "Pokrok", url: "/client/progress", icon: TrendingUp },
];

export const clientHamburgerNav = [
  { title: "Váha", url: "/client/progress/weight", icon: Scale },
  { title: "Merania", url: "/client/progress/measurements", icon: Ruler },
];

const clientNav = [...clientBottomNav, ...clientHamburgerNav];

interface AppSidebarProps {
  profile: Profile;
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const pwaInstall = usePwaInstall();
  const { data: unresolvedCount = 0 } = trpc.analytics.getUnresolvedAlertCount.useQuery(
    undefined,
    { enabled: profile.role === "TRAINER" }
  );
  const nav = profile.role === "TRAINER" ? trainerNav : clientNav;
  const hamburgerNav = profile.role === "TRAINER" ? trainerHamburgerNav : clientHamburgerNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-semibold text-lg">Progressio</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isMobile ? "Ďalšie" : profile.role === "TRAINER" ? "Tréner" : "Klient"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {(isMobile ? hamburgerNav : nav).map((item) => (
                <SidebarMenuItem key={item.url} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={
                      <Link
                        href={item.url}
                        className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 h-8 text-left [&_svg]:size-4 [&_svg]:shrink-0"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{item.title}</span>
                        {profile.role === "TRAINER" && item.url === "/trainer" && unresolvedCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
                            {unresolvedCount > 99 ? "99+" : unresolvedCount}
                          </span>
                        )}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {pwaInstall && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 h-8 text-left [&_svg]:size-4 [&_svg]:shrink-0"
                onClick={async () => {
                  if (pwaInstall.canInstall) {
                    if (isMobile) setOpenMobile(false);
                    await pwaInstall.install();
                  }
                }}
                disabled={!pwaInstall.canInstall || pwaInstall.isInstalling}
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">
                  {pwaInstall.isInstalling
                    ? "Inštalujem…"
                    : pwaInstall.canInstall
                      ? "Nainštaluj aplikáciu"
                      : "Pridať na plochu"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full cursor-pointer flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 outline-none transition-colors [&_svg]:size-4 [&_svg]:shrink-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                  {profile.name[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
                <ChevronUp className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem
                  className="flex items-center cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4 shrink-0" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  <span>Odhlásiť sa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
