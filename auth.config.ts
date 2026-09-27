import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnHabits = request.nextUrl.pathname.startsWith("/habits");

      if (isOnHabits) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
