'use client';
import React from 'react';
import { signIn } from 'next-auth/react';
import '../../src/components/login.css'; // Import the CSS file
import { Google } from '@mui/icons-material'; // Import the Google icon from Material-UI

const Login = () => {
  const handleSignIn = () => {
    // Trigger the NextAuth sign-in function with the 'google' provider
    signIn('google');
  };

  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="left-section">
        <img src="/favicon.ico" alt="InboxRecap Logo" className="logo" />
        <h1>InboxRecap</h1>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <h2>Sign In</h2>
        <p>Login with Google to Create Your Account</p>
        <button className="button-google" onClick={handleSignIn}>
          <Google fontSize="small" /> Google
        </button>
        <p>
          By clicking continue, you agree to our{' '}
          <a href="/tos" className="terms-link">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
