import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, role } = await req.json();

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, name, email, role },
    update: {},
  });

  return NextResponse.json(profile);
}
