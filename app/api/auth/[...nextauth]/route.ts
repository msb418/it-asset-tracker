// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// v5 style export: gives you handlers and helpers (auth, signIn, signOut)
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // keep email on the token the first time we see it
      if (account && profile && !token.email) {
        token.email = profile.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = session.user || {};
        // Make sure session.user.email is a string
        // (v5 types allow undefined)
        session.user.email = String(token.email);
      }
      return session;
    },
  },
});