import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@sudanflood/db/client';
import { loginUser } from '@sudanflood/api/services/auth.service';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      orgId: string | null;
      firstName_ar: string | null;
      firstName_en: string | null;
      lastName_ar: string | null;
      lastName_en: string | null;
      preferredLocale: string;
      accessToken: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    orgId: string | null;
    firstName_ar: string | null;
    firstName_en: string | null;
    lastName_ar: string | null;
    lastName_en: string | null;
    preferredLocale: string;
    accessToken: string;
    refreshToken: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const result = await loginUser(
            db,
            credentials.email as string,
            credentials.password as string,
          );

          return {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            orgId: result.user.orgId,
            firstName_ar: result.user.firstName_ar,
            firstName_en: result.user.firstName_en,
            lastName_ar: result.user.lastName_ar,
            lastName_en: result.user.lastName_en,
            preferredLocale: result.user.preferredLocale,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email!;
        token.role = user.role;
        token.orgId = user.orgId;
        token.firstName_ar = user.firstName_ar;
        token.firstName_en = user.firstName_en;
        token.lastName_ar = user.lastName_ar;
        token.lastName_en = user.lastName_en;
        token.preferredLocale = user.preferredLocale;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.email = token.email as string;
      session.user.role = token.role as string;
      session.user.orgId = (token.orgId as string | null) ?? null;
      session.user.firstName_ar = (token.firstName_ar as string | null) ?? null;
      session.user.firstName_en = (token.firstName_en as string | null) ?? null;
      session.user.lastName_ar = (token.lastName_ar as string | null) ?? null;
      session.user.lastName_en = (token.lastName_en as string | null) ?? null;
      session.user.preferredLocale = (token.preferredLocale as string) ?? 'ar';
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
});
