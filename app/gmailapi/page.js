'use client'; // Important for client-side rendering

import React, { useEffect, useState } from 'react';
import '../../src/components/gmailapi.css'; // Ensure this path is correct

const GmailApi = () => {
  const [unreadCount, setUnreadCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [category, setCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [authorized, setAuthorized] = useState(false);

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
    }
  };

  const fetchUnreadEmailCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/markasread?category=${category}&timeRange=${timeRange}`);
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread emails:', error);
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
    }
  };

  const markAsRead = async () => {
    setMarkingAsRead(true);
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
      }
    } catch (error) {
      console.error('Error marking emails as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const deleteEmails = async () => {
    setDeleting(true);
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
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
    } finally {
      setDeleting(false);
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
    window.location.href = `/api/auth?redirect_uri=${encodeURIComponent(window.location.href)}`;
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

          <p>{loading ? '' : `You have ${unreadCount} unread ${category === 'all' ? '' : category} emails`}</p>

          <button onClick={markAsRead} disabled={loading || markingAsRead}>
            {markingAsRead ? 'Marking as Read...' : 'Mark All as Read'}
          </button>

          <button onClick={deleteEmails} disabled={loading || deleting}>
            {deleting ? 'Moving to Trash...' : 'Delete Emails'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GmailApi;
