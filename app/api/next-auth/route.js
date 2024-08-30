import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.sub; // Save Google user ID to session
      return session;
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic if needed
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
