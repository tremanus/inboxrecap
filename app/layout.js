// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '../src/components/header';
import Footer from "../src/components/footer";
import AuthProvider from '../src/providers/AuthProvider'; // Import your AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InboxRecap | Clear & Summarize Your Inbox",
  description: "Clear and summarize your inbox using InboxRecap! Save storage by deleting unwanted emails and receive daily summaries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
