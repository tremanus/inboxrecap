"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import DashboardNav from './dashboardnav';
import MobileDashboardNav from './mobiledashboardnav';
import TopDashNav from './topdashnav'; // Ensure the path is correct
import GmailApi from './gmailapi'; // Import your new component for mass delete functionality
import './designtest.css';

const MassDelete = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

  const router = useRouter();

  useEffect(() => {
    document.title = "Mass Delete | InboxRecap";
    
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
      setIsMobile(window.innerWidth < 1027); // Set 821px as breakpoint for mobile
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
          {isMobile ? (
            <MobileDashboardNav />
          ) : (
            <DashboardNav />
          )}
          <div className="dashboard-container">
          <div className="main-content">
            <div className="content-container">
              <div className="main-row">
                <div
                  className="mass-delete-container"
                  style={{
                    width: '90%',
                    margin: '0 auto', // Centers the container horizontally
                    padding: '20px', // Optional: Adds padding inside the container
                    boxSizing: 'border-box', // Ensures padding and border are included in the total width
                  }}
                >
                  <GmailApi />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default MassDelete;
