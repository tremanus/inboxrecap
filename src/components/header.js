"use client"; // This directive makes the component a client component

import React from 'react';
import Link from 'next/link'; // Use Next.js's Link component
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'; // Import the useRouter hook

import './header.css'; // Ensure CSS is correctly imported

const Header = () => {
  const { data: session } = useSession(); // Get the session data
  const router = useRouter(); // Initialize the useRouter hook

  const handleDashboardClick = () => {
    console.log('Dashboard button clicked');
    router.push('/dashboard'); // Redirect to the dashboard
  };

  const handlePricingClick = () => {
    console.log('Pricing button clicked');
    router.push('/pricing'); // Redirect to pricing
  };

  const handleSignIn = () => {
    signIn("google", { callbackUrl: '/dashboard' }); // Redirect to dashboard on login
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // Redirect to homepage on logout
  };

  return (
    <header>
      <Link href="/" className="logo-container">
        <img src="/favicon.ico" alt="InboxRecap Logo" className="logo" />
        <span className="site-title">InboxRecap</span>
      </Link>
      <nav>
        <ul>
          <li><Link href="/#features">Features</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/faq">FAQ</Link></li>
        </ul>
        {session ? (
          <>
            <button className="login-button" onClick={handleSignOut}>Logout</button>
            <button className="signup-button" onClick={handleDashboardClick}>Dashboard</button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={handleSignIn}>Login</button>
            <button className="signup-button" onClick={handlePricingClick}>Try For Free</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
