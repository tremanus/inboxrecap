// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import { getServerSession } from "next-auth";
import AuthProvider from "../src/providers/AuthProvider"; // Import your AuthProvider
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InboxRecap | Clear & Summarize Your Inbox",
  description:
    "Clear and summarize your inbox using InboxRecap! Save storage by deleting unwanted emails and receive daily summaries.",
};

export default async function RootLayout({ children }) {
  // Fetch the session on the server side
  const session = await getServerSession();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider session={session}>
          <Analytics />
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
