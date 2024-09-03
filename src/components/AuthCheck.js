'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Home from './home';

const AuthCheck = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>; // Optionally show a loading state while checking authentication
  }

  if (session) {
    router.push('/dashboard'); // Redirect authenticated users to /dashboard
    return null; // Prevent rendering the component while redirecting
  }

  return <Home />; // Render Home if not authenticated
};

export default AuthCheck;
