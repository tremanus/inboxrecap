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
          access_type: "offline",
          prompt: "consent",
          scope: 'openid profile email https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],
  callbacks: {
    // Handle JWT token creation and refreshing
    async jwt({ token, account }) {
      if (account) {
        // First-time login, save the `access_token`, its expiry, and the `refresh_token`
        return {
          ...token,
          accessToken: account.access_token,
          expires_at: Date.now() + account.expires_in * 1000, // Convert seconds to milliseconds
          refreshToken: account.refresh_token,
        };
      }

      // Check if the current access token is still valid
      if (Date.now() < token.expires_at) {
        return token;
      }

      // If the access token has expired, attempt to refresh it
      if (!token.refreshToken) throw new Error("Missing refresh_token");

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          }),
        });

        const tokensOrError = await response.json();

        if (!response.ok) throw tokensOrError;

        const newTokens = {
          access_token: tokensOrError.access_token,
          expires_in: tokensOrError.expires_in,
          refresh_token: tokensOrError.refresh_token,
        };

        return {
          ...token,
          accessToken: newTokens.access_token,
          expires_at: Date.now() + newTokens.expires_in * 1000, // Convert seconds to milliseconds
          refreshToken: newTokens.refresh_token || token.refreshToken, // Preserve old refresh token if new one not provided
        };
      } catch (error) {
        console.error("Error refreshing access_token", error);
        token.error = "RefreshTokenError";
        return token;
      }
    },
    // Add the access token to the session object
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export handler for API routes
export { handler as GET, handler as POST };
