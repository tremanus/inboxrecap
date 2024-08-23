'use client'; // Important for client-side rendering

import React, { useEffect, useState } from 'react';
import '../../src/components/gmailapi.css'; // Ensure this path is correct

const GmailApi = () => {
  const [unreadCount, setUnreadCount] = useState(null);
  const [loading, setLoading] = useState(false); // General loading state
  const [markingAsRead, setMarkingAsRead] = useState(false); // State for "Mark as Read" action
  const [deleting, setDeleting] = useState(false); // State for "Delete Emails" action
  const [userEmail, setUserEmail] = useState(null); // State to store user email
  const [category, setCategory] = useState('all'); // State for email category
  const [timeRange, setTimeRange] = useState('all'); // State for time range

  const fetchUnreadEmailCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/markasread?category=${category}&timeRange=${timeRange}`);
      const data = await response.json();
      console.log('Unread email count response:', data); // Log the response
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    try {
      const response = await fetch('/api/get-user-email'); // Create this endpoint
      const data = await response.json();
      console.log('User email response:', data); // Log the response
      setUserEmail(data.email || ''); // Set user email to state
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  };

  const markAsRead = async () => {
    setMarkingAsRead(true); // Set marking as read state to true
    try {
      const response = await fetch('/api/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, timeRange }),
      });
      const data = await response.json();
      console.log('Mark as read response:', data); // Log the response
      if (data.success) {
        fetchUnreadEmailCount(); // Refresh unread count after marking as read
      } else {
        console.error('Error marking emails as read:', data.error);
      }
    } catch (error) {
      console.error('Error marking emails as read:', error);
    } finally {
      setMarkingAsRead(false); // Reset marking as read state
    }
  };

  const deleteEmails = async () => {
    setDeleting(true); // Set deleting state to true
    try {
      const response = await fetch('/api/movetotrash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, timeRange }),
      });
      const data = await response.json();
      console.log('Delete emails response:', data); // Log the response
      if (data.success) {
        fetchUnreadEmailCount(); // Refresh unread count after deleting emails
      } else {
        console.error('Error deleting emails:', data.error);
      }
    } catch (error) {
      console.error('Error deleting emails:', error);
    } finally {
      setDeleting(false); // Reset deleting state
    }
  };

  useEffect(() => {
    fetchUnreadEmailCount();
    fetchUserEmail(); // Fetch user email on component mount
    const intervalId = setInterval(fetchUnreadEmailCount, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [category, timeRange]); // Re-fetch when category or timeRange changes

  return (
    <div className="gmail-api-container">
      {userEmail && (
        <button disabled className="email-button">
          {`Account: ${userEmail}`}
        </button>
      )}
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
          {deleting ? 'Deleting Emails...' : 'Delete Emails'}
        </button>
      </div>
    </div>
  );
};

export default GmailApi;
