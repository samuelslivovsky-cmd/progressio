import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { id, email, user_metadata } = data.user;
      const { name, role } = user_metadata ?? {};

      if (name && role && email) {
        const { prisma } = await import("@/lib/prisma");
        await prisma.profile.upsert({
          where: { userId: id },
          create: { userId: id, name, email, role },
          update: {},
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
