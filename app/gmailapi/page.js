'use client'; // Important for client-side rendering

import React, { useEffect, useState } from 'react';
import '../../src/components/gmailapi.css'; // Ensure this path is correct

const GmailApi = () => {
  const [unreadCount, setUnreadCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false); // New state for summarizing
  const [summary, setSummary] = useState(null); // New state for the summary result
  const [userEmail, setUserEmail] = useState(null);
  const [category, setCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState(null);

  const SCOPES = 'https://www.googleapis.com/auth/gmail.modify'; // Only the required scope

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/check-authorization');
      const data = await response.json();
      setAuthorized(data.authorized);
      if (data.authorized) {
        fetchUserEmail(); // Fetch user email if authorized
        fetchUnreadEmailCount(); // Fetch unread email count if authorized
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      setError('Failed to check authorization.');
    }
  };

  const fetchUnreadEmailCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/markasread?category=${category}&timeRange=${timeRange}`);
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread emails:', error);
      setError('Failed to fetch unread emails.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    try {
      const response = await fetch('/api/get-user-email');
      const data = await response.json();
      setUserEmail(data.email || '');
    } catch (error) {
      console.error('Error fetching user email:', error);
      setError('Failed to fetch user email.');
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
    setSummary(null);
    setError(null);

    try {
      // Step 1: Fetch the latest unread email
      const response = await fetch(`/api/reademail?category=${category}&timeRange=${timeRange}`);
      const emailData = await response.json();

      if (!emailData.email) {
        setError('No unread emails found.');
        return;
      }

      const emailContent = emailData.email.snippet || '';

      // Step 2: Send the email content to the summarize endpoint
      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent }),
      });

      const summarizeData = await summarizeResponse.json();

      if (summarizeData.summary) {
        setSummary(summarizeData.summary);
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

  useEffect(() => {
    checkAuthorization(); // Check authorization on component mount
    const intervalId = setInterval(() => {
      if (authorized) fetchUnreadEmailCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [authorized, category, timeRange]);

  const authorize = () => {
    const oauthUrl = `/api/auth-callback?redirect_uri=${encodeURIComponent(window.location.href)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="gmail-api-container">
      {!authorized && (
        <button onClick={authorize} className="authorize-button">
          <b>Authorize Google Account</b>
        </button>
      )}
      {userEmail && (
        <button disabled className="email-button">
          {`Account: ${userEmail}`}
        </button>
      )}
      {authorized && (
        <div className="main-container">
          <div className="clear-container">
            <h1>Clear Your Inbox</h1>
            <h2>Clean up your unwanted emails and save storage</h2>

            <div className="selectors-container">
              <div className="category-selector">
                <label htmlFor="category-select">Select Category: </label>
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
                <label htmlFor="time-range-select">Select Time Range: </label>
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

            <button onClick={deleteEmails} disabled={loading || deleting}>
              {deleting ? 'Moving to Trash...' : 'Delete Emails'}
            </button>
          </div>
          <div className="summarize-container">
            <h1>Clear & Summarize</h1>
            <h2>Mark emails as read and receive one sentence recaps of each</h2>

            <button onClick={summarizeLatestEmail} disabled={summarizing || loading}>
              {summarizing ? 'Summarizing...' : 'Summarize Latest Unread Email'}
            </button>

            {summary && (
              <div className="summary-result">
                <h3>Summary:</h3>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GmailApi;
