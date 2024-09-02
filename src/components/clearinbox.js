"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import DashboardNav from './dashboardnav';
import MobileDashboardNav from './mobiledashboardnav';
import TopDashNav from './topdashnav'; // Make sure the path is correct
import GmailApi from './gmailapi'; // Import GmailApi from gmailapi.js
import './designtest.css';

const ClearInbox = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

  const router = useRouter();

  useEffect(() => {
    document.title = "Clear Inbox | InboxRecap";
    
    if (!isLoading && !isAuthenticated) {
      signIn("google"); // Redirects to the sign-in page
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [isAuthenticated, session]);

  useEffect(() => {
    // Check screen size on component mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 821); // Set 768px as breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <>
        <TopDashNav />
        <div className="dashboard-container">
          {isMobile ? (
            <MobileDashboardNav />
          ) : (
            <DashboardNav />
          )}
          <div className="main-content">
            <div className="content-container">
              <div className="top-row">
                <div className="clear-emails-box">
                  <GmailApi /> {/* Render the GmailApi component */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default ClearInbox;
