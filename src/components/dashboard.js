"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { useAuth0 } from '@auth0/auth0-react'; // Import useAuth0
import './dashboard.css'; // Ensure you have this CSS file for styling
import GmailApi from './gmailapi';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0(); // Use useAuth0 hook
  const router = useRouter(); // Initialize router

  useEffect(() => {
    document.title = "Dashboard | InboxRecap";
    
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect(); // Redirect to Auth0 login page if not authenticated
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div className="dashboard-container">
        {/* Profile Section */}
        <div className="profile-header">
          <img src={user?.picture} alt={user?.name} className="profile-picture" />
          <h2 className="profile-name">Welcome, {user?.name}!</h2>
          <p className="profile-email">{user?.email}</p>
        </div>
      <GmailApi />
      </div>
    )
  );
};

export default Dashboard;
