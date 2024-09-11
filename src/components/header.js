"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Use Next.js's Link component
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation'; // Import the useRouter and usePathname hooks
import { Menu, MenuItem, Box, IconButton } from '@mui/joy';
import MenuIcon from '@mui/icons-material/Menu'; // Material-UI icon for menu
import CloseIcon from '@mui/icons-material/Close'; // Material-UI icon for close

import './header.css'; // Ensure CSS is correctly imported

const Header = () => {
  const { data: session } = useSession(); // Get the session data
  const router = useRouter(); // Initialize the useRouter hook
  const pathname = usePathname(); // Get the current pathname

  const [isMobile, setIsMobile] = useState(false); // Track if screen width is less than 888px
  const [anchorEl, setAnchorEl] = useState(null); // State to track the anchor element for the menu

  const handleDashboardClick = () => {
    router.push('/dashboard'); // Redirect to the dashboard
  };

  const handleSignIn = () => {
    router.push('/login'); // Redirect to login page
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // Redirect to homepage on logout
  };

  const handleMenuToggle = (event) => {
    if (anchorEl) {
      setAnchorEl(null); // Close the menu
    } else {
      setAnchorEl(event.currentTarget); // Open the menu and set the button as the anchor
    }
  };

  // Handle window resize to switch between desktop and mobile views
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 889); // Set isMobile true if width < 888px
    };

    handleResize(); // Check screen width on initial load
    window.addEventListener('resize', handleResize); // Add resize listener

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up listener
    };
  }, []);

  // Do not render Header if on the /login, /dashboard, or /clear-inbox pages
  if (['/login', '/dashboard', '/clear-inbox', '/daily-recap', '/mass-delete', '/faq'].includes(pathname)) {
    return null;
  }

  return (
    <header>
      <Link href="/" className="logo-container">
        <img src="/favicon.ico" alt="InboxRecap Logo" className="logo" />
        <span className="site-title">InboxRecap</span>
      </Link>

      {isMobile ? (
        // Render dropdown menu for mobile view
        <Box>
          <IconButton onClick={handleMenuToggle} sx={{ fontSize: 36 }}>
  {anchorEl ? <CloseIcon fontSize="inherit" /> : <MenuIcon fontSize="inherit" />}
</IconButton>
          <Menu
            anchorEl={anchorEl} // Set the button as the anchor for the menu
            open={Boolean(anchorEl)}
            onClose={handleMenuToggle}
            sx={{ minWidth: 120 }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }} // Ensures the menu opens below the button
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }} // Aligns the menu with the button
          >
            <MenuItem onClick={handleMenuToggle}>
              <Link href="#features" style={{ color: 'black', textDecoration: 'none' }}>Features</Link>
            </MenuItem>
            <MenuItem onClick={handleMenuToggle}>
              <Link href="#pricing" style={{ color: 'black', textDecoration: 'none' }}>Pricing</Link>
            </MenuItem>
            <MenuItem onClick={handleMenuToggle}>
              <Link href="#faq" style={{ color: 'black', textDecoration: 'none' }}>FAQ</Link>
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        // Render standard navigation for desktop view
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
      )}
    </header>
  );
};

export default Header;
