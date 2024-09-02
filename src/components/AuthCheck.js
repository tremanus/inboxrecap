// src/components/AuthCheck.js

'use client';

import { useSession } from 'next-auth/react';
import Home from './home';
import Test from './designtest'; // Adjust path if necessary

const AuthCheck = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>; // Optionally show a loading state while checking authentication
  }

  return session ? <Test /> : <Home />;
};

export default AuthCheck;
