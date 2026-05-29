import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Scopes required for Google Classroom read access
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
].join(' ');

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:       SCOPES,
          access_type: 'offline',
          prompt:      'consent',
        },
      },
    }),
  ],
  callbacks: {
    // Persist access_token inside the JWT
    async jwt({ token, account }) {
      if (account) {
        token.accessToken  = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt    = account.expires_at;
      }
      return token;
    },
    // Expose access_token to the client session
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  // After Google OAuth, land back on the dashboard
  pages: { signIn: '/dashboard' },
};
