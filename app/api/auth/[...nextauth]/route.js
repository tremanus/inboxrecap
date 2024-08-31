import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Define the NextAuth options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],
  callbacks: {
    // Store the access token in the session
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Add the access token to the session object
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export handler for API routes
export { handler as GET, handler as POST };
