// src/components/Header.js
"use client"; // Add this directive to make the component a client component

import React from 'react';
import Link from 'next/link'; // Use Next.js's Link component
import { useAuth0 } from '@auth0/auth0-react'; // Import Auth0 hooks

import './header.css'; // Ensure CSS is correctly imported

const Header = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0(); // Get Auth0 hooks

  const handleDashboardClick = () => {
    console.log('Dashboard button clicked');
    window.location.href = '/dashboard'; // Redirect to dashboard
  };

  const handlePricingClick = () => {
    console.log('Pricing button clicked');
    window.location.href = '/pricing'; // Redirect to pricing
  };

  const handleAuthClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth-callback`;  // Ensure this matches the callback URL registered in Google Developer Console
    const scope = 'https://www.googleapis.com/auth/gmail.modify';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    window.location.href = authUrl; // Redirect to Google's OAuth 2.0 server
  };

  const handleLogin = () => {
    loginWithRedirect({ redirectUri: `${window.location.origin}/dashboard` });
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
        {isAuthenticated ? (
          <>
            <button className="login-button" onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
            <button className="signup-button" onClick={handleDashboardClick}>Dashboard</button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={handleLogin}>Login</button>
            <button className="signup-button" onClick={handlePricingClick}>Try For Free</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
