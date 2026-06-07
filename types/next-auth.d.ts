import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profileId: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    profileId?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    profileId?: string;
    role?: string;
  }
}
