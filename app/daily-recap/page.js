'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import DashboardNav from '../../src/components/dashboardnav'; // Import DashboardNav
import MobileDashboardNav from '../../src/components/mobiledashboardnav'; // Import MobileDashboardNav
import TopDashNav from '../../src/components/topdashnav'; // Import TopDashNav
import '../../src/components/clearinbox.css'; // Import CSS for consistent styling

const LastUnreadEmail = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [unreadCount, setUnreadCount] = useState(null); // State for unread emails count
  const [statusMessage, setStatusMessage] = useState(null); // State for status messages
  const [sending, setSending] = useState(false); // State for sending process
  const [loading, setLoading] = useState(true); // State for loading unread count
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn("google"); // Redirect to the sign-in page if not authenticated
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Check screen size on component mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 821); // Set 821px as breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Fetch the unread email count on component mount
    const fetchUnreadEmails = async () => {
      try {
        const response = await fetch('/api/findunread?timeRange=1d'); // Fetch unread emails from the last day
        if (!response.ok) {
          throw new Error('Failed to fetch unread email count');
        }
        const data = await response.json();
        setUnreadCount(data.unreadCount); // Set unread count
      } catch (error) {
        setUnreadCount('Error fetching unread emails');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUnreadEmails();
  }, []);

  const sendDailySummary = async () => {
    setSending(true);
    setStatusMessage(null); // Reset status before sending

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send summary email');
      }

      setStatusMessage('Email Sent'); // Set status message on success
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <>
        <TopDashNav /> {/* Render the top navigation bar */}
        <div className="dashboard-container">
          {isMobile ? (
            <MobileDashboardNav /> 
          ) : (
            <DashboardNav />
          )}
          <div className="main-content">
            <div className="content-container">
              <div className="main-row">
                <h2>Send Daily Summary Email</h2>
                {loading ? (
                  <p>Loading unread emails...</p>
                ) : (
                  <p>You have {unreadCount} unread emails in the last day.</p>
                )}
                <button
                  onClick={sendDailySummary}
                  style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Daily Summary'}
                </button>
                {statusMessage && <div style={{ marginTop: '20px', fontWeight: 'bold' }}>{statusMessage}</div>}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default LastUnreadEmail;
