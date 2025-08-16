// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    // Optional demo login so you can proceed even if Google isn’t ready.
    Credentials({
      name: "Demo",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        if (credentials?.email) {
          return { id: "demo-user", name: "Demo User", email: String(credentials.email) };
        }
        return null;
      },
    }),
    Google({}), // reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
  ],
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) (session.user as any).id = token.sub;
      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        return u.origin === baseUrl ? u.toString() : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
});