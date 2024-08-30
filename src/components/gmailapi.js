"use client"; // Important for client-side rendering

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react'; // Import useSession and signIn from next-auth/react
import './gmailapi.css'; // Ensure this path is correct

const GmailApi = () => {
  const { data: session, status } = useSession(); // Use useSession to get session data and status
  const [unreadCount, setUnreadCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [emailSent, setEmailSent] = useState(null); // Add this state
  const [category, setCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadEmailCount();
    }
  }, [status, category, timeRange]);

  const fetchUnreadEmailCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/findunread?category=${category}&timeRange=${timeRange}`);
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread emails:', error);
      setError('Failed to fetch unread emails.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    setMarkingAsRead(true);
    setError(null);
    try {
      const response = await fetch('/api/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, timeRange }),
      });
      const data = await response.json();
      if (data.success) {
        fetchUnreadEmailCount();
      } else {
        console.error('Error marking emails as read:', data.error);
        setError('Failed to mark emails as read.');
      }
    } catch (error) {
      console.error('Error marking emails as read:', error);
      setError('Failed to mark emails as read.');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const deleteEmails = async () => {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch('/api/movetotrash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, timeRange }),
      });
      const data = await response.json();
      if (data.success) {
        fetchUnreadEmailCount();
      } else {
        console.error('Error deleting emails:', data.error);
        setError('Failed to delete emails.');
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
      setError('Failed to delete emails.');
    } finally {
      setDeleting(false);
    }
  };

  const summarizeLatestEmail = async () => {
    setSummarizing(true);
    setEmailSent(null); // Clear previous email sent status
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.summary) {
        setEmailSent('Email sent successfully'); // Set success message
      } else {
        setError('Failed to summarize email.');
      }
    } catch (error) {
      console.error('Error summarizing latest email:', error);
      setError('Failed to summarize the latest email.');
    } finally {
      setSummarizing(false);
    }
  };

  const authorize = () => {
    signIn('google'); // Redirect to Google OAuth login
  };

  return (
    <div className="gmail-api-container">
      {status === 'unauthenticated' && (
        <button onClick={authorize} className="authorize-button">
          <b>Authorize Google Account</b>
        </button>
      )}
      {session?.user?.email && (
        <button disabled className="email-button">
          {`Account: ${session.user.email}`}
        </button>
      )}
      {status === 'authenticated' && (
        <div className="main-container">
          <div className="clear-container">
            <h1>Clear Your Inbox</h1>
            <h2>Clean up your unwanted emails and save storage</h2>

            <div className="selectors-container">
              <div className="category-selector">
                <label htmlFor="category-select">Category:</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All Mail</option>
                  <option value="promotions">Promotions</option>
                  <option value="social">Social</option>
                  <option value="updates">Updates</option>
                </select>
              </div>

              <div className="time-range-selector">
                <label htmlFor="time-range-select">Time Range:</label>
                <select
                  id="time-range-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="1w">Last 7 days</option>
                  <option value="1m">Last 30 days</option>
                  <option value="6m">Last 6 months</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            <p>
              {loading ? 'Loading...' : `You have ${unreadCount} unread ${category === 'all' ? '' : category} emails`}
            </p>

            {error && <p className="error-message">{error}</p>}

            <button onClick={markAsRead} disabled={loading || markingAsRead}>
              {markingAsRead ? 'Marking as Read...' : 'Mark All as Read'}
            </button>

            <button onClick={deleteEmails} disabled={loading || deleting} className="delete-button">
              {deleting ? 'Moving to Trash...' : 'Delete Emails'}
            </button>
          </div>
          <div className="summarize-container">
            <h1>Clear & Summarize</h1>
            <h2>Mark emails as read and receive one sentence recaps of each</h2>

            <button onClick={summarizeLatestEmail} disabled={summarizing || loading}>
              {summarizing ? 'Sending...' : 'Receive Daily Summary Email'}
            </button>

            {emailSent && (
              <div className="email-sent-result">
                <h3>{emailSent}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GmailApi;
