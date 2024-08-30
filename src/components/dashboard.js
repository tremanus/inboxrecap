"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { useSession, signIn } from 'next-auth/react'; // Import useSession and signIn from next-auth/react
import './dashboard.css'; // Ensure you have this CSS file for styling
import GmailApi from './gmailapi';

const Dashboard = () => {
  const { data: session, status } = useSession(); // Use useSession hook to get session data and status
  const router = useRouter(); // Initialize router

  useEffect(() => {
    document.title = "Dashboard | InboxRecap";
    
    if (status === 'unauthenticated') {
      signIn(); // Redirect to the login page if not authenticated
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="loading">Loading...</div>;
  }

  return (
    session && (
      <div className="dashboard-container">
        {/* Profile Section */}
        <div className="profile-header">
          <img src={session.user?.image} alt={session.user?.name} className="profile-picture" />
          <h2 className="profile-name">Welcome, {session.user?.name}!</h2>
          <p className="profile-email">{session.user?.email}</p>
        </div>
        <GmailApi />
      </div>
    )
  );
};

export default Dashboard;
