import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { store } from "@/lib/store";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = store.getUserByEmail(credentials.email as string);
        if (user && user.passwordHash === credentials.password) {
          // Exclude passwordHash before passing to session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clientId: user.clientId
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.clientId = (user as any).clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).clientId = token.clientId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  }
});
