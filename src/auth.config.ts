import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      // Proje kapalı olacağı için login dışındaki tüm rotalar auth gerektirir
      if (!isLoggedIn) return false; 
      
      return true;
    },
  },
  providers: [], // auth.ts içerisinde tanımlanacak
} satisfies NextAuthConfig;
