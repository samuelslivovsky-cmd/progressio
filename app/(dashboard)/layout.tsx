import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <MobileNav profile={profile} />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24 md:pt-6 md:pb-6 min-h-svh md:pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
