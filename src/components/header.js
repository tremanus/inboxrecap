"use client"; // This directive makes the component a client component

import React from 'react';
import Link from 'next/link'; // Use Next.js's Link component
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation'; // Import the useRouter and usePathname hooks

import './header.css'; // Ensure CSS is correctly imported

const Header = () => {
  const { data: session } = useSession(); // Get the session data
  const router = useRouter(); // Initialize the useRouter hook
  const pathname = usePathname(); // Get the current pathname

  const handleDashboardClick = () => {
    console.log('Dashboard button clicked');
    router.push('/dashboard'); // Redirect to the dashboard
  };

  const handleSignIn = () => {
    router.push('/login'); // Redirect to login page
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // Redirect to homepage on logout
  };

  // Do not render Header if on the /login, /dashboard, or /clear-inbox pages
  if (['/login', '/dashboard', '/clear-inbox', '/daily-recap', '/mass-delete'].includes(pathname)) {
    return null;
  }

  return (
    <header>
      <Link href="/" className="logo-container">
        <img src="/favicon.ico" alt="InboxRecap Logo" className="logo" />
        <span className="site-title">InboxRecap</span>
      </Link>
      <nav>
        <ul>
          <li><Link href="#features">Features</Link></li>
          <li><Link href="#pricing">Pricing</Link></li>
          <li><Link href="#faq">FAQ</Link></li>
        </ul>
        {session ? (
          <>
            <button className="login-button" onClick={handleSignOut}>Logout</button>
            <button className="signup-button" onClick={handleDashboardClick}>Dashboard</button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={handleSignIn}>Login</button>
            <button className="signup-button" onClick={handleSignIn}>Try For Free</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
