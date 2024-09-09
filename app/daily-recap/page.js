'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import DashboardNav from '../../src/components/dashboardnav'; // Import DashboardNav
import MobileDashboardNav from '../../src/components/mobiledashboardnav'; // Import MobileDashboardNav
import TopDashNav from '../../src/components/topdashnav'; // Import TopDashNav
import '../../src/components/clearinbox.css'; // Import CSS for consistent styling

const LastUnreadEmail = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [unreadCount, setUnreadCount] = useState(null); // State for unread emails count
  const [statusMessage, setStatusMessage] = useState(null); // State for status messages
  const [sending, setSending] = useState(false); // State for sending process
  const [loading, setLoading] = useState(true); // State for loading unread count
  const [isMobile, setIsMobile] = useState(false); // Track screen size for mobile view

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn('google'); // Redirect to the sign-in page if not authenticated
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
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
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    isAuthenticated && (
      <>
        <TopDashNav /> {/* Render the top navigation bar */}
        <div className="dashboard-container"> {/* Keep original className */}
          {isMobile ? (
            <MobileDashboardNav />
          ) : (
            <DashboardNav />
          )}
          <div className="main-content"> {/* Keep original className */}
            <div className="content-container"> {/* Keep original className */}
              <div className="main2-row"> {/* Keep original className */}
                <h2 style={styles.heading}>Send Daily Summary Email</h2>
                {loading ? (
                  <p style={styles.unreadText}>Loading unread emails...</p>
                ) : (
                  <p style={styles.unreadText}>
                    You have {unreadCount} unread emails in the last day.
                  </p>
                )}
                <button
                  onClick={sendDailySummary}
                  style={styles.sendButton}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Daily Summary'}
                </button>
                {statusMessage && <div style={styles.statusMessage}>{statusMessage}</div>}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

const styles = {
  // Updated styles for other elements
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '20px auto',
    marginTop: '40px',
  },
  unreadText: {
    fontSize: '18px',
    color: '#555',
    margin: '0 auto',
  },
  sendButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#4caf50',
    color: '#fff',
    fontSize: '16px',
    borderRadius: '5px',
    margin: '20px auto',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  statusMessage: {
    marginTop: '20px',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  },
};

export default LastUnreadEmail;
