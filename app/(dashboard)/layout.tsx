import { requireAuth } from "@/lib/auth-helpers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <MobileNav profile={profile} />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24 md:pt-6 md:pb-6 min-h-svh md:pt-6">
          <PwaInstallBanner />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
