"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@prisma/client";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { trainerBottomNav, clientBottomNav } from "@/components/layout/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  profile: Profile;
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const bottomNav = profile.role === "TRAINER" ? trainerBottomNav : clientBottomNav;

  if (!isMobile) return null;

  return (
    <>
      {/* Top header – hamburger + logo */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 pt-[env(safe-area-inset-top)] md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menu"
          onClick={() => setOpenMobile(true)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href={profile.role === "TRAINER" ? "/trainer" : "/client"} className="flex items-center gap-2 min-w-0">
          <Logo className="h-6 w-6 shrink-0" />
          <span className="font-semibold text-base truncate">Progressio</span>
        </Link>
      </header>

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t bg-background pb-[env(safe-area-inset-bottom)] pt-2 md:hidden"
        aria-label="Hlavná navigácia"
      >
        {bottomNav.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/trainer" && item.url !== "/client" && pathname.startsWith(item.url));
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors min-w-[56px]",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              <span className="truncate max-w-full">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
