import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // filled in lib/auth.ts — kept empty here for Edge compatibility
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublicPage =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");

      const isPwaAsset =
        pathname === "/manifest.webmanifest" ||
        pathname === "/sw.js" ||
        pathname.startsWith("/icon-192") ||
        pathname.startsWith("/icon-512");

      if (!isLoggedIn && !isPublicPage && !isPwaAsset) {
        return false; // redirects to pages.signIn
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // profileId and role are set in the full auth.ts authorize callback
        // and passed via the user object
        token.profileId = (user as any).profileId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.profileId = token.profileId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
